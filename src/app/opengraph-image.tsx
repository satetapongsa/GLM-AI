import { ImageResponse } from "next/og";

export const alt = "GML AI";
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
            width: "850px",
            height: "550px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(26, 115, 232, 0.45) 0%, rgba(56, 189, 248, 0.2) 40%, rgba(19, 19, 20, 0) 75%)",
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
          {/* Big Iconic 4-Pointed Sparkle Star Emblem */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="160"
              height="160"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                fill="url(#gml-og-grad)"
              />
              <defs>
                <linearGradient id="gml-og-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#1a73e8" />
                  <stop offset="0.5" stopColor="#38bdf8" />
                  <stop offset="1" stopColor="#818cf8" />
                </linearGradient>
              </defs>
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
                fontSize: "110px",
                fontWeight: "900",
                color: "#ffffff",
                letterSpacing: "-0.04em",
                lineHeight: "1",
              }}
            >
              GML AI
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
