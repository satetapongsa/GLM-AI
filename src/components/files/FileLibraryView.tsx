"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useFileStore } from "@/lib/store/useFileStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { FileItem } from "@/lib/types";
import { FileCard } from "./FileCard";
import { FileUploadModal } from "./FileUploadModal";
import { Button } from "@/components/ui/Button";
import { Search, Plus, FolderArchive, UploadCloud, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const FILE_TYPES: { id: FileItem["type"] | "all"; label: string }[] = [
  { id: "all", label: "ทั้งหมด" },
  { id: "document", label: "เอกสาร" },
  { id: "pdf", label: "PDF" },
  { id: "image", label: "รูปภาพ" },
  { id: "code", label: "โค้ด" },
];

export function FileLibraryView() {
  const { files, filterType, setFilterType, searchQuery, setSearchQuery, fetchFilesFromDb, isLoading } = useFileStore();
  const { user } = useAuthStore();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    fetchFilesFromDb(user?.email);
  }, [user?.email]);

  const filteredFiles = useMemo(() => {
    return files.filter((f) => {
      const matchesType = filterType === "all" || f.type === filterType;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        f.name.toLowerCase().includes(q) ||
        (f.tags && f.tags.some((t) => t.toLowerCase().includes(q)));

      return matchesType && matchesSearch;
    });
  }, [files, filterType, searchQuery]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <FolderArchive className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#f1f5f9]">
              คลังไฟล์ความรู้ (File & Knowledge Library)
            </h2>
            <p className="text-xs sm:text-sm text-[#94a3b8]">
              ไฟล์เอกสาร โค้ด และสื่อทั้งหมดจะถูกบันทึกและซิงค์ลง Neon PostgreSQL Database อย่างปลอดภัย
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchFilesFromDb(user?.email)}
            disabled={isLoading}
            leftIcon={<RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin text-blue-400")} />}
          >
            รีเฟรชไฟล์
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
            className="bg-[#0b57d0] hover:bg-[#0842a0] text-white"
          >
            อัปโหลดไฟล์
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-3 my-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาไฟล์ตามชื่อ หรือแท็ก..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1e1f20] border border-[rgba(255,255,255,0.08)] text-xs text-[#f1f5f9] placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
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
                    ? "bg-[#0b57d0] text-white shadow-xs font-semibold"
                    : "bg-[#1e1f20] text-slate-300 hover:text-white hover:bg-[#282a2c]"
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Files Grid */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center animate-pulse">
          <div className="p-4 rounded-full bg-[#1e1f20] text-slate-400 mb-3">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-400" />
          </div>
          <p className="text-xs text-slate-400">กำลังโหลดไฟล์จาก Neon PostgreSQL Database...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 rounded-full bg-[#1e1f20] text-slate-400 mb-3">
            <UploadCloud className="h-8 w-8" />
          </div>
          <h4 className="text-sm font-semibold text-[#f1f5f9]">
            ยังไม่มีไฟล์ในคลัง Neon Database
          </h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            อัปโหลดเอกสาร PDF, รูปภาพ หรือไฟล์โค้ด เพื่อบันทึกเข้าสู่ Neon Database และให้ AI ช่วยอ่าน
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
