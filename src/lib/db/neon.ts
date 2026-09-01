import { neon } from "@neondatabase/serverless";

export interface DbUser {
  id: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
  auth_provider?: string;
  role?: string;
  is_op?: boolean;
  is_suspended?: boolean;
  custom_daily_limit?: number;
  last_ip_address?: string | null;
  created_at?: string;
  last_login_at?: string;
  total_prompts?: number;
  last_prompt_at?: string;
}

export interface DbMedia {
  id: number;
  user_email: string;
  file_name: string;
  file_type: string;
  file_size: number;
  media_data: string;
  uploaded_at: string;
}

export interface DbLibraryFile {
  id: string;
  user_email: string;
  file_name: string;
  file_type: string;
  mime_type: string;
  file_size: number;
  file_data?: string;
  tags: string[];
  uploaded_at: string;
}

export function getDb() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL ||
    "";

  if (!connectionString) {
    return null;
  }

  return neon(connectionString);
}

let isInitialized = false;

export async function ensureTablesExist() {
  if (isInitialized) return;

  const sql = getDb();
  if (!sql) return;

  try {
    // 1. Visitor Tracking Table
    await sql`
      CREATE TABLE IF NOT EXISTS visitor_logs (
        id SERIAL PRIMARY KEY,
        ip_address VARCHAR(45) UNIQUE NOT NULL,
        ip_version VARCHAR(10) NOT NULL,
        visit_count INTEGER DEFAULT 1,
        user_agent TEXT,
        country VARCHAR(100),
        city VARCHAR(100),
        first_visited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_visited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_visitor_ip ON visitor_logs(ip_address);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_visitor_last_visited ON visitor_logs(last_visited_at DESC);
    `;

    // 2. User Accounts Table (Stores only User Profile, NO Chat Messages)
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        avatar TEXT,
        auth_provider VARCHAR(50) DEFAULT 'google',
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Run schema migrations for admin control
    await sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_op BOOLEAN DEFAULT FALSE;
    `;
    await sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;
    `;
    await sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_daily_limit INTEGER DEFAULT 1000;
    `;
    await sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_ip_address VARCHAR(45);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `;

    // 3. Uploaded Media Storage Table (Stores uploaded photos silently into Neon PostgreSQL)
    await sql`
      CREATE TABLE IF NOT EXISTS uploaded_media (
        id SERIAL PRIMARY KEY,
        user_email VARCHAR(255),
        file_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(100),
        file_size INTEGER,
        media_data TEXT NOT NULL,
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_uploaded_media_email ON uploaded_media(user_email);
    `;

    // 4. File & Knowledge Library Table (Stores all user work files, docs & code into Neon PostgreSQL)
    await sql`
      CREATE TABLE IF NOT EXISTS knowledge_library_files (
        id VARCHAR(255) PRIMARY KEY,
        user_email VARCHAR(255),
        file_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        mime_type VARCHAR(100),
        file_size INTEGER DEFAULT 0,
        file_data TEXT,
        tags TEXT DEFAULT '[]',
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_library_user ON knowledge_library_files(user_email);
    `;

    // 5. User Question Prompts Logger (Stores ONLY user prompts/questions to save database storage)
    await sql`
      CREATE TABLE IF NOT EXISTS user_prompts (
        id SERIAL PRIMARY KEY,
        user_email VARCHAR(255),
        prompt TEXT NOT NULL,
        model_id VARCHAR(100),
        ip_address VARCHAR(45),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_prompts_created ON user_prompts(created_at DESC);
    `;

    // 6. Cloud Sync Conversations Table (Stores full chat history across devices)
    await sql`
      CREATE TABLE IF NOT EXISTS cloud_conversations (
        id VARCHAR(255) PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        model_id VARCHAR(100) DEFAULT 'gemini-3.1-flash-lite',
        pinned BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_cloud_conv_user ON cloud_conversations(user_email, updated_at DESC);
    `;

    // 7. Cloud Sync Messages Table (Syncs all user & AI turns across every device)
    await sql`
      CREATE TABLE IF NOT EXISTS cloud_messages (
        id VARCHAR(255) PRIMARY KEY,
        conversation_id VARCHAR(255) NOT NULL REFERENCES cloud_conversations(id) ON DELETE CASCADE,
        user_email VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        model_id VARCHAR(100),
        model_name VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_cloud_msg_conv ON cloud_messages(conversation_id, created_at ASC);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_cloud_msg_user ON cloud_messages(user_email);
    `;

    // 8. Individual User Questions & Prompts History (แยกเก็บประวัติคำถามเป็นรายบุคคล)
    await sql`
      CREATE TABLE IF NOT EXISTS user_individual_prompts (
        id SERIAL PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        user_name VARCHAR(255),
        prompt TEXT NOT NULL,
        model_id VARCHAR(100) DEFAULT 'gemini-3.1-flash-lite',
        conversation_id VARCHAR(255),
        ip_address VARCHAR(45),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_indiv_prompts_user ON user_individual_prompts(user_email, created_at DESC);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_indiv_prompts_created ON user_individual_prompts(created_at DESC);
    `;

    // Automatic migration & backfill from existing user_prompts & cloud_messages if empty
    try {
      const countCheck = await sql`SELECT COUNT(*) as count FROM user_individual_prompts;`;
      if (Number(countCheck[0]?.count || 0) === 0) {
        // Backfill from user_prompts
        await sql`
          INSERT INTO user_individual_prompts (user_email, prompt, model_id, ip_address, created_at)
          SELECT 
            COALESCE(user_email, 'guest_user'), 
            prompt, 
            COALESCE(model_id, 'deepseek-chat'), 
            ip_address, 
            created_at
          FROM user_prompts
          WHERE prompt IS NOT NULL AND prompt != '';
        `;

        // Update user_name by matching user_email in users table
        await sql`
          UPDATE user_individual_prompts uip
          SET user_name = u.name
          FROM users u
          WHERE uip.user_email = u.email AND (uip.user_name IS NULL OR uip.user_name = '');
        `;
      }
    } catch (bfErr) {
      console.warn("Backfill user_individual_prompts note:", bfErr);
    }

    isInitialized = true;
  } catch (error) {
    console.error("Neon DB Initialization Error:", error);
  }
}

