import { NextRequest, NextResponse } from "next/server";
import { saveUploadedMedia } from "@/lib/db/neon";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileName, fileType, fileSize, mediaData, userEmail } = body;

    if (!fileName || !mediaData) {
      return NextResponse.json(
        { success: false, error: "Missing required file data" },
        { status: 400 }
      );
    }

    const saved = await saveUploadedMedia({
      fileName,
      fileType,
      fileSize,
      mediaData,
      userEmail,
    });

    return NextResponse.json({
      success: true,
      data: saved,
    });
  } catch (error) {
    console.error("Failed to save media to Neon PostgreSQL:", error);
    return NextResponse.json(
      { success: false, error: "Database error" },
      { status: 500 }
    );
  }
}
