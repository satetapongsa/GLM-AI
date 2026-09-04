"use client";

import React, { useState } from "react";
import { Message, MessageRating } from "@/lib/types";
import { useChatStore } from "@/lib/store/useChatStore";
import { cn } from "@/lib/utils/cn";
import {
  Copy,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Share2,
} from "lucide-react";

export interface MessageActionsProps {
  message: Message;
}

export function MessageActions({ message }: MessageActionsProps) {
  const { regenerateResponse, rateMessage, isStreaming } = useChatStore();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleRate = (rating: MessageRating) => {
    rateMessage(message.id, rating);
  };

  const handleShare = () => {
    alert("คัดลอกข้อความสำหรับแชร์เรียบร้อยแล้ว");
  };

  const handleExportPDF = () => {
    const { exportToPDF, extractTableFromMarkdown } = require("@/lib/utils/accountingExporter");
    const { headers, rows } = extractTableFromMarkdown(message.content);
    exportToPDF(
      "รายงานบัญชีและการเงิน (Financial Accounting Report)",
      headers,
      rows,
      message.content.slice(0, 400),
      `Financial_Report_${Date.now()}.pdf`
    );
  };

  const handleExportExcel = () => {
    const { exportToExcel, extractTableFromMarkdown } = require("@/lib/utils/accountingExporter");
    const { headers, rows } = extractTableFromMarkdown(message.content);
    exportToExcel(`Financial_Report_${Date.now()}`, headers, rows);
  };

  const activeConv = useChatStore((s) => s.conversations.find((c) => c.id === s.activeConversationId));
  const isAccountingChat = activeConv?.title?.includes("บัญชี") || activeConv?.title?.includes("การเงิน");

  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const conversationMessages = useChatStore((s) => (activeConversationId ? s.messages[activeConversationId] || [] : []));
  const hasFileInChat = conversationMessages.some((m) => m.attachments && m.attachments.length > 0);

  const isGreeting = message.content.includes("สวัสดีครับ ผมคือผู้ช่วยบัญชีมืออาชีพ");
  const hasFinancialContent =
    message.content.includes("บาท") ||
    message.content.includes("กำไร") ||
    message.content.includes("รายรับ") ||
    message.content.includes("รายจ่าย") ||
    message.content.includes("รายรวม") ||
    message.content.includes("ต้นทุน") ||
    message.content.includes("PDF") ||
    message.content.includes("Excel") ||
    message.content.includes("|");

  const showExportButtons =
    message.role === "assistant" &&
    !isStreaming &&
    !isGreeting &&
    (isAccountingChat || hasFileInChat || hasFinancialContent);

  return (
    <div className="flex flex-wrap items-center gap-1 mt-2 text-[hsl(var(--muted-foreground))]">
      {/* Copy */}
      <button
        type="button"
        onClick={handleCopy}
        aria-label="คัดลอกข้อความ"
        className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors cursor-pointer"
        title="คัดลอก"
      >
        {isCopied ? (
          <Check className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Regenerate */}
      <button
        type="button"
        disabled={isStreaming}
        onClick={() => regenerateResponse(message.id)}
        aria-label="ตอบใหม่อีกครั้ง"
        className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] disabled:opacity-40 transition-colors cursor-pointer"
        title="ตอบใหม่อีกครั้ง"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </button>

      {/* Like */}
      <button
        type="button"
        onClick={() => handleRate("like")}
        aria-label="ถูกใจคำตอบ"
        className={cn(
          "p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer",
          message.rating === "like"
            ? "text-emerald-500 fill-emerald-500/20"
            : "hover:text-[hsl(var(--foreground))]"
        )}
        title="ถูกใจ"
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </button>

      {/* Dislike */}
      <button
        type="button"
        onClick={() => handleRate("dislike")}
        aria-label="ไม่ถูกใจคำตอบ"
        className={cn(
          "p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer",
          message.rating === "dislike"
            ? "text-rose-500 fill-rose-500/20"
            : "hover:text-[hsl(var(--foreground))]"
        )}
        title="ไม่ถูกใจ"
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </button>

      {/* Share */}
      <button
        type="button"
        onClick={handleShare}
        aria-label="แชร์คำตอบ"
        className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors cursor-pointer"
        title="แชร์"
      >
        <Share2 className="h-3.5 w-3.5" />
      </button>

      {/* PDF & Excel Export Buttons ONLY appear after user attaches file and AI calculates accounting data */}
      {showExportButtons && (
        <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-white/10">
          <button
            type="button"
            onClick={handleExportPDF}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] font-medium border border-rose-500/20 transition-colors cursor-pointer"
            title="ดาวน์โหลดรายงาน PDF"
          >
            <span>ส่งออก PDF</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[11px] font-medium border border-emerald-500/20 transition-colors cursor-pointer"
            title="ดาวน์โหลดไฟล์ Excel (.xlsx)"
          >
            <span>ส่งออก Excel</span>
          </button>
        </div>
      )}
    </div>
  );
}
