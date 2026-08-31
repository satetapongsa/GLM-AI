"use client";

import React, { useMemo, useState } from "react";
import { useFileStore } from "@/lib/store/useFileStore";
import { FileItem } from "@/lib/types";
import { FileCard } from "./FileCard";
import { FileUploadModal } from "./FileUploadModal";
import { Button } from "@/components/ui/Button";
import { Search, Plus, FolderArchive, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const FILE_TYPES: { id: FileItem["type"] | "all"; label: string }[] = [
  { id: "all", label: "ทั้งหมด" },
  { id: "document", label: "เอกสาร" },
  { id: "pdf", label: "PDF" },
  { id: "image", label: "รูปภาพ" },
  { id: "code", label: "โค้ด" },
];

export function FileLibraryView() {
  const { files, filterType, setFilterType, searchQuery, setSearchQuery } = useFileStore();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const filteredFiles = useMemo(() => {
    return files.filter((f) => {
      const matchesType = filterType === "all" || f.type === filterType;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.tags.some((t) => t.toLowerCase().includes(q));

      return matchesType && matchesSearch;
    });
  }, [files, filterType, searchQuery]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
            <FolderArchive className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[hsl(var(--foreground))]">
              คลังไฟล์ความรู้ (File & Knowledge Library)
            </h2>
            <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">
              จัดการไฟล์เอกสาร โค้ด และสื่อต่างๆ เพื่อใช้เป็นบริบทความรู้สำหรับ AI
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsUploadModalOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          อัปโหลดไฟล์
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-3 my-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="ค้นหาไฟล์ตามชื่อ หรือแท็ก..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>

        {/* Type Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {FILE_TYPES.map((t) => {
            const isActive = filterType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setFilterType(t.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer select-none shrink-0",
                  isActive
                    ? "bg-[hsl(var(--primary))] text-white shadow-xs font-semibold"
                    : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]"
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Files Grid */}
      {filteredFiles.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] mb-3">
            <UploadCloud className="h-8 w-8" />
          </div>
          <h4 className="text-sm font-semibold text-[hsl(var(--foreground))]">
            ยังไม่มีไฟล์ในคลัง
          </h4>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 max-w-sm">
            อัปโหลดเอกสาร PDF, รูปภาพ หรือไฟล์โค้ด เพื่อให้ AI ช่วยอ่าน สรุป และตอบคำถาม
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            className="mt-4"
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            อัปโหลดไฟล์แรก
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
          {filteredFiles.map((file) => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}
