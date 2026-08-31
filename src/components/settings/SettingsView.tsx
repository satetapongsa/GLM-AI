"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import { useSettingsStore } from "@/lib/store/useSettingsStore";
import { useChatStore } from "@/lib/store/useChatStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { AVAILABLE_MODELS } from "@/lib/config/models";
import { BRAND_CONFIG } from "@/lib/config/brand";
import { Button } from "@/components/ui/Button";
import {
  Settings,
  Sun,
  Moon,
  Laptop,
  Cpu,
  Keyboard,
  Shield,
  Trash2,
  Download,
  User,
  Check,
  LogIn,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

type SettingsTab =
  | "general"
  | "appearance"
  | "models"
  | "composer"
  | "shortcuts"
  | "privacy"
  | "account";

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useSettingsStore();
  const { clearAllConversations, conversations, messages } = useChatStore();
  const { user, isAuthenticated, logout, openAuthModal } = useAuthStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [isSaved, setIsSaved] = useState(false);

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

  const navTabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: "general", label: "ทั่วไป (General)", icon: <Settings className="h-4 w-4" /> },
    { id: "appearance", label: "รูปลักษณ์ (Appearance)", icon: <Sun className="h-4 w-4" /> },
    { id: "models", label: "โมเดล AI (AI Models)", icon: <Cpu className="h-4 w-4" /> },
    { id: "composer", label: "กล่องข้อความ (Composer)", icon: <Settings className="h-4 w-4" /> },
    { id: "shortcuts", label: "คีย์ลัด (Shortcuts)", icon: <Keyboard className="h-4 w-4" /> },
    { id: "privacy", label: "ความเป็นส่วนตัว & ข้อมูล", icon: <Shield className="h-4 w-4" /> },
    { id: "account", label: "บัญชีผู้ใช้ (Account)", icon: <User className="h-4 w-4" /> },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[hsl(var(--foreground))]">
              การตั้งค่า (Settings & Preferences)
            </h2>
            <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">
              ปรับแต่งพฤติกรรมของ AI ธีมระบบ การเชื่อมต่อ และบัญชีผู้ใช้
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          leftIcon={isSaved ? <Check className="h-4 w-4 text-emerald-400" /> : undefined}
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
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
              )}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Right Content Panel */}
        <div className="md:col-span-3 p-6 rounded-3xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-sm space-y-6 text-xs sm:text-sm">
          {/* General Tab */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[hsl(var(--foreground))] border-b border-[hsl(var(--border))] pb-2">
                การตั้งค่าทั่วไป
              </h3>

              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="font-semibold text-[hsl(var(--foreground))]">บันทึกประวัติการสนทนาอัตโนมัติ</h4>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">บันทึกบทสนทนาลงในพื้นที่ LocalStorage อย่างปลอดภัย</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoSaveHistory}
                  onChange={(e) => updateSettings({ autoSaveHistory: e.target.checked })}
                  className="h-4 w-4 rounded accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-t border-[hsl(var(--border))]">
                <div>
                  <h4 className="font-semibold text-[hsl(var(--foreground))]">แสดงข้อความคำเตือน (Disclaimer)</h4>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">แสดงคำเตือนใต้กล่องข้อความเพื่อความโปร่งใส</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showDisclaimer}
                  onChange={(e) => updateSettings({ showDisclaimer: e.target.checked })}
                  className="h-4 w-4 rounded accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[hsl(var(--foreground))] border-b border-[hsl(var(--border))] pb-2">
                ธีมและรูปลักษณ์ (Theme & Appearance)
              </h3>

              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                เลือกรูปแบบธีมการแสดงผลของระบบ โดยสามารถสลับได้ทันทีโดยไม่ต้องรีโหลดหน้าเว็บ
              </p>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer",
                    theme === "light"
                      ? "border-blue-500 bg-blue-500/10 text-blue-600"
                      : "border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
                  )}
                >
                  <Sun className="h-6 w-6 mb-2" />
                  <span className="font-semibold text-xs">Light (สว่าง)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer",
                    theme === "dark"
                      ? "border-blue-500 bg-blue-500/10 text-blue-600"
                      : "border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
                  )}
                >
                  <Moon className="h-6 w-6 mb-2" />
                  <span className="font-semibold text-xs">Dark (มืด)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer",
                    theme === "system"
                      ? "border-blue-500 bg-blue-500/10 text-blue-600"
                      : "border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
                  )}
                >
                  <Laptop className="h-6 w-6 mb-2" />
                  <span className="font-semibold text-xs">System (ตามระบบ)</span>
                </button>
              </div>
            </div>
          )}

          {/* AI Models Tab */}
          {activeTab === "models" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[hsl(var(--foreground))] border-b border-[hsl(var(--border))] pb-2">
                โมเดลเริ่มต้นและคำสั่งระบบ (Default Model & Prompt)
              </h3>

              <div>
                <label className="block font-semibold text-[hsl(var(--foreground))] mb-1.5">
                  โมเดล AI เริ่มต้น (Default Model)
                </label>
                <select
                  value={settings.defaultModelId}
                  onChange={(e) => updateSettings({ defaultModelId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] outline-none"
                >
                  {AVAILABLE_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.provider})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-[hsl(var(--foreground))] mb-1">
                  <label>Temperature เริ่มต้น</label>
                  <span className="font-mono">{settings.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.temperature}
                  onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-[hsl(var(--muted))] rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-[hsl(var(--foreground))] mb-1.5">
                  คำสั่งระบบกลาง (Global System Prompt Preset)
                </label>
                <textarea
                  rows={3}
                  value={settings.systemPromptPreset}
                  onChange={(e) => updateSettings({ systemPromptPreset: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] outline-none resize-none font-mono text-xs"
                />
              </div>
            </div>
          )}

          {/* Composer Tab */}
          {activeTab === "composer" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[hsl(var(--foreground))] border-b border-[hsl(var(--border))] pb-2">
                พฤติกรรมกล่องข้อความ (Composer Preferences)
              </h3>

              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="font-semibold text-[hsl(var(--foreground))]">กด Enter เพื่อส่งข้อความ</h4>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">หากปิดใช้งาน จะต้องใช้ปุ่มส่งหรือ Ctrl+Enter เท่านั้น</p>
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
              <h3 className="text-base font-bold text-[hsl(var(--foreground))] border-b border-[hsl(var(--border))] pb-2">
                แป้นพิมพ์ลัด (Keyboard Shortcuts)
              </h3>

              <div className="divide-y divide-[hsl(var(--border))] text-xs">
                <div className="flex justify-between py-2.5">
                  <span>ค้นหาแชท (Command Search)</span>
                  <kbd className="px-2 py-0.5 rounded bg-[hsl(var(--muted))] font-mono">Ctrl + K / Cmd + K</kbd>
                </div>
                <div className="flex justify-between py-2.5">
                  <span>ส่งข้อความ</span>
                  <kbd className="px-2 py-0.5 rounded bg-[hsl(var(--muted))] font-mono">Enter</kbd>
                </div>
                <div className="flex justify-between py-2.5">
                  <span>ขึ้นบรรทัดใหม่ในกล่องพิมพ์</span>
                  <kbd className="px-2 py-0.5 rounded bg-[hsl(var(--muted))] font-mono">Shift + Enter</kbd>
                </div>
                <div className="flex justify-between py-2.5">
                  <span>ปิดหน้าต่าง Modal</span>
                  <kbd className="px-2 py-0.5 rounded bg-[hsl(var(--muted))] font-mono">Esc</kbd>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === "privacy" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[hsl(var(--foreground))] border-b border-[hsl(var(--border))] pb-2">
                ความเป็นส่วนตัว & การจัดการข้อมูล
              </h3>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))]">
                <div>
                  <h4 className="font-semibold text-[hsl(var(--foreground))]">ส่งออกข้อมูลทั้งหมด (Export Data)</h4>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">ดาวน์โหลดประวัติการสนทนาทั้งหมดในรูปแบบไฟล์ JSON</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportData} leftIcon={<Download className="h-4 w-4" />}>
                  Export JSON
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500">
                <div>
                  <h4 className="font-semibold text-red-600 dark:text-red-400">ล้างประวัติแชททั้งหมด</h4>
                  <p className="text-xs opacity-80">การกระทำนี้จะลบประวัติการสนทนาทั้งหมดและไม่สามารถกู้คืนได้</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการล้างประวัติการสนทนาทั้งหมด?")) {
                      clearAllConversations();
                      alert("ล้างประวัติแชทเรียบร้อยแล้ว");
                    }
                  }}
                  leftIcon={<Trash2 className="h-4 w-4" />}
                >
                  ล้างข้อมูล
                </Button>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[hsl(var(--foreground))] border-b border-[hsl(var(--border))] pb-2">
                ข้อมูลบัญชีผู้ใช้ (User Account)
              </h3>

              {isAuthenticated && user ? (
                /* Logged In View */
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-[hsl(var(--muted)/0.4)] border border-[hsl(var(--border))]">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-[#e65100] text-white flex items-center justify-center font-bold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[hsl(var(--foreground))]">
                          {user.name}
                        </h4>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          {user.email}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {user.role || "สมาชิก GML"}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm("คุณต้องการออกจากระบบหรือไม่?")) {
                          logout();
                        }
                      }}
                      leftIcon={<LogOut className="h-4 w-4" />}
                    >
                      ออกจากระบบ
                    </Button>
                  </div>
                </div>
              ) : (
                /* Logged Out View */
                <div className="p-6 rounded-2xl bg-[hsl(var(--muted)/0.3)] border border-[hsl(var(--border))] text-center space-y-3">
                  <User className="h-10 w-10 mx-auto text-slate-400" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      คุณยังไม่ได้เข้าสู่ระบบ
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      เข้าสู่ระบบด้วยบัญชี Google เพื่อใช้งานระบบ AI Chat เต็มรูปแบบและซิงค์ข้อมูลประวัติการสนทนา
                    </p>
                  </div>

                  <div className="pt-2 flex justify-center gap-2">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => openAuthModal("login")}
                      className="bg-[#0b57d0] hover:bg-[#0842a0] text-white rounded-full px-6"
                      leftIcon={<LogIn className="h-4 w-4" />}
                    >
                      เข้าสู่ระบบ / สมัครสมาชิก
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
