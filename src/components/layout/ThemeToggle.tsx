"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ThemeToggleProps {
  variant?: "segmented" | "button" | "compact";
  className?: string;
}

export function ThemeToggle({
  variant = "segmented",
  className,
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("h-8 w-24 rounded-xl bg-[hsl(var(--muted))] animate-pulse", className)} />
    );
  }

  if (variant === "compact" || variant === "button") {
    const cycleTheme = () => {
      if (theme === "dark") setTheme("light");
      else if (theme === "light") setTheme("system");
      else setTheme("dark");
    };

    return (
      <button
        type="button"
        onClick={cycleTheme}
        aria-label="เปลี่ยนธีม"
        className={cn(
          "p-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] transition-all cursor-pointer flex items-center gap-2 text-xs",
          className
        )}
        title={`เปลี่ยนธีม (ปัจจุบัน: ${theme === "dark" ? "มืด" : theme === "light" ? "สว่าง" : "ตามระบบ"})`}
      >
        {theme === "dark" ? (
          <Moon className="h-4 w-4 text-blue-400" />
        ) : theme === "light" ? (
          <Sun className="h-4 w-4 text-amber-500" />
        ) : (
          <Laptop className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
        )}
        <span className="text-[11px] font-medium">
          {theme === "dark" ? "มืด" : theme === "light" ? "สว่าง" : "ระบบ"}
        </span>
      </button>
    );
  }

  // Segmented control
  return (
    <div
      className={cn(
        "inline-flex items-center p-1 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] gap-0.5 select-none",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={cn(
          "flex items-center justify-center p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
          theme === "light"
            ? "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-xs"
            : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        )}
        title="ธีมสว่าง (Light Mode)"
      >
        <Sun className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={cn(
          "flex items-center justify-center p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
          theme === "dark"
            ? "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-xs"
            : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        )}
        title="ธีมมืด (Dark Mode)"
      >
        <Moon className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => setTheme("system")}
        className={cn(
          "flex items-center justify-center p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
          theme === "system"
            ? "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-xs"
            : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        )}
        title="ตามระบบ (System Preference)"
      >
        <Laptop className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
