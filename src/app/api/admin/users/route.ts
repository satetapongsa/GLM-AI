import { NextRequest, NextResponse } from "next/server";
import { getAllUsersForAdmin, updateUserAdminControl } from "@/lib/db/neon";
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
    const users = await getAllUsersForAdmin();
    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isRequestAdminAuthorized(req)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Invalid or missing admin token" },
      { status: 401 }
    );
  }
  try {
    const body = await req.json();
    const { userId, action, value } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: userId and action" },
        { status: 400 }
      );
    }

    let updateData: {
      isOp?: boolean;
      isSuspended?: boolean;
      customDailyLimit?: number;
    } = {};

    if (action === "toggle_op") {
      updateData.isOp = Boolean(value);
    } else if (action === "toggle_suspend") {
      updateData.isSuspended = Boolean(value);
    } else if (action === "set_tokens") {
      const limit = parseInt(value, 10);
      if (isNaN(limit) || limit < 0) {
        return NextResponse.json(
          { success: false, error: "Invalid token limit" },
          { status: 400 }
        );
      }
      updateData.customDailyLimit = limit;
    } else {
      return NextResponse.json(
        { success: false, error: "Unknown action" },
        { status: 400 }
      );
    }

    const updatedUser = await updateUserAdminControl(userId, updateData);

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user admin control:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user control" },
      { status: 500 }
    );
  }
}
