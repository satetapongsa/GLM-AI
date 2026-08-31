"use client";

import React, { useState, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useFileStore } from "@/lib/store/useFileStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { UploadCloud, FileText } from "lucide-react";

export interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FileUploadModal({ isOpen, onClose }: FileUploadModalProps) {
  const { uploadFile } = useFileStore();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let type: "document" | "image" | "pdf" | "code" | "other" = "document";
      if (file.type.startsWith("image/")) type = "image";
      else if (file.type === "application/pdf") type = "pdf";
      else if (
        file.name.endsWith(".ts") ||
        file.name.endsWith(".js") ||
        file.name.endsWith(".py") ||
        file.name.endsWith(".json") ||
        file.name.endsWith(".sql") ||
        file.name.endsWith(".html") ||
        file.name.endsWith(".css")
      ) {
        type = "code";
      }

      // Read file content as base64 or text to store in Neon DB
      let fileData: string | undefined = undefined;
      try {
        if (file.size < 5000000) {
          // Less than 5MB
          const reader = new FileReader();
          fileData = await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => resolve("");
            reader.readAsDataURL(file);
          });
        }
      } catch {
        // ignore
      }

      await uploadFile(
        {
          name: file.name,
          type,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          url: "#",
          tags: [type.toUpperCase(), "NeonDB"],
        },
        fileData,
        user?.email
      );
    }

    setIsUploading(false);
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
          className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-colors cursor-pointer text-center bg-[#131314] ${
            dragOver
              ? "border-blue-500 bg-blue-500/10"
              : "border-[rgba(255,255,255,0.12)] hover:border-blue-400/50"
          }`}
        >
          <div className="p-3 rounded-full bg-blue-500/10 text-blue-400 mb-3">
            <UploadCloud className="h-6 w-6" />
          </div>
          <h5 className="font-semibold text-slate-100 text-sm">
            {isUploading ? "กำลังบันทึกลง Neon Database..." : "ลากและวางไฟล์ที่นี่ หรือคลิกเพื่อเลือกไฟล์"}
          </h5>
          <p className="text-[11px] text-slate-400 mt-1">
            รองรับ PDF, DOCX, TXT, PNG, JPG, CSV, Code files (บันทึกลง Neon Database ถาวร)
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[rgba(255,255,255,0.08)]">
          <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>
            ยกเลิก
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-[#0b57d0] hover:bg-[#0842a0] text-white"
          >
            {isUploading ? "กำลังอัปโหลด..." : "เลือกไฟล์จากเครื่อง"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
