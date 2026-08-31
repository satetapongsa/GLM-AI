"use client";

import React, { useRef } from "react";
import { useChatStore } from "@/lib/store/useChatStore";
import {
  UploadCloud,
  Image as ImageIcon,
  FileText,
  Camera,
  ClipboardList,
} from "lucide-react";
import { Attachment } from "@/lib/types";

export interface AttachmentMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AttachmentMenu({ isOpen, onClose }: AttachmentMenuProps) {
  const { addComposerAttachment } = useChatStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "file" | "image" | "doc"
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const newAttachment: Attachment = {
        id: `att-${Date.now()}-${i}`,
        name: file.name,
        type: file.type || (type === "image" ? "image/jpeg" : "application/octet-stream"),
        size: file.size,
        status: "complete",
        previewUrl: type === "image" ? URL.createObjectURL(file) : undefined,
      };
      addComposerAttachment(newAttachment);
    }
    onClose();
  };

  const handlePasteSnippet = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        addComposerAttachment({
          id: `att-snippet-${Date.now()}`,
          name: `Code_Snippet_${new Date().toLocaleTimeString("th-TH").replace(/:/g, "")}.ts`,
          type: "text/plain",
          size: new Blob([text]).size,
          status: "complete",
        });
      }
    } catch {
      // Fallback
    }
    onClose();
  };

  return (
    <>
      {/* Hidden Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFileChange(e, "file")}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileChange(e, "image")}
      />

      {/* Backdrop for click outside */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Popover Menu */}
      <div className="absolute left-0 bottom-full mb-3 z-50 w-56 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150 text-xs">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors text-left cursor-pointer"
        >
          <UploadCloud className="h-4 w-4 text-blue-500" />
          <span>อัปโหลดไฟล์ (Upload File)</span>
        </button>

        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors text-left cursor-pointer"
        >
          <ImageIcon className="h-4 w-4 text-emerald-500" />
          <span>อัปโหลดรูปภาพ (Image)</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors text-left cursor-pointer"
        >
          <FileText className="h-4 w-4 text-amber-500" />
          <span>แนบเอกสาร (PDF, Doc)</span>
        </button>

        <button
          type="button"
          onClick={handlePasteSnippet}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors text-left cursor-pointer border-t border-[hsl(var(--border))] mt-1 pt-1.5"
        >
          <ClipboardList className="h-4 w-4 text-violet-500" />
          <span>วางโค้ดจากคลิปบอร์ด</span>
        </button>
      </div>
    </>
  );
}
