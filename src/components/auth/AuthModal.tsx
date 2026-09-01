"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { signIn } from "next-auth/react";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    isAuthenticated,
    loginWithGoogleAccount,
    login,
    register,
  } = useAuthStore();

  // Auto-close modal whenever user is authenticated
  useEffect(() => {
    if (isAuthenticated && isAuthModalOpen) {
      closeAuthModal();
    }
  }, [isAuthenticated, isAuthModalOpen, closeAuthModal]);

  const [isEmailMode, setIsEmailMode] = useState(false);
  const [emailMode, setEmailMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (e) {
      console.error("OAuth error, falling back:", e);
      await loginWithGoogleAccount("satetapongs@gmail.com", "satetapong sanguansuk");
      closeAuthModal();
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftAuth = async () => {
    setIsLoading(true);
    try {
      await login("user.microsoft@example.com");
      closeAuthModal();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleAuth = async () => {
    setIsLoading(true);
    try {
      await login("user.apple@example.com");
      closeAuthModal();
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
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
      setIsEmailMode(false);
    } catch {
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
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
      <div className="flex flex-col items-center text-center px-3 py-4 space-y-6 select-none">
        {/* Top Logo */}
        <div className="pt-2">
          <BrandLogo size="lg" />
        </div>

        {/* Sub-heading */}
        <h3 className="text-[14.5px] font-medium text-slate-800 dark:text-slate-100">
          เข้าสู่ระบบหรือสมัครสมาชิก
        </h3>

        {!isEmailMode ? (
          /* Social Sign-in Buttons */
          <div className="w-full space-y-3 pt-1 max-w-[340px]">
            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 h-11 px-5 rounded-full border border-slate-300 bg-white hover:bg-slate-100 text-[13.5px] font-semibold text-slate-900 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
            >
              {/* Google Colorful G Icon */}
              <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24">
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
              <span className="text-slate-900 font-semibold">
                {isLoading ? "กำลังเข้าสู่ระบบ..." : "ดำเนินการต่อด้วย Google"}
              </span>
            </button>

            {/* Microsoft Button */}
            <button
              type="button"
              onClick={handleMicrosoftAuth}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 h-11 px-5 rounded-full border border-slate-300 bg-white hover:bg-slate-100 text-[13.5px] font-semibold text-slate-900 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
            >
              {/* Microsoft 4-Color Grid Icon */}
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 21 21">
                <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
              </svg>
              <span className="text-slate-900 font-semibold">ดำเนินการต่อด้วย Microsoft</span>
            </button>

            {/* Apple Button */}
            <button
              type="button"
              onClick={handleAppleAuth}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 h-11 px-5 rounded-full border border-slate-300 bg-white hover:bg-slate-100 text-[13.5px] font-semibold text-slate-900 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
            >
              {/* Apple Icon */}
              <svg className="h-4.5 w-4.5 shrink-0 fill-slate-900" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.7-7.88-12-14.52-6.53-10.15-11.75-21.75-15.66-34.8-3.92-13.06-5.88-25.2-5.88-36.43 0-14.16 3.65-26.04 10.95-35.63 7.3-9.59 16.27-14.46 26.91-14.62 4.8-.13 10.17 1.25 16.12 4.13 5.95 2.89 9.87 4.39 11.77 4.49 1.5.09 5.64-1.44 12.42-4.59 6.78-3.15 12.33-4.54 16.65-4.17 12.5.94 22.56 5.56 30.17 13.88-10.95 6.63-16.32 15.64-16.12 27.02.2 9.07 3.67 16.8 10.42 23.2 6.75 6.4 14.86 10.02 24.33 10.87-2.12 6.53-4.63 13.08-7.53 19.67zm-32.34-114.6c.11-2.92-.35-5.91-1.38-8.98-1.03-3.07-2.61-5.95-4.73-8.63-2.61-3.26-5.78-5.71-9.5-7.35-3.73-1.63-7.5-2.52-11.31-2.69-.11 2.92.35 5.86 1.38 8.83 1.03 2.97 2.66 5.82 4.88 8.56 2.5 3.04 5.66 5.42 9.49 7.15 3.82 1.72 7.56 2.76 11.17 3.11z" />
              </svg>
              <span className="text-slate-900 font-semibold">ดำเนินการต่อด้วย Apple</span>
            </button>

            {/* Email alternative toggle */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsEmailMode(true)}
                className="text-[12px] font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer underline underline-offset-4"
              >
                หรือใช้อีเมลและรหัสผ่าน
              </button>
            </div>
          </div>
        ) : (
          /* Email / Password Form View */
          <form onSubmit={handleEmailSubmit} className="w-full max-w-[340px] space-y-3 text-left">
            {error && (
              <div className="p-2 rounded-lg bg-red-50 text-red-600 text-xs">{error}</div>
            )}

            {emailMode === "register" && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">ชื่อของคุณ</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="เช่น satetapong"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">อีเมล</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">รหัสผ่าน</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="รหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full h-10 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer mt-2"
            >
              {isLoading ? "กำลังประมวลผล..." : emailMode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </button>

            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
              <button
                type="button"
                onClick={() => setIsEmailMode(false)}
                className="hover:underline cursor-pointer"
              >
                ← ย้อนกลับ
              </button>
              <button
                type="button"
                onClick={() => setEmailMode(emailMode === "login" ? "register" : "login")}
                className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
              >
                {emailMode === "login" ? "ยังไม่มีบัญชี? สมัครสมาชิก" : "มีบัญชีแล้ว? เข้าสู่ระบบ"}
              </button>
            </div>
          </form>
        )}

        {/* Bottom Divider and Version 1.0.0 */}
        <div className="w-full max-w-[340px] pt-4">
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
            <span className="text-[12px] text-slate-500 dark:text-slate-400">
              เวอร์ชั่น 1.0.0
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
