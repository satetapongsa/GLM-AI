import { NextRequest, NextResponse } from "next/server";
import { getAIProvider } from "@/lib/providers";
import { AVAILABLE_MODELS } from "@/lib/config/models";
import { logUserPrompt, logIndividualUserPrompt, getUserByEmail } from "@/lib/db/neon";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, modelId, history = [], systemPrompt, isOpMode, userEmail } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Check if user is suspended or granted OP by Admin in Neon DB
    let effectiveOpMode = isOpMode === true;
    let dbUser: any = null;
    if (userEmail && userEmail !== "guest_user") {
      try {
        dbUser = await getUserByEmail(userEmail);
        if (dbUser?.is_suspended) {
          return NextResponse.json(
            { error: "บัญชีของคุณถูกระงับการใช้งานโดยผู้ดูแลระบบ (Account Suspended by Admin)" },
            { status: 403 }
          );
        }
        if (dbUser?.is_op) {
          effectiveOpMode = true;
        }
      } catch (err) {
        console.error("Non-fatal: Error checking user status in Neon DB:", err);
      }
    }

    // Extract client IP address for logging
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || "unknown";

    // Asynchronously log user question/prompt into general and per-individual tables in Neon PostgreSQL
    if (prompt.trim() !== "/op" && prompt.trim() !== "/deop") {
      logUserPrompt({
        prompt: prompt.trim(),
        modelId: modelId || "deepseek-chat",
        userEmail: userEmail || "guest_user",
        ipAddress,
      }).catch((err) => {
        console.error("Non-fatal: failed to log user prompt to Neon DB:", err);
      });

      logIndividualUserPrompt({
        prompt: prompt.trim(),
        modelId: modelId || "deepseek-chat",
        userEmail: userEmail || "guest_user",
        userName: dbUser?.name || undefined,
        ipAddress,
      }).catch((err) => {
        console.error("Non-fatal: failed to log individual user prompt to Neon DB:", err);
      });
    }

    const currentModel = AVAILABLE_MODELS.find((m) => m.id === modelId);
    const providerName = currentModel?.provider || "DeepSeek";
    const provider = getAIProvider(providerName);

    // Create a streaming response
    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
      async start(controller) {
        try {
          const stream = provider.streamMessage(prompt, history, {
            modelId: modelId || "deepseek-chat",
            systemPrompt,
            isOpMode: effectiveOpMode,
          });

          for await (const chunk of stream) {
            // Encode as JSON SSE payload so client gets both content and reasoning traces
            const payload = JSON.stringify({
              delta: chunk.delta,
              content: chunk.content,
              reasoningDelta: chunk.reasoningDelta,
              reasoningContent: chunk.reasoningContent,
              isComplete: chunk.isComplete,
            }) + "\n";

            controller.enqueue(encoder.encode(payload));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(customReadable, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("API Chat Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
