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
  ArrowRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function SkillsView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isTarotModalOpen, setIsTarotModalOpen] = useState(false);

  const { createNewConversation, sendMessage } = useChatStore();
  const { setActiveTab } = useUIStore();

  const filteredSkills = BUILT_IN_SKILLS.filter((skill) => {
    return (
      skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleActivateSkill = (skill: AISkill) => {
    if (skill.id === "skill-tarot-5cards") {
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

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#131314] text-[#f1f5f9]">
      {/* Skill Modal */}
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
                  <span>สกิลดูดวงไพ่ยิปซีอัจฉริยะ</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                    Horoscope AI Specialist
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  ศาสตร์ทำนายดวงชะตาขั้นสูงด้วยไพ่ยิปซี 5 ใบ หยั่งรู้ดวงชะตา วิเคราะห์ตัวตน อุปสรรค และอนาคตอย่างแม่นยำลึกซึ้ง
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
              placeholder="ค้นหาสกิล..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-slate-500 transition-all"
            />
          </div>
        </div>

        {/* Skills Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id}
              className="flex flex-col justify-between p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group shadow-md"
            >
              <div className="space-y-3.5">
                {/* Top Badge & Icon */}
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                    <Sparkles className="h-5 w-5 text-slate-300" />
                  </div>
                  {skill.badgeText && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {skill.badgeText}
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-slate-200 transition-colors">
                    {skill.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    {skill.description}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-5 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-emerald-400" />
                  <span>เปิดใช้งานทำนายดวงทันที</span>
                </span>

                <Button
                  variant="primary"
                  onClick={() => handleActivateSkill(skill)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-4 py-2 rounded-xl border border-slate-600 cursor-pointer flex items-center gap-1.5"
                >
                  <span>เริ่มทำนายดวง</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
