"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { AdminDashboardView } from "@/components/admin/AdminDashboardView";
import { ShieldCheck, Lock, ArrowLeft, KeyRound, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";

const VALID_SECRET_KEYS = ["satetapongs", "gml2026", "admin", "satetapong sanguansuk"];

function SecretAdminContent() {
  const searchParams = useSearchParams();
  const [inputKey, setInputKey] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Check if key is passed via URL ?key=... or ?secret=...
    const urlKey = searchParams.get("key") || searchParams.get("secret");
    const storedAuth = typeof window !== "undefined" ? sessionStorage.getItem("gml_admin_unlocked") : null;

    if (urlKey && VALID_SECRET_KEYS.includes(urlKey.toLowerCase())) {
      setIsUnlocked(true);
      sessionStorage.setItem("gml_admin_unlocked", "true");
    } else if (storedAuth === "true") {
      setIsUnlocked(true);
    }
  }, [searchParams]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (VALID_SECRET_KEYS.includes(inputKey.trim().toLowerCase())) {
      setIsUnlocked(true);
      sessionStorage.setItem("gml_admin_unlocked", "true");
      setErrorMessage("");
    } else {
      setErrorMessage("รหัสผ่านลับไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
    }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#131314] text-[#f1f5f9] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#1e1f20] border border-white/10 shadow-2xl space-y-6 text-center">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Lock className="h-8 w-8" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <span>พื้นที่ลับเฉพาะแอดมิน</span>
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              หน้านี้ถูกซ่อนจากสาธารณะ กรุณาป้อนรหัสลับเพื่อเข้าสู่แดชบอร์ดแอดมิน
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-3 text-left">
            <div className="relative">
              <KeyRound className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                placeholder="ป้อนรหัสลับแอดมิน..."
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setErrorMessage("");
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#131314] text-white text-sm border border-white/10 focus:border-emerald-500 focus:outline-none placeholder:text-slate-600"
                autoFocus
              />
            </div>

            {errorMessage && (
              <p className="text-xs text-red-400 text-center font-medium">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer active:scale-98"
            >
              ปลดล็อคเข้าสู่แดชบอร์ด
            </button>
          </form>

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

  return (
    <div className="min-h-screen bg-[#131314] text-[#f1f5f9] flex flex-col">
      {/* Top Secret Header Bar */}
      <header className="h-14 border-b border-white/10 bg-[#1e1f20]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
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
              SECRET ADMIN ACCESS GRANTED
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem("gml_admin_unlocked");
            setIsUnlocked(false);
          }}
          className="text-xs text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
        >
          ล็อคหน้าต่าง
        </button>
      </header>

      {/* Secret Admin Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
        <AdminDashboardView />
      </main>
    </div>
  );
}

export default function SecretAdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">กำลังโหลด...</div>}>
      <SecretAdminContent />
    </Suspense>
  );
}
