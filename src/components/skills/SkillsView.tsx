"use client";

import React, { useState } from "react";
import { BUILT_IN_SKILLS } from "@/lib/config/skills";
import { AISkill } from "@/lib/types";
import { TarotSkillModal } from "./TarotSkillModal";
import { Button } from "@/components/ui/Button";
import { useChatStore } from "@/lib/store/useChatStore";
import { useUIStore } from "@/lib/store/useUIStore";
import {
  Sparkles,
  Search,
  Wand2,
  FileText,
  Code,
  BookOpen,
  TrendingUp,
  ArrowRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function SkillsView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isTarotModalOpen, setIsTarotModalOpen] = useState(false);

  const { createNewConversation, sendMessage } = useChatStore();
  const { setActiveTab } = useUIStore();

  const categories = [
    { id: "all", label: "สกิลทั้งหมด" },
    { id: "Horoscope", label: "🔮 ดูดวง & โหราศาสตร์" },
    { id: "Productivity", label: "⚡ เพิ่มประสิทธิภาพงาน" },
    { id: "Writing", label: "✍️ การเขียน & SEO" },
    { id: "Coding", label: "💻 เขียนโค้ด & ไอที" },
    { id: "Analysis", label: "📊 วิเคราะห์การเงิน" },
  ];

  const filteredSkills = BUILT_IN_SKILLS.filter((skill) => {
    const matchesCategory = selectedCategory === "all" || skill.category === selectedCategory;
    const matchesSearch =
      skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Sparkles":
        return <Sparkles className="h-6 w-6 text-purple-400" />;
      case "FileText":
        return <FileText className="h-6 w-6 text-sky-400" />;
      case "Code":
        return <Code className="h-6 w-6 text-emerald-400" />;
      case "BookOpen":
        return <BookOpen className="h-6 w-6 text-amber-400" />;
      case "TrendingUp":
        return <TrendingUp className="h-6 w-6 text-rose-400" />;
      default:
        return <Wand2 className="h-6 w-6 text-purple-400" />;
    }
  };

  const handleActivateSkill = (skill: AISkill) => {
    if (skill.hasInteractiveForm || skill.id === "skill-tarot-5cards") {
      setIsTarotModalOpen(true);
      return;
    }

    createNewConversation(`⚡ ${skill.title}`, "gemini-3.1-flash-lite");

    setActiveTab("chat");

    if (skill.defaultPrompt) {
      setTimeout(() => {
        sendMessage(skill.defaultPrompt || "");
      }, 150);
    }
  };

  const featuredTarotSkill = BUILT_IN_SKILLS.find((s) => s.id === "skill-tarot-5cards");

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#131314] text-[#f1f5f9]">
      {/* Tarot Skill Interactive Modal */}
      <TarotSkillModal isOpen={isTarotModalOpen} onClose={() => setIsTarotModalOpen(false)} />

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>คลังสกิล AI อัจฉริยะ</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 font-medium">
                    AI Special Skills
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  เลือกใช้ความสามารถพิเศษเฉพาะทางของ AI เพื่อช่วยดูดวง เขียนโค้ด สร้างคอนเทนต์ และวางแผนงาน
                </p>
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาสกิล AI..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Featured Hero Skill Card: Tarot 5-Card Reading */}
        {featuredTarotSkill && (
          <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 border border-purple-500/40 text-white shadow-2xl shadow-purple-950/50 group">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-purple-600/25 blur-3xl pointer-events-none group-hover:bg-purple-600/35 transition-all" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-600/25 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/25 text-purple-200 border border-purple-400/40 shadow-inner flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-purple-300 animate-pulse" />
                    <span>สกิล AI ยอดฮิตแนะนำอันดับ 1</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    เปิดไพ่ 5 ใบ
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  🔮 สกิลดูดวงไพ่ยิปซี 5 ใบ (5-Card Tarot AI)
                </h2>

                <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed">
                  ถามชื่อ วันเกิด และเรื่องที่อยากรู้ แม่หมอ AI จะทำการสุ่มเปิดไพ่ยิปซี 5 ใบเจาะลึก
                  <strong className="text-purple-300 font-semibold"> ตัวตน อุปสรรค คำตอบเฉพาะเรื่อง แนวทางแก้ไข และบทสรุปอนาคต</strong> อย่างแม่นยำและละเอียดทรงพลัง
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs text-purple-200/80 pt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-900/50 border border-purple-500/30">
                    🃏 เปิดไพ่ 5 ใบพร้อมกัน
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-900/50 border border-purple-500/30">
                    👤 วิเคราะห์ตามวันเกิด
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-900/50 border border-purple-500/30">
                    💡 เฉลยคำตอบและทางออก
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-start md:items-end gap-3">
                <Button
                  variant="primary"
                  onClick={() => setIsTarotModalOpen(true)}
                  className="bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-sm sm:text-base px-7 py-3.5 rounded-2xl shadow-xl shadow-purple-600/40 border border-purple-300/40 cursor-pointer hover:scale-105 transition-all flex items-center gap-2"
                >
                  <Wand2 className="h-5 w-5 animate-bounce" />
                  <span>🔮 เปิดไพ่ดูดวงตอนนี้</span>
                </Button>
                <span className="text-[11px] text-purple-300/70">
                  คลิกเพื่อเปิดหน้าสุ่มจับไพ่และระบุคำถาม
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border",
                selectedCategory === cat.id
                  ? "bg-purple-600/30 text-purple-200 border-purple-500/60 shadow-md shadow-purple-950/40"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Skills Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id}
              className="flex flex-col justify-between p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 transition-all hover:shadow-xl hover:shadow-purple-950/20 group"
            >
              <div className="space-y-3">
                {/* Top Badge & Icon */}
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-slate-800/90 border border-slate-700/80 group-hover:border-purple-500/40 transition-colors">
                    {getIconComponent(skill.iconName)}
                  </div>
                  {skill.badgeText && (
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
                        skill.badgeColor || "bg-slate-800 text-slate-300 border-slate-700"
                      )}
                    >
                      {skill.badgeText}
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                    {skill.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                    {skill.description}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  <Zap className="h-3 w-3 text-purple-400" />
                  <span>พร้อมใช้งาน</span>
                </span>

                <button
                  type="button"
                  onClick={() => handleActivateSkill(skill)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 transition-all cursor-pointer group-hover:scale-105"
                >
                  <span>ใช้งานสกิลนี้</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
