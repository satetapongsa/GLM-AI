/**
 * BRAND CONFIGURATION - GML (GooMiRu)
 * Single source of truth for GML branding, logo, names, and visual identity.
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
  name: "GML",
  fullName: "GooMiRu",
  thaiName: "กูไม่รู้เอไอ",
  welcomeTitle: "ยินดีต้อนรับสู่ กูไม่รู้เอไอ",
  welcomeSubtitle: "วันนี้อยากให้ AI ช่วยเรื่องอะไร",
  placeholderInput: "ถามได้เลย",
  disclaimer: "AI อาจผิดพลาดได้ หลีกเลี่ยงการใส่ข้อมูลส่วนตัวหรือความลับ",
  logo: {
    badge: "TH",
  },
  meta: {
    title: "GML — กูไม่รู้เอไอ (GooMiRu)",
    description: "แพลตฟอร์ม AI Chat และ Multi-Model Workspace อัจฉริยะ",
    keywords: ["GML", "GooMiRu", "AI Chat", "Thai AI", "Next.js"],
  },
  defaultUser: {
    id: "user-1",
    name: "satetapong sanguansuk",
    username: "satetapong",
    email: "satetapongs@gmail.com",
    avatar: "",
    role: "User",
  },
};
