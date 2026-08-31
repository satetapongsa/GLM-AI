"use client";

import React, { useState, useRef, useEffect } from "react";
import { Model } from "@/lib/types";
import { ProviderIcon } from "@/components/ui/ProviderIcon";
import { cn } from "@/lib/utils/cn";
import {
  ChevronRight,
  ChevronDown,
  Code,
  FileText,
  List,
  AlignLeft,
  ListOrdered,
  Table,
  Check,
} from "lucide-react";

export interface ModelCardProps {
  model: Model;
  isSelected: boolean;
  onSelect: (modelId: string) => void;
}

export function ModelCard({ model, isSelected, onSelect }: ModelCardProps) {
  // Option States
  const [processingLevel, setProcessingLevel] = useState<string>("สูงที่สุด");
  const [responseStyle, setResponseStyle] = useState<string>("เป็นลำดับขั้นตอน");
  const [formatType, setFormatType] = useState<string>("ย่อหน้า");

  // Active Dropdown Menu Open State
  const [openDropdown, setOpenDropdown] = useState<"processing" | "style" | "format" | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    if (openDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  const processingOptions = ["ต่ำ", "ปกติ", "สูง", "สูงที่สุด"];

  const styleOptions = [
    "เป็นธรรมชาติ",
    "เป็นกันเอง",
    "เป็นลำดับขั้นตอน",
    "กระชับตรงประเด็น",
    "เชิงวิชาการ",
  ];

  const formatOptions = [
    { id: "code", label: "โค้ดบล็อก", icon: <Code className="h-3.5 w-3.5" /> },
    { id: "markdown", label: "มาร์กดาวน์", icon: <FileText className="h-3.5 w-3.5" /> },
    { id: "bullets", label: "หัวข้อย่อย", icon: <List className="h-3.5 w-3.5" /> },
    { id: "paragraph", label: "ย่อหน้า", icon: <AlignLeft className="h-3.5 w-3.5" /> },
    { id: "numbered", label: "รายการตัวเลข", icon: <ListOrdered className="h-3.5 w-3.5" /> },
    { id: "table", label: "ตาราง", icon: <Table className="h-3.5 w-3.5" /> },
  ];

  return (
    <div
      ref={menuRef}
      onClick={() => onSelect(model.id)}
      className={cn(
        "flex flex-col p-4 sm:p-5 rounded-2xl border transition-all duration-150 cursor-pointer select-none bg-[#1e1f20] relative",
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
            <span className="text-[15px] font-bold text-white truncate">
              {model.name}
            </span>
            {model.isPopular && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                นิยม
              </span>
            )}
          </div>
        </div>

        {/* Right: [ เลือก / ยืนยัน ] Button */}
        <div className="flex items-center gap-3 shrink-0">
          {!isSelected && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(model.id);
              }}
              className="text-[12.5px] font-medium text-blue-400 hover:text-blue-300 cursor-pointer hover:underline"
            >
              ตั้งค่าเพิ่มเติม
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(model.id);
            }}
            className={cn(
              "px-5 py-1.5 rounded-full text-[13px] font-bold transition-all border cursor-pointer",
              isSelected
                ? "bg-[#0b57d0] hover:bg-[#0842a0] text-white border-[#0b57d0] shadow-md active:scale-95"
                : "bg-[#282a2c] border-[rgba(255,255,255,0.08)] text-slate-200 hover:bg-[#333538] hover:text-white"
            )}
          >
            {isSelected ? "ยืนยัน" : "เลือก"}
          </button>
        </div>
      </div>

      {/* Description Line */}
      <p className="text-[12px] text-slate-400 line-clamp-2 leading-relaxed pl-0.5 mb-2">
        {model.description}
      </p>

      {/* Expandable Options Rows (Shown only on Selected Card - Matches User Reference Images) */}
      {isSelected && (
        <div className="mt-2 pt-2 border-t border-[rgba(255,255,255,0.08)] space-y-1 text-[13px] relative">
          {/* Row 1: การประมวลผล */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown(openDropdown === "processing" ? null : "processing");
              }}
              className="w-full flex items-center justify-between py-2 px-2.5 rounded-xl hover:bg-[#282a2c] text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <span>การประมวลผล</span>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <span className="text-white font-medium">{processingLevel}</span>
                {openDropdown === "processing" ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </button>

            {/* Dropdown 1 Menu */}
            {openDropdown === "processing" && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1 w-44 rounded-2xl bg-[#1e1f20] border border-[rgba(255,255,255,0.12)] shadow-2xl z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150"
              >
                {processingOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setProcessingLevel(opt);
                      setOpenDropdown(null);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left",
                      processingLevel === opt
                        ? "bg-[#0b57d0] text-white"
                        : "text-slate-300 hover:bg-[#282a2c] hover:text-white"
                    )}
                  >
                    <span>{opt}</span>
                    {processingLevel === opt && <Check className="h-3.5 w-3.5 text-white" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Row 2: สไตล์การตอบ */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown(openDropdown === "style" ? null : "style");
              }}
              className="w-full flex items-center justify-between py-2 px-2.5 rounded-xl hover:bg-[#282a2c] text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <span>สไตล์การตอบ</span>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <span className="text-white font-medium">{responseStyle}</span>
                {openDropdown === "style" ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </button>

            {/* Dropdown 2 Menu */}
            {openDropdown === "style" && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1 w-48 rounded-2xl bg-[#1e1f20] border border-[rgba(255,255,255,0.12)] shadow-2xl z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150"
              >
                {styleOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setResponseStyle(opt);
                      setOpenDropdown(null);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left",
                      responseStyle === opt
                        ? "bg-[#0b57d0] text-white"
                        : "text-slate-300 hover:bg-[#282a2c] hover:text-white"
                    )}
                  >
                    <span>{opt}</span>
                    {responseStyle === opt && <Check className="h-3.5 w-3.5 text-white" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Row 3: รูปแบบ */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown(openDropdown === "format" ? null : "format");
              }}
              className="w-full flex items-center justify-between py-2 px-2.5 rounded-xl hover:bg-[#282a2c] text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <span>รูปแบบ</span>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <span className="text-white font-medium">{formatType}</span>
                {openDropdown === "format" ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </button>

            {/* Dropdown 3 Menu */}
            {openDropdown === "format" && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1 w-52 rounded-2xl bg-[#1e1f20] border border-[rgba(255,255,255,0.12)] shadow-2xl z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150"
              >
                {formatOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setFormatType(opt.label);
                      setOpenDropdown(null);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left",
                      formatType === opt.label
                        ? "bg-[#0b57d0] text-white"
                        : "text-slate-300 hover:bg-[#282a2c] hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {opt.icon}
                      <span>{opt.label}</span>
                    </div>
                    {formatType === opt.label && <Check className="h-3.5 w-3.5 text-white" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
