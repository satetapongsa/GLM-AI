"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";

export interface DropdownItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  dividerBefore?: boolean;
  badge?: React.ReactNode;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  width?: string;
  className?: string;
}

export function Dropdown({
  trigger,
  items,
  align = "right",
  width = "w-56",
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={cn("relative inline-block text-left", className)}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          role="menu"
          className={cn(
            "absolute z-50 mt-1.5 rounded-xl bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-xl border border-[hsl(var(--border))] py-1.5 focus:outline-none animate-in fade-in zoom-in-95 duration-100",
            width,
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((item) => (
            <React.Fragment key={item.id}>
              {item.dividerBefore && (
                <div className="my-1 border-t border-[hsl(var(--border))]" />
              )}
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick?.();
                    setIsOpen(false);
                  }
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-colors text-left cursor-pointer select-none",
                  item.destructive
                    ? "text-red-500 hover:bg-red-500/10"
                    : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]",
                  item.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon && (
                    <span className="text-[hsl(var(--muted-foreground))]">
                      {item.icon}
                    </span>
                  )}
                  <span>{item.label}</span>
                </div>
                {item.badge}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
