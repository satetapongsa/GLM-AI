import { Conversation, Prompt, Assistant, FileItem, Message, UserSettings } from "@/lib/types";

export const DEFAULT_SETTINGS: UserSettings = {
  theme: "dark",
  defaultModelId: "gemini-3.1-flash-lite",
  enterToSend: true,
  streamingSpeed: "natural",
  soundEffects: false,
  showDisclaimer: true,
  autoSaveHistory: true,
  systemPromptPreset: "คุณคือผู้ช่วย AI อัจฉริยะที่ตอบคำถามได้ฉลาด ตรงไปตรงมา และกระชับ",
  temperature: 0.7,
};

export const INITIAL_CONVERSATIONS: Conversation[] = [];

export const INITIAL_MESSAGES: Record<string, Message[]> = {};

export const INITIAL_PROMPTS: Prompt[] = [
  {
    id: "prompt-1",
    title: "Senior Full-Stack Code Reviewer",
    description: "ตรวจสอบโค้ดอย่างละเอียด ทั้งด้านความปลอดภัย ประสิทธิภาพ และ Clean Architecture",
    category: "Coding",
    tags: ["React", "TypeScript", "Next.js", "Clean Code"],
    content: "กรุณารีวิวโค้ดชุดนี้ในฐานะ Senior Staff Engineer โดยวิเคราะห์:\n1. ความถูกต้องและ Edge Cases\n2. Performance & Memory Leaks\n3. Security Vulnerabilities\n4. คำแนะนำในการ Refactor ให้ Clean ยิ่งขึ้น",
    isFavorite: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prompt-2",
    title: "B2B SaaS Go-to-Market Strategy",
    description: "วางกลยุทธ์เปิดตัวผลิตภัณฑ์ วางตำแหน่งทางการตลาด และ Growth Tactics",
    category: "Business",
    tags: ["SaaS", "GTM", "Marketing", "Strategy"],
    content: "ทำหน้าที่เป็น Chief Marketing Officer (CMO) ช่วยวางแผนกลยุทธ์ Go-to-Market (GTM) สำหรับผลิตภัณฑ์ SaaS ใหม่ โดยครอบคลุม Value Proposition, ICP, ช่องทาง Acquisition และ Key Metrics ในช่วง 90 วันแรก",
    isFavorite: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prompt-3",
    title: "High-Converting Landing Page Copy",
    description: "เขียนคำพาดหัว (Headline) เนื้อหา และ Call to Action ที่จูงใจผู้อ่าน",
    category: "Marketing",
    tags: ["Copywriting", "CRO", "Landing Page"],
    content: "เขียน Copy สำหรับหน้า Landing Page ของบริการ โดยใช้กรอบ AIDA (Attention, Interest, Desire, Action) ประกอบด้วย Hero Headline, Sub-headline, 3 Key Benefits, Social Proof section และ CTA Buttons",
    isFavorite: false,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_ASSISTANTS: Assistant[] = [];

export const INITIAL_FILES: FileItem[] = [];
