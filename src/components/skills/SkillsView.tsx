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
    { id: "Horoscope", label: "ดูดวง & โหราศาสตร์" },
    { id: "Productivity", label: "เพิ่มประสิทธิภาพงาน" },
    { id: "Writing", label: "การเขียน & SEO" },
    { id: "Coding", label: "เขียนโค้ด & ไอที" },
    { id: "Analysis", label: "วิเคราะห์การเงิน" },
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
        return <Sparkles className="h-5 w-5 text-slate-300" />;
      case "FileText":
        return <FileText className="h-5 w-5 text-slate-300" />;
      case "Code":
        return <Code className="h-5 w-5 text-slate-300" />;
      case "BookOpen":
        return <BookOpen className="h-5 w-5 text-slate-300" />;
      case "TrendingUp":
        return <TrendingUp className="h-5 w-5 text-slate-300" />;
      default:
        return <Wand2 className="h-5 w-5 text-slate-300" />;
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200">
                <Sparkles className="h-5 w-5 text-slate-300" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>คลังสกิล AI อัจฉริยะ</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                    AI Special Skills
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  เลือกใช้ความสามารถพิเศษเฉพาะทางของ AI สำหรับทำนายดวงชะตา เขียนโค้ด และวางแผนงาน
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
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-slate-500 transition-all"
            />
          </div>
        </div>

        {/* Featured Hero Skill Card: Tarot 5-Card Reading */}
        {featuredTarotSkill && (
          <div className="relative rounded-2xl p-6 overflow-hidden bg-slate-900 border border-slate-700 text-white shadow-md">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-slate-300" />
                    <span>สกิลแนะนำ</span>
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  สกิลดูดวงไพ่ยิปซี 5 ใบ (5-Card Tarot AI)
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  สุ่มทำนายดวงชะตา 5 ใบ ตอบคำถามตรงประเด็น สรุปอุปสรรคและภาพรวมของปัญหา (สรุปกระชับไม่เกิน 200 คำ)
                </p>
              </div>

              <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
                <Button
                  variant="primary"
                  onClick={() => setIsTarotModalOpen(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl border border-slate-600 cursor-pointer flex items-center gap-2"
                >
                  <Wand2 className="h-4 w-4 text-slate-300" />
                  <span>เริ่มทำนายดวงชะตา</span>
                </Button>
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
                "px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border",
                selectedCategory === cat.id
                  ? "bg-slate-800 text-white border-slate-600"
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
              className="flex flex-col justify-between p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group"
            >
              <div className="space-y-3">
                {/* Top Badge & Icon */}
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                    {getIconComponent(skill.iconName)}
                  </div>
                  {skill.badgeText && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {skill.badgeText}
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-slate-200 transition-colors">
                    {skill.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-3">
                    {skill.description}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 mt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  <Zap className="h-3 w-3 text-slate-400" />
                  <span>พร้อมใช้งาน</span>
                </span>

                <button
                  type="button"
                  onClick={() => handleActivateSkill(skill)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
                >
                  <span>ใช้งานสกิล</span>
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
