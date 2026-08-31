import React from "react";
import { AIProviderName } from "@/lib/types";
import { Sparkles, Brain, Code, Cpu, Film, Music, Layers } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ProviderIconProps {
  provider: AIProviderName | string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProviderIcon({
  provider,
  size = "md",
  className,
}: ProviderIconProps) {
  const sizeClasses = {
    sm: "h-5 w-5 p-0.5",
    md: "h-7 w-7 p-1",
    lg: "h-9 w-9 p-1.5",
  };

  const p = (provider || "").toLowerCase();

  // OpenAI
  if (p.includes("openai") || p.includes("gpt")) {
    return (
      <div
        className={cn(
          "rounded-lg bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20",
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

  // Anthropic / Claude
  if (p.includes("anthropic") || p.includes("claude")) {
    return (
      <div
        className={cn(
          "rounded-lg bg-amber-600/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20",
          sizeClasses[size],
          className
        )}
        title="Anthropic"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="m14.82 2.41-6.19 19.18H4.27L10.46 2.41h4.36zm4.91 19.18-6.19-19.18h4.36l6.19 19.18h-4.36z" />
        </svg>
      </div>
    );
  }

  // Google / Gemini
  if (p.includes("google") || p.includes("gemini")) {
    return (
      <div
        className={cn(
          "rounded-lg bg-blue-600/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20",
          sizeClasses[size],
          className
        )}
        title="Google Gemini"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
        </svg>
      </div>
    );
  }

  // DeepSeek
  if (p.includes("deepseek")) {
    return (
      <div
        className={cn(
          "rounded-lg bg-cyan-600/10 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20",
          sizeClasses[size],
          className
        )}
        title="DeepSeek"
      >
        <Brain className="w-full h-full" />
      </div>
    );
  }

  // Meta / Llama
  if (p.includes("meta") || p.includes("llama")) {
    return (
      <div
        className={cn(
          "rounded-lg bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20",
          sizeClasses[size],
          className
        )}
        title="Meta AI"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
        </svg>
      </div>
    );
  }

  // Mistral
  if (p.includes("mistral")) {
    return (
      <div
        className={cn(
          "rounded-lg bg-orange-600/10 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/20",
          sizeClasses[size],
          className
        )}
        title="Mistral AI"
      >
        <div className="grid grid-cols-2 gap-0.5 w-full h-full p-0.5">
          <div className="bg-current rounded-xs" />
          <div className="bg-current rounded-xs opacity-60" />
          <div className="bg-current rounded-xs opacity-60" />
          <div className="bg-current rounded-xs" />
        </div>
      </div>
    );
  }

  // xAI / Grok
  if (p.includes("xai") || p.includes("grok")) {
    return (
      <div
        className={cn(
          "rounded-lg bg-zinc-800/20 text-zinc-800 dark:bg-zinc-200/20 dark:text-zinc-100 flex items-center justify-center shrink-0 border border-zinc-500/20 font-bold",
          sizeClasses[size],
          className
        )}
        title="xAI"
      >
        <span className="text-[11px] font-mono leading-none">𝕏</span>
      </div>
    );
  }

  // Qwen / Alibaba
  if (p.includes("qwen")) {
    return (
      <div
        className={cn(
          "rounded-lg bg-purple-600/10 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20",
          sizeClasses[size],
          className
        )}
        title="Qwen"
      >
        <Cpu className="w-full h-full" />
      </div>
    );
  }

  // Creative (Flux, Sora, Suno)
  if (p.includes("flux")) {
    return (
      <div
        className={cn(
          "rounded-lg bg-pink-600/10 text-pink-600 dark:bg-pink-500/15 dark:text-pink-400 flex items-center justify-center shrink-0 border border-pink-500/20",
          sizeClasses[size],
          className
        )}
        title="Flux"
      >
        <Sparkles className="w-full h-full" />
      </div>
    );
  }

  if (p.includes("sora")) {
    return (
      <div
        className={cn(
          "rounded-lg bg-rose-600/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20",
          sizeClasses[size],
          className
        )}
        title="Sora"
      >
        <Film className="w-full h-full" />
      </div>
    );
  }

  if (p.includes("suno")) {
    return (
      <div
        className={cn(
          "rounded-lg bg-violet-600/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/20",
          sizeClasses[size],
          className
        )}
        title="Suno"
      >
        <Music className="w-full h-full" />
      </div>
    );
  }

  // Default fallback
  return (
    <div
      className={cn(
        "rounded-lg bg-blue-600/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20",
        sizeClasses[size],
        className
      )}
    >
      <Layers className="w-full h-full" />
    </div>
  );
}
