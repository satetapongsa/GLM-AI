/**
 * BRAND CONFIGURATION - Goomiru (GooMiRu)
 * Single source of truth for Goomiru branding, logo, names, and visual identity.
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
  name: "Goomiru",
  fullName: "Goomiru AI",
  thaiName: "กูไม่รู้เอไอ (Goomiru)",
  welcomeTitle: "ยินดีต้อนรับสู่ Goomiru AI",
  welcomeSubtitle: "วันนี้อยากให้ Goomiru ช่วยเรื่องอะไรครับ",
  placeholderInput: "ถามอะไร Goomiru ได้เลย...",
  disclaimer: "AI อาจผิดพลาดได้ หลีกเลี่ยงการใส่ข้อมูลส่วนตัวหรือความลับ",
  logo: {
    badge: "AI",
  },
  meta: {
    title: "Goomiru — AI Workspace อัจฉริยะ",
    description: "แพลตฟอร์ม AI Chat และ Multi-Model Workspace อัจฉริยะ ขับเคลื่อนด้วย DeepSeek",
    keywords: ["Goomiru", "Goomiru AI", "GML", "AI Chat", "Thai AI", "Next.js"],
  },
  defaultUser: {
    id: "guest-user",
    name: "ผู้ใช้ทั่วไป",
    username: "guest",
    email: "guest@goomiru.ai",
    avatar: "",
    role: "Guest",
  },
};
