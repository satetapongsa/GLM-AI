import { NextRequest, NextResponse } from "next/server";
import { upsertUser } from "@/lib/db/neon";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, email, name, avatar, authProvider, role } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const savedUser = await upsertUser({
      id,
      email,
      name,
      avatar,
      authProvider: authProvider || "email",
      role: role || "user",
    });

    return NextResponse.json({ success: true, user: savedUser });
  } catch (error) {
    console.error("User Sync Error:", error);
    return NextResponse.json({ success: false, error: "Failed to sync user" }, { status: 500 });
  }
}
