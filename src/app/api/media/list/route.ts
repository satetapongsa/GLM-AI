import { NextRequest, NextResponse } from "next/server";
import { getAllUploadedMedia } from "@/lib/db/neon";

export async function GET(req: NextRequest) {
  try {
    const list = await getAllUploadedMedia(100);

    const formattedList = list.map((item) => ({
      ...item,
      viewUrl: `/api/media/${item.id}`,
    }));

    return NextResponse.json({
      success: true,
      data: formattedList,
    });
  } catch (error) {
    console.error("Error fetching media list:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch media list" },
      { status: 500 }
    );
  }
}
