import { ImageResponse } from "next/og";

export const alt = "GML AI - ผู้ช่วยอัจฉริยะภาษาไทย";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#131314",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Background Subtle Gradient Glow */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "700px",
            height: "700px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(11, 87, 208, 0.35) 0%, rgba(19, 19, 20, 0) 70%)",
          }}
        />

        {/* Center Card Container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 60px",
            borderRadius: "32px",
            backgroundColor: "rgba(30, 31, 32, 0.85)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
            maxWidth: "960px",
            textAlign: "center",
          }}
        >
          {/* 4-Pointed Sparkle Star Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "24px",
            }}
          >
            <svg
              width="100"
              height="100"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                fill="url(#og-logo-grad)"
              />
              <defs>
                <linearGradient id="og-logo-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#1a73e8" />
                  <stop offset="0.6" stopColor="#38bdf8" />
                  <stop offset="1" stopColor="#818cf8" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Title Row: GML AI + Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "12px",
            }}
          >
            <span
              style={{
                fontSize: "64px",
                fontWeight: "900",
                color: "#ffffff",
                letterSpacing: "-0.03em",
              }}
            >
              GML AI
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px 16px",
                borderRadius: "9999px",
                backgroundColor: "rgba(11, 87, 208, 0.25)",
                border: "1.5px solid rgba(56, 189, 248, 0.5)",
                color: "#38bdf8",
                fontSize: "22px",
                fontWeight: "800",
              }}
            >
              PRO
            </div>
          </div>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "26px",
              color: "#cbd5e1",
              fontWeight: "500",
              margin: "0 0 20px 0",
              lineHeight: "1.4",
            }}
          >
            ผู้ช่วยอัจฉริยะภาษาไทย & DeepSeek Master Engine
          </p>

          {/* Features Pills */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "8px",
            }}
          >
            <div
              style={{
                padding: "8px 18px",
                borderRadius: "16px",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "#94a3b8",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              ⚡ ตอบไว กระชับ ตรงประเด็น
            </div>
            <div
              style={{
                padding: "8px 18px",
                borderRadius: "16px",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "#94a3b8",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              💻 เขียนโค้ด & อ่านไฟล์ได้จริง
            </div>
            <div
              style={{
                padding: "8px 18px",
                borderRadius: "16px",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "#94a3b8",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              🔒 ปลอดภัย 100%
            </div>
          </div>
        </div>

        {/* Footer Credit */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            fontSize: "15px",
            color: "#64748b",
            fontWeight: "500",
          }}
        >
          glm-ai-gay.vercel.app • Created by satetapong sanguansuk
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
