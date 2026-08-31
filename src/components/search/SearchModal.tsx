"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { useUIStore } from "@/lib/store/useUIStore";
import { useChatStore } from "@/lib/store/useChatStore";
import { formatRelativeTime } from "@/lib/utils/formatters";
import { Search, MessageSquare, Pin, ArrowRight, Sparkles } from "lucide-react";

export function SearchModal() {
  const { isSearchModalOpen, setSearchModalOpen, setActiveTab } = useUIStore();
  const { conversations, messages, setActiveConversation } = useChatStore();
  const [query, setQuery] = useState("");

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchModalOpen(!isSearchModalOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchModalOpen, setSearchModalOpen]);

  const searchResults = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return conversations;

    return conversations.filter((c) => {
      const titleMatch = c.title.toLowerCase().includes(q);
      const snippetMatch = c.lastMessageSnippet?.toLowerCase().includes(q);
      const msgList = messages[c.id] || [];
      const contentMatch = msgList.some((m) =>
        m.content.toLowerCase().includes(q)
      );

      return titleMatch || snippetMatch || contentMatch;
    });
  }, [conversations, messages, query]);

  const handleSelect = (id: string) => {
    setActiveConversation(id);
    setActiveTab("chat");
    setSearchModalOpen(false);
    setQuery("");
  };

  return (
    <Modal
      isOpen={isSearchModalOpen}
      onClose={() => setSearchModalOpen(false)}
      maxWidth="2xl"
      showCloseButton={false}
    >
      <div className="space-y-4">
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-[hsl(var(--border))] pb-3">
          <Search className="h-5 w-5 text-[hsl(var(--muted-foreground))] mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="ค้นหาข้อความ, หัวข้อแชท, หรือคำถาม..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm sm:text-base text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none"
          />
          <kbd className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto space-y-1 pr-1">
          {searchResults.length === 0 ? (
            <div className="py-12 text-center text-xs text-[hsl(var(--muted-foreground))]">
              ไม่พบการสนทนาที่ตรงกับ &ldquo;{query}&rdquo;
            </div>
          ) : (
            searchResults.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelect(c.id)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[hsl(var(--muted))] transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] group-hover:bg-blue-500/10 transition-colors shrink-0 mt-0.5">
                    {c.pinned ? (
                      <Pin className="h-4 w-4 text-amber-500 fill-amber-500/20" />
                    ) : (
                      <MessageSquare className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs sm:text-sm font-semibold text-[hsl(var(--foreground))] truncate">
                      {c.title}
                    </h5>
                    <p className="text-[11px] text-[hsl(var(--muted-foreground))] truncate mt-0.5">
                      {c.lastMessageSnippet || "ไม่มีตัวอย่างข้อความ"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))] hidden sm:inline">
                    {formatRelativeTime(c.updatedAt)}
                  </span>
                  <ArrowRight className="h-4 w-4 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity group-hover:translate-x-0.5" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
