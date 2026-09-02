"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Sparkles, MessageSquare } from "lucide-react";
import { draw5TarotCards } from "@/lib/utils/tarotDeck";
import { useChatStore } from "@/lib/store/useChatStore";
import { useUIStore } from "@/lib/store/useUIStore";

interface TarotSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TarotSkillModal({ isOpen, onClose }: TarotSkillModalProps) {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [question, setQuestion] = useState("");

  const { createNewConversation, sendMessage } = useChatStore();
  const { setActiveTab } = useUIStore();

  const handleStartFortuneTelling = async () => {
    if (!name.trim() || !question.trim()) return;

    const promptMessage = `คำร้องขอทำนายดวงชะตาไพ่ยิปซี 5 ใบ

ชื่อ: ${name.trim()}
วันเกิดและเวลาเกิด: ${birthDate.trim() || "ไม่ระบุ"}
เรื่องที่อยากรู้: ${question.trim()}

รบกวนสุ่มเปิดไพ่ยิปซี 5 ใบ ทำนายตอบคำถาม พร้อมบอกรายละเอียดไพ่ทั้ง 5 ใบ และสรุปภาพรวมของปัญหา ห้ามใส่อิโมจิเด็ดขาด และสรุปความยาวรวมไม่เกิน 200 คำครับ`;

    // Create a new conversation pre-configured for Tarot Fortune Telling
    createNewConversation(`ดูดวงไพ่ยิปซี - ${name.trim()}`, "gemini-3.1-flash-lite");

    onClose();
    setActiveTab("chat");

    // Send the prompt message into the chat
    setTimeout(() => {
      sendMessage(promptMessage);
    }, 150);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="lg">
      <div className="flex flex-col gap-4 p-1 -mt-3">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              สกิลดูดวงไพ่ยิปซี 5 ใบ (5-Card Tarot AI)
            </h2>
            <p className="text-xs text-slate-400">
              กรอกข้อมูลเพื่อสุ่มเปิดไพ่ยิปซี 5 ใบและทำนายดวงชะตาตรงประเด็น (สรุปไม่เกิน 200 คำ)
            </p>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-3.5">
          {/* Input 1: Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <span>ชื่อ</span>
              <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=""
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-slate-500 transition-all"
            />
          </div>

          {/* Input 2: Date of Birth / Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              วันเดือนปีเกิด และเวลาเกิด
            </label>
            <input
              type="text"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              placeholder="เช่น 26/02/2004 23.10 หรือ 26/02/2004 23:10"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-slate-500 transition-all"
            />
          </div>

          {/* Input 3: Question */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <span>เรื่องที่อยากรู้</span>
              <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="ระบุเรื่องที่อยากรู้ หรือคำถามที่คาใจ..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-slate-500 transition-all resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
          <Button variant="ghost" onClick={onClose} type="button">
            ยกเลิก
          </Button>
          <Button
            variant="primary"
            disabled={!name.trim() || !question.trim()}
            onClick={handleStartFortuneTelling}
            className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-2 rounded-xl border border-slate-600 cursor-pointer disabled:opacity-50"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            <span>เริ่มทำนายดวงชะตา</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
