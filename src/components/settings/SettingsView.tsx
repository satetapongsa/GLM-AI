"use client";

import React, { useState } from "react";
import { useSettingsStore } from "@/lib/store/useSettingsStore";
import { useChatStore } from "@/lib/store/useChatStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useUIStore } from "@/lib/store/useUIStore";
import { BRAND_CONFIG } from "@/lib/config/brand";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  Settings,
  Keyboard,
  Shield,
  Trash2,
  Download,
  User,
  Check,
  LogIn,
  LogOut,
  Mail,
  Phone,
  ExternalLink,
  Copy,
  BadgeCheck,
  Sparkles,
  AlertTriangle,
  BarChart3,
  RefreshCw,
  Search,
  MessageSquare,
  TrendingUp,
  Crown,
  Ban,
  Users,
  Plus,
  Minus,
  UserCheck,
  Database,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

type SettingsTab =
  | "creator"
  | "admin"
  | "general"
  | "composer"
  | "shortcuts"
  | "privacy"
  | "account";

export function SettingsView() {
  const { settings, updateSettings } = useSettingsStore();
  const { clearAllConversations, conversations, messages } = useChatStore();
  const { user, isAuthenticated, logout, openAuthModal, openLogoutConfirm } = useAuthStore();
  const { settingsInitialTab } = useUIStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>(
    (settingsInitialTab as SettingsTab) || "admin"
  );

  React.useEffect(() => {
    if (settingsInitialTab) {
      setActiveTab(settingsInitialTab as SettingsTab);
    }
  }, [settingsInitialTab]);

  const [isSaved, setIsSaved] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearedSuccess, setIsClearedSuccess] = useState(false);

  // Admin Dashboard State
  const [adminStats, setAdminStats] = useState<{
    totalPrompts: number;
    todayPrompts: number;
    totalUsers: number;
    modelUsage: { modelId: string; count: number }[];
    recentPrompts: {
      id: number;
      userEmail: string;
      prompt: string;
      modelId: string;
      ipAddress: string;
      createdAt: string;
    }[];
  } | null>(null);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
  const [adminSearch, setAdminSearch] = useState("");

  // Admin Users Management State
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userActionLoading, setUserActionLoading] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");

  // Per-User Questions Modal State
  const [viewingUserQuestions, setViewingUserQuestions] = useState<{ email: string; name?: string } | null>(null);
  const [userQuestionsList, setUserQuestionsList] = useState<any[]>([]);
  const [isLoadingUserQuestions, setIsLoadingUserQuestions] = useState(false);
  const [questionSearchFilter, setQuestionSearchFilter] = useState("");

  const handleViewUserQuestions = async (targetUser: { email: string; name?: string }) => {
    setViewingUserQuestions(targetUser);
    setIsLoadingUserQuestions(true);
    setQuestionSearchFilter("");
    try {
      const res = await fetch(`/api/admin/questions?email=${encodeURIComponent(targetUser.email)}`);
      const data = await res.json();
      if (data.success && data.questions) {
        setUserQuestionsList(data.questions);
      } else {
        setUserQuestionsList([]);
      }
    } catch (e) {
      console.error("Error fetching user questions:", e);
      setUserQuestionsList([]);
    } finally {
      setIsLoadingUserQuestions(false);
    }
  };

  const fetchAdminStats = async () => {
    setIsLoadingAdmin(true);
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.success && data.stats) {
        setAdminStats(data.stats);
      }
    } catch (e) {
      console.error("Error fetching admin stats:", e);
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  const fetchAdminUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success && data.users) {
        setAdminUsers(data.users);
      }
    } catch (e) {
      console.error("Error fetching admin users:", e);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Database Explorer State
  const [selectedDbTable, setSelectedDbTable] = useState<string>("users");
  const [dbData, setDbData] = useState<{
    tableCounts: Record<string, number>;
    rows: any[];
    currentTable: string;
    totalRowsInView: number;
  } | null>(null);
  const [isLoadingDbData, setIsLoadingDbData] = useState(false);
  const [dbSearchFilter, setDbSearchFilter] = useState("");

  const fetchDbData = async (table = selectedDbTable) => {
    setIsLoadingDbData(true);
    setSelectedDbTable(table);
    try {
      const res = await fetch(`/api/admin/database?table=${encodeURIComponent(table)}`);
      const data = await res.json();
      if (data.success) {
        setDbData(data);
      }
    } catch (e) {
      console.error("Error fetching database explorer data:", e);
    } finally {
      setIsLoadingDbData(false);
    }
  };

  const handleToggleOp = async (targetUser: any) => {
    setUserActionLoading(targetUser.id);
    try {
      const nextVal = !targetUser.is_op;
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: targetUser.id,
          action: "toggle_op",
          value: nextVal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminUsers((prev) =>
          prev.map((u) =>
            u.id === targetUser.id ? { ...u, is_op: nextVal, role: nextVal ? "admin" : "user" } : u
          )
        );
      }
    } catch (e) {
      console.error("Failed to toggle OP:", e);
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleToggleSuspend = async (targetUser: any) => {
    setUserActionLoading(targetUser.id);
    try {
      const nextVal = !targetUser.is_suspended;
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: targetUser.id,
          action: "toggle_suspend",
          value: nextVal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminUsers((prev) =>
          prev.map((u) =>
            u.id === targetUser.id ? { ...u, is_suspended: nextVal } : u
          )
        );
      }
    } catch (e) {
      console.error("Failed to toggle suspend:", e);
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleSetTokens = async (targetUser: any, delta: number) => {
    setUserActionLoading(targetUser.id);
    const currentLimit = targetUser.custom_daily_limit || 1000;
    const newLimit = Math.max(0, currentLimit + delta);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: targetUser.id,
          action: "set_tokens",
          value: newLimit,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminUsers((prev) =>
          prev.map((u) =>
            u.id === targetUser.id ? { ...u, custom_daily_limit: newLimit } : u
          )
        );
      }
    } catch (e) {
      console.error("Failed to set tokens:", e);
    } finally {
      setUserActionLoading(null);
    }
  };

  React.useEffect(() => {
    if (activeTab === "admin") {
      fetchAdminStats();
      fetchAdminUsers();
      fetchDbData();
    }
  }, [activeTab]);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(type);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleExportData = () => {
    const exportObject = {
      conversations,
      messages,
      exportedAt: new Date().toISOString(),
      user: user || BRAND_CONFIG.defaultUser,
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `gml_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleConfirmClearAll = () => {
    clearAllConversations();
    setIsClearModalOpen(false);
    setIsClearedSuccess(true);
    setTimeout(() => setIsClearedSuccess(false), 3500);
  };

  const navTabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "creator",
      label: "ข้อมูลผู้สร้าง",
      icon: <BadgeCheck className="h-4 w-4 text-blue-400" />,
    },
    {
      id: "admin",
      label: "แดชบอร์ดแอดมิน (Admin)",
      icon: <BarChart3 className="h-4 w-4 text-emerald-400" />,
    },
    {
      id: "general",
      label: "ทั่วไป",
      icon: <Settings className="h-4 w-4" />,
    },
    {
      id: "account",
      label: "บัญชีผู้ใช้",
      icon: <User className="h-4 w-4" />,
    },
    {
      id: "composer",
      label: "การพิมพ์และการตอบ",
      icon: <Keyboard className="h-4 w-4" />,
    },
    {
      id: "shortcuts",
      label: "คีย์ลัด",
      icon: <Keyboard className="h-4 w-4" />,
    },
    {
      id: "privacy",
      label: "ความเป็นส่วนตัว & ข้อมูล",
      icon: <Shield className="h-4 w-4" />,
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(255,255,255,0.08)]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#f1f5f9]">
            การตั้งค่า (Settings)
          </h2>
          <p className="text-xs sm:text-sm text-[#94a3b8]">
            ปรับแต่งพฤติกรรม ระบบ AI ธีม และข้อมูลส่วนตัวของคุณ
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleSave}
          leftIcon={isSaved ? <Check className="h-4 w-4 text-emerald-400" /> : undefined}
          className="bg-[#0b57d0] hover:bg-[#0842a0] text-white"
        >
          {isSaved ? "บันทึกแล้ว" : "บันทึกการตั้งค่า"}
        </Button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 my-6">
        {/* Left Navigation */}
        <div className="space-y-1">
          {navTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer",
                activeTab === t.id
                  ? "bg-[#0b57d0] text-white font-semibold shadow-xs"
                  : "text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1e1f20]"
              )}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Right Content Panel */}
        <div className="md:col-span-3 p-6 rounded-3xl bg-[#1e1f20] border border-[rgba(255,255,255,0.08)] shadow-sm space-y-6 text-xs sm:text-sm text-[#f1f5f9]">
          {/* Creator Profile Tab */}
          {activeTab === "creator" && (
            <div className="space-y-6 animate-fade-up">
              <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#f1f5f9] flex items-center gap-2">
                    <span>ข้อมูลผู้พัฒนา & ผู้สร้างระบบ</span>
                    <BadgeCheck className="h-4 w-4 text-blue-400 fill-blue-400/20" />
                  </h3>
                  <p className="text-xs text-[#94a3b8]">
                    ผู้ออกแบบและพัฒนาแพลตฟอร์ม GML AI (GooMiRu)
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Lead Developer
                </span>
              </div>

              {/* Creator Main Card */}
              <div className="p-6 rounded-2xl bg-[#131314] border border-[rgba(255,255,255,0.08)] space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-[#0b57d0] to-[#38bdf8] text-white flex items-center justify-center font-black text-2xl shadow-md">
                      S
                    </div>
                    <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-white shadow-xs" title="ผู้พัฒนาพร้อมติดต่อ">
                      <Sparkles className="h-3 w-3" />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-lg font-bold text-white tracking-wide">
                        satetapong sanguansuk
                      </h4>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Verified Creator
                      </span>
                    </div>
                    <p className="text-xs text-[#94a3b8]">
                      Full-Stack AI Engineer & System Architect
                    </p>
                    <p className="text-[11px] text-[#64748b]">
                      ผู้คิดค้น พัฒนาระบบ และดูแลโครงสร้างพื้นฐานของ Goomiru AI
                    </p>
                  </div>
                </div>

                {/* Contact Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {/* Email */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#1e1f20] border border-[rgba(255,255,255,0.06)] hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-[#64748b] block">อีเมลติดต่อ</span>
                        <a
                          href="mailto:satetapongs@gmail.com"
                          className="text-xs font-semibold text-slate-200 hover:text-blue-400 truncate block"
                        >
                          satetapongs@gmail.com
                        </a>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy("satetapongs@gmail.com", "email")}
                      className="p-1.5 rounded-lg text-[#94a3b8] hover:text-white hover:bg-slate-700/50 transition-colors cursor-pointer"
                      title="คัดลอกอีเมล"
                    >
                      {copiedItem === "email" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#1e1f20] border border-[rgba(255,255,255,0.06)] hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-[#64748b] block">เบอร์โทรศัพท์</span>
                        <a
                          href="tel:0815018272"
                          className="text-xs font-semibold text-slate-200 hover:text-emerald-400 truncate block font-mono"
                        >
                          081-501-8272
                        </a>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy("0815018272", "phone")}
                      className="p-1.5 rounded-lg text-[#94a3b8] hover:text-white hover:bg-slate-700/50 transition-colors cursor-pointer"
                      title="คัดลอกเบอร์โทร"
                    >
                      {copiedItem === "phone" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  {/* GitHub Profile */}
                  <div className="sm:col-span-2 flex items-center justify-between p-3 rounded-xl bg-[#1e1f20] border border-[rgba(255,255,255,0.06)] hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-[#64748b] block">GitHub Repository</span>
                        <a
                          href="https://github.com/satetapongsa/Goomairu"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1 truncate"
                        >
                          <span>https://github.com/satetapongsa/Goomiru</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </div>
                    </div>

                    <a
                      href="https://github.com/satetapongsa/Goomairu"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <span>ไปที่ Repo</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Analytics Dashboard Tab */}
          {activeTab === "admin" && (
            <div className="space-y-5 select-none animate-fade-up">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(255,255,255,0.08)] pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#f1f5f9] flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-emerald-400" />
                    <span>แดชบอร์ดแอดมิน (Neon DB Live Analytics)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    สถิติการใช้งานจริงและคำถามที่ผู้ใช้ถามเข้ามาในระบบ Goomiru AI
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fetchAdminStats}
                  disabled={isLoadingAdmin}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer border border-white/10 active:scale-95 shrink-0"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", isLoadingAdmin && "animate-spin text-emerald-400")} />
                  <span>รีเฟรชสถิติ</span>
                </button>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#1e1f20] border border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium">คำถามทั้งหมด</span>
                  <div className="text-xl sm:text-2xl font-black text-white">
                    {adminStats ? adminStats.totalPrompts.toLocaleString() : "..."}
                  </div>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                    <TrendingUp className="h-3 w-3" />
                    <span>บันทึกใน Neon DB</span>
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#1e1f20] border border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium">คำถามวันนี้</span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400">
                    {adminStats ? adminStats.todayPrompts.toLocaleString() : "..."}
                  </div>
                  <span className="text-[10px] text-slate-500">นับตามเวลาวันนี้</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#1e1f20] border border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium">ผู้ใช้ที่ลงทะเบียน</span>
                  <div className="text-xl sm:text-2xl font-black text-sky-400">
                    {adminStats ? adminStats.totalUsers.toLocaleString() : "..."}
                  </div>
                  <span className="text-[10px] text-slate-500">บัญชีในระบบ</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#1e1f20] border border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium">สมองกลขับเคลื่อน</span>
                  <div className="text-xs sm:text-sm font-bold text-amber-400 truncate">
                    DeepSeek Master
                  </div>
                  <span className="text-[10px] text-emerald-400">ประหยัดโทเคนสูงสุด</span>
                </div>
              </div>

              {/* Model Usage Breakdown */}
              {adminStats?.modelUsage && adminStats.modelUsage.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#1e1f20] border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200">โมเดลยอดนิยมที่มีคนเลือกใช้</h4>
                  <div className="space-y-2">
                    {adminStats.modelUsage.map((m, idx) => {
                      const total = adminStats.totalPrompts || 1;
                      const pct = Math.round((m.count / total) * 100);
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-slate-300">
                            <span className="font-semibold">{m.modelId}</span>
                            <span className="text-slate-400">{m.count} ครั้ง ({pct}%)</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400"
                              style={{ width: `${Math.max(5, pct)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent Prompts Stream (ตารางคำถามล่าสุดที่คนส่งเข้ามา) */}
              <div className="p-4 rounded-2xl bg-[#1e1f20] border border-white/10 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-sky-400" />
                    <span>คำถามล่าสุดของผู้ใช้ (Live Prompts Stream)</span>
                  </h4>
                  <div className="relative w-full sm:w-60">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="ค้นหาคำถามหรืออีเมล..."
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1 rounded-xl bg-black/30 border border-white/10 text-xs text-slate-200 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2 pr-1 select-text">
                  {adminStats?.recentPrompts && adminStats.recentPrompts.length > 0 ? (
                    adminStats.recentPrompts
                      .filter(
                        (p) =>
                          p.prompt.toLowerCase().includes(adminSearch.toLowerCase()) ||
                          p.userEmail.toLowerCase().includes(adminSearch.toLowerCase()) ||
                          p.modelId.toLowerCase().includes(adminSearch.toLowerCase())
                      )
                      .map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-[#161718] border border-white/5 space-y-1.5 hover:border-white/15 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                            <span className="font-semibold text-slate-300 truncate max-w-[180px]">
                              {item.userEmail}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono">
                                {item.modelId}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {item.createdAt ? new Date(item.createdAt).toLocaleTimeString("th-TH") : ""}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-200 font-normal leading-relaxed break-words bg-[#1f2022] p-2 rounded-lg border border-white/5">
                            {item.prompt}
                          </p>
                        </div>
                      ))
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-500">
                      {isLoadingAdmin ? "กำลังโหลดข้อมูลจาก Neon DB..." : "ยังไม่มีข้อมูลคำถามในระบบ"}
                    </div>
                  )}
                </div>
              </div>

              {/* User Management & Access Control Section */}
              <div className="p-4 rounded-2xl bg-[#1e1f20] border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2">
                      <Users className="h-4 w-4 text-amber-400" />
                      <span>จัดการผู้ใช้ & สิทธิ์การควบคุม (User Control Panel)</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      เปิด/ปิดสิทธิ์ OP แอดมิน, สั่งระงับบัญชีผู้ใช้, และปรับเพิ่ม/ลดโควต้าโทเคน
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative w-full sm:w-56">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="ค้นหาชื่อหรืออีเมลผู้ใช้..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1 rounded-xl bg-black/30 border border-white/10 text-xs text-slate-200 outline-none focus:border-amber-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={fetchAdminUsers}
                      disabled={isLoadingUsers}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 transition-colors cursor-pointer"
                      title="รีเฟรชรายชื่อผู้ใช้"
                    >
                      <RefreshCw className={cn("h-3.5 w-3.5", isLoadingUsers && "animate-spin text-amber-400")} />
                    </button>
                  </div>
                </div>

                {/* Users List */}
                <div className="space-y-3">
                  {adminUsers.length > 0 ? (
                    adminUsers
                      .filter(
                        (u) =>
                          u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                          (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase()))
                      )
                      .map((u) => {
                        const isActionActive = userActionLoading === u.id;
                        return (
                          <div
                            key={u.id}
                            className={cn(
                              "p-3.5 rounded-2xl border transition-all space-y-3",
                              u.is_suspended
                                ? "bg-red-950/20 border-red-500/30"
                                : u.is_op
                                ? "bg-amber-950/20 border-amber-500/30"
                                : "bg-[#161718] border-white/5"
                            )}
                          >
                            {/* User Header Info */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="h-9 w-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 text-xs font-bold text-white">
                                  {u.avatar ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={u.avatar} alt={u.name || "User"} className="h-full w-full object-cover" />
                                  ) : (
                                    (u.name || u.email || "U")[0].toUpperCase()
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-100 truncate">
                                      {u.name || "ผู้ใช้งาน"}
                                    </span>
                                    {u.is_op && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                                        <Crown className="h-3 w-3" />
                                        <span>OP Admin</span>
                                      </span>
                                    )}
                                    {u.is_suspended && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-bold">
                                        <Ban className="h-3 w-3" />
                                        <span>ถูกระงับ</span>
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                    <span className="text-[11px] text-slate-400 font-mono">
                                      {u.email}
                                    </span>
                                    {u.last_ip_address ? (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[10px] font-mono border border-sky-500/25 font-semibold">
                                        <Globe className="h-2.5 w-2.5" />
                                        <span>IP: {u.last_ip_address}</span>
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-slate-500 font-mono">
                                        🌐 IP: -
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Daily Token Badge */}
                              <div className="flex items-center gap-2 shrink-0">
                                <div className="text-right">
                                  <span className="text-[10px] text-slate-400 block">โควต้าโทเคน</span>
                                  <span className="text-xs font-bold text-emerald-400">
                                    {(u.custom_daily_limit || 1000).toLocaleString()} / วัน
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action Controls Toolbar */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs">
                              {/* Token Adjustment Buttons */}
                              <div className="flex items-center gap-1">
                                <span className="text-[11px] text-slate-400 mr-1">ปรับโทเคน:</span>
                                <button
                                  type="button"
                                  disabled={isActionActive}
                                  onClick={() => handleSetTokens(u, -500)}
                                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-medium cursor-pointer transition-colors"
                                  title="ลดโควต้าลง 500 โทเคน"
                                >
                                  -500
                                </button>
                                <button
                                  type="button"
                                  disabled={isActionActive}
                                  onClick={() => handleSetTokens(u, 500)}
                                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-medium cursor-pointer transition-colors"
                                  title="เพิ่มโควต้าขึ้น 500 โทเคน"
                                >
                                  +500
                                </button>
                                <button
                                  type="button"
                                  disabled={isActionActive}
                                  onClick={() => handleSetTokens(u, 1000)}
                                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-emerald-300 font-medium cursor-pointer transition-colors"
                                  title="เพิ่มโควต้าขึ้น 1,000 โทเคน"
                                >
                                  +1,000
                                </button>
                              </div>

                              {/* OP & Suspend Action Toggles */}
                              <div className="flex items-center gap-2">
                                {/* Toggle OP / DEOP Button */}
                                <button
                                  type="button"
                                  disabled={isActionActive}
                                  onClick={() => handleToggleOp(u)}
                                  className={cn(
                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95",
                                    u.is_op
                                      ? "bg-amber-600 hover:bg-amber-700 text-white"
                                      : "bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30"
                                  )}
                                >
                                  <Crown className="h-3 w-3" />
                                  <span>{u.is_op ? "ถอดสิทธิ์ OP (/deop)" : "ให้สิทธิ์ OP (/op)"}</span>
                                </button>

                                {/* Toggle Suspend Button */}
                                <button
                                  type="button"
                                  disabled={isActionActive}
                                  onClick={() => handleToggleSuspend(u)}
                                  className={cn(
                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95",
                                    u.is_suspended
                                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                      : "bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30"
                                  )}
                                >
                                  <Ban className="h-3 w-3" />
                                  <span>{u.is_suspended ? "ปลดระงับ (Unban)" : "ระงับบัญชี (Ban)"}</span>
                                </button>

                                {/* View User Questions History Button */}
                                <button
                                  type="button"
                                  onClick={() => handleViewUserQuestions(u)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 transition-all cursor-pointer shadow-xs active:scale-95"
                                  title="ดูประวัติคำถามทั้งหมดของคนนี้"
                                >
                                  <MessageSquare className="h-3 w-3" />
                                  <span>ดูประวัติคำถาม</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-500">
                      {isLoadingUsers ? "กำลังโหลดรายชื่อผู้ใช้จาก Neon DB..." : "ยังไม่มีข้อมูลผู้ใช้ในระบบ"}
                    </div>
                  )}
                </div>
              </div>

              {/* Neon Database Live Explorer Section */}
              <div className="p-4 rounded-2xl bg-[#1e1f20] border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <Database className="h-4 w-4 text-emerald-400" />
                      <span>ตรวจสอบข้อมูลในฐานข้อมูล (Neon PostgreSQL Live Explorer)</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      ดูข้อมูลแถวจริงทั้งหมดที่บันทึกอยู่ในฐานข้อมูล Neon แบบสดๆ
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fetchDbData(selectedDbTable)}
                    disabled={isLoadingDbData}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#282a2c] hover:bg-[#333538] text-slate-200 border border-white/10 transition-colors cursor-pointer shrink-0"
                  >
                    <RefreshCw className={cn("h-3.5 w-3.5", isLoadingDbData && "animate-spin text-emerald-400")} />
                    <span>รีเฟรชฐานข้อมูล</span>
                  </button>
                </div>

                {/* Table Selection Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: "users", label: "👤 ผู้ใช้งาน (users)", count: dbData?.tableCounts?.users },
                    { id: "user_individual_prompts", label: "💬 ประวัติคำถามรายบุคคล (user_individual_prompts)", count: dbData?.tableCounts?.user_individual_prompts },
                    { id: "cloud_conversations", label: "🗂️ ประวัติห้องแชท (cloud_conversations)", count: dbData?.tableCounts?.cloud_conversations },
                    { id: "cloud_messages", label: "📝 ข้อความแชท (cloud_messages)", count: dbData?.tableCounts?.cloud_messages },
                    { id: "visitor_logs", label: "🌐 บันทึกผู้เข้าชม (visitor_logs)", count: dbData?.tableCounts?.visitor_logs },
                  ].map((tbl) => (
                    <button
                      key={tbl.id}
                      type="button"
                      onClick={() => fetchDbData(tbl.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border",
                        selectedDbTable === tbl.id
                          ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/40 font-semibold shadow-xs"
                          : "bg-[#131314] hover:bg-[#282a2c] text-slate-400 border-white/5"
                      )}
                    >
                      <span>{tbl.label}</span>
                      <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono text-slate-300">
                        {tbl.count ?? 0}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Search in current table */}
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder={`ค้นหาในตาราง ${selectedDbTable}...`}
                    value={dbSearchFilter}
                    onChange={(e) => setDbSearchFilter(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#131314] text-white text-xs border border-white/10 focus:border-emerald-500 focus:outline-none placeholder:text-slate-500"
                  />
                </div>

                {/* Table Data Render */}
                <div className="rounded-xl border border-white/10 overflow-hidden bg-[#131314]">
                  {isLoadingDbData ? (
                    <div className="py-12 text-center text-xs text-slate-500">
                      <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-emerald-400" />
                      กำลังดึงข้อมูลตาราง {selectedDbTable} จากฐานข้อมูล...
                    </div>
                  ) : !dbData?.rows || dbData.rows.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-500 italic">
                      ไม่พบข้อมูลในตารางนี้
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-[50vh]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="sticky top-0 bg-[#1e1f20] border-b border-white/10 text-slate-300 font-mono text-[11px]">
                          <tr>
                            {Object.keys(dbData.rows[0]).map((colKey) => (
                              <th key={colKey} className="px-3 py-2 whitespace-nowrap font-semibold border-r border-white/5">
                                {colKey}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300 font-sans text-xs">
                          {dbData.rows
                            .filter((row) => {
                              if (!dbSearchFilter.trim()) return true;
                              const rowStr = JSON.stringify(row).toLowerCase();
                              return rowStr.includes(dbSearchFilter.toLowerCase());
                            })
                            .map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                                {Object.entries(row).map(([k, val], cIdx) => (
                                  <td
                                    key={cIdx}
                                    className="px-3 py-2 whitespace-nowrap text-xs border-r border-white/5 font-mono max-w-xs truncate"
                                    title={String(val ?? "")}
                                  >
                                    {k === "last_ip_address" || k === "ip_address" ? (
                                      <span className="text-sky-400 font-bold">{String(val ?? "-")}</span>
                                    ) : k === "is_op" ? (
                                      val ? <span className="text-amber-400 font-bold">TRUE (OP)</span> : <span className="text-slate-600">false</span>
                                    ) : k === "is_suspended" ? (
                                      val ? <span className="text-red-400 font-bold">SUSPENDED</span> : <span className="text-emerald-500">active</span>
                                    ) : val === null || val === undefined ? (
                                      <span className="text-slate-600 italic">null</span>
                                    ) : typeof val === "object" ? (
                                      JSON.stringify(val)
                                    ) : (
                                      String(val)
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* General Tab */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#f1f5f9] border-b border-[rgba(255,255,255,0.08)] pb-2">
                การตั้งค่าทั่วไป
              </h3>

              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="font-semibold text-[#f1f5f9]">บันทึกประวัติการสนทนาอัตโนมัติ</h4>
                  <p className="text-xs text-[#94a3b8]">บันทึกบทสนทนาลงในพื้นที่ LocalStorage อย่างปลอดภัย</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoSaveHistory}
                  onChange={(e) => updateSettings({ autoSaveHistory: e.target.checked })}
                  className="h-4 w-4 rounded accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="font-semibold text-[#f1f5f9]">เสียงเอฟเฟกต์ (Sound Effects)</h4>
                  <p className="text-xs text-[#94a3b8]">เปิดเสียงเอฟเฟกต์ตอบรับเมื่อส่งข้อความและเสร็จสิ้น</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundEffects}
                  onChange={(e) => updateSettings({ soundEffects: e.target.checked })}
                  className="h-4 w-4 rounded accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#f1f5f9] border-b border-[rgba(255,255,255,0.08)] pb-2">
                บัญชีผู้ใช้งาน
              </h3>

              {isAuthenticated && user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#131314] border border-[rgba(255,255,255,0.08)]">
                    <div className="h-12 w-12 rounded-full bg-[#e65100] text-white flex items-center justify-center font-bold text-lg">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{user.name}</h4>
                      <p className="text-xs text-slate-400">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        {user.role === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้ทั่วไป"}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => openLogoutConfirm()}
                    leftIcon={<LogOut className="h-4 w-4 text-red-400" />}
                    className="text-red-400 border-red-900/40 hover:bg-red-950/20 cursor-pointer"
                  >
                    ออกจากระบบ
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 p-4 rounded-2xl bg-[#131314] border border-[rgba(255,255,255,0.08)] text-center">
                  <p className="text-xs text-slate-400">คุณยังไม่ได้เข้าสู่ระบบ เข้าสู่ระบบเพื่อซิงค์ข้อมูลและบันทึกประวัติการใช้งาน</p>
                  <Button
                    variant="primary"
                    onClick={() => openAuthModal("login")}
                    leftIcon={<LogIn className="h-4 w-4" />}
                    className="bg-[#0b57d0] hover:bg-[#0842a0] text-white mx-auto"
                  >
                    เข้าสู่ระบบ / สมัครสมาชิก
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Composer Tab */}
          {activeTab === "composer" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#f1f5f9] border-b border-[rgba(255,255,255,0.08)] pb-2">
                การพิมพ์และการส่งข้อความ
              </h3>

              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="font-semibold text-[#f1f5f9]">กด Enter เพื่อส่งข้อความ</h4>
                  <p className="text-xs text-[#94a3b8]">หากปิด จะต้องกด Shift + Enter เพื่อส่งข้อความ</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enterToSend}
                  onChange={(e) => updateSettings({ enterToSend: e.target.checked })}
                  className="h-4 w-4 rounded accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Shortcuts Tab */}
          {activeTab === "shortcuts" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#f1f5f9] border-b border-[rgba(255,255,255,0.08)] pb-2">
                คีย์ลัดบนแป้นพิมพ์ (Keyboard Shortcuts)
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#131314]">
                  <span className="text-slate-300">ค้นหาประวัติการสนทนา</span>
                  <kbd className="px-2 py-1 rounded bg-[#282a2c] text-slate-300 border border-[rgba(255,255,255,0.08)] font-mono">Ctrl + K / ⌘K</kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#131314]">
                  <span className="text-slate-300">สร้างการสนทนาใหม่</span>
                  <kbd className="px-2 py-1 rounded bg-[#282a2c] text-slate-300 border border-[rgba(255,255,255,0.08)] font-mono">Ctrl + Shift + O</kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#131314]">
                  <span className="text-slate-300">ยุบ / ขยาย แถบข้าง</span>
                  <kbd className="px-2 py-1 rounded bg-[#282a2c] text-slate-300 border border-[rgba(255,255,255,0.08)] font-mono">Ctrl + B / ⌘B</kbd>
                </div>
              </div>
            </div>
          )}

          {/* Privacy & Data Tab */}
          {activeTab === "privacy" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#f1f5f9] border-b border-[rgba(255,255,255,0.08)] pb-2">
                ความเป็นส่วนตัวและการจัดการข้อมูล
              </h3>

              {isClearedSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-up">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>ล้างประวัติการสนทนาทั้งหมดในเครื่องเรียบร้อยแล้ว</span>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-[#131314] border border-[rgba(255,255,255,0.08)] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white">ส่งออกข้อมูลทั้งหมด (Export Data)</h4>
                    <p className="text-xs text-slate-400">ดาวน์โหลดประวัติการสนทนาและไฟล์ที่บันทึกไว้ในรูปแบบ JSON</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportData}
                    leftIcon={<Download className="h-4 w-4" />}
                  >
                    ดาวน์โหลด JSON
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-red-950/20 border border-red-900/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-red-300">ล้างประวัติการสนทนาทั้งหมด</h4>
                    <p className="text-xs text-red-400/80">ลบประวัติการแชททั้งหมดในเครื่อง ไม่สามารถกู้คืนได้</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsClearModalOpen(true)}
                    leftIcon={<Trash2 className="h-4 w-4 text-red-400" />}
                    className="text-red-400 border-red-900/50 hover:bg-red-950/40"
                  >
                    ลบทั้งหมด
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal UI for Clearing All Chats */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        maxWidth="md"
        title={
          <div className="flex items-center gap-2.5 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-base font-bold text-white">ยืนยันการล้างประวัติแชททั้งหมด?</span>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-[#131314] border border-red-500/20 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p className="font-semibold text-red-400 mb-1.5">⚠️ ข้อมูลจะถูกลบอย่างถาวร:</p>
            คุณกำลังจะลบประวัติการสนทนาทั้งหมด <strong className="text-white font-bold">({conversations.length} แชท)</strong> ที่บันทึกไว้ในอุปกรณ์นี้ ข้อมูลที่ถูกลบจะไม่สามารถกู้คืนกลับมาได้อีก
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsClearModalOpen(false)}
              className="px-4 py-2 text-xs"
            >
              ยกเลิก
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={handleConfirmClearAll}
              leftIcon={<Trash2 className="h-4 w-4" />}
              className="bg-red-600 hover:bg-red-700 text-white border-transparent px-4 py-2 text-xs font-semibold shadow-md"
            >
              ยืนยันลบทั้งหมด
            </Button>
          </div>
        </div>
      </Modal>

      {/* Per-User Question History Modal */}
      <Modal
        isOpen={!!viewingUserQuestions}
        onClose={() => setViewingUserQuestions(null)}
        maxWidth="2xl"
        title={
          <div className="flex items-center gap-2.5 text-sky-400">
            <MessageSquare className="h-5 w-5" />
            <span className="text-base font-bold text-white">
              ประวัติคำถามรายบุคคล: {viewingUserQuestions?.name || viewingUserQuestions?.email}
            </span>
          </div>
        }
      >
        <div className="space-y-4">
          {/* User Info Bar & Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#131314] border border-[rgba(255,255,255,0.06)]">
            <div className="text-xs">
              <span className="text-slate-400">บัญชี: </span>
              <span className="text-white font-semibold font-mono">{viewingUserQuestions?.email}</span>
              <span className="ml-3 px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-semibold">
                ถามทั้งหมด {userQuestionsList.length} คำถาม
              </span>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาในคำถามของคนนี้..."
                value={questionSearchFilter}
                onChange={(e) => setQuestionSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#282a2c] text-white text-xs border border-[rgba(255,255,255,0.08)] focus:border-sky-500 focus:outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Question List */}
          <div className="max-h-[55vh] overflow-y-auto space-y-2.5 pr-1">
            {isLoadingUserQuestions ? (
              <div className="py-12 text-center text-xs text-slate-500">
                <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-sky-400" />
                กำลังดึงประวัติคำถามของ {viewingUserQuestions?.email} จากฐานข้อมูล...
              </div>
            ) : userQuestionsList.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 italic">
                ผู้ใช้นี้ยังไม่มีประวัติการส่งคำถามในระบบ
              </div>
            ) : (
              userQuestionsList
                .filter((q) =>
                  questionSearchFilter.trim() === ""
                    ? true
                    : q.prompt.toLowerCase().includes(questionSearchFilter.toLowerCase())
                )
                .map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-3.5 rounded-xl bg-[#131314] border border-[rgba(255,255,255,0.06)] hover:border-sky-500/30 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono font-semibold text-[10px]">
                          {q.model_id || "gemini-3.1-flash-lite"}
                        </span>
                        {q.ip_address && q.ip_address !== "unknown" && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            IP: {q.ip_address}
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 text-[10.5px]">
                        {new Date(q.created_at).toLocaleString("th-TH", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>

                    <div className="text-xs text-slate-200 leading-relaxed font-sans bg-[#1e1f20] p-2.5 rounded-lg border border-[rgba(255,255,255,0.04)] select-text">
                      {q.prompt}
                    </div>
                  </div>
                ))
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setViewingUserQuestions(null)}
              className="px-4 py-2 text-xs"
            >
              ปิดหน้าต่าง
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
