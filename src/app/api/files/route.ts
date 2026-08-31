import { NextResponse } from "next/server";
import { INITIAL_FILES } from "@/lib/config/defaultData";

export async function GET() {
  return NextResponse.json({ files: INITIAL_FILES });
}
