"use client";

import React, { useState, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useFileStore } from "@/lib/store/useFileStore";
import { UploadCloud, FileText } from "lucide-react";

export interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FileUploadModal({ isOpen, onClose }: FileUploadModalProps) {
  const { uploadFile } = useFileStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let type: "document" | "image" | "pdf" | "code" | "other" = "document";
      if (file.type.startsWith("image/")) type = "image";
      else if (file.type === "application/pdf") type = "pdf";
      else if (file.name.endsWith(".ts") || file.name.endsWith(".js") || file.name.endsWith(".py")) type = "code";

      uploadFile({
        name: file.name,
        type,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        url: "#",
        tags: [type.toUpperCase(), "Uploaded"],
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title="อัปโหลดไฟล์สู่คลังความรู้ (Upload Knowledge Files)"
    >
      <div className="space-y-4 text-xs">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-colors cursor-pointer text-center ${
            dragOver
              ? "border-[hsl(var(--primary))] bg-blue-500/5"
              : "border-[hsl(var(--border))] hover:border-[hsl(var(--muted-foreground))]"
          }`}
        >
          <div className="p-3 rounded-full bg-blue-500/10 text-blue-500 mb-3">
            <UploadCloud className="h-6 w-6" />
          </div>
          <h5 className="font-semibold text-[hsl(var(--foreground))] text-sm">
            ลากและวางไฟล์ที่นี่ หรือคลิกเพื่อเลือกไฟล์
          </h5>
          <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1">
            รองรับ PDF, DOCX, TXT, PNG, JPG, CSV, Code files (สูงสุด 50MB)
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[hsl(var(--border))]">
          <Button type="button" variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
          >
            เลือกไฟล์จากเครื่อง
          </Button>
        </div>
      </div>
    </Modal>
  );
}
