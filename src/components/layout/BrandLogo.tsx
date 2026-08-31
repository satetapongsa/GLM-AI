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
  showSubtext = true,
  className,
}: BrandLogoProps) {
  const sizeMap = {
    sm: { icon: "h-5 w-5", text: "text-[16px]", badge: "text-[8.5px] px-1.5 py-0.5" },
    md: { icon: "h-6 w-6", text: "text-[19px]", badge: "text-[9px] px-1.5 py-0.5" },
    lg: { icon: "h-8 w-8", text: "text-2xl", badge: "text-[10px] px-2 py-0.5" },
    xl: { icon: "h-10 w-10", text: "text-3xl", badge: "text-xs px-2.5 py-1" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={cn("inline-flex items-center gap-2 select-none", className)}>
      {/* GML 4-Pointed Star Sparkle Emblem */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn("shrink-0 drop-shadow-sm", currentSize.icon)}
        >
          <path
            d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
            fill="url(#gml-sparkle-logo-grad)"
          />
          <defs>
            <linearGradient id="gml-sparkle-logo-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1a73e8" />
              <stop offset="0.6" stopColor="#38bdf8" />
              <stop offset="1" stopColor="#818cf8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Name Typography */}
      {!collapsed && (
        <div className="flex items-center gap-1.5">
          <span className={cn("font-bold tracking-tight text-white", currentSize.text)}>
            {BRAND_CONFIG.name}
          </span>
          {showBadge && (
            <span className={cn("inline-flex items-center justify-center rounded-full bg-blue-500/20 border border-blue-400/40 font-bold text-sky-300 leading-none", currentSize.badge)}>
              {BRAND_CONFIG.logo.badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function BrandName({ className }: { className?: string }) {
  return (
    <span className={cn("font-bold text-white", className)}>
      {BRAND_CONFIG.name}
    </span>
  );
}
