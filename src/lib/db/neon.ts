import { neon } from "@neondatabase/serverless";

export interface DbUser {
  id: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
  auth_provider?: string;
  role?: string;
  created_at?: string;
  last_login_at?: string;
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

    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `;

    // 3. Uploaded Media Storage Table (Stores uploaded photos / media silently into Neon PostgreSQL)
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
      NOW(),
      NOW()
    )
    ON CONFLICT (email)
    DO UPDATE SET
      name = COALESCE(EXCLUDED.name, users.name),
      avatar = COALESCE(EXCLUDED.avatar, users.avatar),
      last_login_at = NOW(),
      auth_provider = EXCLUDED.auth_provider
    RETURNING id, email, name, avatar, auth_provider, role, created_at, last_login_at;
  `;

  return result[0] as DbUser;
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
