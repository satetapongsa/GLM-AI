import { ImageResponse } from "next/og";

export const size = {
  width: 48,
  height: 48,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#131314",
          borderRadius: "50%",
        }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="gmr-icon-grad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8"/>
              <stop offset="50%" stopColor="#0b57d0"/>
              <stop offset="100%" stopColor="#c084fc"/>
            </linearGradient>
          </defs>
          <path
            d="M24 6 C24 16 16 24 6 24 C16 24 24 32 24 42 C24 32 32 24 42 24 C32 24 24 16 24 6 Z"
            fill="url(#gmr-icon-grad)"
          />
          <circle cx="24" cy="24" r="3.5" fill="#ffffff" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
