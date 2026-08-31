"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/lib/store/useChatStore";
import { useModelStore } from "@/lib/store/useModelStore";
import { useTokenStore } from "@/lib/store/useTokenStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { BRAND_CONFIG } from "@/lib/config/brand";
import { AttachmentMenu } from "./AttachmentMenu";
import { AttachmentPreview } from "./AttachmentPreview";
import { ProviderIcon } from "@/components/ui/ProviderIcon";
import {
  Plus,
  SendHorizontal,
  Square,
  ChevronDown,
  Coins,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function ChatComposer() {
  const {
    composerText,
    setComposerText,
    composerAttachments,
    removeComposerAttachment,
    sendMessage,
    isStreaming,
    stopGeneration,
  } = useChatStore();

  const { openModelModal, getSelectedModel } = useModelStore();
  const { usedTokensToday, dailyLimit, getRemainingTokens } = useTokenStore();
  const { isAuthenticated, openAuthModal } = useAuthStore();
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isUserAuth = mounted ? isAuthenticated : false;
  const selectedModel = getSelectedModel();
  const displayUsedTokens = mounted ? usedTokensToday : 0;
  const displayDailyLimit = mounted ? dailyLimit : 1000;
  const displayRemaining = mounted ? getRemainingTokens() : 1000;

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 24), 140)}px`;
    }
  }, [composerText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isUserAuth) {
      e.preventDefault();
      openAuthModal("login");
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && (composerText.trim() || composerAttachments.length > 0)) {
        sendMessage();
      }
    }
  };

  const handleSendOrStop = () => {
    if (!isUserAuth) {
      openAuthModal("login");
      return;
    }

    if (isStreaming) {
      stopGeneration();
    } else if (composerText.trim() || composerAttachments.length > 0) {
      sendMessage();
    }
  };

  const handleFocus = () => {
    if (!isUserAuth) {
      openAuthModal("login");
    }
  };

  const hasContent = composerText.trim().length > 0 || composerAttachments.length > 0;

  return (
    <div className="w-full max-w-[700px] mx-auto px-4 pb-4">
      {/* Outer Composer Container */}
      <div className="relative flex flex-col rounded-[26px] bg-white dark:bg-[#0f172a] border border-[#3b82f6] shadow-sm px-4 pt-3.5 pb-2.5">
        {/* Attachment Previews */}
        <AttachmentPreview
          attachments={composerAttachments}
          onRemove={removeComposerAttachment}
        />

        {/* Input Text Area */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={composerText}
          onChange={(e) => setComposerText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={
            isUserAuth
              ? BRAND_CONFIG.placeholderInput
              : "เข้าสู่ระบบด้วย Google หรือสมัครสมาชิกเพื่อเริ่มพิมพ์ถาม AI..."
          }
          className="w-full min-h-[28px] max-h-[140px] bg-transparent border-0 resize-none py-1 px-1 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none scrollbar-none leading-relaxed"
        />

        {/* Bottom Actions Row: Left (+) and Model Badge + Token Badge, Right Send/Plane button */}
        <div className="flex items-center justify-between gap-2 mt-2 pt-1 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Plus Attachment Button */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (!isUserAuth) {
                    openAuthModal("login");
                  } else {
                    setIsAttachmentMenuOpen(!isAttachmentMenuOpen);
                  }
                }}
                aria-label="แนบไฟล์หรือรูปภาพ"
                className={cn(
                  "h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                <Plus className={cn("h-4 w-4 transition-transform duration-200", isAttachmentMenuOpen && "rotate-45")} />
              </button>

              {isUserAuth && (
                <AttachmentMenu
                  isOpen={isAttachmentMenuOpen}
                  onClose={() => setIsAttachmentMenuOpen(false)}
                />
              )}
            </div>

            {/* Model Pill Button [ ✦ DeepSeek V3 (Chat) ▾ ] */}
            <button
              type="button"
              onClick={openModelModal}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[12px] font-medium transition-colors cursor-pointer"
            >
              <ProviderIcon provider={selectedModel.provider} size="sm" />
              <span className="truncate max-w-[150px] sm:max-w-[200px]">
                {selectedModel.name}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {/* Token Quota Badge or Sign In Required Pill */}
            {isUserAuth ? (
              <div
                suppressHydrationWarning
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-[11px] font-medium text-slate-600 dark:text-slate-400 select-none"
                title={`โควต้าประจำวัน: ใช้ไปแล้ว ${displayUsedTokens} / ${displayDailyLimit} โทเคน (เหลือ ${displayRemaining} โทเคน)`}
              >
                <Coins className="h-3 w-3 text-amber-500 shrink-0" />
                <span suppressHydrationWarning className="font-semibold text-slate-800 dark:text-slate-200">
                  {displayUsedTokens}
                </span>
                <span suppressHydrationWarning className="text-slate-400">
                  /{displayDailyLimit}
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-100 cursor-pointer transition-colors select-none"
              >
                <Lock className="h-3 w-3 text-amber-500 shrink-0" />
                <span>เข้าสู่ระบบก่อนเริ่มถาม</span>
              </button>
            )}
          </div>

          {/* Send / Paper Plane Icon Button */}
          <div className="shrink-0 ml-auto sm:ml-0">
            {isStreaming ? (
              <button
                type="button"
                onClick={handleSendOrStop}
                aria-label="หยุดการสร้างข้อความ"
                className="h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-xs transition-transform active:scale-95 cursor-pointer animate-pulse"
                title="หยุดการตอบกลับ"
              >
                <Square className="h-3.5 w-3.5 fill-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSendOrStop}
                aria-label="ส่งข้อความ"
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center transition-all cursor-pointer",
                  isUserAuth && hasContent
                    ? "bg-[#0b57d0] text-white hover:bg-[#0842a0] active:scale-95 shadow-xs"
                    : !isUserAuth
                    ? "bg-[#0b57d0] text-white hover:bg-[#0842a0] active:scale-95 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                )}
                title={isUserAuth ? "ส่งข้อความ (Enter)" : "เข้าสู่ระบบเพื่อส่งข้อความ"}
              >
                <SendHorizontal className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-2 text-center text-[11px] text-slate-500 dark:text-slate-400 select-none">
        {BRAND_CONFIG.disclaimer}
      </p>
    </div>
  );
}