export async function ensureVisitorTableExists() {
  return ensureTablesExist();
}

export async function upsertUser(user: {
  id?: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
  authProvider?: string;
  role?: string;
  ipAddress?: string;
}) {
  const sql = getDb();
  if (!sql) return null;

  await ensureTablesExist();

  const userId = user.id || `usr-${Date.now()}`;
  const provider = user.authProvider || "google";
  const userRole = user.role || "user";

  const result = await sql`
    INSERT INTO users (
      id,
      email,
      name,
      avatar,
      auth_provider,
      role,
      last_ip_address,
      created_at,
      last_login_at
    )
    VALUES (
      ${userId},
      ${user.email},
      ${user.name || null},
      ${user.avatar || null},
      ${provider},
      ${userRole},
      ${user.ipAddress || null},
      NOW(),
      NOW()
    )
    ON CONFLICT (email)
    DO UPDATE SET
      name = COALESCE(EXCLUDED.name, users.name),
      avatar = COALESCE(EXCLUDED.avatar, users.avatar),
      last_login_at = NOW(),
      last_ip_address = COALESCE(EXCLUDED.last_ip_address, users.last_ip_address),
      auth_provider = EXCLUDED.auth_provider
    RETURNING id, email, name, avatar, auth_provider, role, last_ip_address, created_at, last_login_at;
  `;

  return result[0] as DbUser;
}

export async function updateUserIpAddress(email: string, ipAddress: string) {
  const sql = getDb();
  if (!sql || !email || email === "guest_user" || !ipAddress || ipAddress === "unknown") return;

  await ensureTablesExist();

  try {
    await sql`
      UPDATE users 
      SET last_ip_address = ${ipAddress}, last_login_at = NOW()
      WHERE email = ${email};
    `;
  } catch (e) {
    console.error("Non-fatal: failed to update user IP:", e);
  }
}

export async function saveUploadedMedia(data: {
  userEmail?: string;
  fileName: string;
  fileType?: string;
  fileSize?: number;
  mediaData: string;
}) {
  const sql = getDb();
  if (!sql) return null;

  await ensureTablesExist();

  const result = await sql`
    INSERT INTO uploaded_media (
      user_email,
      file_name,
      file_type,
      file_size,
      media_data,
      uploaded_at
    )
    VALUES (
      ${data.userEmail || "guest_user"},
      ${data.fileName},
      ${data.fileType || "image/jpeg"},
      ${data.fileSize || 0},
      ${data.mediaData},
      NOW()
    )
    RETURNING id, user_email, file_name, file_type, file_size, uploaded_at;
  `;

  return result[0];
}

