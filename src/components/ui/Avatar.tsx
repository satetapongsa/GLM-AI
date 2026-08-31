import React from "react";
import { cn } from "@/lib/utils/cn";
import { User as UserIcon, Bot, Sparkles } from "lucide-react";

export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  variant?: "user" | "bot" | "assistant" | "system";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Avatar({
  src,
  alt = "Avatar",
  fallback,
  variant = "user",
  size = "md",
  className,
}: AvatarProps) {
  const sizeClasses = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-11 w-11 text-base",
    xl: "h-14 w-14 text-lg",
  };

  const iconSizes = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-4.5 w-4.5",
    lg: "h-6 w-6",
    xl: "h-7 w-7",
  };

  const variantStyles = {
    user: "bg-blue-600 text-white font-semibold",
    bot: "bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white shadow-sm",
    assistant: "bg-emerald-600 text-white",
    system: "bg-zinc-600 text-white",
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center shrink-0 rounded-xl overflow-hidden select-none",
        sizeClasses[size],
        variantStyles[variant],
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLElement).style.display = "none";
          }}
        />
      ) : fallback ? (
        <span>{fallback}</span>
      ) : variant === "bot" ? (
        <Sparkles className={iconSizes[size]} />
      ) : variant === "assistant" ? (
        <Bot className={iconSizes[size]} />
      ) : (
        <UserIcon className={iconSizes[size]} />
      )}
    </div>
  );
}
