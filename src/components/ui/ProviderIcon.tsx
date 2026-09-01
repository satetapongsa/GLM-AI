"use client";

import React, { useState, useEffect } from "react";
import { AIProviderName } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

export interface ProviderIconProps {
  provider: AIProviderName | string;
  iconUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function ProviderIcon({
  provider,
  iconUrl,
  size = "md",
  className,
}: ProviderIconProps) {
  const [imgError, setImgError] = useState(false);

  // Reset error state whenever model iconUrl or provider changes
  useEffect(() => {
    setImgError(false);
  }, [iconUrl, provider]);

  const sizeClasses = {
    sm: "h-5.5 w-5.5",
    md: "h-9 w-9",
    lg: "h-11 w-11",
    xl: "h-13 w-13",
  };

  const p = (provider || "").toLowerCase();

  let fallbackIconSrc = "/icon.svg";
  let title = provider || "AI Model";

  if (p.includes("goomiru") || p.includes("gml")) {
    fallbackIconSrc = "/icon.svg";
    title = "Goomiru AI";
  } else if (p.includes("anthropic") || p.includes("claude")) {
    fallbackIconSrc = "/icons/models/claude.svg";
    title = "Anthropic Claude";
  } else if (p.includes("openai") || p.includes("gpt")) {
    fallbackIconSrc = "/icons/models/openai.svg";
    title = "OpenAI";
  } else if (p.includes("google") || p.includes("gemini")) {
    fallbackIconSrc = "/icons/models/gemini.svg";
    title = "Google Gemini";
  } else if (p.includes("deepseek")) {
    fallbackIconSrc = "/icons/models/deepseek.svg";
    title = "DeepSeek";
  } else if (p.includes("meta") || p.includes("llama")) {
    fallbackIconSrc = "/icons/models/meta.svg";
    title = "Meta Llama";
  } else if (p.includes("mistral")) {
    fallbackIconSrc = "/icons/models/mistral.svg";
    title = "Mistral AI";
  } else if (p.includes("xai") || p.includes("grok")) {
    fallbackIconSrc = "/icons/models/grok.svg";
    title = "xAI Grok";
  } else if (p.includes("flux")) {
    fallbackIconSrc = "/icons/models/flux.svg";
    title = "Flux (Black Forest Labs)";
  } else if (p.includes("sora")) {
    fallbackIconSrc = "/icons/models/sora.svg";
    title = "Sora";
  } else if (p.includes("suno")) {
    fallbackIconSrc = "/icons/models/suno.svg";
    title = "Suno AI";
  } else if (p.includes("microsoft") || p.includes("copilot")) {
    fallbackIconSrc = "/icon.svg";
    title = "Microsoft Copilot";
  }

  const finalSrc = !imgError && iconUrl ? iconUrl : fallbackIconSrc;

  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0 shadow-xs overflow-hidden rounded-full bg-[#131314] border border-[rgba(255,255,255,0.12)]",
        sizeClasses[size],
        className
      )}
      title={title}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={finalSrc}
        src={finalSrc}
        alt={title}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className="w-full h-full object-cover select-none"
        loading="eager"
      />
    </div>
  );
}
