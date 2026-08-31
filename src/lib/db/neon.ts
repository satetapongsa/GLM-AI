import { neon } from "@neondatabase/serverless";

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

let isTableInitialized = false;

export async function ensureVisitorTableExists() {
  if (isTableInitialized) return;

  const sql = getDb();
  if (!sql) return;

  try {
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

    isTableInitialized = true;
  } catch (error) {
    console.error("Neon DB Initialization Error:", error);
  }
}
