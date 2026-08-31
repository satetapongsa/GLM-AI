"use client";

import React from "react";
import { Attachment } from "@/lib/types";
import { formatFileSize } from "@/lib/utils/formatters";
import { X, FileText, Image as ImageIcon, CheckCircle } from "lucide-react";

export interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove: (id: string) => void;
}

export function AttachmentPreview({
  attachments,
  onRemove,
}: AttachmentPreviewProps) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-3 pt-3 pb-1 border-b border-[hsl(var(--border))]">
      {attachments.map((att) => {
        const isImage = att.type.startsWith("image/") || !!att.previewUrl;

        return (
          <div
            key={att.id}
            className="group relative flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--foreground))] animate-in fade-in zoom-in-95 duration-100"
          >
            {isImage && att.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={att.previewUrl}
                alt={att.name}
                className="h-8 w-8 object-cover rounded-lg shrink-0"
              />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4" />
              </div>
            )}

            <div className="flex flex-col min-w-0 max-w-[140px]">
              <span className="truncate text-xs font-medium">{att.name}</span>
              <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                {formatFileSize(att.size)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onRemove(att.id)}
              aria-label="ลบไฟล์แนบ"
              className="p-1 rounded-full text-[hsl(var(--muted-foreground))] hover:bg-black/10 dark:hover:bg-white/10 hover:text-red-500 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
