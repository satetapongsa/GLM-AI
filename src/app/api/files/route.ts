import { NextRequest, NextResponse } from "next/server";
import { getAllLibraryFiles, saveLibraryFile, deleteLibraryFile } from "@/lib/db/neon";

export async function GET(req: NextRequest) {
  try {
    const userEmail = req.nextUrl.searchParams.get("userEmail") || undefined;
    const files = await getAllLibraryFiles(userEmail);
    return NextResponse.json({ success: true, files });
  } catch (error) {
    console.error("Error fetching library files:", error);
    return NextResponse.json({ success: false, files: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, userEmail, fileName, fileType, mimeType, fileSize, fileData, tags } = body;

    if (!fileName || !fileType) {
      return NextResponse.json(
        { success: false, error: "fileName and fileType are required" },
        { status: 400 }
      );
    }

    const saved = await saveLibraryFile({
      id: id || `file-${Date.now()}`,
      userEmail: userEmail || "guest_user",
      fileName,
      fileType,
      mimeType: mimeType || "application/octet-stream",
      fileSize: fileSize || 0,
      fileData,
      tags: tags || [],
    });

    return NextResponse.json({ success: true, file: saved });
  } catch (error) {
    console.error("Error saving library file to Neon DB:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save file to Neon database" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "File ID required" }, { status: 400 });
    }

    await deleteLibraryFile(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting library file from Neon DB:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete file from Neon database" },
      { status: 500 }
    );
  }
}
