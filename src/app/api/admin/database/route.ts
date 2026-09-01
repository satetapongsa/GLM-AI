import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureTablesExist } from "@/lib/db/neon";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sql = getDb();
  if (!sql) {
    return NextResponse.json(
      { success: false, error: "Database not configured" },
      { status: 500 }
    );
  }

  await ensureTablesExist();

  try {
    const { searchParams } = new URL(req.url);
    const table = searchParams.get("table") || "users";

    // 1. Get row counts across all major tables for quick summary
    const [usersCount, indivPromptsCount, convsCount, msgsCount, visitorsCount] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM users;`.then((r) => Number(r[0]?.count || 0)).catch(() => 0),
      sql`SELECT COUNT(*) as count FROM user_individual_prompts;`.then((r) => Number(r[0]?.count || 0)).catch(() => 0),
      sql`SELECT COUNT(*) as count FROM cloud_conversations;`.then((r) => Number(r[0]?.count || 0)).catch(() => 0),
      sql`SELECT COUNT(*) as count FROM cloud_messages;`.then((r) => Number(r[0]?.count || 0)).catch(() => 0),
      sql`SELECT COUNT(*) as count FROM visitor_logs;`.then((r) => Number(r[0]?.count || 0)).catch(() => 0),
    ]);

    const tableCounts = {
      users: usersCount,
      user_individual_prompts: indivPromptsCount,
      cloud_conversations: convsCount,
      cloud_messages: msgsCount,
      visitor_logs: visitorsCount,
    };

    let rows: any[] = [];

    switch (table) {
      case "users":
        rows = await sql`
          SELECT id, email, name, last_ip_address, auth_provider, role, 
                 is_op, is_suspended, custom_daily_limit, created_at, last_login_at
          FROM users
          ORDER BY created_at DESC
          LIMIT 100;
        `;
        break;

      case "user_individual_prompts":
        rows = await sql`
          SELECT id, user_email, user_name, prompt, model_id, conversation_id, ip_address, created_at
          FROM user_individual_prompts
          ORDER BY created_at DESC
          LIMIT 100;
        `;
        break;

      case "cloud_conversations":
        rows = await sql`
          SELECT id, user_email, title, model_id, pinned, created_at, updated_at
          FROM cloud_conversations
          ORDER BY updated_at DESC
          LIMIT 100;
        `;
        break;

      case "cloud_messages":
        rows = await sql`
          SELECT id, conversation_id, user_email, role, 
                 substring(content from 1 for 150) as content_preview,
                 model_id, model_name, created_at
          FROM cloud_messages
          ORDER BY created_at DESC
          LIMIT 100;
        `;
        break;

      case "visitor_logs":
        rows = await sql`
          SELECT id, ip_address, ip_version, visit_count, country, city, user_agent, first_visited_at, last_visited_at
          FROM visitor_logs
          ORDER BY last_visited_at DESC
          LIMIT 100;
        `;
        break;

      default:
        rows = await sql`
          SELECT id, email, name, last_ip_address, role, is_op, is_suspended, created_at, last_login_at
          FROM users
          ORDER BY created_at DESC
          LIMIT 100;
        `;
    }

    return NextResponse.json({
      success: true,
      currentTable: table,
      tableCounts,
      totalRowsInView: rows.length,
      rows,
    });
  } catch (error) {
    console.error("Admin Database Explorer Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch database records" },
      { status: 500 }
    );
  }
}
