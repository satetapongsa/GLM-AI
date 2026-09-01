/**
 * BRAND CONFIGURATION - Goomairu (Goomairu AI)
 * Single source of truth for Goomairu branding, logo, names, and visual identity.
 */

export interface BrandConfig {
  name: string;
  fullName: string;
  thaiName: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  placeholderInput: string;
  disclaimer: string;
  logo: {
    badge: string;
  };
  meta: {
    title: string;
    description: string;
    keywords: string[];
  };
  defaultUser: {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar: string;
    role: string;
  };
}

export const BRAND_CONFIG: BrandConfig = {
  name: "Goomairu",
  fullName: "Goomairu AI",
  thaiName: "กูไม่รู้เอไอ (Goomairu)",
  welcomeTitle: "ยินดีต้อนรับสู่ Goomairu AI",
  welcomeSubtitle: "วันนี้อยากให้ Goomairu ช่วยเรื่องอะไรครับ",
  placeholderInput: "ถามอะไร Goomairu ได้เลย...",
  disclaimer: "AI อาจผิดพลาดได้ หลีกเลี่ยงการใส่ข้อมูลส่วนตัวหรือความลับ",
  logo: {
    badge: "AI",
  },
  meta: {
    title: "Goomairu AI",
    description: "Goomairu AI — ผู้ช่วยเอไออัจฉริยะภาษาไทย ตอบทุกคำถาม คิดไอเดีย และช่วยทำงานได้ทุกรูปแบบ",
    keywords: ["Goomairu", "Goomairu AI", "AI Chat", "Thai AI", "Next.js"],
  },
  defaultUser: {
    id: "guest-user",
    name: "ผู้ใช้ทั่วไป",
    username: "guest",
    email: "guest@goomairu.ai",
    avatar: "",
    role: "Guest",
  },
};
