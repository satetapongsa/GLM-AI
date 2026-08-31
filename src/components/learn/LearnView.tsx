"use client";

import React, { useState } from "react";
import { BookOpen, Sparkles, Terminal, Cpu, Lightbulb, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useChatStore } from "@/lib/store/useChatStore";
import { useUIStore } from "@/lib/store/useUIStore";

interface Topic {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  samplePrompt?: string;
}

const TOPICS: Topic[] = [
  {
    id: "prompt-frameworks",
    title: "โครงสร้าง Prompt ระดับสูง (C-T-R-F Framework)",
    category: "Prompt Engineering",
    summary: "Context, Task, Restrictions, Format - กรอบคิดเขียน Prompt ให้ได้ผลลัพธ์ตรงเป้าหมาย 100%",
    content: `การเขียน Prompt ที่ดี ไม่ใช่การพิมพ์คำสั่งสั้นๆ แต่คือการกำหนดบริบทที่ชัดเจน:
1. **Context (บริบท):** อธิบายว่าคุณเป็นใคร ทำโปรเจกต์อะไร และกลุ่มเป้าหมายคือใคร
2. **Task (ภารกิจ):** ระบุสิ่งที่ต้องการให้ AI ทำอย่างชัดเจนและเจาะจง
3. **Restrictions (ข้อจำกัด):** ระบุสิ่งที่ไม่ต้องการ เช่น ห้ามเกิน 200 คำ, ห้ามใช้คำศัพท์เฉพาะทาง
4. **Format (รูปแบบผลลัพธ์):** กำหนดว่าต้องการ Markdown, ตาราง, หรือ Code Block`,
    samplePrompt: `Context: ฉันเป็น Product Designer กำลังออกแบบ SaaS Dashboard
Task: ช่วยร่าง User Flow สำหรับฟังก์ชัน Multi-Model Selection
Restrictions: กระชับ ไม่เกิน 5 ขั้นตอน
Format: แบ่งเป็นขั้นตอน 1-5 พร้อมระบุ Touchpoints สำคัญ`,
  },
  {
    id: "parameters",
    title: "เข้าใจ Parameters: Temperature & Top-P",
    category: "AI Fundamentals",
    summary: "การปรับความเสี่ยง ความแม่นยำ และความสร้างสรรค์ของโมเดล AI",
    content: `พารามิเตอร์หลักที่มีผลต่อคำตอบของ AI:
- **Temperature (0.0 - 1.0):** 
  - \`0.0 - 0.3\`: เหมาะกับงานเขียนโค้ด การคำนวณ และการวิเคราะห์ข้อกฎหมาย (Deterministic)
  - \`0.7 - 0.8\`: เหมาะกับการสนทนาทั่วไป การค้นคว้า และการสรุปความ (Balanced)
  - \`0.9 - 1.0+\`: เหมาะกับการคิดไอเดียใหม่ๆ การแต่งเพลง และงานศิลปะ (Creative)
- **Context Window:** ปริมาณ Token สูงสุดที่โมเดลสามารถจดจำได้ในหนึ่งเซสชัน`,
    samplePrompt: "อธิบายความแตกต่างของ Greedy Search กับ Temperature Sampling ในการประมวลผล LLM",
  },
  {
    id: "reasoning-models",
    title: "ทำความรู้จัก Reasoning Models & Chain of Thought",
    category: "Modern AI Architecture",
    summary: "ทำไมโมเดลรุ่นใหม่อย่าง Claude 3.7 Hybrid และ DeepSeek R1 ถึงคิดก่อนตอบ",
    content: `โมเดลกลุ่ม Reasoning ไม่ได้พ่นคำตอบออกมาในทันที แต่จะสร้าง "กระบวนการคิดภายใน" (Thinking / Hidden Scratchpad) เพื่อ:
1. แตกโจทย์ปัญหาที่ซับซ้อนออกเป็นข้อย่อย
2. ทบทวนและตรวจสอบตรรกะของตัวเอง (Self-Correction)
3. ป้องกันการเกิด Hallucination ในงานคำนวณและวิทยาศาสตร์`,
    samplePrompt: "ช่วยวิเคราะห์และพิสูจน์ Time Complexity ของ Dijkstra Algorithm ร่วมกับ Min-Heap",
  },
];

export function LearnView() {
  const [selectedTopic, setSelectedTopic] = useState<Topic>(TOPICS[0]);
  const { setComposerText } = useChatStore();
  const { setActiveTab } = useUIStore();

  const handleTryPrompt = (prompt: string) => {
    setComposerText(prompt);
    setActiveTab("chat");
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-6 border-b border-[hsl(var(--border))]">
        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[hsl(var(--foreground))]">
            เรียนรู้เกี่ยวกับ AI (AI Learning Center)
          </h2>
          <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">
            คู่มือเทคนิคการใช้งาน AI, Prompt Engineering และแนวคิดสถาปัตยกรรมโมเดลสมัยใหม่
          </p>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
        {/* Topics List Sidebar */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider px-1 mb-2">
            หัวข้อบทเรียน
          </h4>
          {TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic)}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                selectedTopic.id === topic.id
                  ? "bg-[hsl(var(--card))] border-[hsl(var(--primary))] shadow-sm ring-1 ring-[hsl(var(--primary)/0.2)]"
                  : "bg-[hsl(var(--muted)/0.4)] border-[hsl(var(--border))] hover:bg-[hsl(var(--card))] hover:border-[hsl(var(--border)/0.8)]"
              }`}
            >
              <span className="text-[10px] font-semibold text-blue-500 uppercase">
                {topic.category}
              </span>
              <h5 className="text-xs sm:text-sm font-bold text-[hsl(var(--foreground))] mt-0.5">
                {topic.title}
              </h5>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1 line-clamp-2">
                {topic.summary}
              </p>
            </button>
          ))}
        </div>

        {/* Selected Topic Content Panel */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                {selectedTopic.category}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-[hsl(var(--card-foreground))]">
              {selectedTopic.title}
            </h3>

            <div className="text-xs sm:text-sm text-[hsl(var(--foreground)/0.85)] leading-relaxed whitespace-pre-line space-y-2 border-t border-[hsl(var(--border))] pt-4">
              {selectedTopic.content}
            </div>

            {selectedTopic.samplePrompt && (
              <div className="mt-6 p-4 rounded-2xl bg-[hsl(var(--muted)/0.6)] border border-[hsl(var(--border))] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[hsl(var(--foreground))] flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    ตัวอย่างคำสั่งทดลองใช้ (Interactive Sample):
                  </span>
                </div>
                <pre className="text-xs font-mono text-[hsl(var(--foreground))] whitespace-pre-wrap bg-[hsl(var(--background))] p-3 rounded-xl border border-[hsl(var(--border))]">
                  {selectedTopic.samplePrompt}
                </pre>
                <div className="flex justify-end pt-1">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleTryPrompt(selectedTopic.samplePrompt!)}
                  >
                    ลองใช้คำสั่งนี้ในแชท
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
