import React from "react";
import { BRAND_CONFIG } from "@/lib/config/brand";
import { cn } from "@/lib/utils/cn";

export interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  collapsed?: boolean;
  showBadge?: boolean;
  showSubtext?: boolean;
  className?: string;
}

export function BrandLogo({
  size = "md",
  collapsed = false,
  showBadge = true,
  className,
}: BrandLogoProps) {
  const sizeMap = {
    sm: { icon: "h-5 w-5", text: "text-[16px]", badge: "text-[8.5px] px-1.5 py-0.5" },
    md: { icon: "h-7 w-7", text: "text-[19px]", badge: "text-[9px] px-1.5 py-0.5" },
    lg: { icon: "h-9 w-9", text: "text-2xl", badge: "text-[10px] px-2 py-0.5" },
    xl: { icon: "h-11 w-11", text: "text-3xl", badge: "text-xs px-2.5 py-1" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {/* Goomiru Supernova Emblem */}
      <div className={cn("relative flex items-center justify-center shrink-0 drop-shadow-md", currentSize.icon)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icon.svg"
          alt="Goomiru Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Brand Name Typography */}
      {!collapsed && (
        <div className="flex items-center gap-1.5">
          <span className={cn("font-extrabold tracking-tight text-white flex items-center", currentSize.text)}>
            <span>Goo</span>
            <span className="text-sky-400">mi</span>
            <span>ru</span>
          </span>
          {showBadge && (
            <span className={cn("inline-flex items-center justify-center rounded-full bg-blue-500/20 border border-blue-400/35 font-black text-sky-300 leading-none shadow-2xs", currentSize.badge)}>
              AI
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function BrandName({ className }: { className?: string }) {
  return (
    <span className={cn("font-extrabold text-white", className)}>
      <span>Goo</span>
      <span className="text-sky-400">mi</span>
      <span>ru</span>
    </span>
  );
}
