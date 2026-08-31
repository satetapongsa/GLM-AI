"use client";

import React, { useMemo, useState } from "react";
import { useAssistantStore } from "@/lib/store/useAssistantStore";
import { AssistantCard } from "./AssistantCard";
import { AssistantModal } from "./AssistantModal";
import { Button } from "@/components/ui/Button";
import { Search, Plus, Bot } from "lucide-react";

export function AssistantListView() {
  const { assistants, searchQuery, setSearchQuery } = useAssistantStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredAssistants = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return assistants;

    return assistants.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tagline.toLowerCase().includes(q) ||
        a.tools.some((t) => t.toLowerCase().includes(q))
    );
  }, [assistants, searchQuery]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[hsl(var(--foreground))]">
              ผู้ช่วยอัจฉริยะ (AI Assistants Hub)
            </h2>
            <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">
              สร้าง ปรับแต่ง และเลือกใช้ผู้ช่วย AI ที่ได้รับการฝึกฝนคำสั่งเฉพาะทาง
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          สร้างผู้ช่วยใหม่
        </Button>
      </div>

      {/* Search Bar */}
      <div className="my-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="ค้นหาผู้ช่วย AI ตามชื่อ, ทักษะ หรือเครื่องมือ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>
      </div>

      {/* Assistants Grid */}
      {filteredAssistants.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] mb-3">
            <Bot className="h-8 w-8" />
          </div>
          <h4 className="text-sm font-semibold text-[hsl(var(--foreground))]">
            ไม่พบผู้ช่วยที่ตรงกับคำค้นหา
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="mt-4"
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            สร้างผู้ช่วย
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
          {filteredAssistants.map((assistant) => (
            <AssistantCard key={assistant.id} assistant={assistant} />
          ))}
        </div>
      )}

      {/* Modal */}
      <AssistantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
