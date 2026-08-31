import { QuickAction } from "@/lib/types";

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "compare-models",
    label: "เปรียบเทียบโมเดล",
    description: "ทดสอบและวิเคราะห์ผลลัพธ์ของหลายโมเดลพร้อมกัน",
    iconName: "ArrowLeftRight",
    category: "compare",
    suggestedPrompt: "ช่วยเปรียบเทียบจุดเด่นและกรณีการใช้งานที่เหมาะสมระหว่าง Gemini 3.1 Pro, Claude Sonnet 5 และ GPT-5.6 ให้ดูหน่อยในรูปแบบตาราง",
  },
  {
    id: "gen-image",
    label: "สร้างรูปภาพ",
    description: "สร้างภาพจินตนาการ คอนเซ็ปต์อาร์ต หรือภาพสินค้า",
    iconName: "Image",
    category: "generation",
    suggestedPrompt: "สร้างคำสั่ง Prompt สำหรับสร้างภาพ Futuristic City ในยามค่ำคืนที่มีแสงนีออน",
  },
  {
    id: "gen-video",
    label: "สร้างวิดีโอ",
    description: "สร้างสตอรี่บอร์ดและวิดีโอคลิปความคมชัดสูง",
    iconName: "Clapperboard",
    category: "generation",
    suggestedPrompt: "เขียน Storyboard และ Prompt สำหรับเจนเนอเรตวิดีโอโฆษณาสินค้ากาแฟสกัดเย็นความยาว 15 วินาที",
  },
  {
    id: "gen-music",
    label: "สร้างเพลง",
    description: "แต่งเพลง ทำนอง และเนื้อร้องสไตล์สตูดิโอ",
    iconName: "AudioLines",
    category: "generation",
    suggestedPrompt: "ช่วยเขียนเนื้อเพลงและสไตล์ดนตรีสำหรับเพลงแนว Lofi Chill Beats สำหรับเปิดฟังตอนทำงาน",
  },
  {
    id: "deep-research",
    label: "ค้นคว้าเชิงลึก",
    description: "วิเคราะห์ข้อมูล สรุปงานวิจัย และรายงานเชิงลึก",
    iconName: "Telescope",
    category: "analysis",
    suggestedPrompt: "ทำการค้นคว้าและวิเคราะห์แนวโน้มเทคโนโลยี AI Agents และแนวทางการนำมาประยุกต์ใช้ในธุรกิจ",
  },
];
