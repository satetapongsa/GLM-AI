import { NextRequest, NextResponse } from "next/server";
import { getAdminStats } from "@/lib/db/neon";
import { isRequestAdminAuthorized } from "@/lib/auth/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isRequestAdminAuthorized(req)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Invalid or missing admin token" },
      { status: 401 }
    );
  }

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
