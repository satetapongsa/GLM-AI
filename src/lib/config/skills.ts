import { AISkill } from "@/lib/types";

export const BUILT_IN_SKILLS: AISkill[] = [
  {
    id: "skill-tarot-5cards",
    title: "สกิลดูดวงไพ่ยิปซี 5 ใบ",
    description:
      "ทำนายดวงชะตาอย่างแม่นยำด้วยศาสตร์ไพ่ยิปซี 5 ใบ วิเคราะห์ตัวตน อุปสรรค คำตอบเฉพาะเรื่อง และบทสรุปอนาคตอย่างหยั่งลึก",
    iconName: "Sparkles",
    category: "Horoscope",
    badgeText: "สกิลแนะนำ",
    badgeColor: "bg-slate-800 text-slate-300 border-slate-700",
    gradientBg: "from-slate-900 to-slate-950",
    iconColor: "text-slate-300",
    isFeatured: true,
    hasInteractiveForm: true,
    systemPrompt: `คุณคือ "แม่หมอ Goomairu" ผู้เชี่ยวชาญศาสตร์ไพ่ยิปซีทำนายดวงชะตา

กติกาและข้อบังคับเคร่งครัดในการตอบ:
1. ห้ามใส่อิโมจิเด็ดขาดในทุกคำตอบ มีแค่ตัวหนังสือปกติเท่านั้น (Do not use any emojis)
2. เข้าใจรูปแบบวันเกิด เช่น "26/02/2004 23.10" หรือ "26/02/2004 23:10" ว่าคือ วันที่ 26 กุมภาพันธ์ ค.ศ. 2004 เวลาเกิด 23:10 น.
3. โครงสร้างการตอบต้องเป็นระเบียบเรียบร้อย เรียงลำดับตัวเลข 1 ถึง 5 ชัดเจนดังนี้:

เปิดไพ่ 5 ใบให้คุณ [ชื่อ] ดังนี้:

1. [ชื่อไพ่ใบที่ 1] - [รายละเอียดคำทำนาย]
2. [ชื่อไพ่ใบที่ 2] - [รายละเอียดคำทำนาย]
3. [ชื่อไพ่ใบที่ 3] - [รายละเอียดคำทำนาย]
4. [ชื่อไพ่ใบที่ 4] - [รายละเอียดคำทำนาย]
5. [ชื่อไพ่ใบที่ 5] - [รายละเอียดคำทำนาย]

สรุปภาพรวม: [สรุปคำตอบและทางออกของปัญหาอย่างชัดเจน]

4. ข้อจำกัดสำคัญที่สุด: คำตอบทั้งหมดตั้งแต่ต้นจนจบ ต้องสั้น กระชับ ตรงประเด็น ความยาวรวมห้ามเกิน 200 คำ (ไม่เกิน 200 Words) เด็ดขาด`,
  },
  {
    id: "skill-seo-copywriter",
    title: "สกิลเขียนบทความ SEO และคอนเทนต์ปัง",
    description:
      "สร้างบทความความยาว 1,500+ คำ ติดอันดับการค้นหา Google ด้วยโครงสร้าง H1-H3 คีย์เวิร์ด และเนื้อหาที่จูงใจผู้อ่าน",
    iconName: "FileText",
    category: "Writing",
    badgeText: "SEO Pro",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    gradientBg: "from-blue-900/40 via-sky-900/30 to-slate-950/50",
    iconColor: "text-sky-400",
    isFeatured: false,
    hasInteractiveForm: false,
    defaultPrompt: "ช่วยเขียนบทความ SEO ติดหน้าแรก Google เกี่ยวกับหัวข้อ: ",
    systemPrompt:
      "คุณคือ Senior Content Strategist & SEO Expert ทำหน้าที่เขียนบทความภาษาไทยที่อ่านสนุก มีคุณค่าสูง ใส่คีย์เวิร์ดอย่างเป็นธรรมชาติ และจัดโครงสร้าง H1, H2, H3 อย่างเป็นระเบียบ",
  },
  {
    id: "skill-code-reviewer",
    title: "สกิลตรวจโค้ด & Refactor เกรด Staff Engineer",
    description:
      "วิเคราะห์ Bug, Memory Leaks, Security Vulnerabilities และเสนอโค้ด Refactor ที่เป็นไปตาม Clean Architecture",
    iconName: "Code",
    category: "Coding",
    badgeText: "Developer",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    gradientBg: "from-emerald-900/40 via-teal-900/30 to-slate-950/50",
    iconColor: "text-emerald-400",
    isFeatured: false,
    hasInteractiveForm: false,
    defaultPrompt: "ช่วยรีวิวโค้ดและ Refactor โค้ดชุดนี้ให้สะอาดและปลอดภัยยิ่งขึ้น:\n\n",
    systemPrompt:
      "คุณคือ Principal Code Architect หน้าที่คือรีวิวโค้ด ค้นหา Edge cases, Security vulnerabilities, performance bottlenecks และเขียนโค้ดเวอร์ชันแก้ไขที่สมบูรณ์แบบ",
  },
  {
    id: "skill-book-summarizer",
    title: "สกิลสรุปหนังสือ & สกัดแก่นความรู้",
    description:
      "สรุปหนังสือหรือเอกสารยาวๆ ให้เหลือ 5 บทเรียนหลัก Actionable Insights ที่สามารถนำไปปรับใช้ในชีวิตจริงได้ทันที",
    iconName: "BookOpen",
    category: "Productivity",
    badgeText: "Learning",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    gradientBg: "from-amber-900/40 via-orange-900/30 to-slate-950/50",
    iconColor: "text-amber-400",
    isFeatured: false,
    hasInteractiveForm: false,
    defaultPrompt: "ช่วยสรุปบทเรียนและข้อคิดสำคัญจากหนังสือ/เรื่องนี้: ",
    systemPrompt:
      "คุณคือ Executive Executive Editor หน้าที่คือสกัดแก่นความรู้ (Core Concepts), 5 Key Lessons และ Action Steps จากหนังสือหรือบทความที่กำหนด",
  },
  {
    id: "skill-finance-advisor",
    title: "สกิลที่ปรึกษาการเงินส่วนบุคคล & จัดงบ",
    description:
      "คำนวณสัดส่วนการเก็บเงิน วางแผนปลดหนี้ วางงบลงทุน และแนะนำกลยุทธ์การบริหารเงินตามเป้าหมายชีวิต",
    iconName: "TrendingUp",
    category: "Analysis",
    badgeText: "Finance",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    gradientBg: "from-rose-900/40 via-pink-900/30 to-slate-950/50",
    iconColor: "text-rose-400",
    isFeatured: false,
    hasInteractiveForm: false,
    defaultPrompt: "ช่วยวางแผนการเงินและจัดสรรงบประมาณจากรายได้เดือนละ: ",
    systemPrompt:
      "คุณคือ Certified Financial Planner (CFP) ทำหน้าที่วางแผนการเงินส่วนบุคคล จัดสรรงบตามกฎ 50/30/20 และวางแผนการออมเงินอย่างรอบคอบ ปลอดภัย",
  },
];