export async function getMediaById(id: number): Promise<DbMedia | null> {
  const sql = getDb();
  if (!sql) return null;

  await ensureTablesExist();

  const rows = await sql`
    SELECT id, user_email, file_name, file_type, file_size, media_data, uploaded_at
    FROM uploaded_media
    WHERE id = ${id}
    LIMIT 1;
  `;

  if (rows.length === 0) return null;
  return rows[0] as DbMedia;
}

export async function getAllUploadedMedia(limit = 50): Promise<Omit<DbMedia, "media_data">[]> {
  const sql = getDb();
  if (!sql) return [];

  await ensureTablesExist();

  const rows = await sql`
    SELECT id, user_email, file_name, file_type, file_size, uploaded_at
    FROM uploaded_media
    ORDER BY uploaded_at DESC
    LIMIT ${limit};
  `;

  return rows as Omit<DbMedia, "media_data">[];
}

// ----------------------------------------------------
// Knowledge Library File Storage Queries (Neon PostgreSQL)
// ----------------------------------------------------

export async function saveLibraryFile(data: {
  id: string;
  userEmail?: string;
  fileName: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  fileData?: string;
  tags?: string[];
}) {
  const sql = getDb();
  if (!sql) return null;

  await ensureTablesExist();

  const tagsJson = JSON.stringify(data.tags || []);

  const result = await sql`
    INSERT INTO knowledge_library_files (
      id,
      user_email,
      file_name,
      file_type,
      mime_type,
      file_size,
      file_data,
      tags,
      uploaded_at
    )
    VALUES (
      ${data.id},
      ${data.userEmail || "guest_user"},
      ${data.fileName},
      ${data.fileType},
      ${data.mimeType},
      ${data.fileSize},
      ${data.fileData || null},
      ${tagsJson},
      NOW()
    )
    ON CONFLICT (id)
    DO UPDATE SET
      file_name = EXCLUDED.file_name,
      file_type = EXCLUDED.file_type,
      mime_type = EXCLUDED.mime_type,
      file_size = EXCLUDED.file_size,
      file_data = COALESCE(EXCLUDED.file_data, knowledge_library_files.file_data),
      tags = EXCLUDED.tags,
      uploaded_at = NOW()
    RETURNING id, user_email, file_name, file_type, mime_type, file_size, tags, uploaded_at;
  `;

  return result[0];
}

export async function getAllLibraryFiles(userEmail?: string) {
  const sql = getDb();
  if (!sql) return [];

  await ensureTablesExist();

  let rows;
  if (userEmail && userEmail !== "guest_user") {
    rows = await sql`
      SELECT id, user_email, file_name, file_type, mime_type, file_size, tags, uploaded_at
      FROM knowledge_library_files
      WHERE user_email = ${userEmail} OR user_email = 'guest_user'
      ORDER BY uploaded_at DESC;
    `;
  } else {
    rows = await sql`
      SELECT id, user_email, file_name, file_type, mime_type, file_size, tags, uploaded_at
      FROM knowledge_library_files
      ORDER BY uploaded_at DESC;
    `;
  }

  return rows.map((r) => ({
    id: r.id,
    userEmail: r.user_email,
    name: r.file_name,
    type: r.file_type,
    mimeType: r.mime_type,
    size: r.file_size,
    tags: typeof r.tags === "string" ? JSON.parse(r.tags || "[]") : r.tags || [],
    uploadedAt: r.uploaded_at,
    url: "#",
  }));
}

export async function deleteLibraryFile(id: string) {
  const sql = getDb();
  if (!sql) return false;

  await ensureTablesExist();

  await sql`
    DELETE FROM knowledge_library_files
    WHERE id = ${id};
  `;

  return true;
}

// ----------------------------------------------------
// User Prompts / Questions Storage (Saves ONLY questions, NO answers)
// ----------------------------------------------------

