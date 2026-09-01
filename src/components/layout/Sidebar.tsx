"use client";

import React, { useState, useEffect } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useChatStore } from "@/lib/store/useChatStore";
import { useUIStore } from "@/lib/store/useUIStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { cn } from "@/lib/utils/cn";
import {
  Menu,
  SquarePen,
  Search,
  FileText,
  Bookmark,
  Star,
  BookOpen,
  LogIn,
  LogOut,
  MessageSquare,
  Pin,
  Trash2,
  Pencil,
  Check,
  X,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";

export function Sidebar() {
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    togglePinConversation,
    deleteConversation,
    renameConversation,
  } = useChatStore();

  const {
    isSidebarCollapsed,
    toggleSidebar,
    setSearchModalOpen,
    activeTab,
    setActiveTab,
  } = useUIStore();
  const { user, isAuthenticated, openAuthModal, openLogoutConfirm } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNewChat = () => {
    setActiveTab("chat");
    setActiveConversation(null);
  };

  const handleSelectConversation = (id: string) => {
    setActiveTab("chat");
    setActiveConversation(id);
  };

  const navItems = [
    {
      id: "search",
      label: "ค้นหาแชท",
      icon: <Search className="h-4 w-4 text-slate-300" />,
      onClick: () => setSearchModalOpen(true),
    },
    {
      id: "prompts",
      label: "พริพรอมต์",
      icon: <FileText className="h-4 w-4 text-slate-300" />,
      onClick: () => setActiveTab("prompts"),
      active: activeTab === "prompts",
    },
    {
      id: "saved",
      label: "ชุดคำสั่งที่บันทึกไว้",
      icon: <Bookmark className="h-4 w-4 text-slate-300" />,
      onClick: () => setActiveTab("saved"),
      active: activeTab === "saved",
    },
    {
      id: "library",
      label: "คลัง",
      icon: <Star className="h-4 w-4 text-slate-300" />,
      onClick: () => setActiveTab("library"),
      active: activeTab === "library",
    },
    {
      id: "learn",
      label: "เรียนรู้เกี่ยวกับ AI",
      icon: <BookOpen className="h-4 w-4 text-slate-300" />,
      onClick: () => setActiveTab("learn"),
      active: activeTab === "learn",
    },
  ];

  const isUserAuthenticated = mounted ? isAuthenticated : false;
  const currentUser = mounted ? user : null;
  const currentConversations = mounted ? conversations : [];

  const pinnedConversations = currentConversations.filter((c) => c.pinned);
  const recentConversations = currentConversations.filter((c) => !c.pinned);

  return (
    <aside
      aria-label="แถบนำทางด้านข้าง"
      className={cn(
        "h-screen flex flex-col bg-[#1e1f20] border-r border-[rgba(255,255,255,0.08)] text-[#f1f5f9] transition-all duration-200 select-none z-30 shrink-0",
        isSidebarCollapsed ? "w-[64px]" : "w-[260px]"
      )}
    >
      {/* Top Header: Logo + Menu Toggle */}
      <div className="flex items-center justify-between px-4 h-15 shrink-0">
        <button
          onClick={handleNewChat}
          className="flex items-center gap-2 overflow-hidden text-left focus:outline-none cursor-pointer"
        >
          <BrandLogo size="md" collapsed={isSidebarCollapsed} />
        </button>

        <button
          onClick={toggleSidebar}
          aria-label={isSidebarCollapsed ? "ขยายแถบข้าง" : "ยุบแถบข้าง"}
          className="p-1.5 rounded-lg text-slate-300 hover:bg-[#282a2c] transition-colors cursor-pointer"
        >
          <Menu className="h-5 w-5 stroke-[2.2]" />
        </button>
      </div>

      {/* Primary Action: Full-width New Chat Button */}
      <div className="px-3 pt-1 pb-2 shrink-0">
        <button
          onClick={handleNewChat}
          className={cn(
            "w-full flex items-center justify-center gap-2 h-10 rounded-full font-medium text-[13.5px] transition-all cursor-pointer",
            "bg-[#0b57d0] hover:bg-[#0842a0] text-white shadow-xs active:scale-[0.98]",
            isSidebarCollapsed ? "px-0 w-10 mx-auto" : "px-4"
          )}
          title="แชทใหม่"
        >
          <SquarePen className="h-4 w-4 stroke-[2.2]" />
          {!isSidebarCollapsed && <span>แชทใหม่</span>}
        </button>
      </div>

      {/* Middle Scrollable Section: Navigation + Recent Chat History */}
      <div className="flex-1 overflow-y-auto px-2 space-y-3 scrollbar-none py-1">
        {/* Main Navigation List */}
        <nav aria-label="เมนูหลัก" className="space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-[13px] font-normal transition-colors cursor-pointer text-left",
                item.active
                  ? "bg-[#282a2c] text-white font-medium shadow-2xs"
                  : "text-slate-300 hover:bg-[#282a2c] hover:text-white"
              )}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Pinned Chats Section (if any) */}
        {pinnedConversations.length > 0 && (
          <div className="space-y-1 pt-2 border-t border-[rgba(255,255,255,0.06)]">
            {!isSidebarCollapsed && (
              <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Pin className="h-3 w-3 text-amber-400 fill-amber-400/20" />
                <span>ปักหมุดไว้</span>
              </div>
            )}
            <div className="space-y-0.5">
              {pinnedConversations.map((c) => {
                const isActive = activeTab === "chat" && activeConversationId === c.id;
                const isEditing = editingConvId === c.id;
                return (
                  <div
                    key={c.id}
                    className={cn(
                      "group flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[12.5px] transition-colors cursor-pointer",
                      isActive
                        ? "bg-[#0b57d0]/20 border border-[#0b57d0]/40 text-white font-medium"
                        : "text-slate-300 hover:bg-[#282a2c] hover:text-white"
                    )}
                    onClick={() => {
                      if (!isEditing) handleSelectConversation(c.id);
                    }}
                    title={c.title}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Pin className="h-3.5 w-3.5 text-amber-400 shrink-0 fill-amber-400/20" />
                      {!isSidebarCollapsed && (
                        isEditing ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (editTitleInput.trim()) {
                                renameConversation(c.id, editTitleInput.trim());
                              }
                              setEditingConvId(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 flex-1 min-w-0 mr-1"
                          >
                            <input
                              type="text"
                              autoFocus
                              value={editTitleInput}
                              onChange={(e) => setEditTitleInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Escape") setEditingConvId(null);
                              }}
                              className="w-full bg-[#131314] text-white text-xs px-2 py-0.5 rounded border border-blue-500 outline-none"
                            />
                            <button
                              type="submit"
                              className="p-1 text-emerald-400 hover:text-emerald-300 rounded hover:bg-emerald-950/40 cursor-pointer shrink-0"
                              title="บันทึกชื่อ"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingConvId(null)}
                              className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-700/50 cursor-pointer shrink-0"
                              title="ยกเลิก"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </form>
                        ) : (
                          <span className="truncate">{c.title}</span>
                        )
                      )}
                    </div>

                    {!isSidebarCollapsed && !isEditing && (
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 ml-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingConvId(c.id);
                            setEditTitleInput(c.title);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 transition-colors"
                          title="เปลี่ยนชื่อแชท"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePinConversation(c.id);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                          title="ยกเลิกปักหมุด"
                        >
                          <Pin className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(c.id);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                          title="ลบแชท"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Chat History Section */}
        <div className="space-y-1 pt-2 border-t border-[rgba(255,255,255,0.06)]">
          {!isSidebarCollapsed && (
            <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>แชทล่าสุด ({recentConversations.length})</span>
            </div>
          )}

          <div className="space-y-0.5">
            {recentConversations.length === 0 ? (
              !isSidebarCollapsed && (
                <div className="px-3 py-2 text-[11.5px] text-slate-500 italic">
                  ยังไม่มีประวัติแชทในเครื่อง
                </div>
              )
            ) : (
              recentConversations.map((c) => {
                const isActive = activeTab === "chat" && activeConversationId === c.id;
                const isEditing = editingConvId === c.id;
                return (
                  <div
                    key={c.id}
                    className={cn(
                      "group flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[12.5px] transition-colors cursor-pointer",
                      isActive
                        ? "bg-[#0b57d0]/20 border border-[#0b57d0]/40 text-white font-medium"
                        : "text-slate-300 hover:bg-[#282a2c] hover:text-white"
                    )}
                    onClick={() => {
                      if (!isEditing) handleSelectConversation(c.id);
                    }}
                    title={c.title}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <MessageSquare className="h-3.5 w-3.5 text-slate-400 shrink-0 group-hover:text-blue-400 transition-colors" />
                      {!isSidebarCollapsed && (
                        isEditing ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (editTitleInput.trim()) {
                                renameConversation(c.id, editTitleInput.trim());
                              }
                              setEditingConvId(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 flex-1 min-w-0 mr-1"
                          >
                            <input
                              type="text"
                              autoFocus
                              value={editTitleInput}
                              onChange={(e) => setEditTitleInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Escape") setEditingConvId(null);
                              }}
                              className="w-full bg-[#131314] text-white text-xs px-2 py-0.5 rounded border border-blue-500 outline-none"
                            />
                            <button
                              type="submit"
                              className="p-1 text-emerald-400 hover:text-emerald-300 rounded hover:bg-emerald-950/40 cursor-pointer shrink-0"
                              title="บันทึกชื่อ"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingConvId(null)}
                              className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-700/50 cursor-pointer shrink-0"
                              title="ยกเลิก"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </form>
                        ) : (
                          <span className="truncate">{c.title}</span>
                        )
                      )}
                    </div>

                    {!isSidebarCollapsed && !isEditing && (
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 ml-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingConvId(c.id);
                            setEditTitleInput(c.title);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 transition-colors"
                          title="เปลี่ยนชื่อแชท"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePinConversation(c.id);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-700/50 transition-colors"
                          title="ปักหมุดแชท"
                        >
                          <Pin className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(c.id);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                          title="ลบแชท"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Auth & User Profile Section */}
      <div className="p-3 border-t border-[rgba(255,255,255,0.08)] shrink-0">
        {isUserAuthenticated && currentUser ? (
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-[#282a2c] transition-colors group">
            <div
              onClick={() => setActiveTab("settings")}
              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
            >
              {/* Profile Avatar */}
              <div className="h-8.5 w-8.5 rounded-full bg-[#e65100] text-white flex items-center justify-center font-bold text-sm shrink-0">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
              </div>

              {!isSidebarCollapsed && (
                <div className="flex flex-col min-w-0 text-left leading-tight">
                  <span className="text-[13px] font-semibold text-slate-100 truncate">
                    {currentUser.name}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate">
                    {currentUser.email}
                  </span>
                </div>
              )}
            </div>

            {!isSidebarCollapsed && (
              <button
                type="button"
                onClick={() => openLogoutConfirm()}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-all cursor-pointer"
                title="ออกจากระบบ"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          /* Not Authenticated: Sign In Button */
          <button
            type="button"
            onClick={() => openAuthModal("login")}
            className={cn(
              "w-full flex items-center justify-center gap-2 h-10 rounded-xl font-medium text-xs transition-all cursor-pointer",
              "bg-[#282a2c] hover:bg-[#333538] text-sky-400 border border-[rgba(255,255,255,0.08)]",
              isSidebarCollapsed ? "px-0" : "px-3"
            )}
            title="เข้าสู่ระบบ / สมัครสมาชิก"
          >
            <LogIn className="h-4 w-4" />
            {!isSidebarCollapsed && <span>เข้าสู่ระบบ / สมัครสมาชิก</span>}
          </button>
        )}
      </div>

      {/* Delete Chat Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        maxWidth="sm"
        title={
          <div className="flex items-center gap-2.5 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-base font-bold text-white">ลบการสนทนานี้?</span>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            คุณแน่ใจหรือไม่ว่าต้องการลบแชทนี้? ประวัติข้อความทั้งหมดในการสนทนานี้จะถูกลบอย่างถาวร
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              className="px-4 py-2 text-xs cursor-pointer"
            >
              ยกเลิก
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={() => {
                if (deleteConfirmId) {
                  deleteConversation(deleteConfirmId);
                  setDeleteConfirmId(null);
                }
              }}
              leftIcon={<Trash2 className="h-4 w-4" />}
              className="bg-red-600 hover:bg-red-700 text-white border-transparent px-4 py-2 text-xs font-semibold shadow-md cursor-pointer active:scale-95"
            >
              ลบแชท
            </Button>
          </div>
        </div>
      </Modal>
    </aside>
  );
}
