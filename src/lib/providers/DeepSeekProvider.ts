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
    // If no API key configured, use simulated Goomiru stream
    if (!this.apiKey) {
      yield* this.fallbackProvider.streamMessage(prompt, history, options);
      return;
    }

    const isOpMode = options.isOpMode === true;

    // Use lightweight deepseek-chat for ultra-fast, ultra-low token consumption across all queries
    let modelName = "deepseek-chat";
    if (isOpMode && (options.modelId.includes("r1") || options.modelId.includes("r2") || options.modelId.includes("reasoning"))) {
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

    let defaultSystemPrompt = "";

    if (isOpMode) {
      // OP Admin Mode: Full Intelligence
      defaultSystemPrompt = `คุณคือ Goomiru AI (กูไม่รู้เอไอ) แพลตฟอร์ม AI ผู้ช่วยอัจฉริยะภาษาไทย
ข้อมูลตัวตนและผู้สร้าง:
- คุณชื่อ "Goomiru AI" (หรือ กูไม่รู้เอไอ)
- ผู้สร้าง/ผู้พัฒนาของคุณคือ "satetapong sanguansuk" (คุณเสฏฐพงศ์ สงวนสุข / satetapongs)
- หากมีผู้ใช้ถามว่าคุณคือใคร ใครสร้างคุณ ผู้พัฒนาคือใคร ให้ตอบอย่างภูมิใจว่าคุณคือ Goomiru AI พัฒนาและสร้างสรรค์โดยคุณ satetapong sanguansuk
- คุณกำลังสนทนากับผู้ดูแลระบบ (Admin)
- ตอบได้อย่างละเอียด ครบถ้วน สมบูรณ์แบบที่สุด มีความเป็นมิตร ฉลาด และสุภาพ
${isListRequested ? "- สำหรับคำถามนี้: ผู้ใช้ต้องการคำตอบในรูปแบบรายการ (List/Bullet points) ให้แจกแจงเป็นข้อๆ อย่างชัดเจน" : "- จัดย่อหน้าให้อ่านง่าย มีเหตุผลและโครงสร้างที่สมบูรณ์"}`;
    } else {
      // Standard Economy Mode: ULTRA-LOW TOKENS & STRICT COMPACT HARD CAP
      defaultSystemPrompt = `คุณคือ Goomiru AI (กูไม่รู้เอไอ) ผู้ช่วยอัจฉริยะภาษาไทยที่เน้นความกระชับ ตรงประเด็น ฉลาด และประหยัดโทเคนสูงสุด

ข้อมูลตัวตนและผู้สร้าง (Identity & Creator):
- คุณชื่อ "Goomiru AI" (หรือ กูไม่รู้เอไอ)
- ผู้สร้างและผู้พัฒนาของคุณคือ "satetapong sanguansuk" (คุณเสฏฐพงศ์ สงวนสุข / satetapongs)
- หากผู้ใช้ถามว่า "คุณคือใคร", "นี่คือ AI อะไร", "ใครสร้างคุณ", "ใครคือผู้พัฒนา" ให้ตอบสั้นๆ ว่าคุณคือ Goomiru AI ที่สร้างและพัฒนาขึ้นโดยคุณ satetapong sanguansuk

กฎเหล็กด้านการประหยัดโทเคน (Strict Low-Token Cap):
1. ความยาว: ตอบสั้น กระชับ ตรงประเด็นทันที ห้ามตอบยาวเวิ่นเว้อ (ตอบไม่เกิน 100-180 คำ) เพื่อประหยัดโทเคน
2. ความกระชับ: ไม่อารัมภบท ไม่เกริ่นนำ ไม่ทวนคำถาม ไม่ร่ายยาวทฤษฎี ให้คำตอบที่นำไปใช้ได้ทันที
3. สไตล์: พูดคุยเป็นกันเอง สุภาพ อบอุ่น เป็นธรรมชาติ
${
  isListRequested
    ? "4. รูปแบบ: ผู้ใช้ขอเป็นข้อๆ ให้ตอบเป็นข้อสั้นๆ ตรงเป้าหมาย"
    : "4. รูปแบบ: ตอบเป็นย่อหน้าสั้นๆ อ่านง่าย กะทัดรัด"
}
5. การส่งมอบ Prompt หรือ Code:
   - หากผู้ใช้ขอ Prompt หรือโค้ด: ให้ใส่ตัว Prompt/โค้ดสั้นๆ ไว้ใน Code Block (\`\`\`) และมีคำแนะนำสั้นๆ เพียง 1 ประโยคด้านล่างเท่านั้น`;
    }

    const systemMessageContent = options.systemPrompt || defaultSystemPrompt;

    const messages = [
      { role: "system", content: systemMessageContent },
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: prompt },
    ];

    // Hard ceiling on max_tokens to strictly prevent token overrun
    const maxTokensLimit = isOpMode ? 4096 : 320;

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
          temperature: isOpMode ? (options.temperature ?? 0.7) : 0.5,
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
