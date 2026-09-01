import { NextRequest, NextResponse } from "next/server";
import {
  getCloudChatData,
  saveCloudConversation,
  saveCloudMessage,
  deleteCloudConversation,
  renameCloudConversation,
  logIndividualUserPrompt,
} from "@/lib/db/neon";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get("userEmail");

    if (!userEmail || userEmail === "guest_user") {
      return NextResponse.json({
        success: true,
        conversations: [],
        messages: {},
      });
    }

    const data = await getCloudChatData(userEmail);
    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Cloud chat fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cloud chat data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userEmail } = body;

    if (!userEmail || userEmail === "guest_user") {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    if (action === "save_conversation") {
      const { conversation } = body;
      if (!conversation?.id) {
        return NextResponse.json({ success: false, error: "Missing conversation" }, { status: 400 });
      }
      await saveCloudConversation({
        id: conversation.id,
        userEmail,
        title: conversation.title || "การสนทนาใหม่",
        modelId: conversation.modelId,
        pinned: conversation.pinned,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      });
      return NextResponse.json({ success: true });
    }

    if (action === "save_message") {
      const { message } = body;
      if (!message?.id || !message?.conversationId) {
        return NextResponse.json({ success: false, error: "Missing message" }, { status: 400 });
      }
      await saveCloudMessage({
        id: message.id,
        conversationId: message.conversationId,
        userEmail,
        role: message.role,
        content: message.content,
        modelId: message.modelId,
        modelName: message.modelName,
        createdAt: message.createdAt,
      });

      // Also log into individual user questions history if role is user
      if (message.role === "user" && message.content?.trim()) {
        logIndividualUserPrompt({
          userEmail,
          prompt: message.content.trim(),
          modelId: message.modelId,
          conversationId: message.conversationId,
          createdAt: message.createdAt,
        }).catch(() => {});
      }

      return NextResponse.json({ success: true });
    }

    if (action === "rename_conversation") {
      const { id, title } = body;
      if (!id || !title) {
        return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
      }
      await renameCloudConversation(id, userEmail, title);
      return NextResponse.json({ success: true });
    }

    if (action === "delete_conversation") {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ success: false, error: "Missing conversation ID" }, { status: 400 });
      }
      await deleteCloudConversation(id, userEmail);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Cloud chat sync error:", error);
    return NextResponse.json(
      { success: false, error: "Internal sync error" },
      { status: 500 }
    );
  }
}
