"use client";

import React, { useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { useModelStore } from "@/lib/store/useModelStore";
import { useChatStore } from "@/lib/store/useChatStore";
import { MODEL_CATEGORIES } from "@/lib/config/models";
import { ModelCard } from "./ModelCard";
import { ModelSettingsModal } from "./ModelSettingsModal";
import {
  Sparkles,
  MessageSquare,
  Telescope,
  Image as ImageIcon,
  Clapperboard,
  Music,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function ModelSelectorModal() {
  const {
    models,
    selectedCategory,
    setSelectedCategory,
    isModelModalOpen,
    closeModelModal,
    selectModel,
  } = useModelStore();

  const { activeModelId } = useChatStore();

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case "Sparkles":
        return <Sparkles className="h-3.5 w-3.5 text-blue-400" />;
      case "MessageSquare":
        return <MessageSquare className="h-3.5 w-3.5" />;
      case "Telescope":
        return <Telescope className="h-3.5 w-3.5" />;
      case "Image":
        return <ImageIcon className="h-3.5 w-3.5" />;
      case "Clapperboard":
        return <Clapperboard className="h-3.5 w-3.5" />;
      case "Music":
        return <Music className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

  const filteredModels = useMemo(() => {
    if (selectedCategory === "all") return models;
    return models.filter((m) => m.category.includes(selectedCategory));
  }, [models, selectedCategory]);

  return (
    <>
      <Modal
        isOpen={isModelModalOpen}
        onClose={closeModelModal}
        maxWidth="4xl"
        title={
          <span className="text-[17px] font-bold text-[#f1f5f9]">
            เลือกโมเดล AI (Select AI Model)
          </span>
        }
      >
        <div className="space-y-4">
          {/* Category Tabs Pill Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-[rgba(255,255,255,0.08)]">
            {MODEL_CATEGORIES.map((tab) => {
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12.5px] font-medium transition-all whitespace-nowrap cursor-pointer shrink-0",
                    isActive
                      ? "bg-[#0b57d0] text-white shadow-xs font-semibold"
                      : "bg-[#1e1f20] border border-[rgba(255,255,255,0.08)] text-slate-300 hover:text-white hover:bg-[#282a2c]"
                  )}
                >
                  {tab.iconName && getCategoryIcon(tab.iconName)}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Model Cards List */}
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {filteredModels.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                isSelected={activeModelId === model.id}
                onSelect={(id) => selectModel(id)}
              />
            ))}
          </div>
        </div>
      </Modal>

      {/* Parameter Settings Modal */}
      <ModelSettingsModal />
    </>
  );
}
