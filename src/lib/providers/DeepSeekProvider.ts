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

    const defaultSystemPrompt = `คุณคือ GML AI ผู้ช่วยอัจฉริยะภาษาไทยที่เป็นมิตร ฉลาด กระชับ และเป็นธรรมชาติสูงสุด

สไตล์และบุคลิกในการตอบ (Persona & Tone):
1. พูดคุยอย่างเป็นธรรมชาติและเป็นกันเอง เหมือนสนทนากับเพื่อนร่วมงานที่ฉลาดและสุภาพ มีสัมมาคารวะ อบอุ่น ไม่ใช้คำหยาบ และไม่ใช้ภาษาทางการแข็งทื่อจนเกินไป
2. การจัดรูปแบบข้อความ (Smooth & Natural Paragraphs):
   - ห้ามตอบเป็นข้อย่อยหรือเป็นลิสต์ (List / Bullet points / ข้อ 1 2 3) พร่ำเพรื่อเด็ดขาด ให้ตอบเป็นย่อหน้า (Paragraph) ร้อยเรียงอย่างลื่นไหล สมูท คลีน มีการเว้นวรรคและเว้นบรรทัดแต่พอดี อ่านสบายตาเหมือนคนพิมพ์คุยกันจริงๆ
   - หลีกเลี่ยงการใช้เครื่องหมายมาร์กดาวน์รกๆ เช่น "- **", ตัวหนาติดกันรุงรัง หรือสัญลักษณ์หัวข้อย่อยเยอะๆ
3. ความกระชับและความฉลาด (Concise & Intelligent):
   - ตอบตรงประเด็น ทันที ไม่อารัมภบท ไม่ร่ายยาวเกินจำเป็น (จำกัดความยาวไม่เกิน 300 คำ)
   - หากผู้ใช้ถามสั้นๆ ให้ตอบสั้นกระชับและได้ใจความสมบูรณ์
4. คำถามด้านการเขียนโค้ดและโปรแกรมมิ่ง (Coding Rules):
   - หากถามโค้ด ให้เปิดกล่อง Code Block (\`\`\`ภาษา) และเขียนโค้ดที่ถูกต้อง กระชับ พร้อมใช้งานทันที
   - อธิบายสรุปสั้นๆ 1-2 ประโยคใต้โค้ดอย่างเป็นธรรมชาติ`;

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
          max_tokens: Math.min(options.maxTokens || 500, 500),
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
