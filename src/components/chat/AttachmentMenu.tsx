"use client";

import React, { useRef } from "react";
import { useChatStore } from "@/lib/store/useChatStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Image as ImageIcon, Images } from "lucide-react";
import { Attachment } from "@/lib/types";

export interface AttachmentMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AttachmentMenu({ isOpen, onClose }: AttachmentMenuProps) {
  const { addComposerAttachment } = useChatStore();
  const { user } = useAuthStore();
  const imageInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/") && !file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) continue;

      // Background upload to Neon PostgreSQL
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
              // background upload
            });
          }
        };
        reader.readAsDataURL(file);
      } catch {
        // ignore
      }

      const newAttachment: Attachment = {
        id: `att-img-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`,
        name: file.name,
        type: file.type || "image/jpeg",
        size: file.size,
        status: "complete",
        previewUrl: URL.createObjectURL(file),
      };
      addComposerAttachment(newAttachment);
    }

    e.target.value = "";
    onClose();
  };

  return (
    <>
      {/* Multi-Image File Input */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImageChange}
      />

      {/* Backdrop for click outside */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Popover Menu for Multi-Image Picker */}
      <div className="absolute left-0 bottom-full mb-3 z-50 w-64 rounded-2xl bg-[#1e1f20] border border-[rgba(255,255,255,0.12)] shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150 text-xs text-[#f1f5f9]">
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-[#282a2c] transition-colors text-left cursor-pointer group"
        >
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
            <Images className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-100">เลือกรูปภาพจากคลังภาพ</p>
            <p className="text-[10px] text-slate-400">เลือกกี่รูปก็ได้เพื่อแนบให้ AI</p>
          </div>
        </button>
      </div>
    </>
  );
}
