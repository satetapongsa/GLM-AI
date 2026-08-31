"use client";

import React from "react";
import { MODEL_CATEGORIES } from "@/lib/config/models";
import { ModelCategory } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

export interface ModelCategoryTabsProps {
  activeCategory: ModelCategory;
  onSelectCategory: (category: ModelCategory) => void;
}

export function ModelCategoryTabs({
  activeCategory,
  onSelectCategory,
}: ModelCategoryTabsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-[hsl(var(--border))]">
      {MODEL_CATEGORIES.map((tab) => {
        const isActive = activeCategory === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectCategory(tab.id)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer select-none shrink-0",
              isActive
                ? "bg-[hsl(var(--primary))] text-white shadow-xs font-semibold"
                : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
