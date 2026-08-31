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
  title: {
    default: BRAND_CONFIG.meta.title,
    template: `%s | ${BRAND_CONFIG.name}`,
  },
  description: BRAND_CONFIG.meta.description,
  keywords: BRAND_CONFIG.meta.keywords,
  authors: [{ name: BRAND_CONFIG.name }],
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f19" },
  ],
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
    <html lang="th" suppressHydrationWarning className={`${inter.variable} ${notoSansThai.variable}`}>
      <body
        className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] antialiased selection:bg-blue-500 selection:text-white"
        style={{ fontFamily: "var(--font-thai), var(--font-inter), sans-serif" }}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <AppShell>{children}</AppShell>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
