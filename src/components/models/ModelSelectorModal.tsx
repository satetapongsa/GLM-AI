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
        return <Sparkles className="h-3.5 w-3.5 text-[#0b57d0]" />;
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
          <span className="text-[17px] font-bold text-slate-900 dark:text-slate-100">
            เลือกโมเดล
          </span>
        }
      >
        <div className="space-y-4">
          {/* Category Tabs Pill Bar - Matches Reference Image 1 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-100 dark:border-slate-800">
            {MODEL_CATEGORIES.map((tab) => {
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12.5px] font-normal transition-all whitespace-nowrap cursor-pointer shrink-0",
                    isActive
                      ? "bg-[#e8f0fe] dark:bg-blue-900/30 text-[#0b57d0] dark:text-blue-300 font-semibold"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  {tab.iconName && getCategoryIcon(tab.iconName)}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Model Cards List - Matches Reference Image 1 Vertical Stack */}
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
