"use client";

import React, { useState } from "react";
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

  const sizeClasses = {
    sm: "h-6 w-6 rounded-lg",
    md: "h-9 w-9 rounded-xl",
    lg: "h-11 w-11 rounded-2xl",
    xl: "h-13 w-13 rounded-2xl",
  };

  const p = (provider || "").toLowerCase();

  let fallbackIconSrc = "/icons/models/deepseek.svg";
  let bgClass = "bg-[#0066ff]/15 border border-[#0066ff]/30";
  let title = provider || "AI Model";

  if (p.includes("anthropic") || p.includes("claude")) {
    fallbackIconSrc = "/icons/models/claude.svg";
    bgClass = "bg-[#d97706]/15 border border-[#d97706]/30";
    title = "Anthropic Claude";
  } else if (p.includes("openai") || p.includes("gpt")) {
    fallbackIconSrc = "/icons/models/openai.svg";
    bgClass = "bg-[#10a37f]/15 border border-[#10a37f]/30";
    title = "OpenAI";
  } else if (p.includes("google") || p.includes("gemini")) {
    fallbackIconSrc = "/icons/models/gemini.svg";
    bgClass = "bg-[#1a73e8]/15 border border-[#1a73e8]/30";
    title = "Google Gemini";
  } else if (p.includes("deepseek")) {
    fallbackIconSrc = "/icons/models/deepseek.svg";
    bgClass = "bg-[#0066ff]/15 border border-[#0066ff]/30";
    title = "DeepSeek";
  } else if (p.includes("meta") || p.includes("llama")) {
    fallbackIconSrc = "/icons/models/meta.svg";
    bgClass = "bg-[#0081fb]/15 border border-[#0081fb]/30";
    title = "Meta Llama";
  } else if (p.includes("mistral")) {
    fallbackIconSrc = "/icons/models/mistral.svg";
    bgClass = "bg-[#f97316]/15 border border-[#f97316]/30";
    title = "Mistral AI";
  } else if (p.includes("xai") || p.includes("grok")) {
    fallbackIconSrc = "/icons/models/grok.svg";
    bgClass = "bg-white/10 border border-white/20";
    title = "xAI Grok";
  } else if (p.includes("flux")) {
    fallbackIconSrc = "/icons/models/flux.svg";
    bgClass = "bg-[#ec4899]/15 border border-[#ec4899]/30";
    title = "Flux (Black Forest Labs)";
  } else if (p.includes("sora")) {
    fallbackIconSrc = "/icons/models/sora.svg";
    bgClass = "bg-[#ea580c]/15 border border-[#ea580c]/30";
    title = "Sora";
  } else if (p.includes("suno")) {
    fallbackIconSrc = "/icons/models/suno.svg";
    bgClass = "bg-[#8b5cf6]/15 border border-[#8b5cf6]/30";
    title = "Suno AI";
  }

  const finalSrc = !imgError && iconUrl ? iconUrl : fallbackIconSrc;

  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0 shadow-xs overflow-hidden bg-[#131314] border border-[rgba(255,255,255,0.1)]",
        sizeClasses[size],
        className
      )}
      title={title}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
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
