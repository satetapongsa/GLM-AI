"use client";

import React, { useState, useEffect } from "react";
import { BRAND_CONFIG } from "@/lib/config/brand";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useChatStore } from "@/lib/store/useChatStore";
import { LogIn, Sparkles, Code2, PenTool, BookOpen, ArrowUpRight } from "lucide-react";

export function WelcomeScreen() {
  const { isAuthenticated, openAuthModal } = useAuthStore();
  const { setComposerText } = useChatStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isUserAuth = mounted ? isAuthenticated : false;

  const quickPrompts = [
    {
      icon: <Sparkles className="h-4 w-4 text-sky-400" />,
      title: "สร้าง Prompt ภาพ AI",
      desc: "สร้างภาพเมืองไซเบอร์พังก์ หรือภาพวิวทิวทัศน์",
      promptText: "สร้างคำสั่ง Prompt ภาษาอังกฤษสำหรับสร้างภาพ Futuristic Cyberpunk City ยามค่ำคืน แสงนีออนสะท้อนพื้นถนน รายละเอียดสูง",
    },
    {
      icon: <Code2 className="h-4 w-4 text-emerald-400" />,
      title: "เขียนโค้ดและแก้บั๊ก",
      desc: "เขียนฟังก์ชัน หรืออธิบายโครงสร้างโค้ด",
      promptText: "ช่วยเขียนฟังก์ชันและอธิบายการทำงานของโค้ดให้กระชับและนำไปใช้งานได้ทันที",
    },
    {
      icon: <PenTool className="h-4 w-4 text-purple-400" />,
      title: "คิดไอเดีย & แคปชั่น",
      desc: "แคปชั่นโซเชียลมีเดีย หรือไอเดียคอนเทนต์ใหม่ๆ",
      promptText: "ช่วยคิดไอเดียแคปชั่นเปิดตัวโปรเจกต์ที่น่าสนใจ ดึงดูดสายตา และกระชับ ตรงประเด็น 3 แบบ",
    },
    {
      icon: <BookOpen className="h-4 w-4 text-amber-400" />,
      title: "สรุปข้อมูลกระชับ",
      desc: "ย่อยเนื้อหายาวให้เข้าใจง่ายใน 1 นาที",
      promptText: "ช่วยสรุปใจความสำคัญและประเด็นหลักของเรื่องนี้ให้กระชับ ตรงไปตรงมา และจำง่าย:",
    },
  ];

  const handleSelectPrompt = (text: string) => {
    setComposerText(text);
    // Focus the textarea
    const textarea = document.querySelector("textarea");
    if (textarea) {
      textarea.focus();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 pt-6 pb-2 max-w-2xl mx-auto select-none animate-fade-up">
      {/* Welcome Title */}
      <h1 className="text-[26px] sm:text-[30px] font-bold text-[#0b57d0] dark:text-[#38bdf8] leading-tight">
        {BRAND_CONFIG.welcomeTitle}
      </h1>

      {/* Subtitle */}
      <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-normal">
        {BRAND_CONFIG.welcomeSubtitle}
      </p>

      {/* Central Goomiru Supernova Crystal & Quantum Orbit Emblem */}
      <div className="my-5 relative flex items-center justify-center animate-soft-float">
        {/* Soft Ambient Glow Effect */}
        <div className="absolute h-32 w-32 rounded-full bg-gradient-to-tr from-blue-600/25 via-sky-400/20 to-purple-500/25 blur-2xl pointer-events-none" />

        <div className="relative h-24 w-24 sm:h-28 sm:w-28 drop-shadow-[0_0_30px_rgba(56,189,248,0.45)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.svg"
            alt="Goomairu AI Logo"
            className="w-full h-full object-contain select-none"
          />
        </div>
      </div>

      {/* Sign In CTA if not authenticated */}
      {!isUserAuth && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => openAuthModal("login")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <LogIn className="h-4 w-4" />
            <span>เข้าสู่ระบบด้วย Google เพื่อเริ่มใช้งาน</span>
          </button>
        </div>
      )}

      {/* Quick Prompt Cards Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left mt-2">
        {quickPrompts.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectPrompt(item.promptText)}
            className="flex items-start gap-3 p-3 rounded-2xl bg-white/60 dark:bg-[#1e1f20]/80 hover:bg-white dark:hover:bg-[#282a2c] border border-slate-200/80 dark:border-white/10 hover:border-blue-400 dark:hover:border-sky-500/40 transition-all cursor-pointer group shadow-xs hover:shadow-md active:scale-[0.98]"
          >
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 shrink-0 group-hover:scale-105 transition-transform">
              {item.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-500 dark:group-hover:text-sky-400 transition-colors">
                  {item.title}
                </span>
                <ArrowUpRight className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 font-normal">
                {item.desc}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
