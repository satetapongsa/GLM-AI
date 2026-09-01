"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { signIn } from "next-auth/react";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  // Auto-close modal whenever user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && isAuthModalOpen) {
      closeAuthModal();
    }
  }, [isAuthenticated, isAuthModalOpen, closeAuthModal]);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (e) {
      console.error("Google OAuth error:", e);
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
      <div className="flex flex-col items-center text-center px-4 py-6 select-none space-y-5">
        {/* Top Logo */}
        <div className="pt-2">
          <BrandLogo size="lg" />
        </div>

        {/* Heading */}
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            ยินดีต้อนรับสู่ Goomiru AI
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            เข้าสู่ระบบด้วยบัญชี Google เพื่อเริ่มสนทนากับ AI ทุกโมเดล
          </p>
        </div>

        {/* Single Google Sign-in Button */}
        <div className="w-full max-w-[320px] pt-2">
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 h-12 px-5 rounded-2xl border border-slate-300 dark:border-white/10 bg-white hover:bg-slate-50 dark:bg-[#2b2c2e] dark:hover:bg-[#343538] text-[14px] font-semibold text-slate-800 dark:text-white transition-all cursor-pointer shadow-sm hover:shadow active:scale-[0.98]"
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
            <span>{isLoading ? "กำลังเชื่อมต่อ..." : "ดำเนินการต่อด้วย Google"}</span>
          </button>
        </div>

        {/* Bottom Version Note */}
        <div className="w-full max-w-[320px] pt-4 border-t border-slate-200 dark:border-white/5">
          <span className="text-[11px] text-slate-400">
            Goomiru AI v1.0.0 • ปลอดภัยด้วย Google OAuth
          </span>
        </div>
      </div>
    </Modal>
  );
}
