"use client";

import React, { useMemo, useState } from "react";
import { usePromptStore } from "@/lib/store/usePromptStore";
import { PromptCategory } from "@/lib/types";
import { PromptCard } from "./PromptCard";
import { PromptModal } from "./PromptModal";
import { Button } from "@/components/ui/Button";
import { Search, Plus, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const CATEGORIES: (PromptCategory | "All")[] = [
  "All",
  "Marketing",
  "Coding",
  "Writing",
  "Research",
  "Business",
  "Design",
  "Productivity",
];

export function PromptLibraryView({ onlyFavorites = false }: { onlyFavorites?: boolean }) {
  const { prompts, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } =
    usePromptStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredPrompts = useMemo(() => {
    return prompts.filter((p) => {
      if (onlyFavorites && !p.isFavorite) return false;
      const matchesCategory =
        selectedCategory === "All" || p.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [prompts, selectedCategory, searchQuery, onlyFavorites]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[hsl(var(--border))]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              {onlyFavorites ? (
                <Star className="h-5 w-5 fill-amber-500" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[hsl(var(--foreground))]">
                {onlyFavorites ? "ชุดคำสั่งที่บันทึกไว้ (Saved Prompts)" : "คลังพริพรอมต์ (Prompt Library)"}
              </h2>
              <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">
                {onlyFavorites
                  ? "รายการ Prompt โปรดที่คุณบันทึกไว้เพื่อหยิบมาใช้งานได้อย่างรวดเร็ว"
                  : "รวบรวมเทมเพลตคำสั่งคุณภาพสูงสำหรับงานสายงานต่างๆ"}
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          สร้าง Prompt ใหม่
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-3 my-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="ค้นหาตามชื่อ, เนื้อหา หรือแท็ก..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer select-none shrink-0",
                  isActive
                    ? "bg-[hsl(var(--primary))] text-white shadow-xs font-semibold"
                    : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]"
                )}
              >
                {cat === "All" ? "ทั้งหมด" : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Prompts Grid */}
      {filteredPrompts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] mb-3">
            <Sparkles className="h-8 w-8" />
          </div>
          <h4 className="text-sm font-semibold text-[hsl(var(--foreground))]">
            {onlyFavorites ? "ยังไม่มี Prompt ที่บันทึกไว้" : "ไม่พบ Prompt ที่ตรงกับคำค้นหา"}
          </h4>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 max-w-sm">
            {onlyFavorites
              ? "คุณสามารถกดไอคอนดาวบน Prompt ใดๆ เพื่อบันทึกไว้ในหน้านี้"
              : "ลองเปลี่ยนคำค้นหา หรือสร้าง Prompt ใหม่ของคุณเอง"}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4"
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            สร้าง Prompt
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
          {filteredPrompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <PromptModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
