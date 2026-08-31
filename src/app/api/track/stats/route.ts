import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureVisitorTableExists } from "@/lib/db/neon";

export async function GET(req: NextRequest) {
  try {
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({
        success: false,
        error: "DATABASE_URL is not configured yet.",
      });
    }

    await ensureVisitorTableExists();

    const statsResult = await sql`
      SELECT 
        COUNT(*)::int AS total_unique_ips,
        COALESCE(SUM(visit_count), 0)::int AS total_page_views,
        COUNT(CASE WHEN ip_version = 'IPv4' THEN 1 END)::int AS total_ipv4,
        COUNT(CASE WHEN ip_version = 'IPv6' THEN 1 END)::int AS total_ipv6
      FROM visitor_logs;
    `;

    const recentVisitors = await sql`
      SELECT 
        id,
        ip_address,
        ip_version,
        visit_count,
        country,
        city,
        first_visited_at,
        last_visited_at
      FROM visitor_logs
      ORDER BY last_visited_at DESC
      LIMIT 50;
    `;

    return NextResponse.json({
      success: true,
      summary: statsResult[0],
      recentVisitors,
    });
  } catch (error) {
    console.error("Stats Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500 });
  }
}