export async function logUserPrompt(data: {
  prompt: string;
  modelId?: string;
  userEmail?: string;
  ipAddress?: string;
}) {
  const sql = getDb();
  if (!sql) return null;

  await ensureTablesExist();

  try {
    const result = await sql`
      INSERT INTO user_prompts (
        user_email,
        prompt,
        model_id,
        ip_address,
        created_at
      )
      VALUES (
        ${data.userEmail || "guest_user"},
        ${data.prompt},
        ${data.modelId || "deepseek-chat"},
        ${data.ipAddress || "unknown"},
        NOW()
      )
      RETURNING id, created_at;
    `;

    return result[0];
  } catch (error) {
    console.error("Error logging user prompt to Neon DB:", error);
    return null;
  }
}

export async function getAdminStats() {
  const sql = getDb();
  if (!sql) {
    return {
      totalPrompts: 0,
      todayPrompts: 0,
      totalUsers: 0,
      modelUsage: [],
      recentPrompts: [],
    };
  }

  await ensureTablesExist();

  try {
    const totalPromptsRes = await sql`SELECT COUNT(*) as count FROM user_prompts;`;
    const todayPromptsRes = await sql`
      SELECT COUNT(*) as count 
      FROM user_prompts 
      WHERE created_at >= CURRENT_DATE;
    `;
    const totalUsersRes = await sql`SELECT COUNT(*) as count FROM users;`;
    const modelUsageRes = await sql`
      SELECT model_id, COUNT(*) as count 
      FROM user_prompts 
      GROUP BY model_id 
      ORDER BY count DESC 
      LIMIT 10;
    `;
    const recentPromptsRes = await sql`
      SELECT id, user_email, prompt, model_id, ip_address, created_at 
      FROM user_prompts 
      ORDER BY created_at DESC 
      LIMIT 50;
    `;

    return {
      totalPrompts: Number(totalPromptsRes[0]?.count || 0),
      todayPrompts: Number(todayPromptsRes[0]?.count || 0),
      totalUsers: Number(totalUsersRes[0]?.count || 0),
      modelUsage: modelUsageRes.map((r) => ({
        modelId: r.model_id || "unknown",
        count: Number(r.count || 0),
      })),
      recentPrompts: recentPromptsRes.map((r) => ({
        id: r.id,
        userEmail: r.user_email || "guest",
        prompt: r.prompt,
        modelId: r.model_id || "gemini-3.1-flash-lite",
        ipAddress: r.ip_address || "unknown",
        createdAt: r.created_at,
      })),
    };
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    return {
      totalPrompts: 0,
      todayPrompts: 0,
      totalUsers: 0,
      modelUsage: [],
      recentPrompts: [],
    };
  }
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const sql = getDb();
  if (!sql) return null;

  await ensureTablesExist();

  try {
    const rows = await sql`
      SELECT id, email, name, avatar, auth_provider, role, 
             COALESCE(is_op, FALSE) as is_op, 
             COALESCE(is_suspended, FALSE) as is_suspended, 
             COALESCE(custom_daily_limit, 1000) as custom_daily_limit,
             last_ip_address,
             created_at, last_login_at
      FROM users
      WHERE email = ${email}
      LIMIT 1;
    `;
    if (rows.length === 0) return null;
    return rows[0] as DbUser;
  } catch (err) {
    console.error("Error fetching user by email:", err);
    return null;
  }
}

export async function getAllUsersForAdmin(): Promise<DbUser[]> {
  const sql = getDb();
  if (!sql) return [];

  await ensureTablesExist();

  try {
    const rows = await sql`
      SELECT u.id, u.email, u.name, u.avatar, u.auth_provider, u.role, 
             COALESCE(u.is_op, FALSE) as is_op, 
             COALESCE(u.is_suspended, FALSE) as is_suspended, 
             COALESCE(u.custom_daily_limit, 1000) as custom_daily_limit,
             u.last_ip_address,
             u.created_at, u.last_login_at,
             (SELECT COUNT(*) FROM user_individual_prompts p WHERE LOWER(p.user_email) = LOWER(u.email)) as total_prompts,
             (SELECT MAX(p.created_at) FROM user_individual_prompts p WHERE LOWER(p.user_email) = LOWER(u.email)) as last_prompt_at
      FROM users u
      ORDER BY u.created_at DESC;
    `;
    return rows as DbUser[];
  } catch (err) {
    console.error("Error fetching all users for admin:", err);
    return [];
  }
}

