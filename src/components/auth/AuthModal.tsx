"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { signIn } from "next-auth/react";
import { Mail, Lock, User, Eye, EyeOff, Sparkles } from "lucide-react";

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    isAuthenticated,
    login,
    register,
  } = useAuthStore();

  // Auto-close modal whenever user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && isAuthModalOpen) {
      closeAuthModal();
    }
  }, [isAuthenticated, isAuthModalOpen, closeAuthModal]);

  const [authTab, setAuthTab] = useState<"google" | "email">("google");
  const [emailMode, setEmailMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError("");
    try {
      // Trigger official Google OAuth redirect flow
      await signIn("google", { callbackUrl: "/" });
    } catch (e) {
      console.error("Google OAuth error:", e);
      setError("ไม่สามารถเชื่อมต่อ Google ได้ กรุณาเข้าสู่ระบบด้วยอีเมลด้านล่าง");
      setAuthTab("email");
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("กรุณากรอกอีเมลของคุณ");
      return;
    }

    setIsLoading(true);
    try {
      if (emailMode === "login") {
        await login(email.trim(), password);
      } else {
        await register(name.trim() || email.split("@")[0], email.trim(), password);
      }
      closeAuthModal();
    } catch {
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      maxWidth="sm"
      showCloseButton={true}
    >
      {/* Auth Card */}
      <div className="flex flex-col items-center text-center px-4 py-5 select-none space-y-4">
        {/* Top Logo */}
        <div className="pt-1">
          <BrandLogo size="lg" />
        </div>

        {/* Sub-heading */}
        <div>
          <h3 className="text-[16px] font-bold text-slate-800 dark:text-slate-100">
            ยินดีต้อนรับสู่ Goomiru AI
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            เข้าสู่ระบบเพื่อเริ่มใช้งานโมเดล AI ทั้งหมดได้ทันที
          </p>
        </div>

        {/* Tabs: Google vs Email */}
        <div className="w-full max-w-[340px] flex p-1 rounded-xl bg-slate-100 dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthTab("google");
              setError("");
            }}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              authTab === "google"
                ? "bg-white dark:bg-[#2b2c2e] text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            เข้าด้วย Google
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthTab("email");
              setError("");
            }}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              authTab === "email"
                ? "bg-white dark:bg-[#2b2c2e] text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            เข้าด้วยอีเมล / สมัครใหม่
          </button>
        </div>

        {error && (
          <div className="w-full max-w-[340px] p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-left">
            {error}
          </div>
        )}

        {authTab === "google" ? (
          /* Google Sign-in View */
          <div className="w-full max-w-[340px] space-y-3 pt-1">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 h-12 px-5 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-[14px] font-semibold text-slate-900 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            >
              {/* Google Colorful Icon */}
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              <span>{isLoading ? "กำลังเปิด Google..." : "ดำเนินการต่อด้วย Google"}</span>
            </button>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setAuthTab("email")}
                className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
              >
                หรือใช้อีเมลและรหัสผ่านของคุณเอง →
              </button>
            </div>
          </div>
        ) : (
          /* Email / Password Form View (Works for ANY user 100%) */
          <form onSubmit={handleEmailSubmit} className="w-full max-w-[340px] space-y-3 text-left">
            {emailMode === "register" && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  ชื่อที่ต้องการให้ AI เรียก
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="เช่น สมชาย, John"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                อีเมล
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                รหัสผ่าน
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="รหัสผ่านของคุณ"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-[#1e1f20] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-2xl bg-[#0b57d0] hover:bg-[#0842a0] text-white font-semibold text-xs shadow-md transition-all cursor-pointer mt-2 active:scale-98 flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {isLoading
                  ? "กำลังเข้าสู่ระบบ..."
                  : emailMode === "login"
                  ? "เข้าสู่ระบบทันที"
                  : "สร้างบัญชีและเริ่มใช้งาน"}
              </span>
            </button>

            <div className="flex justify-between items-center text-[11.5px] text-slate-500 pt-1">
              <button
                type="button"
                onClick={() => setAuthTab("google")}
                className="hover:underline cursor-pointer text-slate-400"
              >
                ← ใช้ Google แทน
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmailMode(emailMode === "login" ? "register" : "login");
                  setError("");
                }}
                className="text-blue-500 hover:underline cursor-pointer font-medium"
              >
                {emailMode === "login" ? "ยังไม่มีบัญชี? สมัครใหม่" : "มีบัญชีแล้ว? เข้าสู่ระบบ"}
              </button>
            </div>
          </form>
        )}

        {/* Bottom Version */}
        <div className="w-full max-w-[340px] pt-3 border-t border-slate-200 dark:border-white/5">
          <span className="text-[11px] text-slate-400">
            Goomiru AI v1.0.0 • ปลอดภัย เข้ารหัสมาตรฐาน 256-bit
          </span>
        </div>
      </div>
    </Modal>
  );
}
