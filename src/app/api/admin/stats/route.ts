import { NextResponse } from "next/server";
import { getAdminStats } from "@/lib/db/neon";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getAdminStats();
    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Admin stats API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
