"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useAssistantStore } from "@/lib/store/useAssistantStore";
import { AVAILABLE_MODELS } from "@/lib/config/models";

export interface AssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMOJI_OPTIONS = ["🤖", "💻", "✍️", "📊", "🎨", "🔬", "⚖️", "🏥", "🚀", "💡", "🧠", "🎯"];

export function AssistantModal({ isOpen, onClose }: AssistantModalProps) {
  const { addAssistant } = useAssistantStore();

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("🤖");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [modelId, setModelId] = useState("gemini-3.1-pro");
  const [temperature, setTemperature] = useState(0.7);
  const [toolsInput, setToolsInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !systemPrompt.trim()) return;

    const tools = toolsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    addAssistant({
      name: name.trim(),
      avatar,
      tagline: tagline.trim() || "ผู้ช่วย AI เฉพาะทาง",
      description: description.trim() || tagline.trim(),
      systemPrompt: systemPrompt.trim(),
      modelId,
      temperature,
      tools: tools.length > 0 ? tools : ["Knowledge Retrieval", "Web Search"],
      isPinned: false,
      isBuiltIn: false,
    });

    setName("");
    setTagline("");
    setDescription("");
    setSystemPrompt("");
    setToolsInput("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title="สร้างผู้ช่วย AI อัจฉริยะ (Create Custom AI Assistant)"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Avatar & Name */}
        <div className="flex gap-3">
          <div className="shrink-0">
            <label className="block font-semibold text-[hsl(var(--foreground))] mb-1.5">
              ไอคอน
            </label>
            <div className="flex flex-wrap gap-1 max-w-[120px] p-1.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
              {EMOJI_OPTIONS.slice(0, 6).map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={`h-7 w-7 rounded-lg flex items-center justify-center text-sm cursor-pointer ${
                    avatar === emoji ? "bg-[hsl(var(--primary))] text-white" : "hover:bg-black/10"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <label className="block font-semibold text-[hsl(var(--foreground))] mb-1.5">
                ชื่อผู้ช่วย (Assistant Name) *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น Lead DevOps Specialist..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[hsl(var(--foreground))] mb-1.5">
                สโลแกนสั้นๆ (Tagline)
              </label>
              <input
                type="text"
                placeholder="เช่น ผู้เชี่ยวชาญ Kubernetes และ CI/CD..."
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
            </div>
          </div>
        </div>

        {/* Model Selection & Temp */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[hsl(var(--foreground))] mb-1.5">
              โมเดลหลัก (Base Model)
            </label>
            <select
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            >
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between font-semibold text-[hsl(var(--foreground))] mb-1.5">
              <label>Temperature</label>
              <span className="font-mono">{temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-2 bg-[hsl(var(--muted))] rounded-lg appearance-none cursor-pointer accent-[hsl(var(--primary))] mt-2"
            />
          </div>
        </div>

        {/* System Prompt */}
        <div>
          <label className="block font-semibold text-[hsl(var(--foreground))] mb-1.5">
            คำสั่งระบบ (System Instructions / Persona) *
          </label>
          <textarea
            required
            rows={5}
            placeholder="กำหนดบุคลิก กฎเกณฑ์ ข้อจำกัด และรูปแบบการตอบคำถาม..."
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] font-mono resize-none leading-relaxed"
          />
        </div>

        {/* Tools */}
        <div>
          <label className="block font-semibold text-[hsl(var(--foreground))] mb-1.5">
            เครื่องมือที่เปิดใช้งาน (Tools - คั่นด้วยเครื่องหมายจุลภาค)
          </label>
          <input
            type="text"
            placeholder="เช่น Web Search, Code Sandbox, File Parser"
            value={toolsInput}
            onChange={(e) => setToolsInput(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[hsl(var(--border))]">
          <Button type="button" variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button type="submit" variant="primary">
            สร้าง Assistant
          </Button>
        </div>
      </form>
    </Modal>
  );
}
