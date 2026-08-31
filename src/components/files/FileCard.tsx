"use client";

import React from "react";
import { FileItem } from "@/lib/types";
import { useFileStore } from "@/lib/store/useFileStore";
import { formatFileSize, formatRelativeTime } from "@/lib/utils/formatters";
import {
  FileText,
  Image as ImageIcon,
  FileCode,
  FileSpreadsheet,
  Download,
  Trash2,
  ExternalLink,
} from "lucide-react";

export interface FileCardProps {
  file: FileItem;
}

export function FileCard({ file }: FileCardProps) {
  const { deleteFile } = useFileStore();

  const getFileIcon = (type: FileItem["type"]) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-6 w-6 text-emerald-500" />;
      case "code":
        return <FileCode className="h-6 w-6 text-blue-500" />;
      case "pdf":
      case "document":
        return <FileText className="h-6 w-6 text-rose-500" />;
      default:
        return <FileSpreadsheet className="h-6 w-6 text-amber-500" />;
    }
  };

  return (
    <div className="flex flex-col justify-between p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:shadow-md transition-all duration-200 group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-[hsl(var(--muted))]">
            {getFileIcon(file.type)}
          </div>
          <button
            type="button"
            onClick={() => deleteFile(file.id)}
            className="p-1.5 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
            title="ลบไฟล์"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <h4 className="text-xs sm:text-sm font-semibold text-[hsl(var(--card-foreground))] truncate" title={file.name}>
          {file.name}
        </h4>

        <div className="flex items-center gap-2 mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
          <span>{formatFileSize(file.size)}</span>
          <span>•</span>
          <span>{formatRelativeTime(file.uploadedAt)}</span>
        </div>

        {file.tags && file.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {file.tags.map((t) => (
              <span
                key={t}
                className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 mt-4 pt-2.5 border-t border-[hsl(var(--border))]">
        <span className="text-[10px] uppercase font-mono tracking-wider text-[hsl(var(--muted-foreground))]">
          {file.type}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => alert(`กำลังเปิดไฟล์: ${file.name}`)}
            className="p-1.5 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
            title="เปิดดูตัวอย่าง"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => alert(`ดาวน์โหลด: ${file.name}`)}
            className="p-1.5 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
            title="ดาวน์โหลด"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
