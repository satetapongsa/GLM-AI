import { AIProvider, ChatProviderOptions, StreamChunk } from "./AIProvider";
import { MockAIProvider } from "./MockAIProvider";

export class DeepSeekProvider implements AIProvider {
  name = "DeepSeekProvider";
  private apiKey: string;
  private baseUrl: string;
  private fallbackProvider: MockAIProvider;

  constructor(apiKey?: string, baseUrl: string = "https://api.deepseek.com") {
    this.apiKey = apiKey || process.env.DEEPSEEK_API_KEY || "";
    this.baseUrl = baseUrl;
    this.fallbackProvider = new MockAIProvider();
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  async *streamMessage(
    prompt: string,
    history: { role: "user" | "assistant" | "system"; content: string }[],
    options: ChatProviderOptions
  ): AsyncGenerator<StreamChunk> {
    // If no API key configured, use simulated GML stream
    if (!this.apiKey) {
      yield* this.fallbackProvider.streamMessage(prompt, history, options);
      return;
    }

    // Map internal model IDs to official DeepSeek model IDs
    let modelName = "deepseek-chat";
    if (options.modelId.includes("r1") || options.modelId.includes("r2") || options.modelId.includes("reasoning")) {
      modelName = "deepseek-reasoner";
    }

    const messages = [
      ...(options.systemPrompt ? [{ role: "system", content: options.systemPrompt }] : []),
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: prompt },
    ];

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages,
          stream: true,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 4096,
        }),
        signal: options.signal,
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error("No response body received from DeepSeek");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";
      let accumulatedReasoning = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.trim().startsWith("data:"));

        for (const line of lines) {
          const jsonStr = line.replace(/^data:\s*/, "").trim();
          if (jsonStr === "[DONE]") continue;

          try {
            const data = JSON.parse(jsonStr);
            const delta = data.choices?.[0]?.delta;

            // DeepSeek Reasoner sends `reasoning_content`
            if (delta?.reasoning_content) {
              accumulatedReasoning += delta.reasoning_content;
              yield {
                content: accumulatedContent,
                delta: "",
                isComplete: false,
                reasoningDelta: delta.reasoning_content,
                reasoningContent: accumulatedReasoning,
              };
            }

            // Regular content chunks
            if (delta?.content) {
              accumulatedContent += delta.content;
              yield {
                content: accumulatedContent,
                delta: delta.content,
                isComplete: false,
                reasoningContent: accumulatedReasoning,
              };
            }
          } catch {
            // Ignore parse errors on partial SSE chunks
          }
        }
      }

      yield {
        content: accumulatedContent,
        delta: "",
        isComplete: true,
        reasoningContent: accumulatedReasoning,
      };
    } catch (err: unknown) {
      if ((err as Error).name === "AbortError") {
        throw err;
      }
      console.warn("DeepSeek API connection failed, using fallback:", err);
      yield* this.fallbackProvider.streamMessage(prompt, history, options);
    }
  }

  async sendMessage(
    prompt: string,
    history: { role: "user" | "assistant" | "system"; content: string }[],
    options: ChatProviderOptions
  ): Promise<{ content: string; reasoning?: string; tokensUsed?: number }> {
    if (!this.apiKey) {
      return this.fallbackProvider.sendMessage(prompt, history, options);
    }

    let modelName = "deepseek-chat";
    if (options.modelId.includes("r1") || options.modelId.includes("r2") || options.modelId.includes("reasoning")) {
      modelName = "deepseek-reasoner";
    }

    const messages = [
      ...(options.systemPrompt ? [{ role: "system", content: options.systemPrompt }] : []),
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: prompt },
    ];

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 4096,
      }),
      signal: options.signal,
    });

    const data = await response.json();
    return {
      content: data.choices?.[0]?.message?.content || "",
      reasoning: data.choices?.[0]?.message?.reasoning_content || undefined,
      tokensUsed: data.usage?.total_tokens,
    };
  }
}
