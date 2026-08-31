"use client";

import React, { useState } from "react";
import { Prompt } from "@/lib/types";
import { usePromptStore } from "@/lib/store/usePromptStore";
import { useChatStore } from "@/lib/store/useChatStore";
import { useUIStore } from "@/lib/store/useUIStore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Star, Copy, Check, ArrowUpRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface PromptCardProps {
  prompt: Prompt;
  onEdit?: (prompt: Prompt) => void;
}

export function PromptCard({ prompt, onEdit }: PromptCardProps) {
  const { toggleFavorite, deletePrompt } = usePromptStore();
  const { setComposerText, createNewConversation } = useChatStore();
  const { setActiveTab } = useUIStore();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleUsePrompt = () => {
    setComposerText(prompt.content);
    setActiveTab("chat");
  };

  return (
    <div className="flex flex-col justify-between p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:shadow-md transition-all duration-200 group">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <Badge variant="secondary">{prompt.category}</Badge>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => toggleFavorite(prompt.id)}
              className={cn(
                "p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer",
                prompt.isFavorite ? "text-amber-500 fill-amber-500" : "text-[hsl(var(--muted-foreground))]"
              )}
              title={prompt.isFavorite ? "เลิกบันทึกเป็นรายการโปรด" : "บันทึกเป็นรายการโปรด"}
            >
              <Star className={cn("h-4 w-4", prompt.isFavorite && "fill-amber-500")} />
            </button>
            {prompt.isCustom && (
              <button
                type="button"
                onClick={() => deletePrompt(prompt.id)}
                className="p-1.5 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="ลบ Prompt"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h4 className="text-sm sm:text-base font-bold text-[hsl(var(--card-foreground))]">
          {prompt.title}
        </h4>

        {/* Description */}
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1.5 line-clamp-2 leading-relaxed">
          {prompt.description}
        </p>

        {/* Content Snippet */}
        <div className="mt-3 p-2.5 rounded-xl bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border)/0.7)] text-xs text-[hsl(var(--foreground)/0.8)] font-mono line-clamp-3 leading-relaxed">
          {prompt.content}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {prompt.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-md bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-[hsl(var(--border))]">
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors cursor-pointer"
        >
          {isCopied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-emerald-500">คัดลอกแล้ว</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>คัดลอก</span>
            </>
          )}
        </button>

        <Button
          size="sm"
          variant="primary"
          onClick={handleUsePrompt}
          rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}
        >
          ใช้ Prompt นี้
        </Button>
      </div>
    </div>
  );
}
