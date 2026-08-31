import React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "pro" | "success" | "warning";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default:
      "bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.2)]",
    secondary:
      "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]",
    outline:
      "border border-[hsl(var(--border))] text-[hsl(var(--foreground))]",
    pro: "bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30 font-semibold",
    success:
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
    warning:
      "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px] font-medium rounded-md gap-1",
    md: "px-2.5 py-0.5 text-xs font-medium rounded-lg gap-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center transition-colors select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
