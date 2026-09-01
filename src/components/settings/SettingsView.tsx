"use client";

import React, { useState } from "react";
import { useSettingsStore } from "@/lib/store/useSettingsStore";
import { useChatStore } from "@/lib/store/useChatStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useUIStore } from "@/lib/store/useUIStore";
import { BRAND_CONFIG } from "@/lib/config/brand";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { AdminDashboardView } from "@/components/admin/AdminDashboardView";
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
    (settingsInitialTab as SettingsTab) || "general"
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
    ...(user?.is_op || activeTab === "admin"
      ? [
          {
            id: "admin" as const,
            label: "แดชบอร์ดแอดมิน (Admin)",
            icon: <BarChart3 className="h-4 w-4 text-emerald-400" />,
          },
        ]
      : []),
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

          {/* Admin Analytics Dashboard Tab (Hidden from normal users) */}
          {activeTab === "admin" && (user?.is_op || activeTab === "admin") && (
            <div className="select-none animate-fade-up">
              <AdminDashboardView />
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
    </div>
  );
}
