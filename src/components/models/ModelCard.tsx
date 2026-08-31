"use client";

import React from "react";
import { Model } from "@/lib/types";
import { useModelStore } from "@/lib/store/useModelStore";
import { ProviderIcon } from "@/components/ui/ProviderIcon";
import { cn } from "@/lib/utils/cn";

export interface ModelCardProps {
  model: Model;
  isSelected: boolean;
  onSelect: (modelId: string) => void;
}

export function ModelCard({ model, isSelected, onSelect }: ModelCardProps) {
  const { openModelSettingsModal } = useModelStore();

  return (
    <div
      className={cn(
        "flex flex-col p-4 sm:p-4.5 rounded-2xl border transition-all duration-150 bg-white dark:bg-slate-900",
        isSelected
          ? "border-[#3b82f6] ring-1 ring-[#3b82f6]/20 bg-blue-50/20 dark:bg-blue-900/10"
          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
      )}
    >
      {/* Top Line: Provider Icon + Model Title on Left, Link & Pill Button on Right */}
      <div className="flex items-center justify-between gap-3 mb-1.5">
        {/* Left: Icon & Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <ProviderIcon provider={model.provider} size="md" />
          <span className="text-[14.5px] font-bold text-slate-900 dark:text-slate-100 truncate">
            {model.name}
          </span>
        </div>

        {/* Right: ตั้งค่าเพิ่มเติม Link + [ เลือก ] Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openModelSettingsModal(model.id);
            }}
            className="text-[12.5px] font-medium text-[#0b57d0] hover:text-[#0842a0] dark:text-blue-400 cursor-pointer hover:underline"
          >
            ตั้งค่าเพิ่มเติม
          </button>

          <button
            type="button"
            onClick={() => onSelect(model.id)}
            className={cn(
              "px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors border cursor-pointer",
              isSelected
                ? "bg-[#0b57d0] text-white border-[#0b57d0]"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
            )}
          >
            {isSelected ? "เลือกแล้ว" : "เลือก"}
          </button>
        </div>
      </div>

      {/* Bottom Line: Description (เหมาะสำหรับ: ...) */}
      <p className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
        {model.description}
      </p>
    </div>
  );
}
