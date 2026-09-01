"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { AdminDashboardView } from "@/components/admin/AdminDashboardView";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

function SecretAdminContent() {
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isRedFlashing, setIsRedFlashing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the password input on mount
  useEffect(() => {
    if (!isUnlocked && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isUnlocked]);

  const triggerErrorEffect = (msg: string) => {
    setErrorMessage(msg);
    setIsShaking(true);
    setIsRedFlashing(true);
    setTimeout(() => setIsShaking(false), 450);
    setTimeout(() => setIsRedFlashing(false), 800);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // If user attempts to click empty space to bypass or dismiss
    if (e.target === e.currentTarget) {
      triggerErrorEffect("พื้นที่นี้ถูกล็อคความปลอดภัย ต้องใส่รหัสผ่านเพื่อเข้าดูข้อมูล");
    }
  };

  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordInput.trim()) {
      triggerErrorEffect("กรุณาป้อนรหัสผ่านก่อนเข้าสู่ระบบ");
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      // Secure server-side validation - NO passwords stored in client code
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput.trim() }),
      });

      const data = await res.json();

      if (data.success && data.token) {
        // Authenticated successfully by server
        setIsUnlocked(true);
        sessionStorage.setItem("gml_admin_token", data.token);
        setErrorMessage(null);
      } else {
        triggerErrorEffect(data.error || "รหัสผ่านไม่ถูกต้อง ไม่อนุญาตให้เข้าถึงแดชบอร์ด");
        setPasswordInput("");
      }
    } catch {
      triggerErrorEffect("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์เพื่อยืนยันรหัสผ่าน");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLockScreen = () => {
    setIsUnlocked(false);
    setPasswordInput("");
    setErrorMessage(null);
    sessionStorage.removeItem("gml_admin_token");
  };

  // LOCKED STATE: Fullscreen impenetrable security modal
  if (!isUnlocked) {
    return (
      <div
        onClick={handleBackdropClick}
        className={cn(
          "min-h-screen w-screen bg-[#0d0e10] text-[#f1f5f9] flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-300",
          isRedFlashing ? "bg-red-950/20" : "bg-[#0d0e10]"
        )}
      >
        {/* Subtle glowing ambient backdrop */}
        <div
          className={cn(
            "absolute -top-40 left-1/2 -translate-x-1/2 w-[550px] h-[550px] rounded-full blur-[120px] pointer-events-none transition-all duration-500",
            isRedFlashing
              ? "bg-red-600/30"
              : "bg-emerald-600/10"
          )}
        />

        {/* The Security Gate Modal Box */}
        <div
          className={cn(
            "max-w-md w-full p-7 sm:p-8 rounded-3xl bg-[#18191b] border shadow-2xl space-y-6 text-center transition-all duration-300 relative z-10",
            isShaking && "animate-shake",
            isRedFlashing
              ? "border-red-500 ring-4 ring-red-500/40 bg-[#1c1214] shadow-red-500/20"
              : "border-white/10 shadow-black/80"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Security Icon Badge */}
          <div
            className={cn(
              "h-16 w-16 mx-auto rounded-2xl flex items-center justify-center transition-all duration-300 border shadow-inner",
              isRedFlashing
                ? "bg-red-500/20 border-red-500/50 text-red-400 scale-105"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            )}
          >
            {isRedFlashing ? (
              <ShieldAlert className="h-8 w-8 animate-pulse text-red-400" />
            ) : (
              <Lock className="h-8 w-8 text-emerald-400" />
            )}
          </div>

          <div>
            <h1 className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <span>พื้นที่ลับควบคุมแอดมิน</span>
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              หน้านี้ถูกป้องกันด้วยระบบยืนยันตัวตนเซิร์ฟเวอร์ กรุณาใส่รหัสผ่านเพื่อเข้าใช้งาน
            </p>
          </div>

          {/* Password Entry Form */}
          <form onSubmit={handleUnlockSubmit} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 block">
                รหัสผ่านลับแอดมิน (Admin Passphrase)
              </label>
              <div className="relative">
                <KeyRound
                  className={cn(
                    "h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors",
                    isRedFlashing ? "text-red-400" : "text-slate-500"
                  )}
                />
                <input
                  ref={inputRef}
                  type={showPassword ? "text" : "password"}
                  placeholder="ป้อนรหัสผ่านลับ..."
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className={cn(
                    "w-full pl-10 pr-10 py-3 rounded-xl bg-[#111214] text-white text-sm border focus:outline-none transition-all placeholder:text-slate-600 font-mono",
                    isRedFlashing
                      ? "border-red-500 ring-2 ring-red-500/30 text-red-200"
                      : "border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  )}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white transition-colors cursor-pointer"
                  title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error message banner */}
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 font-medium animate-fade-up">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className={cn(
                "w-full py-3 rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98",
                isRedFlashing
                  ? "bg-red-600 hover:bg-red-500 text-white shadow-red-600/30"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
              )}
            >
              {isVerifying ? (
                <span className="animate-pulse">กำลังตรวจสอบรหัสผ่าน...</span>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  <span>ปลดล็อคเข้าสู่แดชบอร์ด</span>
                </>
              )}
            </button>
          </form>

          {/* Safe exit link to public main app */}
          <div className="pt-2 border-t border-white/5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>กลับสู่หน้าหลัก Goomairu AI</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // UNLOCKED STATE: Full Admin Dashboard
  return (
    <div className="min-h-screen bg-[#131314] text-[#f1f5f9] flex flex-col">
      {/* Top Secret Admin Bar */}
      <header className="h-14 border-b border-white/10 bg-[#1e1f20]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>กลับหน้าแชทหลัก</span>
          </Link>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 font-mono tracking-wider">
              ADMIN SESSION ACTIVE
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLockScreen}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/30 hover:bg-red-900/50 text-red-300 border border-red-500/30 text-xs font-semibold transition-all cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>ล็อคหน้าจอ</span>
        </button>
      </header>

      {/* Secret Admin Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        <AdminDashboardView />
      </main>
    </div>
  );
}

export default function SecretAdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">กำลังโหลดระบบความปลอดภัย...</div>}>
      <SecretAdminContent />
    </Suspense>
  );
}
