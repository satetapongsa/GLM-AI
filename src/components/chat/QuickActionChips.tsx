"use client";

import React from "react";
import { QUICK_ACTIONS } from "@/lib/config/quickActions";
import { useChatStore } from "@/lib/store/useChatStore";
import {
  ArrowLeftRight,
  Image as ImageIcon,
  Clapperboard,
  AudioLines,
  Telescope,
} from "lucide-react";

export function QuickActionChips() {
  const { setComposerText } = useChatStore();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "ArrowLeftRight":
        return <ArrowLeftRight className="h-3.5 w-3.5 text-sky-400" />;
      case "Image":
        return <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />;
      case "Clapperboard":
        return <Clapperboard className="h-3.5 w-3.5 text-purple-400" />;
      case "AudioLines":
        return <AudioLines className="h-3.5 w-3.5 text-amber-400" />;
      case "Telescope":
        return <Telescope className="h-3.5 w-3.5 text-rose-400" />;
      default:
        return <ArrowLeftRight className="h-3.5 w-3.5 text-sky-400" />;
    }
  };

  const handleActionClick = (prompt: string) => {
    setComposerText(prompt);
  };

  return (
    <div className="w-full flex items-center justify-center gap-2 flex-wrap sm:flex-nowrap overflow-x-auto pb-1 scrollbar-none px-2 mb-3">
      {QUICK_ACTIONS.map((action) => (
        <button
          key={action.id}
          onClick={() => handleActionClick(action.suggestedPrompt)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1e1f20] border border-[rgba(255,255,255,0.08)] text-[12px] text-slate-200 shadow-2xs hover:bg-[#282a2c] hover:border-[rgba(255,255,255,0.15)] transition-all whitespace-nowrap shrink-0 cursor-pointer active:scale-95"
          title={action.description}
        >
          <span className="shrink-0">{getIcon(action.iconName)}</span>
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}
