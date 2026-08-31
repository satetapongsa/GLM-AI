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
    sm: "h-6 w-6 p-1 rounded-md",
    md: "h-8 w-8 p-1.5 rounded-lg",
    lg: "h-10 w-10 p-2 rounded-xl",
    xl: "h-12 w-12 p-2.5 rounded-2xl",
  };

  const p = (provider || "").toLowerCase();

  // 1. OpenAI / ChatGPT
  if (p.includes("openai") || p.includes("gpt")) {
    return (
      <div
        className={cn(
          "bg-[#10a37f]/15 text-[#10a37f] border border-[#10a37f]/30 flex items-center justify-center shrink-0 shadow-2xs",
          sizeClasses[size],
          className
        )}
        title="OpenAI"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M22.28 9.9a5.7 5.7 0 0 0-.48-4.7 5.78 5.78 0 0 0-4.04-2.82 5.86 5.86 0 0 0-5.1 1.25 5.73 5.73 0 0 0-4.14-.38 5.78 5.78 0 0 0-3.37 3.6 5.86 5.86 0 0 0-1.78 4.95 5.74 5.74 0 0 0 .48 4.7 5.78 5.78 0 0 0 4.04 2.82 5.86 5.86 0 0 0 5.1-1.25 5.73 5.73 0 0 0 4.14.38 5.78 5.78 0 0 0 3.37-3.6 5.86 5.86 0 0 0 1.78-4.95zm-9.03 9.47a3.86 3.86 0 0 1-2.58-.33l1.1-1.9a1.93 1.93 0 0 0 1.94.31l-.46 1.92zm-5.7-3.28a3.85 3.85 0 0 1-.98-2.42l2.19-.38a1.93 1.93 0 0 0 .97 1.71l-2.18 1.09zm-1.44-6.3a3.86 3.86 0 0 1 1.6-2.09l1.09 1.9a1.93 1.93 0 0 0-.97 1.71l-1.72-1.52zm8.7-3.28a3.86 3.86 0 0 1 2.58.33l-1.1 1.9a1.93 1.93 0 0 0-1.94-.31l.46-1.92zm5.7 3.28a3.85 3.85 0 0 1 .98 2.42l-2.19.38a1.93 1.93 0 0 0-.97-1.71l2.18-1.09zm1.44 6.3a3.86 3.86 0 0 1-1.6 2.09l-1.09-1.9a1.93 1.93 0 0 0 .97-1.71l1.72 1.52z" />
        </svg>
      </div>
    );
  }

  // 2. Anthropic / Claude
  if (p.includes("anthropic") || p.includes("claude")) {
    return (
      <div
        className={cn(
          "bg-[#d97706]/15 text-[#f59e0b] border border-[#d97706]/30 flex items-center justify-center shrink-0 shadow-2xs",
          sizeClasses[size],
          className
        )}
        title="Anthropic Claude"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M13.727 3.333H10.273L4 20.667H7.455L8.91 16.5H15.09L16.545 20.667H20L13.727 3.333ZM9.818 13.75L12 7.5L14.182 13.75H9.818Z" />
        </svg>
      </div>
    );
  }

  // 3. DeepSeek (Official Whale Fin & Wave Logo)
  if (p.includes("deepseek")) {
    return (
      <div
        className={cn(
          "bg-[#0066ff]/15 text-[#38bdf8] border border-[#0066ff]/35 flex items-center justify-center shrink-0 shadow-2xs",
          sizeClasses[size],
          className
        )}
        title="DeepSeek"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M2.5 12C2.5 6.753 6.753 2.5 12 2.5c3.218 0 6.072 1.6 7.788 4.053l-3.288 3.288A5.5 5.5 0 0 0 12 8a5.5 5.5 0 0 0-5.5 5.5c0 1.258.423 2.418 1.134 3.344l-3.447 3.447A9.458 9.458 0 0 1 2.5 12zm19 0c0 5.247-4.253 9.5-9.5 9.5a9.458 9.458 0 0 1-7.788-4.053l3.288-3.288A5.5 5.5 0 0 0 12 16a5.5 5.5 0 0 0 5.5-5.5c0-1.258-.423-2.418-1.134-3.344l3.447-3.447A9.458 9.458 0 0 1 21.5 12z" />
        </svg>
      </div>
    );
  }

  // 4. Google / Gemini (Official 4-pointed sparkle gradient star)
  if (p.includes("google") || p.includes("gemini")) {
    return (
      <div
        className={cn(
          "bg-[#1a73e8]/15 text-[#38bdf8] border border-[#1a73e8]/30 flex items-center justify-center shrink-0 shadow-2xs",
          sizeClasses[size],
          className
        )}
        title="Google Gemini"
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          <path
            d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
            fill="url(#gemini-icon-grad)"
          />
          <defs>
            <linearGradient id="gemini-icon-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1a73e8" />
              <stop offset="0.5" stopColor="#a855f7" />
              <stop offset="1" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // 5. Flux / Black Forest Labs (Official Geometric Hex/Cube)
  if (p.includes("flux")) {
    return (
      <div
        className={cn(
          "bg-[#ec4899]/15 text-[#f472b6] border border-[#ec4899]/30 flex items-center justify-center shrink-0 shadow-2xs",
          sizeClasses[size],
          className
        )}
        title="Flux (Black Forest Labs)"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 2L2 7.5v9L12 22l10-5.5v-9L12 2zm0 2.24l7.6 4.18-3.4 1.87-7.6-4.18 3.4-1.87zm-8 5.64l7 3.85v7.7l-7-3.85V9.88zm9 11.55v-7.7l7-3.85v7.7l-7 3.85z" />
        </svg>
      </div>
    );
  }

  // 6. Sora / OpenAI Video (Official Cinematic Aperture Iris)
  if (p.includes("sora")) {
    return (
      <div
        className={cn(
          "bg-[#ea580c]/15 text-[#fb923c] border border-[#ea580c]/30 flex items-center justify-center shrink-0 shadow-2xs",
          sizeClasses[size],
          className
        )}
        title="Sora"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm-2-12.5v7l6-3.5z" />
        </svg>
      </div>
    );
  }

  // 7. Suno AI (Official Sound Wave Music Circle)
  if (p.includes("suno")) {
    return (
      <div
        className={cn(
          "bg-[#8b5cf6]/15 text-[#a78bfa] border border-[#8b5cf6]/30 flex items-center justify-center shrink-0 shadow-2xs",
          sizeClasses[size],
          className
        )}
        title="Suno AI"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
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
          "bg-[#0081fb]/15 text-[#60a5fa] border border-[#0081fb]/30 flex items-center justify-center shrink-0 shadow-2xs",
          sizeClasses[size],
          className
        )}
        title="Meta Llama"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M16.99 4c-2.3 0-4.22 1.34-5 3.32-.78-1.98-2.7-3.32-5-3.32-3.31 0-6 2.69-6 6 0 4.19 5.3 9.42 10.45 10.9.36.1.74.1 1.1 0C17.7 19.42 23 14.19 23 10c0-3.31-2.69-6-6.01-6zm-5.99 13.9C6.88 16.5 4 12.35 4 10c0-1.65 1.35-3 3-3 1.83 0 3.38 1.25 3.84 3h2.32c.46-1.75 2.01-3 3.84-3 1.65 0 3 1.35 3 3 0 2.35-2.88 6.5-7 7.9z" />
        </svg>
      </div>
    );
  }

  // 9. Mistral AI (Official 4-Block Pixel Array)
  if (p.includes("mistral")) {
    return (
      <div
        className={cn(
          "bg-[#f97316]/15 text-[#fb923c] border border-[#f97316]/30 flex items-center justify-center shrink-0 shadow-2xs",
          sizeClasses[size],
          className
        )}
        title="Mistral AI"
      >
        <div className="grid grid-cols-2 gap-0.5 w-full h-full p-0.5">
          <div className="bg-current rounded-xs" />
          <div className="bg-current rounded-xs opacity-75" />
          <div className="bg-current rounded-xs opacity-75" />
          <div className="bg-current rounded-xs" />
        </div>
      </div>
    );
  }

  // 10. xAI / Grok
  if (p.includes("xai") || p.includes("grok")) {
    return (
      <div
        className={cn(
          "bg-white/10 text-white border border-white/20 flex items-center justify-center shrink-0 shadow-2xs font-mono font-black",
          sizeClasses[size],
          className
        )}
        title="xAI Grok"
      >
        <span className="text-[13px] leading-none">𝕏</span>
      </div>
    );
  }

  // Default Fallback
  return (
    <div
      className={cn(
        "bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 shadow-2xs",
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
