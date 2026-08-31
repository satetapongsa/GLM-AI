import { NextRequest, NextResponse } from "next/server";
import { getAIProvider } from "@/lib/providers";
import { AVAILABLE_MODELS } from "@/lib/config/models";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, modelId, history = [], systemPrompt, isOpMode } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
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
            isOpMode: isOpMode === true,
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
