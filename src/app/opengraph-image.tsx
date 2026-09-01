import { ImageResponse } from "next/og";

export const alt = "Goomairu AI";
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
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#131314",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Luminous Ambient Background Glows */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "900px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(11, 87, 208, 0.5) 0%, rgba(56, 189, 248, 0.25) 40%, rgba(19, 19, 20, 0) 75%)",
          }}
        />

        {/* Iconic Logo + Brand Typography (ChatGPT/Gemini Style) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "36px",
          }}
        >
          {/* Big Iconic Goomiru Supernova Star Emblem */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "160px",
              height: "160px",
              borderRadius: "50%",
              background: "#131314",
              border: "3px solid rgba(56, 189, 248, 0.4)",
              boxShadow: "0 0 50px rgba(56, 189, 248, 0.4)",
            }}
          >
            <svg
              width="130"
              height="130"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="gmr-og-main" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#38bdf8"/>
                  <stop offset="45%" stopColor="#0b57d0"/>
                  <stop offset="85%" stopColor="#8b5cf6"/>
                  <stop offset="100%" stopColor="#ec4899"/>
                </linearGradient>
              </defs>
              <ellipse cx="24" cy="24" rx="17" ry="7" transform="rotate(-30 24 24)" stroke="#38bdf8" strokeWidth="2.2" strokeDasharray="32 8" strokeLinecap="round"/>
              <path d="M24 6 C24 16 16 24 6 24 C16 24 24 32 24 42 C24 32 32 24 42 24 C32 24 24 16 24 6 Z" fill="url(#gmr-og-main)"/>
              <circle cx="24" cy="24" r="3.5" fill="#ffffff"/>
            </svg>
          </div>

          {/* Massive Clean Bold Brand Name */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: "100px",
                fontWeight: "900",
                color: "#ffffff",
                letterSpacing: "-0.03em",
                lineHeight: "1",
              }}
            >
              Goomairu
            </span>
            <span
              style={{
                fontSize: "30px",
                fontWeight: "700",
                color: "#38bdf8",
                letterSpacing: "0.2em",
                marginTop: "8px",
                textTransform: "uppercase",
              }}
            >
              AI Workspace
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
