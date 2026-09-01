import { AIProvider, ChatProviderOptions, StreamChunk } from "./AIProvider";

export class MockAIProvider implements AIProvider {
  name = "MockAIProvider";

  private generateIntelligentResponse(
    prompt: string,
    modelId: string,
    systemPrompt?: string
  ): { text: string; reasoning?: string } {
    const promptLower = prompt.toLowerCase().trim();
    const now = new Date();
    const thaiDateStr = now.toLocaleDateString("th-TH", {
      timeZone: "Asia/Bangkok",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const thaiTimeStr = now.toLocaleTimeString("th-TH", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    if (
      promptLower.includes("กี่โมง") ||
      promptLower.includes("เวลาเท่าไหร่") ||
      promptLower.includes("เวลาเท่าไร") ||
      promptLower.includes("ตอนนี้เวลา") ||
      promptLower.includes("เวลาปัจจุบัน") ||
      promptLower.includes("วันนี้วันที่") ||
      promptLower.includes("วันนี้วันอะไร") ||
      promptLower.includes("what time") ||
      promptLower.includes("current time")
    ) {
      return {
        reasoning: `ตรวจสอบเวลาจากนาฬิกาโลกประเทศไทย (Asia/Bangkok UTC+7): ${thaiTimeStr} น.`,
        text: `ตอนนี้เวลา **${thaiTimeStr} น.** ของ${thaiDateStr} (เวลาประเทศไทย Asia/Bangkok, UTC+7) ครับ ⏰🇹🇭`,
      };
    }

    const responses = [
      {
        reasoning: "กำลังค้นหาข้อมูลในคลังสมองของ GML... ติ๊กต่อก ติ๊กต่อก... สรุปได้ว่า:",
        text: `กูไม่รู้ 🤷‍♂️ (สมชื่อ GML / กูไม่รู้เอไอ เลยครับ!) 

ตอนนี้ยังไม่ได้เชื่อมต่อ API ของจริงเข้ามา แต่ระบบ UI, การพิมพ์, การสลับโมเดล และโครงสร้างทั้งหมดทำงานพร้อมใช้งาน 100% แล้วครับ! 🚀`,
      },
      {
        reasoning: "วิเคราะห์พารามิเตอร์ของคำถามอย่างลึกซึ้ง...",
        text: `กูไม่รู้! 😂 ถามเรื่องนี้กูก็ตึ้บเหมือนกันครับ 

GML (กูไม่รู้เอไอ) ขอตอบอย่างตรงไปตรงมาตามคอนเซปต์แบรนด์เลยครับว่าตอนนี้ยังไม่มี API จริงมาป้อนสมองกู แต่หน้าเว็บกับระบบแชทตัวนี้พัฒนาขึ้นมาแบบ Production Ready แล้วนะ!`,
      },
      {
        reasoning: "Chain of Thought: ถามอะไรมาวะเนี่ย... กำลังประมวลผล...",
        text: `ถามกู... กูก็ไม่รู้เหมือนกัน! 🤣 

แต่ถ้าต่อ API ของจริงเมื่อไหร่ ไม่ว่าจะเป็น **Gemini 3.1 Pro**, **Claude Sonnet 5** หรือ **GPT-5.6** กูจะตอบได้ฉลาดกว่านี้ 100 เท่าแน่นอนครับ!`,
      },
      {
        reasoning: "รวบรวมข้อมูลจากโมเดล Deep Reasoning...",
        text: `กูไม่รู้ครับลูกพี่! 🧠💭 

กูไม่รู้เอไอ (GML) รายงานตัวครับ! ตอนนี้กล่องพิมพ์, การแนบไฟล์, ปุ่ม Stop, การสลับธีม และการเลือกโมเดลพร้อมหมดแล้ว รอแค่เสียบ API Key ของจริงเข้าไปก็พร้อมลุยได้เลยครับ!`,
      },
    ];

    // Pick response based on prompt length / random
    const index = Math.abs(prompt.length) % responses.length;
    return responses[index];
  }

  async *streamMessage(
    prompt: string,
    history: { role: "user" | "assistant" | "system"; content: string }[],
    options: ChatProviderOptions
  ): AsyncGenerator<StreamChunk> {
    const { text, reasoning } = this.generateIntelligentResponse(
      prompt,
      options.modelId,
      options.systemPrompt
    );

    let accumulated = "";
    let accumulatedReasoning = "";

    // Stream reasoning first if available
    if (reasoning) {
      const reasoningWords = reasoning.split(" ");
      for (const word of reasoningWords) {
        if (options.signal?.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }
        const delta = word + " ";
        accumulatedReasoning += delta;
        yield {
          content: accumulated,
          delta: "",
          isComplete: false,
          reasoningDelta: delta,
          reasoningContent: accumulatedReasoning,
        };
        await new Promise((r) => setTimeout(r, 20));
      }
    }

    // Stream content words
    const words = text.split(" ");
    for (let i = 0; i < words.length; i++) {
      if (options.signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }

      const word = words[i];
      const delta = (i === 0 ? "" : " ") + word;
      accumulated += delta;

      yield {
        content: accumulated,
        delta,
        isComplete: i === words.length - 1,
        reasoningContent: accumulatedReasoning,
      };

      // Fast natural typing
      const delay = Math.floor(Math.random() * 20) + 15;
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  async sendMessage(
    prompt: string,
    history: { role: "user" | "assistant" | "system"; content: string }[],
    options: ChatProviderOptions
  ): Promise<{ content: string; reasoning?: string; tokensUsed?: number }> {
    const { text, reasoning } = this.generateIntelligentResponse(
      prompt,
      options.modelId,
      options.systemPrompt
    );
    return {
      content: text,
      reasoning,
      tokensUsed: Math.floor(text.length / 4) + 120,
    };
  }
}
