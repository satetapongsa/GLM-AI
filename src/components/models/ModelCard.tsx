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
      onClick={() => onSelect(model.id)}
      className={cn(
        "flex flex-col p-4 sm:p-4.5 rounded-2xl border transition-all duration-150 cursor-pointer select-none bg-[#1e1f20]",
        isSelected
          ? "border-[#0b57d0] ring-1 ring-[#0b57d0]/30 bg-[#0b57d0]/10"
          : "border-[rgba(255,255,255,0.08)] hover:border-slate-600 hover:bg-[#282a2c]"
      )}
    >
      {/* Top Line: Provider Icon + Model Title on Left, Link & Pill Button on Right */}
      <div className="flex items-center justify-between gap-3 mb-2">
        {/* Left: Official Real Icon & Name */}
        <div className="flex items-center gap-3 min-w-0">
          <ProviderIcon provider={model.provider} size="md" />
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[14.5px] font-bold text-white truncate">
              {model.name}
            </span>
            {model.isPopular && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                นิยม
              </span>
            )}
          </div>
        </div>

        {/* Right: ตั้งค่าเพิ่มเติม Link + [ เลือก ] Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openModelSettingsModal(model.id);
            }}
            className="text-[12.5px] font-medium text-blue-400 hover:text-blue-300 cursor-pointer hover:underline"
          >
            ตั้งค่าเพิ่มเติม
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(model.id);
            }}
            className={cn(
              "px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors border cursor-pointer",
              isSelected
                ? "bg-[#0b57d0] text-white border-[#0b57d0] shadow-xs"
                : "bg-[#282a2c] border-[rgba(255,255,255,0.08)] text-slate-200 hover:bg-[#333538] hover:text-white"
            )}
          >
            {isSelected ? "เลือกแล้ว" : "เลือก"}
          </button>
        </div>
      </div>

      {/* Bottom Line: Description (เหมาะสำหรับ: ...) */}
      <p className="text-[12px] text-slate-400 line-clamp-2 leading-relaxed pl-1">
        {model.description}
      </p>
    </div>
  );
}
