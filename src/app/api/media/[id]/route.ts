import { NextRequest, NextResponse } from "next/server";
import { getMediaById } from "@/lib/db/neon";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mediaId = parseInt(id, 10);

    if (isNaN(mediaId)) {
      return NextResponse.json({ error: "Invalid media ID" }, { status: 400 });
    }

    const media = await getMediaById(mediaId);

    if (!media || !media.media_data) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Parse base64 data URI (e.g. data:image/png;base64,iVBORw0KGgo...)
    const matches = media.media_data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    let mimeType = media.file_type || "image/jpeg";
    let base64String = media.media_data;

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64String = matches[2];
    } else if (base64String.startsWith("data:")) {
      const commaIdx = base64String.indexOf(",");
      if (commaIdx !== -1) {
        base64String = base64String.slice(commaIdx + 1);
      }
    }

    const buffer = Buffer.from(base64String, "base64");

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": buffer.length.toString(),
        "Content-Disposition": `inline; filename="${encodeURIComponent(media.file_name)}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
