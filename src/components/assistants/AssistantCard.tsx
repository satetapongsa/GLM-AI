"use client";

import React from "react";
import { Assistant } from "@/lib/types";
import { useAssistantStore } from "@/lib/store/useAssistantStore";
import { useChatStore } from "@/lib/store/useChatStore";
import { useUIStore } from "@/lib/store/useUIStore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pin, MessageSquare, Trash2, Sliders } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface AssistantCardProps {
  assistant: Assistant;
}

export function AssistantCard({ assistant }: AssistantCardProps) {
  const { togglePinAssistant, deleteAssistant } = useAssistantStore();
  const { createNewConversation } = useChatStore();
  const { setActiveTab } = useUIStore();

  const handleStartChat = () => {
    createNewConversation(`สวัสดี ${assistant.name}`, assistant.modelId);
    setActiveTab("chat");
  };

  return (
    <div className="flex flex-col justify-between p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:shadow-md transition-all duration-200 group">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="text-3xl p-2 rounded-2xl bg-[hsl(var(--muted))] select-none">
              {assistant.avatar}
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-[hsl(var(--card-foreground))]">
                {assistant.name}
              </h4>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                โมเดล: {assistant.modelId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => togglePinAssistant(assistant.id)}
              className={cn(
                "p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer",
                assistant.isPinned ? "text-amber-500 fill-amber-500" : "text-[hsl(var(--muted-foreground))]"
              )}
              title="ปักหมุดที่แถบข้าง"
            >
              <Pin className={cn("h-4 w-4", assistant.isPinned && "fill-amber-500/20")} />
            </button>
            {!assistant.isBuiltIn && (
              <button
                type="button"
                onClick={() => deleteAssistant(assistant.id)}
                className="p-1.5 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="ลบ Assistant"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tagline & Description */}
        <p className="text-xs font-medium text-[hsl(var(--foreground))] mt-1">
          {assistant.tagline}
        </p>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 line-clamp-2 leading-relaxed">
          {assistant.description}
        </p>

        {/* Tools Badges */}
        {assistant.tools && assistant.tools.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {assistant.tools.map((tool) => (
              <span
                key={tool}
                className="text-[10px] px-2 py-0.5 rounded-md bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
              >
                🛠️ {tool}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-[hsl(var(--border))]">
        <div className="flex items-center gap-1 text-[11px] text-[hsl(var(--muted-foreground))]">
          <Sliders className="h-3 w-3" />
          <span>Temp: {assistant.temperature}</span>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={handleStartChat}
          leftIcon={<MessageSquare className="h-3.5 w-3.5" />}
        >
          เริ่มสนทนา
        </Button>
      </div>
    </div>
  );
}
