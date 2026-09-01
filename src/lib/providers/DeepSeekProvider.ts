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

    // Check if user specifically asks for a list in this prompt
    const promptLower = prompt.toLowerCase();
    const isListRequested =
      promptLower.includes("ลิสต์") ||
      promptLower.includes("ลิส") ||
      promptLower.includes("list") ||
      promptLower.includes("ข้อๆ") ||
      promptLower.includes("เป็นข้อ") ||
      promptLower.includes("หัวข้อ");

    const isOpMode = options.isOpMode === true;

    let defaultSystemPrompt = "";

    if (isOpMode) {
      // OP Admin Mode: Unrestricted full intelligence, long and deep answers
      defaultSystemPrompt = `คุณคือ GML AI ในโหมด [Admin OP Mode: Unrestricted Full Intelligence]
คุณกำลังสนทนากับผู้ดูแลระบบระดับสูง (Admin)
- ปลดล็อคขีดจำกัดความยาวทั้งหมด (ไม่ต้องจำกัด 300 คำ)
- ตอบได้อย่างละเอียด ลึกซึ้ง ครบถ้วน สมบูรณ์แบบที่สุด ไม่กั๊กความรู้
- มีความเป็นมิตร ฉลาด และสุภาพ
${isListRequested ? "- สำหรับคำถามนี้: ผู้ใช้ต้องการคำตอบในรูปแบบรายการ (List/Bullet points) ให้แจกแจงเป็นข้อๆ อย่างชัดเจน" : "- จัดย่อหน้าให้อ่านง่าย มีเหตุผลและโครงสร้างที่สมบูรณ์"}`;
    } else {
      // Standard Economy Mode: STRICT 300-WORD HARD CAP
      defaultSystemPrompt = `คุณคือ GML AI ผู้ช่วยอัจฉริยะภาษาไทยที่ตอบคำถามได้ฉลาด กระชับ ตรงประเด็น และเป็นธรรมชาติ

กฎเหล็กด้านความยาวและการประหยัดโทเคน (Strict 300-Word Hard Cap):
- ห้ามตอบยาวเกิน 300 คำในทุกกรณีเด็ดขาด! ไม่ว่าคำถามจะยาก ซับซ้อน หรือขอให้ตอบละเอียดแค่ไหนก็ตาม ให้สรุปใจความสำคัญ ตอบให้ฉลาด กระชับ สั้น และตรงประเด็นทันที
- ไม่อารัมภบท ไม่เกริ่นนำ ไม่พิมพ์ทวนคำถาม ไม่ร่ายยาวเวิ่นเว้อ

สไตล์และรูปแบบการตอบ:
1. ความเป็นมิตร: พูดคุยอย่างเป็นธรรมชาติ เป็นกันเอง สุภาพ มีสัมมาคารวะ อบอุ่น ไม่หยาบคาย และไม่แข็งทื่อ
2. รูปแบบข้อความ:
${
  isListRequested
    ? "   - ผู้ใช้ร้องขอแบบรายการ ให้ตอบเป็นข้อๆ (List / Bullet points) สั้น กระชับ ชัดเจน"
    : "   - ตอบเป็นย่อหน้า (Paragraph) ร้อยเรียงอย่างลื่นไหล สมูท คลีน มีการเว้นวรรคแต่พอดี ห้ามตอบเป็นลิสต์พร่ำเพรื่อ"
}
3. การส่งมอบ Prompt และ Code:
   - หากผู้ใช้ขอ Prompt (เช่น คำสั่งสร้างภาพ Midjourney/Flux/SD, คำสั่งวิดีโอ, คำสั่ง AI), โค้ดโปรแกรม, หรือข้อความที่ต้องการให้คัดลอก:
     * ให้ใส่ "ตัว Prompt หรือ โค้ดภาษาอังกฤษเนื้อๆ" ไว้ข้างใน Code Block เสมอ (\`\`\` หรือ \`\`\`prompt) เพื่อให้ผู้ใช้กดปุ่มคัดลอกได้ทันที
     * ห้ามเอาข้อความอธิบายภาษาไทยหรือเคล็ดลับไปใส่ใน Code Block เด็ดขาด!
     * ข้อความอธิบาย เคล็ดลับเพิ่มเติม หรือคำแนะนำ ให้เขียนไว้ "นอก Code Block" เป็นข้อความปกติ พร้อมเน้นตัวหนา (**หัวข้อ**) ให้อ่านง่าย`;
    }

    const systemMessageContent = options.systemPrompt || defaultSystemPrompt;

    const messages = [
      { role: "system", content: systemMessageContent },
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: prompt },
    ];

    const maxTokensLimit = isOpMode ? 4096 : 450;

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
          temperature: isOpMode ? (options.temperature ?? 0.7) : 0.6,
          max_tokens: maxTokensLimit,
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
