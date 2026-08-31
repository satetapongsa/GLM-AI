"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useModelStore } from "@/lib/store/useModelStore";
import { AVAILABLE_MODELS } from "@/lib/config/models";
import { ProviderIcon } from "@/components/ui/ProviderIcon";
import { Sliders, Check, Globe, Code2, Image as ImageIcon, Zap } from "lucide-react";

export function ModelSettingsModal() {
  const {
    isModelSettingsModalOpen,
    closeModelSettingsModal,
    settingsTargetModelId,
    getSettingsForModel,
    updateModelSettings,
  } = useModelStore();

  if (!settingsTargetModelId) return null;

  const model = AVAILABLE_MODELS.find((m) => m.id === settingsTargetModelId);
  if (!model) return null;

  const settings = getSettingsForModel(model.id);

  return (
    <Modal
      isOpen={isModelSettingsModalOpen}
      onClose={closeModelSettingsModal}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2.5">
          <ProviderIcon provider={model.provider} size="sm" />
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[hsl(var(--foreground))]">
              ตั้งค่าพารามิเตอร์: {model.name}
            </h3>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
              ปรับแต่งความแม่นยำและเครื่องมือเสริมสำหรับการตอบกลับ
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Temperature */}
        <div className="p-3.5 rounded-2xl bg-[hsl(var(--muted)/0.4)] border border-[hsl(var(--border))] space-y-2">
          <div className="flex justify-between items-center font-semibold text-[hsl(var(--foreground))]">
            <label className="flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-blue-500" />
              <span>Temperature (ความสร้างสรรค์)</span>
            </label>
            <span className="font-mono bg-[hsl(var(--card))] px-2 py-0.5 rounded-md border border-[hsl(var(--border))]">
              {settings.temperature}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.temperature}
            onChange={(e) =>
              updateModelSettings(model.id, { temperature: parseFloat(e.target.value) })
            }
            className="w-full h-1.5 bg-[hsl(var(--muted))] rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-[hsl(var(--muted-foreground))]">
            <span>0.0 (แม่นยำ/โค้ด)</span>
            <span>0.7 (สมดุล)</span>
            <span>1.0 (สร้างสรรค์)</span>
          </div>
        </div>

        {/* Reasoning Level */}
        <div className="p-3.5 rounded-2xl bg-[hsl(var(--muted)/0.4)] border border-[hsl(var(--border))] space-y-2">
          <div className="flex justify-between items-center font-semibold text-[hsl(var(--foreground))]">
            <label className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>ระดับการคิดวิเคราะห์ (Reasoning Level)</span>
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(["low", "medium", "high"] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => updateModelSettings(model.id, { reasoningLevel: lvl })}
                className={`py-1.5 rounded-xl border text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all ${
                  settings.reasoningLevel === lvl
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Capabilities Toggles */}
        <div className="p-3.5 rounded-2xl bg-[hsl(var(--muted)/0.4)] border border-[hsl(var(--border))] space-y-3">
          <h4 className="font-semibold text-[hsl(var(--foreground))]">
            เครื่องมือและความสามารถเพิ่มเติม (Augmented Tools)
          </h4>

          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-emerald-500" />
              <div>
                <div className="font-medium text-[hsl(var(--foreground))]">Web Search (ค้นหาเว็บสด)</div>
                <div className="text-[10px] text-[hsl(var(--muted-foreground))]">ดึงข้อมูลแบบ Real-time จากอินเทอร์เน็ต</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.webSearch}
              onChange={(e) => updateModelSettings(model.id, { webSearch: e.target.checked })}
              className="h-4 w-4 rounded accent-blue-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-1 border-t border-[hsl(var(--border))]">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-cyan-500" />
              <div>
                <div className="font-medium text-[hsl(var(--foreground))]">Code Interpreter</div>
                <div className="text-[10px] text-[hsl(var(--muted-foreground))]">รันและประมวลผลโค้ดใน Sandbox</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.codeInterpreter}
              onChange={(e) => updateModelSettings(model.id, { codeInterpreter: e.target.checked })}
              className="h-4 w-4 rounded accent-blue-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-1 border-t border-[hsl(var(--border))]">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-rose-500" />
              <div>
                <div className="font-medium text-[hsl(var(--foreground))]">Image Understanding</div>
                <div className="text-[10px] text-[hsl(var(--muted-foreground))]">วิเคราะห์และอ่านรายละเอียดในรูปภาพ</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.imageUnderstanding}
              onChange={(e) => updateModelSettings(model.id, { imageUnderstanding: e.target.checked })}
              className="h-4 w-4 rounded accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[hsl(var(--border))]">
          <Button variant="primary" size="sm" onClick={closeModelSettingsModal}>
            บันทึกการตั้งค่า
          </Button>
        </div>
      </div>
    </Modal>
  );
}
