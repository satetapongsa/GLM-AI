import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { BRAND_CONFIG } from "@/lib/config/brand";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-thai",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://glm-ai-gay.vercel.app"),
  title: {
    default: "GML AI - ผู้ช่วยอัจฉริยะภาษาไทย & DeepSeek AI",
    template: `%s | ${BRAND_CONFIG.name}`,
  },
  description:
    "GML AI แพลตฟอร์ม AI ผู้ช่วยอัจฉริยะภาษาไทย ขับเคลื่อนด้วย DeepSeek Master Engine ตอบคำถาม วิเคราะห์ข้อมูล เขียนโค้ด และอ่านไฟล์ได้อย่างรวดเร็วและแม่นยำ พัฒนาโดย satetapong sanguansuk",
  keywords: [
    "GML AI",
    "GooMiRu",
    "DeepSeek AI",
    "Thai AI",
    "ผู้ช่วย AI ภาษาไทย",
    "AI Chatbot",
    "AI เขียนโค้ด",
  ],
  authors: [{ name: "satetapong sanguansuk" }],
  creator: "satetapong sanguansuk",
  publisher: "GML AI",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "GML AI (GooMiRu) - ผู้ช่วยอัจฉริยะภาษาไทย & DeepSeek AI",
    description:
      "แพลตฟอร์ม AI ภาษาไทยที่ฉลาด ตอบไว กระชับ เขียนโค้ด และอ่านไฟล์ได้จริง ขับเคลื่อนด้วย DeepSeek Master Engine",
    url: "https://glm-ai-gay.vercel.app",
    siteName: "GML AI",
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GML AI (GooMiRu) - ผู้ช่วยอัจฉริยะภาษาไทย",
    description:
      "AI ผู้ช่วยอัจฉริยะภาษาไทย ตอบไว เขียนโค้ด และอ่านไฟล์ได้จริง ขับเคลื่อนด้วย DeepSeek Master Engine",
  },
  other: {
    "color-scheme": "dark",
  },
};

export const viewport: Viewport = {
  themeColor: "#131314",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="th"
      suppressHydrationWarning
      className={`dark ${inter.variable} ${notoSansThai.variable}`}
      style={{ colorScheme: "dark", backgroundColor: "#131314" }}
    >
      <body
        className="min-h-screen bg-[#131314] text-[#f1f5f9] antialiased selection:bg-blue-500 selection:text-white"
        style={{
          fontFamily: "var(--font-thai), var(--font-inter), sans-serif",
          colorScheme: "dark",
          backgroundColor: "#131314",
        }}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <AppShell>{children}</AppShell>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
