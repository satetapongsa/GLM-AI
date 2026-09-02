"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Sparkles, Wand2, RefreshCw, MessageSquare, Flame, Check, HelpCircle } from "lucide-react";
import { draw5TarotCards, TarotCard } from "@/lib/utils/tarotDeck";
import { useChatStore } from "@/lib/store/useChatStore";
import { useUIStore } from "@/lib/store/useUIStore";
import { BUILT_IN_SKILLS } from "@/lib/config/skills";

interface TarotSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TarotSkillModal({ isOpen, onClose }: TarotSkillModalProps) {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [question, setQuestion] = useState("");
  const [drawnCards, setDrawnCards] = useState<{ card: TarotCard; positionLabel: string }[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const { createNewConversation, sendMessage } = useChatStore();
  const { setActiveTab } = useUIStore();

  const tarotSkill = BUILT_IN_SKILLS.find((s) => s.id === "skill-tarot-5cards");

  const handleDrawCards = () => {
    setIsDrawing(true);
    setTimeout(() => {
      const result = draw5TarotCards();
      setDrawnCards(result);
      setIsDrawing(false);
    }, 600);
  };

  const handleStartFortuneTelling = async () => {
    if (!name.trim() || !question.trim()) return;

    // If cards haven't been drawn yet, draw them automatically
    let cardsToUse = drawnCards;
    if (cardsToUse.length === 0) {
      cardsToUse = draw5TarotCards();
      setDrawnCards(cardsToUse);
    }

    const cardDetailsFormatted = cardsToUse
      .map(
        (item, idx) =>
          `${idx + 1}. **${item.card.nameTh}** — ${item.positionLabel}\n   *(ความหมาย: ${item.card.keywords.join(", ")})*`
      )
      .join("\n\n");

    const promptMessage = `🔮 **คำร้องขอเปิดดวงชะตาไพ่ยิปซี 5 ใบ**

👤 **ชื่อผู้ดูดวง**: ${name.trim()}
📅 **วัน/เดือน/ปีเกิด**: ${birthDate.trim() || "ไม่ระบุ"}
❓ **เรื่องที่อยากรู้/คำถามเปิดดวง**: ${question.trim()}

🃏 **ไพ่ยิปซี 5 ใบที่สุ่มได้จากสำรับ**:
${cardDetailsFormatted}

รบกวนแม่หมอ Goomairu ทำนายดวงชะตาเรื่องนี้ให้อย่างเจาะลึก แม่นยำ และให้แนวทางแก้ไขเชิงบวกครับ!`;

    // Create a new conversation pre-configured with Tarot System Prompt
    createNewConversation(`🔮 ดูดวงไพ่ยิปซี — ${name.trim()}`, "gemini-3.1-flash-lite");

    onClose();
    setActiveTab("chat");

    // Send the prompt message into the new chat
    setTimeout(() => {
      sendMessage(promptMessage);
    }, 150);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="xl">
      <div className="flex flex-col gap-5 p-1 -mt-4">
        {/* Mystical Header Banner */}
        <div className="relative rounded-2xl p-6 overflow-hidden bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 border border-purple-500/30 text-white shadow-xl">
          <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex items-center justify-center p-3 rounded-2xl bg-purple-500/20 border border-purple-400/40 text-purple-300 shadow-inner">
              <Sparkles className="h-7 w-7 animate-pulse text-purple-300" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                <Wand2 className="h-3 w-3" /> สกิล AI ยอดฮิตอันดับ 1
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                ศาสตร์ทำนายไพ่ยิปซี 5 ใบ (5-Card Tarot AI)
              </h2>
              <p className="text-xs sm:text-sm text-purple-200/80 mt-0.5">
                กรอกข้อมูลและคำถามที่อยากรู้ เพื่อสุ่มเปิดไพ่ยิปซี 5 ใบและรับคำทำนายเชิงลึกจากแม่หมอ AI
              </p>
            </div>
          </div>
        </div>

        {/* Inputs Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Input 1: Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <span>ชื่อ - นามสกุล / ชื่อเล่น</span>
                <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น ณัฐดนัย / น้องเจน"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>

            {/* Input 2: Date of birth */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                วัน / เดือน / ปีเกิด (และเวลาเกิดถ้าทราบ)
              </label>
              <input
                type="text"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                placeholder="เช่น 15 พฤศจิกายน 2541 เวลา 09:30 น."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>

          {/* Input 3: Question */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <span>เรื่องที่อยากรู้ / คำถามตั้งดวง</span>
              <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="เช่น เรื่องงานย้ายงานใหม่จะมีโอกาสสำเร็จไหม? หรือ เรื่องความรักกับคนนี้มีเกณฑ์สมหวังไหม?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
            />
          </div>
        </div>

        {/* Tarot Card Draw Section */}
        <div className="bg-slate-900/80 border border-purple-500/20 rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber-400" />
              <h3 className="text-sm sm:text-base font-bold text-white">
                สุ่มเปิดไพ่ยิปซี 5 ใบประจำดวงชะตา
              </h3>
            </div>
            <button
              type="button"
              onClick={handleDrawCards}
              disabled={isDrawing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-400/40 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isDrawing ? "animate-spin" : ""}`} />
              <span>{drawnCards.length > 0 ? "สุ่มสลับไพ่ใหม่" : "เปิดไพ่ 5 ใบ"}</span>
            </button>
          </div>

          {/* Cards Display Grid */}
          {drawnCards.length === 0 ? (
            <div
              onClick={handleDrawCards}
              className="border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 rounded-xl p-6 text-center cursor-pointer transition-all bg-purple-950/10 group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🔮🃏</div>
              <p className="text-xs sm:text-sm font-semibold text-purple-200">
                กดที่นี่เพื่อสุ่มสับและเปิดไพ่ยิปซี 5 ใบ
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                (ระบบจะเปิดไพ่ 5 ใบแทนตัวตน อุปสรรค คำตอบ แนวทางแก้ไข และอนาคต)
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {drawnCards.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-between p-3 rounded-xl bg-gradient-to-b from-purple-950/60 via-slate-900 to-indigo-950/80 border border-purple-500/40 text-center shadow-md animate-in fade-in zoom-in-95 duration-200"
                >
                  <span className="text-[10px] font-bold text-purple-300 px-2 py-0.5 rounded-full bg-purple-900/50 border border-purple-500/30 mb-2">
                    ใบที่ {idx + 1}
                  </span>
                  <div className="text-2xl my-1">{item.card.symbol}</div>
                  <div className="text-xs font-bold text-white leading-tight mt-1 line-clamp-1">
                    {item.card.nameEn}
                  </div>
                  <div className="text-[11px] font-medium text-amber-300 mt-0.5 line-clamp-1">
                    {item.card.nameTh.split(" ")[0]}
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1 line-clamp-2">
                    {item.card.keywords.join(", ")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">
            ยกเลิก
          </Button>
          <Button
            variant="primary"
            disabled={!name.trim() || !question.trim() || isDrawing}
            onClick={handleStartFortuneTelling}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 border border-purple-400/40 cursor-pointer disabled:opacity-50"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            <span>🔮 เริ่มทำนายดวงชะตา</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
