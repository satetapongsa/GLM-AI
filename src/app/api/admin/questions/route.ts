import { NextRequest, NextResponse } from "next/server";
import { getIndividualUserPrompts, getAllUsersQuestionSummary } from "@/lib/db/neon";
import { isRequestAdminAuthorized } from "@/lib/auth/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isRequestAdminAuthorized(req)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Invalid or missing admin token" },
      { status: 401 }
    );
  }
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (email) {
      // Return full question history for a specific individual
      const questions = await getIndividualUserPrompts(email, 100);
      return NextResponse.json({
        success: true,
        email,
        totalQuestions: questions.length,
        questions,
      });
    }

    // Return summary grouped by user
    const userSummaries = await getAllUsersQuestionSummary();
    return NextResponse.json({
      success: true,
      users: userSummaries,
    });
  } catch (error) {
    console.error("Admin user questions API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user questions" },
      { status: 500 }
    );
  }
}
