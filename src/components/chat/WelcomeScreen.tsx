"use client";

import React, { useState, useEffect } from "react";
import { BRAND_CONFIG } from "@/lib/config/brand";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { LogIn } from "lucide-react";

export function WelcomeScreen() {
  const { isAuthenticated, openAuthModal } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isUserAuth = mounted ? isAuthenticated : false;

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 pt-8 pb-4 max-w-xl mx-auto select-none animate-fade-up">
      {/* Welcome Title */}
      <h1 className="text-[26px] sm:text-[30px] font-bold text-[#0b57d0] dark:text-[#38bdf8] leading-tight">
        {BRAND_CONFIG.welcomeTitle}
      </h1>

      {/* Subtitle */}
      <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-normal">
        {BRAND_CONFIG.welcomeSubtitle}
      </p>

      {/* Central Goomiru Supernova Crystal & Quantum Orbit Emblem */}
      <div className="my-7 relative flex items-center justify-center animate-soft-float">
        {/* Soft Ambient Glow Effect */}
        <div className="absolute h-36 w-36 rounded-full bg-gradient-to-tr from-blue-600/25 via-sky-400/20 to-purple-500/25 blur-2xl pointer-events-none" />

        <div className="relative h-28 w-28 sm:h-32 sm:w-32 drop-shadow-[0_0_30px_rgba(56,189,248,0.45)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.svg"
            alt="Goomiru Logo"
            className="w-full h-full object-contain select-none"
          />
        </div>
      </div>

      {/* Sign In CTA if not authenticated */}
      {!isUserAuth && (
        <div className="mt-1">
          <button
            type="button"
            onClick={() => openAuthModal("login")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <LogIn className="h-4 w-4" />
            <span>เข้าสู่ระบบด้วย Google หรือสมัครสมาชิกเพื่อเริ่มแชท</span>
          </button>
        </div>
      )}
    </div>
  );
}
