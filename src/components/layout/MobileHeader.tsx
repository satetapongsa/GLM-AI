"use client";

import React from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { useUIStore } from "@/lib/store/useUIStore";
import { useChatStore } from "@/lib/store/useChatStore";
import { Menu, Plus } from "lucide-react";

export function MobileHeader() {
  const { toggleMobileDrawer } = useUIStore();
  const { setActiveConversation } = useChatStore();

  return (
    <header className="md:hidden flex items-center justify-between px-3 h-14 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] shrink-0 z-20">
      <div className="flex items-center gap-2.5">
        <button
          onClick={toggleMobileDrawer}
          aria-label="เปิดเมนู"
          className="p-2 rounded-xl text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
        <BrandLogo size="sm" showBadge={false} showSubtext={false} />
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setActiveConversation(null)}
          aria-label="แชทใหม่"
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white text-xs font-semibold shadow-xs cursor-pointer active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>แชทใหม่</span>
        </button>
      </div>
    </header>
  );
}
