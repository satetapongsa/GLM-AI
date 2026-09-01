"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  BarChart3,
  RefreshCw,
  Search,
  MessageSquare,
  Crown,
  Ban,
  Users,
  Plus,
  Minus,
  Database,
  Globe,
  Copy,
  Check,
  UserCheck,
  User,
  Folder,
  FileText,
  Zap,
  Shield,
  Clock,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function AdminDashboardView() {
  // Navigation Subtab within Admin Portal
  const [adminViewTab, setAdminViewTab] = useState<"users" | "stream" | "database">("users");

  // Admin Dashboard State
  const [adminStats, setAdminStats] = useState<{
    totalPrompts: number;
    todayPrompts: number;
    totalUsers: number;
    modelUsage: { modelId: string; count: number }[];
    recentPrompts: {
      id: number;
      userEmail: string;
      prompt: string;
      modelId: string;
      ipAddress: string;
      createdAt: string;
    }[];
  } | null>(null);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
  const [adminSearch, setAdminSearch] = useState("");

  // Admin Users Management State
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userActionLoading, setUserActionLoading] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");

  // Per-User Profile & Questions Modal State
  const [viewingUserProfile, setViewingUserProfile] = useState<any | null>(null);
  const [userQuestionsList, setUserQuestionsList] = useState<any[]>([]);
  const [isLoadingUserQuestions, setIsLoadingUserQuestions] = useState(false);
  const [questionSearchFilter, setQuestionSearchFilter] = useState("");

  // Database Explorer State
  const [selectedDbTable, setSelectedDbTable] = useState<string>("users");
  const [dbData, setDbData] = useState<{
    tableCounts: Record<string, number>;
    rows: any[];
    currentTable: string;
    totalRowsInView: number;
  } | null>(null);
  const [isLoadingDbData, setIsLoadingDbData] = useState(false);
  const [dbSearchFilter, setDbSearchFilter] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const getAdminHeaders = () => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("gml_admin_token") || "" : "";
    return {
      "Content-Type": "application/json",
      "x-admin-token": token,
    };
  };

  const fetchAdminStats = async () => {
    setIsLoadingAdmin(true);
    try {
      const res = await fetch("/api/admin/stats", {
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (data.success && data.stats) {
        setAdminStats(data.stats);
      }
    } catch (e) {
      console.error("Error fetching admin stats:", e);
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  const fetchAdminUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users", {
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (data.success && data.users) {
        setAdminUsers(data.users);
      }
    } catch (e) {
      console.error("Error fetching admin users:", e);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchDbData = async (table = selectedDbTable) => {
    setIsLoadingDbData(true);
    setSelectedDbTable(table);
    try {
      const res = await fetch(`/api/admin/database?table=${encodeURIComponent(table)}`, {
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setDbData(data);
      }
    } catch (e) {
      console.error("Error fetching database explorer data:", e);
    } finally {
      setIsLoadingDbData(false);
    }
  };

  const handleOpenUserProfile = async (targetUser: any) => {
    setViewingUserProfile(targetUser);
    setIsLoadingUserQuestions(true);
    setQuestionSearchFilter("");
    try {
      const res = await fetch(`/api/admin/questions?email=${encodeURIComponent(targetUser.email)}`, {
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (data.success && data.questions) {
        setUserQuestionsList(data.questions);
      } else {
        setUserQuestionsList([]);
      }
    } catch (e) {
      console.error("Error fetching user questions:", e);
      setUserQuestionsList([]);
    } finally {
      setIsLoadingUserQuestions(false);
    }
  };

  const handleToggleOp = async (targetUser: any) => {
    setUserActionLoading(targetUser.id);
    try {
      const nextVal = !targetUser.is_op;
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: getAdminHeaders(),
        body: JSON.stringify({
          userId: targetUser.id,
          action: "toggle_op",
          value: nextVal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminUsers((prev) =>
          prev.map((u) =>
            u.id === targetUser.id ? { ...u, is_op: nextVal, role: nextVal ? "admin" : "user" } : u
          )
        );
        if (viewingUserProfile?.id === targetUser.id) {
          setViewingUserProfile((prev: any) => ({ ...prev, is_op: nextVal }));
        }
      }
    } catch (e) {
      console.error("Failed to toggle OP:", e);
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleToggleSuspend = async (targetUser: any) => {
    setUserActionLoading(targetUser.id);
    try {
      const nextVal = !targetUser.is_suspended;
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: getAdminHeaders(),
        body: JSON.stringify({
          userId: targetUser.id,
          action: "toggle_suspend",
          value: nextVal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminUsers((prev) =>
          prev.map((u) =>
            u.id === targetUser.id ? { ...u, is_suspended: nextVal } : u
          )
        );
        if (viewingUserProfile?.id === targetUser.id) {
          setViewingUserProfile((prev: any) => ({ ...prev, is_suspended: nextVal }));
        }
      }
    } catch (e) {
      console.error("Failed to toggle suspend:", e);
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleSetTokens = async (targetUser: any, delta: number) => {
    setUserActionLoading(targetUser.id);
    const currentLimit = targetUser.custom_daily_limit || 1000;
    const newLimit = Math.max(0, currentLimit + delta);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: getAdminHeaders(),
        body: JSON.stringify({
          userId: targetUser.id,
          action: "set_tokens",
          value: newLimit,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminUsers((prev) =>
          prev.map((u) =>
            u.id === targetUser.id ? { ...u, custom_daily_limit: newLimit } : u
          )
        );
        if (viewingUserProfile?.id === targetUser.id) {
          setViewingUserProfile((prev: any) => ({ ...prev, custom_daily_limit: newLimit }));
        }
      }
    } catch (e) {
      console.error("Failed to set tokens:", e);
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  useEffect(() => {
    fetchAdminStats();
    fetchAdminUsers();
    fetchDbData();
  }, []);

  return (
    <div className="space-y-6 text-[#f1f5f9]">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>แดชบอร์ดควบคุมแอดมิน (Admin Master Center)</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase">
                  Live Neon DB
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                ตรวจสอบข้อมูลผู้ใช้งานรายบุคคล ดู IP Address ของแต่ละคน และดูประวัติคำถามเป็นตาราง
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isLoadingAdmin || isLoadingUsers}
            onClick={() => {
              fetchAdminStats();
              fetchAdminUsers();
              fetchDbData(selectedDbTable);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#282a2c] hover:bg-[#333538] text-slate-200 border border-white/10 transition-colors cursor-pointer shrink-0 shadow-sm active:scale-95"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", (isLoadingAdmin || isLoadingUsers) && "animate-spin text-emerald-400")} />
            <span>รีเฟรชข้อมูลทั้งหมด</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#1e1f20] border border-white/10 space-y-1 relative overflow-hidden">
          <div className="absolute right-3 top-3 opacity-10">
            <Users className="h-10 w-10 text-sky-400" />
          </div>
          <span className="text-xs text-slate-400 font-medium">ผู้ใช้งานทั้งหมด</span>
          <div className="text-2xl font-black text-white">
            {adminStats ? adminStats.totalUsers.toLocaleString() : adminUsers.length || "..."}
          </div>
          <span className="text-[10px] text-sky-400 font-medium">แยกเก็บโปรไฟล์รายบุคคล</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#1e1f20] border border-white/10 space-y-1 relative overflow-hidden">
          <div className="absolute right-3 top-3 opacity-10">
            <MessageSquare className="h-10 w-10 text-emerald-400" />
          </div>
          <span className="text-xs text-slate-400 font-medium">คำถามสะสมในระบบ</span>
          <div className="text-2xl font-black text-emerald-400">
            {adminStats ? adminStats.totalPrompts.toLocaleString() : "..."}
          </div>
          <span className="text-[10px] text-slate-400">บันทึกทุก Prompt ลง Neon DB</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#1e1f20] border border-white/10 space-y-1 relative overflow-hidden">
          <div className="absolute right-3 top-3 opacity-10">
            <Clock className="h-10 w-10 text-amber-400" />
          </div>
          <span className="text-xs text-slate-400 font-medium">คำถามวันนี้</span>
          <div className="text-2xl font-black text-amber-400">
            {adminStats ? adminStats.todayPrompts.toLocaleString() : "..."}
          </div>
          <span className="text-[10px] text-slate-400">คำนวณตามเวลาไทย ICT</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#1e1f20] border border-white/10 space-y-1 relative overflow-hidden">
          <div className="absolute right-3 top-3 opacity-10">
            <Globe className="h-10 w-10 text-purple-400" />
          </div>
          <span className="text-xs text-slate-400 font-medium">ระบบจับ IP รายคน</span>
          <div className="text-base font-bold text-purple-300 mt-1 truncate">
            Active Real-time
          </div>
          <span className="text-[10px] text-emerald-400">ซิงค์อัตโนมัติทุกแชท</span>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#1a1b1c] border border-white/10 w-fit">
        <button
          type="button"
          onClick={() => setAdminViewTab("users")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
            adminViewTab === "users"
              ? "bg-emerald-600 text-white shadow-md"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          )}
        >
          <Users className="h-4 w-4" />
          <span>ตารางข้อมูลผู้ใช้งาน & IP ({adminUsers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminViewTab("stream")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
            adminViewTab === "stream"
              ? "bg-sky-600 text-white shadow-md"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          )}
        >
          <MessageSquare className="h-4 w-4" />
          <span>สตรีมคำถามสด (Live Stream)</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminViewTab("database")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
            adminViewTab === "database"
              ? "bg-purple-600 text-white shadow-md"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          )}
        >
          <Database className="h-4 w-4" />
          <span>Neon Live Database Explorer</span>
        </button>
      </div>

      {/* TAB 1: USERS & PROFILES TABLE VIEW (แยกข้อมูลเป็นคนๆ กดดูโปรไฟล์และไอพี) */}
      {adminViewTab === "users" && (
        <div className="p-5 rounded-3xl bg-[#1e1f20] border border-white/10 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-400" />
                <span>รายชื่อผู้ใช้งานทั้งหมดในระบบ (User Directory & IP Master Table)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                คลิกที่ปุ่ม <span className="text-sky-400 font-semibold">"ดูโปรไฟล์ & ประวัติคำถาม"</span> หรือคลิกที่แถวเพื่อเปิดดูข้อมูลคำถามของคนนั้นแบบตาราง
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, อีเมล หรือ IP Address..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#131314] text-white text-xs border border-white/10 focus:border-emerald-500 focus:outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* User Master Table */}
          <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#131314]">
            {isLoadingUsers ? (
              <div className="py-16 text-center text-xs text-slate-500">
                <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-emerald-400" />
                กำลังโหลดรายชื่อผู้ใช้จาก Neon PostgreSQL...
              </div>
            ) : adminUsers.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500 italic">
                ยังไม่มีข้อมูลผู้ใช้ในระบบ
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#242628] border-b border-white/10 text-slate-300 font-sans text-xs">
                    <tr>
                      <th className="px-4 py-3 font-semibold">ผู้ใช้งาน</th>
                      <th className="px-4 py-3 font-semibold">อีเมล (Email)</th>
                      <th className="px-4 py-3 font-semibold">
                        <span className="inline-flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5 text-sky-400" />
                          <span>IP Address ล่าสุด</span>
                        </span>
                      </th>
                      <th className="px-4 py-3 font-semibold text-center">คำถามทั้งหมด</th>
                      <th className="px-4 py-3 font-semibold text-center">สถานะ</th>
                      <th className="px-4 py-3 font-semibold text-center">โควต้าโทเคน</th>
                      <th className="px-4 py-3 font-semibold">เข้าใช้ล่าสุด</th>
                      <th className="px-4 py-3 font-semibold text-right">แอคชั่น / จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {adminUsers
                      .filter((u) => {
                        if (!userSearch.trim()) return true;
                        const q = userSearch.toLowerCase();
                        return (
                          (u.email && u.email.toLowerCase().includes(q)) ||
                          (u.name && u.name.toLowerCase().includes(q)) ||
                          (u.last_ip_address && u.last_ip_address.toLowerCase().includes(q))
                        );
                      })
                      .map((u) => {
                        const isActionActive = userActionLoading === u.id;
                        return (
                          <tr
                            key={u.id}
                            className={cn(
                              "hover:bg-white/[0.04] transition-colors group cursor-pointer",
                              u.is_suspended && "bg-red-950/20",
                              u.is_op && "bg-amber-950/15"
                            )}
                            onClick={() => handleOpenUserProfile(u)}
                          >
                            {/* User column */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 text-white font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden border border-white/10">
                                  {u.avatar ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={u.avatar} alt={u.name || "User"} className="h-full w-full object-cover" />
                                  ) : (
                                    (u.name || u.email || "U")[0].toUpperCase()
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-white truncate max-w-[140px]">
                                    {u.name || "ผู้ใช้งาน"}
                                  </div>
                                  <span className="text-[10px] text-slate-400 capitalize">
                                    {u.auth_provider || "email"}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Email column */}
                            <td className="px-4 py-3 font-mono text-xs text-slate-300">
                              <div className="flex items-center gap-1.5">
                                <span>{u.email}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(u.email);
                                  }}
                                  className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                                  title="คัดลอกอีเมล"
                                >
                                  {copiedText === u.email ? (
                                    <Check className="h-3 w-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                              </div>
                            </td>

                            {/* IP Address column */}
                            <td className="px-4 py-3">
                              {u.last_ip_address ? (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30 font-mono text-xs font-semibold">
                                  <Globe className="h-3 w-3" />
                                  <span>{u.last_ip_address}</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopy(u.last_ip_address);
                                    }}
                                    className="ml-1 p-0.5 rounded hover:bg-sky-500/20 text-sky-400 hover:text-white"
                                    title="คัดลอก IP Address"
                                  >
                                    {copiedText === u.last_ip_address ? (
                                      <Check className="h-2.5 w-2.5 text-emerald-400" />
                                    ) : (
                                      <Copy className="h-2.5 w-2.5" />
                                    )}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-slate-500 font-mono text-xs">-</span>
                              )}
                            </td>

                            {/* Prompt Count column */}
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/30">
                                <MessageSquare className="h-3 w-3" />
                                <span>{u.total_prompts ? Number(u.total_prompts).toLocaleString() : "0"}</span>
                              </span>
                            </td>

                            {/* Status column */}
                            <td className="px-4 py-3 text-center">
                              {u.is_suspended ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/40 text-[10.5px] font-bold">
                                  <Ban className="h-3 w-3" />
                                  <span>ถูกระงับ</span>
                                </span>
                              ) : u.is_op ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10.5px] font-bold">
                                  <Crown className="h-3 w-3" />
                                  <span>OP Admin</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-white/10 text-[10.5px] font-medium">
                                  <span>ผู้ใช้ทั่วไป</span>
                                </span>
                              )}
                            </td>

                            {/* Token Quota column */}
                            <td className="px-4 py-3 text-center font-mono font-bold text-emerald-400">
                              {(u.custom_daily_limit || 1000).toLocaleString()}
                            </td>

                            {/* Last Active column */}
                            <td className="px-4 py-3 text-slate-400 text-[11px]">
                              {u.last_prompt_at ? (
                                new Date(u.last_prompt_at).toLocaleString("th-TH", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })
                              ) : u.created_at ? (
                                new Date(u.created_at).toLocaleString("th-TH", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })
                              ) : (
                                "-"
                              )}
                            </td>

                            {/* Action Buttons column */}
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => handleOpenUserProfile(u)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                                  title="เปิดดูโปรไฟล์และประวัติคำถามเป็นตาราง"
                                >
                                  <Search className="h-3 w-3" />
                                  <span>ดูโปรไฟล์</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={isActionActive}
                                  onClick={() => handleToggleOp(u)}
                                  className={cn(
                                    "p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border active:scale-95",
                                    u.is_op
                                      ? "bg-amber-500 text-black border-amber-400 font-bold"
                                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-white/10"
                                  )}
                                  title={u.is_op ? "ถอดสิทธิ์ OP (/deop)" : "ให้สิทธิ์ OP (/op)"}
                                >
                                  <Crown className="h-3.5 w-3.5" />
                                </button>

                                <button
                                  type="button"
                                  disabled={isActionActive}
                                  onClick={() => handleToggleSuspend(u)}
                                  className={cn(
                                    "p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border active:scale-95",
                                    u.is_suspended
                                      ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500"
                                      : "bg-red-950/40 hover:bg-red-900/60 text-red-300 border-red-500/30"
                                  )}
                                  title={u.is_suspended ? "ปลดระงับบัญชี" : "สั่งระงับบัญชี (Ban)"}
                                >
                                  <Ban className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE PROMPTS STREAM */}
      {adminViewTab === "stream" && (
        <div className="p-5 rounded-3xl bg-[#1e1f20] border border-white/10 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-sky-400" />
                <span>คำถามล่าสุดของผู้ใช้ทั้งหมด (Live Prompts Stream)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                ติดตามคำถามสดๆ ที่ส่งเข้ามาจากผู้ใช้ทุกคนในระบบ
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="ค้นหาข้อความ/อีเมล/ไอพี..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#131314] text-white text-xs border border-white/10 focus:border-sky-500 focus:outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="max-h-[65vh] overflow-y-auto space-y-2.5 pr-1">
            {adminStats?.recentPrompts && adminStats.recentPrompts.length > 0 ? (
              adminStats.recentPrompts
                .filter((p) => {
                  if (!adminSearch.trim()) return true;
                  const query = adminSearch.toLowerCase();
                  return (
                    p.prompt.toLowerCase().includes(query) ||
                    p.userEmail.toLowerCase().includes(query) ||
                    (p.ipAddress && p.ipAddress.toLowerCase().includes(query))
                  );
                })
                .map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl bg-[#131314] border border-white/5 space-y-2 hover:border-white/15 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-200 font-bold">{p.userEmail}</span>
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-mono border border-blue-500/20">
                          {p.modelId}
                        </span>
                        {p.ipAddress && p.ipAddress !== "unknown" && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[10px] font-mono">
                            <Globe className="h-2.5 w-2.5" />
                            <span>{p.ipAddress}</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {new Date(p.createdAt).toLocaleTimeString("th-TH", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-slate-200 text-xs font-sans leading-relaxed bg-[#1a1b1c] p-3 rounded-xl border border-white/5">
                      {p.prompt}
                    </p>
                  </div>
                ))
            ) : (
              <div className="py-16 text-center text-xs text-slate-500">
                {isLoadingAdmin ? "กำลังโหลดประวัติ..." : "ยังไม่มีข้อมูลคำถามในระบบ"}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: NEON LIVE DATABASE EXPLORER */}
      {adminViewTab === "database" && (
        <div className="p-5 rounded-3xl bg-[#1e1f20] border border-white/10 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-400" />
                <span>ตรวจสอบข้อมูลในฐานข้อมูล (Neon PostgreSQL Live Explorer)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                ดูข้อมูลแถวจริงทั้งหมดที่บันทึกอยู่ในฐานข้อมูล Neon แบบสดๆ
              </p>
            </div>
            <button
              type="button"
              onClick={() => fetchDbData(selectedDbTable)}
              disabled={isLoadingDbData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#282a2c] hover:bg-[#333538] text-slate-200 border border-white/10 transition-colors cursor-pointer shrink-0"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isLoadingDbData && "animate-spin text-purple-400")} />
              <span>รีเฟรชตารางนี้</span>
            </button>
          </div>

          {/* Table Selection Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "users", label: "ผู้ใช้งาน (users)", icon: <User className="h-3.5 w-3.5 text-sky-400" />, count: dbData?.tableCounts?.users },
              { id: "user_individual_prompts", label: "ประวัติคำถามรายบุคคล (user_individual_prompts)", icon: <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />, count: dbData?.tableCounts?.user_individual_prompts },
              { id: "cloud_conversations", label: "ประวัติห้องแชท (cloud_conversations)", icon: <Folder className="h-3.5 w-3.5 text-amber-400" />, count: dbData?.tableCounts?.cloud_conversations },
              { id: "cloud_messages", label: "ข้อความแชท (cloud_messages)", icon: <FileText className="h-3.5 w-3.5 text-indigo-400" />, count: dbData?.tableCounts?.cloud_messages },
              { id: "visitor_logs", label: "บันทึกผู้เข้าชม (visitor_logs)", icon: <Globe className="h-3.5 w-3.5 text-purple-400" />, count: dbData?.tableCounts?.visitor_logs },
            ].map((tbl) => (
              <button
                key={tbl.id}
                type="button"
                onClick={() => fetchDbData(tbl.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border",
                  selectedDbTable === tbl.id
                    ? "bg-purple-600/25 text-purple-300 border-purple-500/50 font-bold shadow-xs"
                    : "bg-[#131314] hover:bg-[#282a2c] text-slate-400 border-white/5"
                )}
              >
                {tbl.icon}
                <span>{tbl.label}</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono text-slate-300">
                  {tbl.count ?? 0}
                </span>
              </button>
            ))}
          </div>

          {/* Search in current table */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder={`ค้นหาในตาราง ${selectedDbTable}...`}
              value={dbSearchFilter}
              onChange={(e) => setDbSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#131314] text-white text-xs border border-white/10 focus:border-purple-500 focus:outline-none placeholder:text-slate-500"
            />
          </div>

          {/* Table Data Render */}
          <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#131314]">
            {isLoadingDbData ? (
              <div className="py-16 text-center text-xs text-slate-500">
                <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-purple-400" />
                กำลังดึงข้อมูลตาราง {selectedDbTable} จากฐานข้อมูล...
              </div>
            ) : !dbData?.rows || dbData.rows.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500 italic">
                ไม่พบข้อมูลในตารางนี้
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[55vh]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-[#1e1f20] border-b border-white/10 text-slate-300 font-mono text-[11px] z-10">
                    <tr>
                      {Object.keys(dbData.rows[0]).map((colKey) => (
                        <th key={colKey} className="px-3.5 py-2.5 whitespace-nowrap font-semibold border-r border-white/5">
                          {colKey}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300 font-sans text-xs">
                    {dbData.rows
                      .filter((row) => {
                        if (!dbSearchFilter.trim()) return true;
                        const rowStr = JSON.stringify(row).toLowerCase();
                        return rowStr.includes(dbSearchFilter.toLowerCase());
                      })
                      .map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                          {Object.entries(row).map(([k, val], cIdx) => (
                            <td
                              key={cIdx}
                              className="px-3.5 py-2 whitespace-nowrap text-xs border-r border-white/5 font-mono max-w-xs truncate"
                              title={String(val ?? "")}
                            >
                              {k === "last_ip_address" || k === "ip_address" ? (
                                <span className="text-sky-400 font-bold">{String(val ?? "-")}</span>
                              ) : k === "is_op" ? (
                                val ? <span className="text-amber-400 font-bold">TRUE (OP)</span> : <span className="text-slate-600">false</span>
                              ) : k === "is_suspended" ? (
                                val ? <span className="text-red-400 font-bold">SUSPENDED</span> : <span className="text-emerald-500">active</span>
                              ) : val === null || val === undefined ? (
                                <span className="text-slate-600 italic">null</span>
                              ) : typeof val === "object" ? (
                                JSON.stringify(val)
                              ) : (
                                String(val)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DETAILED USER PROFILE & QUESTIONS MODAL (เปิดดูโปรไฟล์และประวัติคำถามเป็นตาราง) */}
      <Modal
        isOpen={!!viewingUserProfile}
        onClose={() => setViewingUserProfile(null)}
        maxWidth="4xl"
        title={
          <div className="flex items-center gap-2.5 text-sky-400">
            <UserCheck className="h-5 w-5" />
            <span className="text-base font-bold text-white">
              โปรไฟล์ผู้ใช้ & ข้อมูลคำถาม: {viewingUserProfile?.name || viewingUserProfile?.email}
            </span>
          </div>
        }
      >
        {viewingUserProfile && (
          <div className="space-y-5 select-text">
            {/* User Profile Summary Card */}
            <div className="p-4 rounded-2xl bg-[#1e1f20] border border-white/10 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-bold flex items-center justify-center text-base shrink-0 shadow-md overflow-hidden border border-white/15">
                    {viewingUserProfile.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={viewingUserProfile.avatar} alt={viewingUserProfile.name || "User"} className="h-full w-full object-cover" />
                    ) : (
                      (viewingUserProfile.name || viewingUserProfile.email || "U")[0].toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">
                        {viewingUserProfile.name || "ผู้ใช้งาน"}
                      </h4>
                      {viewingUserProfile.is_op && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                          <Crown className="h-3 w-3" />
                          <span>OP Admin</span>
                        </span>
                      )}
                      {viewingUserProfile.is_suspended && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-bold">
                          <Ban className="h-3 w-3" />
                          <span>ระงับบัญชี</span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {viewingUserProfile.email}
                    </div>
                  </div>
                </div>

                {/* IP Badge & Token Quota */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-[#131314] border border-white/5 space-y-0.5">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Globe className="h-2.5 w-2.5 text-sky-400" />
                      <span>IP Address</span>
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-sky-400">
                      <span>{viewingUserProfile.last_ip_address || "ไม่ระบุ"}</span>
                      {viewingUserProfile.last_ip_address && (
                        <button
                          type="button"
                          onClick={() => handleCopy(viewingUserProfile.last_ip_address)}
                          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                          title="คัดลอก IP"
                        >
                          {copiedText === viewingUserProfile.last_ip_address ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#131314] border border-white/5 space-y-0.5">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Zap className="h-2.5 w-2.5 text-emerald-400" />
                      <span>โควต้าโทเคน</span>
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {(viewingUserProfile.custom_daily_limit || 1000).toLocaleString()} / วัน
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#131314] border border-white/5 space-y-0.5">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <MessageSquare className="h-2.5 w-2.5 text-amber-400" />
                      <span>คำถามที่ถาม</span>
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {userQuestionsList.length} ข้อความ
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Admin Control Bar for this user */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-[11px] text-slate-400 mr-1">ปรับโทเคน:</span>
                  <button
                    type="button"
                    onClick={() => handleSetTokens(viewingUserProfile, -500)}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium cursor-pointer"
                  >
                    -500
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetTokens(viewingUserProfile, 500)}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium cursor-pointer"
                  >
                    +500
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetTokens(viewingUserProfile, 5000)}
                    className="px-2 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-xs text-emerald-400 font-semibold border border-emerald-500/30 cursor-pointer"
                  >
                    +5K
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleOp(viewingUserProfile)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                      viewingUserProfile.is_op
                        ? "bg-amber-500 hover:bg-amber-600 text-black font-bold"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10"
                    )}
                  >
                    <Crown className="h-3.5 w-3.5" />
                    <span>{viewingUserProfile.is_op ? "ถอดสิทธิ์ OP" : "ให้สิทธิ์ OP"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleSuspend(viewingUserProfile)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                      viewingUserProfile.is_suspended
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-red-950/50 hover:bg-red-900/70 text-red-300 border border-red-500/30"
                    )}
                  >
                    <Ban className="h-3.5 w-3.5" />
                    <span>{viewingUserProfile.is_suspended ? "ปลดระงับบัญชี" : "ระงับบัญชี (Ban)"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Questions Table Section as Requested: "ว่าถามไรบ้าง คนนี้ไอพีไร เป็นตารางเลย" */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-sky-400" />
                  <span>ตารางประวัติคำถามของผู้ใช้นี้ (Question History Table)</span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 font-mono text-xs">
                    {userQuestionsList.length} รายการ
                  </span>
                </h4>

                <div className="relative w-full sm:w-64">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="ค้นหาในข้อความคำถาม..."
                    value={questionSearchFilter}
                    onChange={(e) => setQuestionSearchFilter(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#131314] text-white text-xs border border-white/10 focus:border-sky-500 focus:outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Questions Table */}
              <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#131314]">
                {isLoadingUserQuestions ? (
                  <div className="py-16 text-center text-xs text-slate-500">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-sky-400" />
                    กำลังดึงประวัติคำถามของ {viewingUserProfile.email} จากฐานข้อมูล...
                  </div>
                ) : userQuestionsList.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-500 italic">
                    ผู้ใช้นี้ยังไม่มีประวัติการส่งคำถามในระบบ
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-[50vh]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 bg-[#1e1f20] border-b border-white/10 text-slate-300 font-sans text-xs z-10">
                        <tr>
                          <th className="px-3.5 py-2.5 font-semibold text-center w-12">#</th>
                          <th className="px-3.5 py-2.5 font-semibold w-40">วัน-เวลาที่ถาม</th>
                          <th className="px-3.5 py-2.5 font-semibold">ข้อความคำถาม (Prompt)</th>
                          <th className="px-3.5 py-2.5 font-semibold w-28 text-center">โมเดล AI</th>
                          <th className="px-3.5 py-2.5 font-semibold w-36">
                            <span className="inline-flex items-center gap-1 text-sky-400">
                              <Globe className="h-3 w-3" />
                              <span>ไอพีตอนถาม</span>
                            </span>
                          </th>
                          <th className="px-3.5 py-2.5 font-semibold w-16 text-center">คัดลอก</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {userQuestionsList
                          .filter((q) =>
                            questionSearchFilter.trim() === ""
                              ? true
                              : q.prompt.toLowerCase().includes(questionSearchFilter.toLowerCase())
                          )
                          .map((q, idx) => (
                            <tr key={q.id || idx} className="hover:bg-white/[0.03] transition-colors">
                              {/* Index */}
                              <td className="px-3.5 py-3 text-center font-mono text-slate-500 text-[11px]">
                                {idx + 1}
                              </td>

                              {/* Timestamp */}
                              <td className="px-3.5 py-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                                {new Date(q.created_at).toLocaleString("th-TH", {
                                  dateStyle: "short",
                                  timeStyle: "medium",
                                })}
                              </td>

                              {/* Prompt Text */}
                              <td className="px-3.5 py-3 text-slate-100 font-sans text-xs leading-relaxed max-w-md">
                                <div className="p-2 rounded-lg bg-[#1a1b1c] border border-white/5 select-text hover:border-white/15 transition-colors">
                                  {q.prompt}
                                </div>
                              </td>

                              {/* Model */}
                              <td className="px-3.5 py-3 text-center whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono font-semibold text-[10px] border border-blue-500/20">
                                  {q.model_id || "deepseek-chat"}
                                </span>
                              </td>

                              {/* IP Address */}
                              <td className="px-3.5 py-3 font-mono text-xs text-sky-400 whitespace-nowrap">
                                {q.ip_address && q.ip_address !== "unknown" ? (
                                  <div className="flex items-center gap-1">
                                    <Globe className="h-3 w-3 shrink-0" />
                                    <span>{q.ip_address}</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-600">-</span>
                                )}
                              </td>

                              {/* Copy Button */}
                              <td className="px-3.5 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleCopy(q.prompt)}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                  title="คัดลอกข้อความคำถาม"
                                >
                                  {copiedText === q.prompt ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setViewingUserProfile(null)}
                className="px-5 py-2 text-xs font-semibold rounded-xl"
              >
                ปิดหน้าต่างโปรไฟล์
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
