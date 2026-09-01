"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { useModelStore } from "@/lib/store/useModelStore";
import { useChatStore } from "@/lib/store/useChatStore";
import { DEFAULT_MODEL_ID } from "@/lib/config/models";
import { ModelCard } from "./ModelCard";
import { ModelSettingsModal } from "./ModelSettingsModal";

export function ModelSelectorModal() {
  const {
    models,
    isModelModalOpen,
    closeModelModal,
    selectModel,
  } = useModelStore();

  const { activeModelId } = useChatStore();
  const currentSelectedId = activeModelId || DEFAULT_MODEL_ID;

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
          {/* Model Cards List */}
          <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
            {models.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                isSelected={currentSelectedId === model.id}
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
