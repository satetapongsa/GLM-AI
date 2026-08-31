import React from "react";
import { AIProviderName } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

export interface ProviderIconProps {
  provider: AIProviderName | string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function ProviderIcon({
  provider,
  size = "md",
  className,
}: ProviderIconProps) {
  const sizeClasses = {
    sm: "h-6 w-6 p-1 rounded-lg",
    md: "h-8 w-8 p-1.5 rounded-xl",
    lg: "h-10 w-10 p-2 rounded-2xl",
    xl: "h-12 w-12 p-2.5 rounded-2xl",
  };

  const p = (provider || "").toLowerCase();

  // 1. Anthropic / Claude (Official Terracotta Orange 16-Ray Starburst Asterisk)
  if (p.includes("anthropic") || p.includes("claude")) {
    return (
      <div
        className={cn(
          "bg-[#cc785c]/15 text-[#d97706] border border-[#cc785c]/30 flex items-center justify-center shrink-0 shadow-xs",
          sizeClasses[size],
          className
        )}
        title="Anthropic Claude"
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          <g fill="#d97706">
            <circle cx="12" cy="12" r="3.2" />
            <path d="M12 1.5a1.2 1.2 0 0 1 1.2 1.2v3.6a1.2 1.2 0 0 1-2.4 0V2.7a1.2 1.2 0 0 1 1.2-1.2zm0 14a1.2 1.2 0 0 1 1.2 1.2v3.6a1.2 1.2 0 0 1-2.4 0v-3.6a1.2 1.2 0 0 1 1.2-1.2zM22.5 12a1.2 1.2 0 0 1-1.2 1.2h-3.6a1.2 1.2 0 0 1 0-2.4h3.6a1.2 1.2 0 0 1 1.2 1.2zM6.3 12a1.2 1.2 0 0 1-1.2 1.2H1.5a1.2 1.2 0 0 1 0-2.4h3.6a1.2 1.2 0 0 1 1.2 1.2z" />
            <path d="M19.42 4.58a1.2 1.2 0 0 1 0 1.7l-2.55 2.54a1.2 1.2 0 1 1-1.7-1.7l2.55-2.54a1.2 1.2 0 0 1 1.7 0zm-9.9 9.9a1.2 1.2 0 0 1 0 1.7l-2.54 2.54a1.2 1.2 0 1 1-1.7-1.7l2.55-2.54a1.2 1.2 0 0 1 1.7 0zm9.9 4.94a1.2 1.2 0 0 1-1.7 0l-2.55-2.54a1.2 1.2 0 1 1 1.7-1.7l2.55 2.54a1.2 1.2 0 0 1 0 1.7zm-9.9-9.9a1.2 1.2 0 0 1-1.7 0L5.28 7.08a1.2 1.2 0 1 1 1.7-1.7l2.54 2.55a1.2 1.2 0 0 1 0 1.7z" />
            <path d="M16.2 3.1a1.1 1.1 0 0 1 .8 1.4l-1.3 3.4a1.1 1.1 0 0 1-2.1-.8l1.3-3.4a1.1 1.1 0 0 1 1.3-.6zm-7 14.4a1.1 1.1 0 0 1 .8 1.4l-1.3 3.4a1.1 1.1 0 0 1-2.1-.8l1.3-3.4a1.1 1.1 0 0 1 1.3-.6zm11.7-1.3a1.1 1.1 0 0 1-1.4.8l-3.4-1.3a1.1 1.1 0 0 1 .8-2.1l3.4 1.3a1.1 1.1 0 0 1 .6 1.3zm-14.4-7a1.1 1.1 0 0 1-1.4.8l-3.4-1.3a1.1 1.1 0 0 1 .8-2.1l3.4 1.3a1.1 1.1 0 0 1 .6 1.3z" />
          </g>
        </svg>
      </div>
    );
  }

  // 2. OpenAI / ChatGPT (Official Spiral Rosette in Green & Dark)
  if (p.includes("openai") || p.includes("gpt")) {
    return (
      <div
        className={cn(
          "bg-[#10a37f]/15 text-[#10a37f] border border-[#10a37f]/30 flex items-center justify-center shrink-0 shadow-xs",
          sizeClasses[size],
          className
        )}
        title="OpenAI"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-[#10a37f]">
          <path d="M22.28 9.9a5.7 5.7 0 0 0-.48-4.7 5.78 5.78 0 0 0-4.04-2.82 5.86 5.86 0 0 0-5.1 1.25 5.73 5.73 0 0 0-4.14-.38 5.78 5.78 0 0 0-3.37 3.6 5.86 5.86 0 0 0-1.78 4.95 5.74 5.74 0 0 0 .48 4.7 5.78 5.78 0 0 0 4.04 2.82 5.86 5.86 0 0 0 5.1-1.25 5.73 5.73 0 0 0 4.14.38 5.78 5.78 0 0 0 3.37-3.6 5.86 5.86 0 0 0 1.78-4.95zm-9.03 9.47a3.86 3.86 0 0 1-2.58-.33l1.1-1.9a1.93 1.93 0 0 0 1.94.31l-.46 1.92zm-5.7-3.28a3.85 3.85 0 0 1-.98-2.42l2.19-.38a1.93 1.93 0 0 0 .97 1.71l-2.18 1.09zm-1.44-6.3a3.86 3.86 0 0 1 1.6-2.09l1.09 1.9a1.93 1.93 0 0 0-.97 1.71l-1.72-1.52zm8.7-3.28a3.86 3.86 0 0 1 2.58.33l-1.1 1.9a1.93 1.93 0 0 0-1.94-.31l.46-1.92zm5.7 3.28a3.85 3.85 0 0 1 .98 2.42l-2.19.38a1.93 1.93 0 0 0-.97-1.71l2.18-1.09zm1.44 6.3a3.86 3.86 0 0 1-1.6 2.09l-1.09-1.9a1.93 1.93 0 0 0 .97-1.71l1.72 1.52z" />
        </svg>
      </div>
    );
  }

  // 3. Google / Gemini (Official 4-Pointed Sparkle Star in Gradient)
  if (p.includes("google") || p.includes("gemini")) {
    return (
      <div
        className={cn(
          "bg-[#1a73e8]/15 text-[#38bdf8] border border-[#1a73e8]/30 flex items-center justify-center shrink-0 shadow-xs",
          sizeClasses[size],
          className
        )}
        title="Google Gemini"
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          <path
            d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z"
            fill="url(#gemini-star-grad)"
          />
          <defs>
            <linearGradient id="gemini-star-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1a73e8" />
              <stop offset="0.45" stopColor="#a855f7" />
              <stop offset="1" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // 4. DeepSeek (Official Deep Blue Whale Fin Logo)
  if (p.includes("deepseek")) {
    return (
      <div
        className={cn(
          "bg-[#0066ff]/15 text-[#38bdf8] border border-[#0066ff]/35 flex items-center justify-center shrink-0 shadow-xs",
          sizeClasses[size],
          className
        )}
        title="DeepSeek"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-[#0066ff]">
          <path d="M2.5 12C2.5 6.753 6.753 2.5 12 2.5c3.218 0 6.072 1.6 7.788 4.053l-3.288 3.288A5.5 5.5 0 0 0 12 8a5.5 5.5 0 0 0-5.5 5.5c0 1.258.423 2.418 1.134 3.344l-3.447 3.447A9.458 9.458 0 0 1 2.5 12zm19 0c0 5.247-4.253 9.5-9.5 9.5a9.458 9.458 0 0 1-7.788-4.053l3.288-3.288A5.5 5.5 0 0 0 12 16a5.5 5.5 0 0 0 5.5-5.5c0-1.258-.423-2.418-1.134-3.344l3.447-3.447A9.458 9.458 0 0 1 21.5 12z" />
        </svg>
      </div>
    );
  }

  // 5. Flux / Black Forest Labs (Official Neon Pink Hexagon Cube)
  if (p.includes("flux")) {
    return (
      <div
        className={cn(
          "bg-[#ec4899]/15 text-[#f472b6] border border-[#ec4899]/30 flex items-center justify-center shrink-0 shadow-xs",
          sizeClasses[size],
          className
        )}
        title="Flux (Black Forest Labs)"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-[#ec4899]">
          <path d="M12 2L2 7.5v9L12 22l10-5.5v-9L12 2zm0 2.24l7.6 4.18-3.4 1.87-7.6-4.18 3.4-1.87zm-8 5.64l7 3.85v7.7l-7-3.85V9.88zm9 11.55v-7.7l7-3.85v7.7l-7 3.85z" />
        </svg>
      </div>
    );
  }

  // 6. Sora / OpenAI Video (Official Aperture Iris Lens)
  if (p.includes("sora")) {
    return (
      <div
        className={cn(
          "bg-[#ea580c]/15 text-[#fb923c] border border-[#ea580c]/30 flex items-center justify-center shrink-0 shadow-xs",
          sizeClasses[size],
          className
        )}
        title="Sora"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-[#ea580c]">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm-2-12.5v7l6-3.5z" />
        </svg>
      </div>
    );
  }

  // 7. Suno AI (Official Sound Wave Music)
  if (p.includes("suno")) {
    return (
      <div
        className={cn(
          "bg-[#8b5cf6]/15 text-[#a78bfa] border border-[#8b5cf6]/30 flex items-center justify-center shrink-0 shadow-xs",
          sizeClasses[size],
          className
        )}
        title="Suno AI"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-[#8b5cf6]">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
      </div>
    );
  }

  // 8. Meta AI / Llama (Official Meta Infinity Loop)
  if (p.includes("meta") || p.includes("llama")) {
    return (
      <div
        className={cn(
          "bg-[#0081fb]/15 text-[#60a5fa] border border-[#0081fb]/30 flex items-center justify-center shrink-0 shadow-xs",
          sizeClasses[size],
          className
        )}
        title="Meta Llama"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-[#0081fb]">
          <path d="M16.99 4c-2.3 0-4.22 1.34-5 3.32-.78-1.98-2.7-3.32-5-3.32-3.31 0-6 2.69-6 6 0 4.19 5.3 9.42 10.45 10.9.36.1.74.1 1.1 0C17.7 19.42 23 14.19 23 10c0-3.31-2.69-6-6.01-6zm-5.99 13.9C6.88 16.5 4 12.35 4 10c0-1.65 1.35-3 3-3 1.83 0 3.38 1.25 3.84 3h2.32c.46-1.75 2.01-3 3.84-3 1.65 0 3 1.35 3 3 0 2.35-2.88 6.5-7 7.9z" />
        </svg>
      </div>
    );
  }

  // 9. Mistral AI (Official Layered Pixel Bricks)
  if (p.includes("mistral")) {
    return (
      <div
        className={cn(
          "bg-[#f97316]/15 text-[#fb923c] border border-[#f97316]/30 flex items-center justify-center shrink-0 shadow-xs",
          sizeClasses[size],
          className
        )}
        title="Mistral AI"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-[#f97316]">
          <path d="M3 4h4v4H3V4zm14 0h4v4h-4V4zM3 10h4v4H3v-4zm7 0h4v4h-4v-4zm7 0h4v4h-4v-4zM3 16h4v4H3v-4zm14 0h4v4h-4v-4z" />
        </svg>
      </div>
    );
  }

  // 10. xAI / Grok (Official Bold 𝕏)
  if (p.includes("xai") || p.includes("grok")) {
    return (
      <div
        className={cn(
          "bg-white/10 text-white border border-white/20 flex items-center justify-center shrink-0 shadow-xs font-mono font-black",
          sizeClasses[size],
          className
        )}
        title="xAI Grok"
      >
        <span className="text-[14px] leading-none font-bold">𝕏</span>
      </div>
    );
  }

  // Default Fallback
  return (
    <div
      className={cn(
        "bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 shadow-xs",
        sizeClasses[size],
        className
      )}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
      </svg>
    </div>
  );
}
