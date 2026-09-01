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
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function AdminDashboardView() {
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

  // Per-User Questions Modal State
  const [viewingUserQuestions, setViewingUserQuestions] = useState<{ email: string; name?: string } | null>(null);
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

  const fetchAdminStats = async () => {
    setIsLoadingAdmin(true);
    try {
      const res = await fetch("/api/admin/stats");
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
      const res = await fetch("/api/admin/users");
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
      const res = await fetch(`/api/admin/database?table=${encodeURIComponent(table)}`);
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

  const handleViewUserQuestions = async (targetUser: { email: string; name?: string }) => {
    setViewingUserQuestions(targetUser);
    setIsLoadingUserQuestions(true);
    setQuestionSearchFilter("");
    try {
      const res = await fetch(`/api/admin/questions?email=${encodeURIComponent(targetUser.email)}`);
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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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
      }
    } catch (e) {
      console.error("Failed to set tokens:", e);
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleCopy = (text: string) => {
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-400" />
            <span>แดชบอร์ดแอดมิน (Admin Control Center & Neon DB Explorer)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            มอนิเตอร์คำถาม ควบคุมผู้ใช้งาน จัดการ IP และตรวจสอบฐานข้อมูลสด
          </p>
        </div>

        <button
          type="button"
          disabled={isLoadingAdmin}
          onClick={() => {
            fetchAdminStats();
            fetchAdminUsers();
            fetchDbData(selectedDbTable);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#282a2c] hover:bg-[#333538] text-slate-200 border border-white/10 transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isLoadingAdmin && "animate-spin text-emerald-400")} />
          <span>รีเฟรชข้อมูลทั้งหมด</span>
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#1e1f20] border border-white/10 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">คำถามทั้งหมดในระบบ</span>
          <div className="text-xl sm:text-2xl font-black text-white">
            {adminStats ? adminStats.totalPrompts.toLocaleString() : "..."}
          </div>
          <span className="text-[10px] text-slate-500">สะสมตั้งแต่เปิดเว็บ</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#1e1f20] border border-white/10 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">คำถามวันนี้</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">
            {adminStats ? adminStats.todayPrompts.toLocaleString() : "..."}
          </div>
          <span className="text-[10px] text-slate-500">นับตามเวลาวันนี้</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#1e1f20] border border-white/10 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">ผู้ใช้ที่ลงทะเบียน</span>
          <div className="text-xl sm:text-2xl font-black text-sky-400">
            {adminStats ? adminStats.totalUsers.toLocaleString() : "..."}
          </div>
          <span className="text-[10px] text-slate-500">บัญชีในระบบ</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#1e1f20] border border-white/10 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">สมองกลขับเคลื่อน</span>
          <div className="text-xs sm:text-sm font-bold text-amber-400 truncate">
            DeepSeek Master
          </div>
          <span className="text-[10px] text-emerald-400">ประหยัดโทเคนสูงสุด</span>
        </div>
      </div>

      {/* Model Usage Breakdown */}
      {adminStats?.modelUsage && adminStats.modelUsage.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#1e1f20] border border-white/10 space-y-3">
          <h4 className="text-xs font-bold text-slate-200">โมเดลยอดนิยมที่มีคนเลือกใช้</h4>
          <div className="space-y-2">
            {adminStats.modelUsage.map((m, idx) => {
              const total = adminStats.totalPrompts || 1;
              const pct = Math.round((m.count / total) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-semibold">{m.modelId}</span>
                    <span className="text-slate-400">{m.count} ครั้ง ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Prompts Stream */}
      <div className="p-4 rounded-2xl bg-[#1e1f20] border border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-sky-400" />
            <span>คำถามล่าสุดของผู้ใช้ (Live Prompts Stream)</span>
          </h4>
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="ค้นหาข้อความ/อีเมล/ไอพี..."
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#131314] text-white text-xs border border-white/10 focus:border-sky-500 focus:outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
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
                  className="p-3 rounded-xl bg-[#131314] border border-white/5 space-y-1.5 text-xs hover:border-white/15 transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-300 font-semibold">{p.userEmail}</span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-mono">
                        {p.modelId}
                      </span>
                    </div>
                    <span>
                      {new Date(p.createdAt).toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-slate-200 text-xs font-sans leading-relaxed line-clamp-2">
                    {p.prompt}
                  </p>
                  {p.ipAddress && p.ipAddress !== "unknown" && (
                    <div className="text-[10px] text-slate-500 font-mono">
                      🌐 IP: {p.ipAddress}
                    </div>
                  )}
                </div>
              ))
          ) : (
            <div className="py-6 text-center text-xs text-slate-500">
              {isLoadingAdmin ? "กำลังโหลดประวัติ..." : "ยังไม่มีข้อมูลคำถามในระบบ"}
            </div>
          )}
        </div>
      </div>

      {/* User Management Panel */}
      <div className="p-4 rounded-2xl bg-[#1e1f20] border border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Users className="h-4 w-4 text-amber-400" />
              <span>จัดการสิทธิ์ผู้ใช้งาน (User Management & Permissions)</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              เปิด/ปิดสิทธิ์ OP, ระงับบัญชี (Ban), ปรับโควต้าโทเคน และดูประวัติคำถาม
            </p>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="ค้นหาผู้ใช้/อีเมล/ไอพี..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#131314] text-white text-xs border border-white/10 focus:border-amber-500 focus:outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {adminUsers && adminUsers.length > 0 ? (
            adminUsers
              .filter((u) => {
                if (!userSearch.trim()) return true;
                const query = userSearch.toLowerCase();
                return (
                  (u.email && u.email.toLowerCase().includes(query)) ||
                  (u.name && u.name.toLowerCase().includes(query)) ||
                  (u.last_ip_address && u.last_ip_address.toLowerCase().includes(query))
                );
              })
              .map((u) => {
                const isActionActive = userActionLoading === u.id;
                return (
                  <div
                    key={u.id}
                    className={cn(
                      "p-3 rounded-2xl border transition-all space-y-2.5",
                      u.is_suspended
                        ? "bg-red-950/20 border-red-500/30"
                        : u.is_op
                        ? "bg-amber-950/20 border-amber-500/30"
                        : "bg-[#131314] border-white/5"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-inner">
                          {u.name ? u.name[0].toUpperCase() : "U"}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-100 truncate">
                              {u.name || "ผู้ใช้งาน"}
                            </span>
                            {u.is_op && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                                <Crown className="h-3 w-3" />
                                <span>OP Admin</span>
                              </span>
                            )}
                            {u.is_suspended && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-bold">
                                <Ban className="h-3 w-3" />
                                <span>ถูกระงับ</span>
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-slate-400 font-mono">
                              {u.email}
                            </span>
                            {u.last_ip_address ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[10px] font-mono border border-sky-500/25 font-semibold">
                                <Globe className="h-2.5 w-2.5" />
                                <span>IP: {u.last_ip_address}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-mono">
                                🌐 IP: -
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">โควต้าโทเคน</span>
                          <span className="text-xs font-bold text-emerald-400">
                            {(u.custom_daily_limit || 1000).toLocaleString()} / วัน
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-400 mr-1">ปรับโทเคน:</span>
                        <button
                          type="button"
                          disabled={isActionActive}
                          onClick={() => handleSetTokens(u, -500)}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-medium cursor-pointer transition-colors"
                          title="ลดโควต้าลง 500 โทเคน"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          disabled={isActionActive}
                          onClick={() => handleSetTokens(u, 500)}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-medium cursor-pointer transition-colors"
                          title="เพิ่มโควต้า 500 โทเคน"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          disabled={isActionActive}
                          onClick={() => handleSetTokens(u, 5000)}
                          className="px-2 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-[11px] text-emerald-400 font-semibold border border-emerald-500/30 cursor-pointer transition-colors"
                          title="เพิ่ม 5,000 โทเคน"
                        >
                          +5K
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isActionActive}
                          onClick={() => handleToggleOp(u)}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95",
                            u.is_op
                              ? "bg-amber-500 hover:bg-amber-600 text-black font-bold"
                              : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10"
                          )}
                        >
                          <Crown className="h-3 w-3" />
                          <span>{u.is_op ? "ถอดสิทธิ์ OP (/deop)" : "ให้สิทธิ์ OP (/op)"}</span>
                        </button>

                        <button
                          type="button"
                          disabled={isActionActive}
                          onClick={() => handleToggleSuspend(u)}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95",
                            u.is_suspended
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30"
                          )}
                        >
                          <Ban className="h-3 w-3" />
                          <span>{u.is_suspended ? "ปลดระงับ (Unban)" : "ระงับบัญชี (Ban)"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleViewUserQuestions(u)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 transition-all cursor-pointer shadow-xs active:scale-95"
                          title="ดูประวัติคำถามทั้งหมดของคนนี้"
                        >
                          <MessageSquare className="h-3 w-3" />
                          <span>ดูประวัติคำถาม</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              {isLoadingUsers ? "กำลังโหลดรายชื่อผู้ใช้จาก Neon DB..." : "ยังไม่มีข้อมูลผู้ใช้ในระบบ"}
            </div>
          )}
        </div>
      </div>

      {/* Neon Database Live Explorer Section */}
      <div className="p-4 rounded-2xl bg-[#1e1f20] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-400" />
              <span>ตรวจสอบข้อมูลในฐานข้อมูล (Neon PostgreSQL Live Explorer)</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              ดูข้อมูลแถวจริงทั้งหมดที่บันทึกอยู่ในฐานข้อมูล Neon แบบสดๆ
            </p>
          </div>
          <button
            type="button"
            onClick={() => fetchDbData(selectedDbTable)}
            disabled={isLoadingDbData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#282a2c] hover:bg-[#333538] text-slate-200 border border-white/10 transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoadingDbData && "animate-spin text-emerald-400")} />
            <span>รีเฟรชฐานข้อมูล</span>
          </button>
        </div>

        {/* Table Selection Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "users", label: "👤 ผู้ใช้งาน (users)", count: dbData?.tableCounts?.users },
            { id: "user_individual_prompts", label: "💬 ประวัติคำถามรายบุคคล (user_individual_prompts)", count: dbData?.tableCounts?.user_individual_prompts },
            { id: "cloud_conversations", label: "🗂️ ประวัติห้องแชท (cloud_conversations)", count: dbData?.tableCounts?.cloud_conversations },
            { id: "cloud_messages", label: "📝 ข้อความแชท (cloud_messages)", count: dbData?.tableCounts?.cloud_messages },
            { id: "visitor_logs", label: "🌐 บันทึกผู้เข้าชม (visitor_logs)", count: dbData?.tableCounts?.visitor_logs },
          ].map((tbl) => (
            <button
              key={tbl.id}
              type="button"
              onClick={() => fetchDbData(tbl.id)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border",
                selectedDbTable === tbl.id
                  ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/40 font-semibold shadow-xs"
                  : "bg-[#131314] hover:bg-[#282a2c] text-slate-400 border-white/5"
              )}
            >
              <span>{tbl.label}</span>
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono text-slate-300">
                {tbl.count ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Search in current table */}
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={`ค้นหาในตาราง ${selectedDbTable}...`}
            value={dbSearchFilter}
            onChange={(e) => setDbSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#131314] text-white text-xs border border-white/10 focus:border-emerald-500 focus:outline-none placeholder:text-slate-500"
          />
        </div>

        {/* Table Data Render */}
        <div className="rounded-xl border border-white/10 overflow-hidden bg-[#131314]">
          {isLoadingDbData ? (
            <div className="py-12 text-center text-xs text-slate-500">
              <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-emerald-400" />
              กำลังดึงข้อมูลตาราง {selectedDbTable} จากฐานข้อมูล...
            </div>
          ) : !dbData?.rows || dbData.rows.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 italic">
              ไม่พบข้อมูลในตารางนี้
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[50vh]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-[#1e1f20] border-b border-white/10 text-slate-300 font-mono text-[11px]">
                  <tr>
                    {Object.keys(dbData.rows[0]).map((colKey) => (
                      <th key={colKey} className="px-3 py-2 whitespace-nowrap font-semibold border-r border-white/5">
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
                            className="px-3 py-2 whitespace-nowrap text-xs border-r border-white/5 font-mono max-w-xs truncate"
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

      {/* Per-User Question History Modal */}
      <Modal
        isOpen={!!viewingUserQuestions}
        onClose={() => setViewingUserQuestions(null)}
        maxWidth="2xl"
        title={
          <div className="flex items-center gap-2.5 text-sky-400">
            <MessageSquare className="h-5 w-5" />
            <span className="text-base font-bold text-white">
              ประวัติคำถามรายบุคคล: {viewingUserQuestions?.name || viewingUserQuestions?.email}
            </span>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#131314] border border-[rgba(255,255,255,0.06)]">
            <div className="text-xs">
              <span className="text-slate-400">บัญชี: </span>
              <span className="text-white font-semibold font-mono">{viewingUserQuestions?.email}</span>
              <span className="ml-3 px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-semibold">
                ถามทั้งหมด {userQuestionsList.length} คำถาม
              </span>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาในคำถามของคนนี้..."
                value={questionSearchFilter}
                onChange={(e) => setQuestionSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#282a2c] text-white text-xs border border-[rgba(255,255,255,0.08)] focus:border-sky-500 focus:outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="max-h-[55vh] overflow-y-auto space-y-2.5 pr-1">
            {isLoadingUserQuestions ? (
              <div className="py-12 text-center text-xs text-slate-500">
                <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-sky-400" />
                กำลังดึงประวัติคำถามของ {viewingUserQuestions?.email} จากฐานข้อมูล...
              </div>
            ) : userQuestionsList.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 italic">
                ผู้ใช้นี้ยังไม่มีประวัติการส่งคำถามในระบบ
              </div>
            ) : (
              userQuestionsList
                .filter((q) =>
                  questionSearchFilter.trim() === ""
                    ? true
                    : q.prompt.toLowerCase().includes(questionSearchFilter.toLowerCase())
                )
                .map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-3.5 rounded-xl bg-[#131314] border border-[rgba(255,255,255,0.06)] hover:border-sky-500/30 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono font-semibold text-[10px]">
                          {q.model_id || "deepseek-chat"}
                        </span>
                        {q.ip_address && q.ip_address !== "unknown" && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            IP: {q.ip_address}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[10.5px]">
                          {new Date(q.created_at).toLocaleString("th-TH", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(q.prompt)}
                          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="คัดลอกคำถาม"
                        >
                          {copiedText === q.prompt ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-200 leading-relaxed font-sans bg-[#1e1f20] p-2.5 rounded-lg border border-[rgba(255,255,255,0.04)] select-text">
                      {q.prompt}
                    </div>
                  </div>
                ))
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setViewingUserQuestions(null)}
              className="px-4 py-2 text-xs"
            >
              ปิดหน้าต่าง
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
