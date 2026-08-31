"use client";

import React, { useState } from "react";
import { Folder as FolderIcon, Plus, MessageSquare, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useChatStore } from "@/lib/store/useChatStore";
import { useUIStore } from "@/lib/store/useUIStore";

interface WorkspaceFolder {
  id: string;
  name: string;
  color: string;
  conversationCount: number;
}

export function FoldersView() {
  const { conversations, setActiveConversation } = useChatStore();
  const { setActiveTab } = useUIStore();

  const [folders, setFolders] = useState<WorkspaceFolder[]>([
    { id: "f-1", name: "วิจัยและพัฒนา AI", color: "bg-blue-500", conversationCount: 2 },
    { id: "f-2", name: "การตลาดและคอนเทนต์", color: "bg-amber-500", conversationCount: 1 },
    { id: "f-3", name: "โปรเจกต์ SaaS 2026", color: "bg-emerald-500", conversationCount: 3 },
  ]);

  const [newFolderName, setNewFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setFolders([
      ...folders,
      {
        id: `f-${Date.now()}`,
        name: newFolderName.trim(),
        color: "bg-indigo-500",
        conversationCount: 0,
      },
    ]);
    setNewFolderName("");
    setIsCreating(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-500">
            <FolderIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[hsl(var(--foreground))]">
              โฟลเดอร์จัดเก็บแชท (Chat Folders)
            </h2>
            <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">
              จัดระเบียบหัวข้อการสนทนาและองค์ความรู้ให้เป็นหมวดหมู่ตามโปรเจกต์
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreating(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          สร้างโฟลเดอร์ใหม่
        </Button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateFolder} className="my-6 p-4 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] flex gap-2">
          <input
            type="text"
            required
            autoFocus
            placeholder="ชื่อโฟลเดอร์..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--foreground))] outline-none"
          />
          <Button type="submit" size="sm" variant="primary">
            สร้าง
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setIsCreating(false)}>
            ยกเลิก
          </Button>
        </form>
      )}

      {/* Folders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-6">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`h-3.5 w-3.5 rounded-full ${folder.color}`} />
                  <h4 className="text-sm font-bold text-[hsl(var(--card-foreground))]">
                    {folder.name}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setFolders(folders.filter((f) => f.id !== folder.id))}
                  className="text-[hsl(var(--muted-foreground))] hover:text-red-500 cursor-pointer p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {folder.conversationCount} บทสนทนาในโฟลเดอร์นี้
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[hsl(var(--border))] flex justify-between items-center text-xs">
              <button
                onClick={() => {
                  setActiveTab("chat");
                  if (conversations.length > 0) {
                    setActiveConversation(conversations[0].id);
                  }
                }}
                className="text-blue-500 hover:underline cursor-pointer font-medium"
              >
                เปิดดูแชทในโฟลเดอร์ →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
