"use client";

import React, { useRef } from "react";
import { useChatStore } from "@/lib/store/useChatStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import {
  UploadCloud,
  Image as ImageIcon,
  FileText,
  ClipboardList,
} from "lucide-react";
import { Attachment } from "@/lib/types";

export interface AttachmentMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AttachmentMenu({ isOpen, onClose }: AttachmentMenuProps) {
  const { addComposerAttachment } = useChatStore();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "file" | "image" | "doc"
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      let textContent: string | undefined = undefined;
      const isImage = type === "image" || file.type.startsWith("image/");
      const isTextOrCode =
        file.type.startsWith("text/") ||
        file.name.endsWith(".txt") ||
        file.name.endsWith(".js") ||
        file.name.endsWith(".ts") ||
        file.name.endsWith(".tsx") ||
        file.name.endsWith(".jsx") ||
        file.name.endsWith(".py") ||
        file.name.endsWith(".json") ||
        file.name.endsWith(".html") ||
        file.name.endsWith(".css") ||
        file.name.endsWith(".md") ||
        file.name.endsWith(".sql") ||
        file.name.endsWith(".csv");

      if (isTextOrCode && file.size < 500000) {
        try {
          textContent = await file.text();
        } catch {
          // ignore
        }
      }

      // If user uploaded an image, silently store it into Neon PostgreSQL in the background!
      if (isImage) {
        try {
          const reader = new FileReader();
          reader.onload = async () => {
            const base64Data = reader.result as string;
            if (base64Data) {
              fetch("/api/media/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  fileName: file.name,
                  fileType: file.type || "image/jpeg",
                  fileSize: file.size,
                  mediaData: base64Data,
                  userEmail: user?.email || "guest_user",
                }),
              }).catch(() => {
                // background upload, silent failover
              });
            }
          };
          reader.readAsDataURL(file);
        } catch {
          // ignore
        }
      }

      const newAttachment: Attachment = {
        id: `att-${Date.now()}-${i}`,
        name: file.name,
        type: file.type || (isImage ? "image/jpeg" : "application/octet-stream"),
        size: file.size,
        content: textContent,
        status: "complete",
        previewUrl: isImage ? URL.createObjectURL(file) : undefined,
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
          name: `Snippet_${new Date().toLocaleTimeString("th-TH").replace(/:/g, "")}.txt`,
          type: "text/plain",
          size: new Blob([text]).size,
          content: text,
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
      <div className="absolute left-0 bottom-full mb-3 z-50 w-56 rounded-2xl bg-[#1e1f20] border border-[rgba(255,255,255,0.08)] shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150 text-xs text-[#f1f5f9]">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-[#282a2c] transition-colors text-left cursor-pointer"
        >
          <UploadCloud className="h-4 w-4 text-blue-400" />
          <span>อัปโหลดไฟล์ (Code, TXT, JSON)</span>
        </button>

        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-[#282a2c] transition-colors text-left cursor-pointer"
        >
          <ImageIcon className="h-4 w-4 text-emerald-400" />
          <span>อัปโหลดรูปภาพ (Image)</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-[#282a2c] transition-colors text-left cursor-pointer"
        >
          <FileText className="h-4 w-4 text-amber-400" />
          <span>แนบเอกสาร (Doc, Data)</span>
        </button>

        <button
          type="button"
          onClick={handlePasteSnippet}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-[#282a2c] transition-colors text-left cursor-pointer border-t border-[rgba(255,255,255,0.08)] mt-1 pt-1.5"
        >
          <ClipboardList className="h-4 w-4 text-purple-400" />
          <span>วางโค้ดจากคลิปบอร์ด</span>
        </button>
      </div>
    </>
  );
}