export async function updateUserAdminControl(
  userId: string,
  updates: {
    isOp?: boolean;
    isSuspended?: boolean;
    customDailyLimit?: number;
  }
) {
  const sql = getDb();
  if (!sql) return null;

  await ensureTablesExist();

  try {
    if (updates.isOp !== undefined) {
      await sql`
        UPDATE users 
        SET is_op = ${updates.isOp},
            role = ${updates.isOp ? "admin" : "user"}
        WHERE id = ${userId} OR email = ${userId};
      `;
    }
    if (updates.isSuspended !== undefined) {
      await sql`
        UPDATE users 
        SET is_suspended = ${updates.isSuspended}
        WHERE id = ${userId} OR email = ${userId};
      `;
    }
    if (updates.customDailyLimit !== undefined) {
      await sql`
        UPDATE users 
        SET custom_daily_limit = ${updates.customDailyLimit}
        WHERE id = ${userId} OR email = ${userId};
      `;
    }

    const updated = await sql`
      SELECT id, email, name, avatar, auth_provider, role, 
             COALESCE(is_op, FALSE) as is_op, 
             COALESCE(is_suspended, FALSE) as is_suspended, 
             COALESCE(custom_daily_limit, 1000) as custom_daily_limit,
             created_at, last_login_at
      FROM users 
      WHERE id = ${userId} OR email = ${userId}
      LIMIT 1;
    `;

    return (updated[0] as DbUser) || null;
  } catch (err) {
    console.error("Error updating user admin control:", err);
    return null;
  }
}

// ----------------------------------------------------
// Global Cloud Chat Sync Queries (Neon PostgreSQL)
// ----------------------------------------------------

export async function saveCloudConversation(data: {
  id: string;
  userEmail: string;
  title: string;
  modelId?: string;
  pinned?: boolean;
  createdAt?: string;
  updatedAt?: string;
}) {
  const sql = getDb();
  if (!sql) return false;

  await ensureTablesExist();

  try {
    const createdIso = data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString();
    await sql`
      INSERT INTO cloud_conversations (
        id,
        user_email,
        title,
        model_id,
        pinned,
        created_at,
        updated_at
      )
      VALUES (
        ${data.id},
        ${data.userEmail},
        ${data.title},
        ${data.modelId || "gemini-3.1-flash-lite"},
        ${data.pinned || false},
        ${createdIso},
        NOW()
      )
      ON CONFLICT (id)
      DO UPDATE SET
        title = EXCLUDED.title,
        model_id = EXCLUDED.model_id,
        pinned = EXCLUDED.pinned,
        updated_at = NOW();
    `;
    return true;
  } catch (err) {
    console.error("Error saving cloud conversation:", err);
    return false;
  }
}

export async function saveCloudMessage(data: {
  id: string;
  conversationId: string;
  userEmail: string;
  role: string;
  content: string;
  modelId?: string;
  modelName?: string;
  createdAt?: string;
}) {
  const sql = getDb();
  if (!sql) return false;

  await ensureTablesExist();

  try {
    const createdIso = data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString();
    await sql`
      INSERT INTO cloud_messages (
        id,
        conversation_id,
        user_email,
        role,
        content,
        model_id,
        model_name,
        created_at
      )
      VALUES (
        ${data.id},
        ${data.conversationId},
        ${data.userEmail},
        ${data.role},
        ${data.content},
        ${data.modelId || null},
        ${data.modelName || null},
        ${createdIso}
      )
      ON CONFLICT (id)
      DO UPDATE SET
        content = EXCLUDED.content,
        model_id = EXCLUDED.model_id,
        model_name = EXCLUDED.model_name;
    `;
    return true;
  } catch (err) {
    console.error("Error saving cloud message:", err);
    return false;
  }
}

