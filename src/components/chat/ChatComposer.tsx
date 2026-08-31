"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/lib/store/useChatStore";
import { useModelStore } from "@/lib/store/useModelStore";
import { useTokenStore } from "@/lib/store/useTokenStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { BRAND_CONFIG } from "@/lib/config/brand";
import { AVAILABLE_MODELS } from "@/lib/config/models";
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
  const currentModel = mounted ? getSelectedModel() : AVAILABLE_MODELS[0];
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
    <div className="w-full max-w-[720px] mx-auto px-3 sm:px-4 pb-3 relative">
      {/* Outer Composer Container */}
      <div className="relative flex flex-col rounded-[24px] bg-[#1e1f20] border border-[#0b57d0]/60 focus-within:border-[#0b57d0] shadow-sm px-3.5 pt-3 pb-2 transition-colors">
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
          className="w-full min-h-[28px] max-h-[140px] bg-transparent border-0 resize-none py-1 px-1 text-[13.5px] text-[#f1f5f9] placeholder:text-[#64748b] focus:outline-none scrollbar-none leading-relaxed"
        />

        {/* Bottom Actions Row */}
        <div className="flex items-center justify-between gap-1.5 mt-2 pt-1">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
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
                  "h-7 w-7 rounded-full bg-[#282a2c] text-slate-300 flex items-center justify-center transition-colors cursor-pointer hover:bg-[#333538]"
                )}
              >
                <Plus className={cn("h-3.5 w-3.5 transition-transform duration-200", isAttachmentMenuOpen && "rotate-45")} />
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
              suppressHydrationWarning
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#282a2c] hover:bg-[#333538] border border-[rgba(255,255,255,0.06)] text-slate-200 text-[11.5px] font-medium transition-colors cursor-pointer shrink-0 max-w-[130px] sm:max-w-[220px]"
            >
              <ProviderIcon provider={currentModel.provider} size="sm" />
              <span suppressHydrationWarning className="truncate">
                {currentModel.name}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
            </button>

            {/* Token Quota Badge or Sign In Required Pill */}
            {isUserAuth ? (
              <div
                suppressHydrationWarning
                className="hidden xs:flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#282a2c] border border-[rgba(255,255,255,0.06)] text-[10.5px] font-medium text-slate-300 select-none shrink-0"
                title={`โควต้าประจำวัน: ใช้ไปแล้ว ${displayUsedTokens} / ${displayDailyLimit} โทเคน (เหลือ ${displayRemaining} โทเคน)`}
              >
                <Coins className="h-3 w-3 text-amber-400 shrink-0" />
                <span suppressHydrationWarning className="font-semibold text-slate-200">
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
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/40 border border-amber-800 text-[10.5px] font-medium text-amber-300 hover:bg-amber-900/50 cursor-pointer transition-colors select-none shrink-0"
              >
                <Lock className="h-3 w-3 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">เข้าสู่ระบบก่อนเริ่มถาม</span>
                <span className="sm:hidden">เข้าสู่ระบบ</span>
              </button>
            )}
          </div>

          {/* Send / Paper Plane Icon Button */}
          <div className="shrink-0 ml-1">
            {isStreaming ? (
              <button
                type="button"
                onClick={handleSendOrStop}
                aria-label="หยุดการสร้างข้อความ"
                className="h-7.5 w-7.5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-xs transition-transform active:scale-95 cursor-pointer animate-pulse"
                title="หยุดการตอบกลับ"
              >
                <Square className="h-3 w-3 fill-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSendOrStop}
                aria-label="ส่งข้อความ"
                className={cn(
                  "h-7.5 w-7.5 rounded-full flex items-center justify-center transition-all cursor-pointer",
                  isUserAuth && hasContent
                    ? "bg-[#0b57d0] text-white hover:bg-[#0842a0] active:scale-95 shadow-xs"
                    : !isUserAuth
                    ? "bg-[#0b57d0] text-white hover:bg-[#0842a0] active:scale-95 shadow-xs"
                    : "bg-[#282a2c] text-slate-500 cursor-not-allowed"
                )}
                title={isUserAuth ? "ส่งข้อความ (Enter)" : "เข้าสู่ระบบเพื่อส่งข้อความ"}
              >
                <SendHorizontal className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-1.5 text-center text-[10.5px] text-[#64748b] select-none">
        {BRAND_CONFIG.disclaimer}
      </p>
    </div>
  );
}
