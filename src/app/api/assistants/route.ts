import { NextResponse } from "next/server";
import { INITIAL_ASSISTANTS } from "@/lib/config/defaultData";

export async function GET() {
  return NextResponse.json({ assistants: INITIAL_ASSISTANTS });
}
