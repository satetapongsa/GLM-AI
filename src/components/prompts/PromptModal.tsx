"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { usePromptStore } from "@/lib/store/usePromptStore";
import { PromptCategory } from "@/lib/types";

export interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: PromptCategory[] = [
  "Marketing",
  "Coding",
  "Writing",
  "Research",
  "Business",
  "Design",
  "Productivity",
];

export function PromptModal({ isOpen, onClose }: PromptModalProps) {
  const { addPrompt } = usePromptStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<PromptCategory>("Coding");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    addPrompt({
      title: title.trim(),
      description: description.trim() || title.trim(),
      category,
      content: content.trim(),
      tags: tags.length > 0 ? tags : [category],
      isFavorite: false,
    });

    setTitle("");
    setDescription("");
    setContent("");
    setTagsInput("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title="สร้าง Prompt ใหม่ (Create Custom Prompt)"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-[hsl(var(--foreground))] mb-1.5">
            ชื่อ Prompt *
          </label>
          <input
            type="text"
            required
            placeholder="เช่น Senior Frontend Code Reviewer..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>

        <div>
          <label className="block font-semibold text-[hsl(var(--foreground))] mb-1.5">
            หมวดหมู่ (Category)
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as PromptCategory)}
            className="w-full px-3.5 py-2 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-[hsl(var(--foreground))] mb-1.5">
            คำอธิบายสั้นๆ (Description)
          </label>
          <input
            type="text"
            placeholder="ช่วยอธิบายวัตถุประสงค์ของ Prompt นี้..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>

        <div>
          <label className="block font-semibold text-[hsl(var(--foreground))] mb-1.5">
            เนื้อหา Prompt (Prompt Instructions) *
          </label>
          <textarea
            required
            rows={5}
            placeholder="ใส่คำสั่งหรือโครงสร้างที่ต้องการให้ AI ตอบสนอง..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] font-mono resize-none leading-relaxed"
          />
        </div>

        <div>
          <label className="block font-semibold text-[hsl(var(--foreground))] mb-1.5">
            แท็ก (Tags - คั่นด้วยเครื่องหมายจุลภาค)
          </label>
          <input
            type="text"
            placeholder="เช่น React, Architecture, Security"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[hsl(var(--border))]">
          <Button type="button" variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button type="submit" variant="primary">
            บันทึก Prompt
          </Button>
        </div>
      </form>
    </Modal>
  );
}