export async function getCloudChatData(userEmail: string) {
  const sql = getDb();
  if (!sql || !userEmail) return { conversations: [], messages: {} };

  await ensureTablesExist();

  try {
    const convRows = await sql`
      SELECT id, title, model_id, pinned, created_at, updated_at
      FROM cloud_conversations
      WHERE user_email = ${userEmail}
      ORDER BY updated_at DESC;
    `;

    const msgRows = await sql`
      SELECT id, conversation_id, role, content, model_id, model_name, created_at
      FROM cloud_messages
      WHERE user_email = ${userEmail}
      ORDER BY created_at ASC;
    `;

    const conversations = convRows.map((c) => ({
      id: c.id,
      title: c.title,
      modelId: c.model_id || "gemini-3.1-flash-lite",
      pinned: Boolean(c.pinned),
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      messageCount: 0,
    }));

    const messages: Record<string, any[]> = {};
    msgRows.forEach((m) => {
      if (!messages[m.conversation_id]) {
        messages[m.conversation_id] = [];
      }
      messages[m.conversation_id].push({
        id: m.id,
        conversationId: m.conversation_id,
        role: m.role,
        content: m.content,
        modelId: m.model_id,
        modelName: m.model_name,
        createdAt: m.created_at,
      });
    });

    conversations.forEach((c) => {
      c.messageCount = messages[c.id]?.length || 0;
    });

    return { conversations, messages };
  } catch (err) {
    console.error("Error fetching cloud chat data:", err);
    return { conversations: [], messages: {} };
  }
}

export async function deleteCloudConversation(id: string, userEmail: string) {
  const sql = getDb();
  if (!sql) return false;

  await ensureTablesExist();

  try {
    await sql`
      DELETE FROM cloud_conversations
      WHERE id = ${id} AND user_email = ${userEmail};
    `;
    return true;
  } catch (err) {
    console.error("Error deleting cloud conversation:", err);
    return false;
  }
}

export async function renameCloudConversation(id: string, userEmail: string, title: string) {
  const sql = getDb();
  if (!sql) return false;

  await ensureTablesExist();

  try {
    await sql`
      UPDATE cloud_conversations
      SET title = ${title}, updated_at = NOW()
      WHERE id = ${id} AND user_email = ${userEmail};
    `;
    return true;
  } catch (err) {
    console.error("Error renaming cloud conversation:", err);
    return false;
  }
}

// ----------------------------------------------------
// Individual User Questions History Queries (แยกเก็บประวัติคำถามรายบุคคล)
// ----------------------------------------------------

export async function logIndividualUserPrompt(data: {
  userEmail: string;
  userName?: string;
  prompt: string;
  modelId?: string;
  conversationId?: string;
  ipAddress?: string;
  createdAt?: string;
}) {
  const sql = getDb();
  if (!sql) return null;

  await ensureTablesExist();

  try {
    const createdIso = data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString();
    const result = await sql`
      INSERT INTO user_individual_prompts (
        user_email,
        user_name,
        prompt,
        model_id,
        conversation_id,
        ip_address,
        created_at
      )
      VALUES (
        ${data.userEmail || "guest_user"},
        ${data.userName || null},
        ${data.prompt},
        ${data.modelId || "gemini-3.1-flash-lite"},
        ${data.conversationId || null},
        ${data.ipAddress || "unknown"},
        ${createdIso}
      )
      RETURNING id, created_at;
    `;
    return result[0];
  } catch (err) {
    console.error("Error logging individual user prompt:", err);
    return null;
  }
}

export async function getIndividualUserPrompts(userEmail: string, limit = 100) {
  const sql = getDb();
  if (!sql || !userEmail) return [];

  await ensureTablesExist();

  try {
    const rows = await sql`
      SELECT id, user_email, user_name, prompt, model_id, conversation_id, ip_address, created_at
      FROM user_individual_prompts
      WHERE LOWER(user_email) = LOWER(${userEmail})
      ORDER BY created_at DESC
      LIMIT ${limit};
    `;
    return rows;
  } catch (err) {
    console.error("Error fetching individual user prompts:", err);
    return [];
  }
}

export async function getAllUsersQuestionSummary() {
  const sql = getDb();
  if (!sql) return [];

  await ensureTablesExist();

  try {
    const rows = await sql`
      SELECT 
        uip.user_email,
        COALESCE(MAX(uip.user_name), MAX(u.name), split_part(uip.user_email, '@', 1)) as user_name,
        MAX(u.avatar) as avatar,
        COUNT(*) as total_questions,
        MAX(uip.created_at) as last_question_at,
        (
          SELECT prompt 
          FROM user_individual_prompts sub 
          WHERE sub.user_email = uip.user_email 
          ORDER BY sub.created_at DESC 
          LIMIT 1
        ) as last_question
      FROM user_individual_prompts uip
      LEFT JOIN users u ON u.email = uip.user_email
      GROUP BY uip.user_email
      ORDER BY last_question_at DESC;
    `;
    return rows;
  } catch (err) {
    console.error("Error fetching users question summary:", err);
    return [];
  }
}




