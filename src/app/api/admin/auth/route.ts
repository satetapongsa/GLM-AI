import { NextRequest, NextResponse } from "next/server";
import { validateAdminPassword, generateAdminToken } from "@/lib/auth/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "กรุณาป้อนรหัสผ่าน" },
        { status: 400 }
      );
    }

    // Server-side password validation
    const isValid = validateAdminPassword(password);

    if (!isValid) {
      // Artificial delay to prevent brute-force attacks
      await new Promise((resolve) => setTimeout(resolve, 350));
      return NextResponse.json(
        { success: false, error: "รหัสผ่านลับไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง" },
        { status: 401 }
      );
    }

    // Issue cryptographically signed token
    const token = generateAdminToken();

    return NextResponse.json({
      success: true,
      token,
      message: "ยินดีต้อนรับเข้าสู่ระบบแดชบอร์ดแอดมิน",
    });
  } catch (error) {
    console.error("Admin auth API error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์" },
      { status: 500 }
    );
  }
}
