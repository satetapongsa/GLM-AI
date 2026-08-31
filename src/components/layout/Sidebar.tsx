"use client";

import React, { useState, useEffect } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { useChatStore } from "@/lib/store/useChatStore";
import { useUIStore } from "@/lib/store/useUIStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { BRAND_CONFIG } from "@/lib/config/brand";
import { cn } from "@/lib/utils/cn";
import {
  Menu,
  SquarePen,
  Search,
  FileText,
  Bookmark,
  Star,
  BookOpen,
  FolderPlus,
  Clock,
  LogIn,
  LogOut,
} from "lucide-react";

export function Sidebar() {
  const { setActiveConversation } = useChatStore();
  const { isSidebarCollapsed, toggleSidebar, setSearchModalOpen, activeTab, setActiveTab } =
    useUIStore();
  const { user, isAuthenticated, openAuthModal, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNewChat = () => {
    setActiveTab("chat");
    setActiveConversation(null);
  };

  const navItems = [
    {
      id: "search",
      label: "ค้นหาแชท",
      icon: <Search className="h-4 w-4 text-slate-700 dark:text-slate-300" />,
      onClick: () => setSearchModalOpen(true),
    },
    {
      id: "prompts",
      label: "พริพรอมต์",
      icon: <FileText className="h-4 w-4 text-slate-700 dark:text-slate-300" />,
      onClick: () => setActiveTab("prompts"),
      active: activeTab === "prompts",
    },
    {
      id: "saved",
      label: "ชุดคำสั่งที่บันทึกไว้",
      icon: <Bookmark className="h-4 w-4 text-slate-700 dark:text-slate-300" />,
      onClick: () => setActiveTab("saved"),
      active: activeTab === "saved",
    },
    {
      id: "library",
      label: "คลัง",
      icon: <Star className="h-4 w-4 text-slate-700 dark:text-slate-300" />,
      onClick: () => setActiveTab("library"),
      active: activeTab === "library",
    },
    {
      id: "learn",
      label: "เรียนรู้เกี่ยวกับ AI",
      icon: <BookOpen className="h-4 w-4 text-slate-700 dark:text-slate-300" />,
      onClick: () => setActiveTab("learn"),
      active: activeTab === "learn",
    },
    {
      id: "folders",
      label: "โฟลเดอร์",
      icon: <FolderPlus className="h-4 w-4 text-slate-700 dark:text-slate-300" />,
      onClick: () => setActiveTab("folders"),
      active: activeTab === "folders",
    },
  ];

  const currentUser = mounted ? user : BRAND_CONFIG.defaultUser;
  const isUserAuthenticated = mounted ? isAuthenticated : true;

  return (
    <aside
      className={cn(
        "h-screen flex flex-col bg-white dark:bg-[#0f172a] border-r border-slate-100 dark:border-slate-800 transition-all duration-200 select-none z-30 shrink-0",
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
          className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Menu className="h-5 w-5 stroke-[2.2]" />
        </button>
      </div>

      {/* Primary Action: New Chat Pill + Clock/History button */}
      <div className="px-3 pt-1 pb-3 flex items-center gap-2 shrink-0">
        <button
          onClick={handleNewChat}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 h-10 rounded-full font-medium text-[13.5px] transition-all cursor-pointer",
            "bg-[#0b57d0] hover:bg-[#0842a0] text-white shadow-xs active:scale-[0.98]",
            isSidebarCollapsed ? "px-0 w-10 flex-none mx-auto" : "px-4"
          )}
          title="แชทใหม่"
        >
          <SquarePen className="h-4 w-4 stroke-[2.2]" />
          {!isSidebarCollapsed && <span>แชทใหม่</span>}
        </button>

        {!isSidebarCollapsed && (
          <button
            onClick={() => setSearchModalOpen(true)}
            aria-label="ประวัติ"
            className="h-10 w-10 rounded-full border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="ประวัติและค้นหา"
          >
            <Clock className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5 scrollbar-none">
        <nav aria-label="เมนูหลัก" className="space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-normal transition-colors cursor-pointer text-left",
                item.active
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850"
              )}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom Auth & User Profile Section */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
        {isUserAuthenticated && currentUser ? (
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
            <div
              onClick={() => setActiveTab("settings")}
              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
            >
              {/* Orange Profile Circle */}
              <div className="h-8.5 w-8.5 rounded-full bg-[#e65100] text-white flex items-center justify-center font-bold text-sm shrink-0">
                {currentUser.name.charAt(0).toUpperCase() || "U"}
              </div>

              {!isSidebarCollapsed && (
                <div className="flex flex-col min-w-0 text-left leading-tight">
                  <span className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {currentUser.name}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser.email}
                  </span>
                </div>
              )}
            </div>

            {!isSidebarCollapsed && (
              <button
                type="button"
                onClick={() => {
                  if (confirm("คุณต้องการออกจากระบบหรือไม่?")) {
                    logout();
                  }
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
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
              "bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700",
              isSidebarCollapsed ? "px-0" : "px-3"
            )}
            title="เข้าสู่ระบบ / สมัครสมาชิก"
          >
            <LogIn className="h-4 w-4" />
            {!isSidebarCollapsed && <span>เข้าสู่ระบบ / สมัครสมาชิก</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
