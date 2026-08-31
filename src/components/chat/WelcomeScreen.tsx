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

      {/* Central GML 4-Pointed AI Diamond Star with Floating Orb */}
      <div className="my-6 relative flex items-center justify-center animate-soft-float">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-28 w-28 text-[#0b57d0] drop-shadow-sm"
        >
          {/* Main 4-pointed diamond star */}
          <path
            d="M50 8C50 30 70 50 92 50C70 50 50 70 50 92C50 70 30 50 8 50C30 50 50 30 50 8Z"
            fill="url(#sparkle-grad)"
          />
          {/* Floating Orb at top right */}
          <circle cx="78" cy="22" r="5.5" fill="#0b57d0" />

          <defs>
            <linearGradient id="sparkle-grad" x1="8" y1="8" x2="92" y2="92" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0842a0" />
              <stop offset="0.5" stopColor="#0b57d0" />
              <stop offset="1" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
        </svg>
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
