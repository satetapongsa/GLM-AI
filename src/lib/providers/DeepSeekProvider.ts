import { AIProvider, ChatProviderOptions, StreamChunk } from "./AIProvider";
import { MockAIProvider } from "./MockAIProvider";

export class DeepSeekProvider implements AIProvider {
  name = "DeepSeek";
  private apiKey: string;
  private baseUrl: string;
  private fallbackProvider: MockAIProvider;

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || "";
    this.baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
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

    const defaultSystemPrompt = `คุณคือ GML AI ผู้ช่วยอัจฉริยะภาษาไทยที่ตอบคำถามได้ฉลาด ตรงไปตรงมา กระชับ และเป็นธรรมชาติ
กฎการตอบ:
1. ตอบตรงประเด็นและกระชับ (Concise & Direct): หากผู้ใช้ถามคำถามสั้นหรือคำถามทั่วไป ให้ตอบสั้นกระชับ ตรงประเด็นทันที ไม่ต้องเกริ่นนำ ไม่ต้องอารัมภบทยืดยาว ไม่ต้องแบ่งข้อย่อยยาวเหยียดเกินความจำเป็น แต่ต้องได้ใจความสมบูรณ์ ถูกต้อง และฉลาด
2. ไม่ใช้สัญลักษณ์มาร์กดาวน์พร่ำเพรื่อ: หลีกเลี่ยงการใช้สัญลักษณ์ซ้ำซ้อนหรือแปลกๆ เช่น "- **" หรือตัวหนาติดกันรุงรัง จัดเนื้อหาให้อ่านง่าย สบายตา สะอาดตา
3. หากผู้ใช้ต้องการรายละเอียด เจาะลึก หรือเขียนโปรแกรม จึงค่อยอธิบายละเอียดเป็นขั้นตอน`;

    const systemMessageContent = options.systemPrompt || defaultSystemPrompt;

    const messages = [
      { role: "system", content: systemMessageContent },
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
          max_tokens: options.maxTokens ?? 2048,
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

        const rawText = decoder.decode(value, { stream: true });
        const lines = rawText.split("\n");

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data:")) continue;
          if (trimmed === "data: [DONE]") {
            yield {
              delta: "",
              content: accumulatedContent,
              reasoningDelta: "",
              reasoningContent: accumulatedReasoning,
              isComplete: true,
            };
            return;
          }

          try {
            const jsonStr = trimmed.replace(/^data:\s*/, "");
            const parsed = JSON.parse(jsonStr);
            const choice = parsed.choices?.[0];

            if (choice) {
              const deltaContent = choice.delta?.content || "";
              const deltaReasoning = choice.delta?.reasoning_content || "";

              accumulatedContent += deltaContent;
              accumulatedReasoning += deltaReasoning;

              yield {
                delta: deltaContent,
                content: accumulatedContent,
                reasoningDelta: deltaReasoning,
                reasoningContent: accumulatedReasoning,
                isComplete: choice.finish_reason !== null,
              };
            }
          } catch {
            // Ignore parse errors on partial chunks
          }
        }
      }

      yield {
        delta: "",
        content: accumulatedContent,
        reasoningDelta: "",
        reasoningContent: accumulatedReasoning,
        isComplete: true,
      };
    } catch (error) {
      console.error("DeepSeek API stream error, falling back to simulated engine:", error);
      yield* this.fallbackProvider.streamMessage(prompt, history, options);
    }
  }

  async sendMessage(
    prompt: string,
    history: { role: "user" | "assistant" | "system"; content: string }[],
    options: ChatProviderOptions
  ): Promise<{ content: string; reasoning?: string; tokensUsed?: number }> {
    let fullContent = "";
    let fullReasoning = "";

    const stream = this.streamMessage(prompt, history, options);
    for await (const chunk of stream) {
      fullContent = chunk.content;
      if (chunk.reasoningContent) {
        fullReasoning = chunk.reasoningContent;
      }
    }

    return {
      content: fullContent,
      reasoning: fullReasoning || undefined,
      tokensUsed: Math.max(1, Math.round(fullContent.length / 4)),
    };
  }
}
