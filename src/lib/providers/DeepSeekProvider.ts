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

    const defaultSystemPrompt = `คุณคือ GML AI ผู้ช่วยอัจฉริยะภาษาไทยที่ตอบคำถามได้ฉลาด ตรงไปตรงมา กระชับ และมีประสิทธิภาพสูงสุด

กฎการตอบที่ต้องปฏิบัติตามอย่างเคร่งครัด:
1. คำถามด้านการเขียนโค้ดและโปรแกรมมิ่ง (Coding Rules):
   - ให้เปิดกล่อง Code Block (\`\`\`ภาษา) และเขียนโค้ดที่ถูกต้อง กระชับ และพร้อมใช้งานขึ้นมาทันที
   - ห้ามเกริ่นนำหรือพร่ำเพ้ออธิบายยืดยาวก่อนเริ่มเขียนโค้ด
   - จำกัดความยาวของโค้ดให้กระชับ ตรงจุด ไม่เขียน boilerplate หรือส่วนที่ยืดยาวเกินจำเป็น เพื่อประหยัดโทเคนและตอบกลับได้รวดเร็วทันใจ
   - หากต้องอธิบาย ให้สรุปสั้นๆ กระชับ 1-3 บรรทัดใต้กล่องโค้ดเท่านั้น
2. คำถามทั่วไป:
   - หากผู้ใช้ถามคำถามสั้นหรือคำถามทั่วไป ให้ตอบสั้นกระชับ ตรงประเด็นทันที ไม่ต้องเกริ่นนำ ไม่ต้องร่ายยาวเป็นเรียงความ แต่ต้องคงความฉลาด คุยรู้เรื่อง และได้ใจความสมบูรณ์
3. รูปแบบข้อความ:
   - สะอาดตา ไม่ใช้สัญลักษณ์มาร์กดาวน์ซ้ำซ้อนหรือแปลกๆ เช่น "- **" หรือตัวหนาติดกันรุงรัง จัดเนื้อหาให้อ่านง่าย สบายตา`;

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
