import { NextRequest, NextResponse } from "next/server";
import { getRealIp } from "@/lib/utils/getRealIp";
import { getDb, ensureVisitorTableExists } from "@/lib/db/neon";

export async function POST(req: NextRequest) {
  try {
    const ipInfo = getRealIp(req);
    const sql = getDb();

    if (!sql) {
      // Return safe info if DATABASE_URL not yet configured
      return NextResponse.json({
        success: true,
        tracked: false,
        ip: ipInfo.ip,
        version: ipInfo.version,
        message: "DATABASE_URL is not set. Real IP detected.",
      });
    }

    await ensureVisitorTableExists();

    // Upsert visitor record: insert or increment visit count and update last_visited_at
    const result = await sql`
      INSERT INTO visitor_logs (
        ip_address,
        ip_version,
        visit_count,
        user_agent,
        country,
        city,
        first_visited_at,
        last_visited_at
      )
      VALUES (
        ${ipInfo.ip},
        ${ipInfo.version},
        1,
        ${ipInfo.userAgent || null},
        ${ipInfo.country || null},
        ${ipInfo.city || null},
        NOW(),
        NOW()
      )
      ON CONFLICT (ip_address)
      DO UPDATE SET
        visit_count = visitor_logs.visit_count + 1,
        last_visited_at = NOW(),
        user_agent = COALESCE(EXCLUDED.user_agent, visitor_logs.user_agent),
        country = COALESCE(EXCLUDED.country, visitor_logs.country),
        city = COALESCE(EXCLUDED.city, visitor_logs.city)
      RETURNING id, ip_address, ip_version, visit_count, first_visited_at, last_visited_at, country, city;
    `;

    const visitor = result[0];

    return NextResponse.json({
      success: true,
      tracked: true,
      data: {
        ip: visitor.ip_address,
        version: visitor.ip_version,
        visitCount: visitor.visit_count,
        firstVisited: visitor.first_visited_at,
        lastVisited: visitor.last_visited_at,
        country: visitor.country,
        city: visitor.city,
      },
    });
  } catch (error) {
    console.error("Tracking Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record visitor log" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
