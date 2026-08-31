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
        return <ArrowLeftRight className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />;
      case "Image":
        return <ImageIcon className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />;
      case "Clapperboard":
        return <Clapperboard className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />;
      case "AudioLines":
        return <AudioLines className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />;
      case "Telescope":
        return <Telescope className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />;
      default:
        return <ArrowLeftRight className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />;
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[12px] text-slate-700 dark:text-slate-300 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-850 hover:border-slate-300 transition-all whitespace-nowrap shrink-0 cursor-pointer active:scale-95"
          title={action.description}
        >
          <span className="shrink-0">{getIcon(action.iconName)}</span>
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}
