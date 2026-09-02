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
  metadataBase: new URL("https://goomairu.vercel.app"),
  title: {
    default: "Goomairu AI — ผู้ช่วยเอไออัจฉริยะภาษาไทย (AI Chatbot & Assistant)",
    template: `%s | ${BRAND_CONFIG.name}`,
  },
  description:
    "Goomairu AI (กูไม่รู้เอไอ) — เว็บแอปพลิเคชันผู้ช่วย AI อัจฉริยะภาษาไทย ตอบทุกคำถาม วิเคราะห์ข้อมูล เขียนโค้ด คิดไอเดียสร้างสรรค์ และช่วยทำงานได้อย่างรวดเร็ว แม่นยำ และมีประสิทธิภาพ",
  keywords: [
    "Goomairu",
    "Goomairu AI",
    "กูไม่รู้เอไอ",
    "AI ภาษาไทย",
    "ผู้ช่วย AI ภาษาไทย",
    "AI Chatbot",
    "ปัญญาประดิษฐ์",
    "DeepSeek",
    "AI เขียนโค้ด",
    "AI ช่วยคิดงาน",
    "Thai AI Chatbot",
    "Generative AI Thailand",
    "AI ถามตอบ",
    "ระบบแชท AI",
    "Thai AI Assistant",
  ],
  authors: [{ name: "satetapong sanguansuk" }],
  creator: "satetapong sanguansuk",
  publisher: "Goomairu AI",
  category: "technology",
  alternates: {
    canonical: "https://goomairu.vercel.app",
    languages: {
      "th-TH": "https://goomairu.vercel.app",
    },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "Goomairu AI — ผู้ช่วยเอไออัจฉริยะภาษาไทย",
    description:
      "Goomairu AI (กูไม่รู้เอไอ) — ผู้ช่วยเอไออัจฉริยะภาษาไทย ตอบทุกคำถาม วิเคราะห์ข้อมูล เขียนโค้ด และช่วยทำงานได้ทุกรูปแบบ รวดเร็ว ปลอดภัย",
    url: "https://goomairu.vercel.app",
    siteName: "Goomairu AI",
    locale: "th_TH",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Goomairu AI — ผู้ช่วยเอไออัจฉริยะภาษาไทย",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Goomairu AI — ผู้ช่วยเอไออัจฉริยะภาษาไทย",
    description:
      "Goomairu AI (กูไม่รู้เอไอ) — ผู้ช่วยเอไออัจฉริยะภาษาไทย ตอบทุกคำถาม คิดไอเดีย และช่วยทำงานได้ทุกรูปแบบ",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "color-scheme": "dark",
  },
};

export const viewport: Viewport = {
  themeColor: "#131314",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Goomairu AI",
  alternateName: ["กูไม่รู้เอไอ", "Goomairu"],
  url: "https://goomairu.vercel.app",
  description:
    "Goomairu AI (กูไม่รู้เอไอ) — เว็บแอปพลิเคชันผู้ช่วย AI อัจฉริยะภาษาไทย ตอบทุกคำถาม วิเคราะห์ข้อมูล เขียนโค้ด และช่วยทำงานได้อย่างรวดเร็ว",
  applicationCategory: "Productivity, Utilities, BusinessApplication",
  operatingSystem: "All",
  browserRequirements: "Requires JavaScript. Requires HTML5.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "THB",
  },
  author: {
    "@type": "Person",
    name: "satetapong sanguansuk",
  },
  publisher: {
    "@type": "Organization",
    name: "Goomairu AI",
    url: "https://goomairu.vercel.app",
    logo: "https://goomairu.vercel.app/icon.svg",
  },
  inLanguage: ["th", "en"],
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
