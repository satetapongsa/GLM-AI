import { NextResponse } from "next/server";
import { INITIAL_PROMPTS } from "@/lib/config/defaultData";

export async function GET() {
  return NextResponse.json({ prompts: INITIAL_PROMPTS });
}
