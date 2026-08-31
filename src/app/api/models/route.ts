import { NextResponse } from "next/server";
import { AVAILABLE_MODELS, MODEL_CATEGORIES } from "@/lib/config/models";

export async function GET() {
  return NextResponse.json({
    models: AVAILABLE_MODELS,
    categories: MODEL_CATEGORIES,
  });
}
