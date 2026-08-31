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
  return (
    <div className={cn("inline-flex items-center gap-1.5 select-none", className)}>
      {/* GML 4-Pointed Star Emblem */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-[#0b57d0]"
        >
          <path
            d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
            fill="url(#gml-grad)"
          />
          <defs>
            <linearGradient id="gml-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0b57d0" />
              <stop offset="1" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Name Typography */}
      {!collapsed && (
        <div className="flex items-center gap-1">
          <span className="text-[20px] font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {BRAND_CONFIG.name}
          </span>
          {showBadge && (
            <span className="inline-flex items-center justify-center h-4.5 px-1 rounded-full border border-slate-700 dark:border-slate-300 text-[9px] font-bold text-slate-800 dark:text-slate-200 leading-none">
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
    <span className={cn("font-bold text-slate-900 dark:text-slate-100", className)}>
      {BRAND_CONFIG.name}
    </span>
  );
}
