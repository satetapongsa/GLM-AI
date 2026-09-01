import { NextRequest, NextResponse } from "next/server";
import { upsertUser } from "@/lib/db/neon";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, email, name, avatar, authProvider, role } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    // Extract client IP address for per-account IP tracking
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || undefined;

    const savedUser = await upsertUser({
      id,
      email,
      name,
      avatar,
      authProvider: authProvider || "email",
      role: role || "user",
      ipAddress,
    });

    return NextResponse.json({ success: true, user: savedUser });
  } catch (error) {
    console.error("User Sync Error:", error);
    return NextResponse.json({ success: false, error: "Failed to sync user" }, { status: 500 });
  }
}
