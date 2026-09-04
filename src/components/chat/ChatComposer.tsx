"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/lib/store/useChatStore";
import { useModelStore } from "@/lib/store/useModelStore";
import { useSettingsStore } from "@/lib/store/useSettingsStore";
import { useTokenStore } from "@/lib/store/useTokenStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { BRAND_CONFIG } from "@/lib/config/brand";
import { AttachmentPreview } from "./AttachmentPreview";
import { ProviderIcon } from "@/components/ui/ProviderIcon";
import { AVAILABLE_MODELS } from "@/lib/config/models";
import { cn } from "@/lib/utils/cn";
import { Attachment } from "@/lib/types";
import {
  Send,
  Image as ImageIcon,
  Square,
  ChevronDown,
  Coins,
  Lock,
  Activity,
} from "lucide-react";

export function ChatComposer() {
  const {
    composerText,
    setComposerText,
    composerAttachments,
    addComposerAttachment,
    removeComposerAttachment,
    sendMessage,
    stopGeneration,
    isStreaming,
    activeModelId,
  } = useChatStore();

  const { getSelectedModel, openModelModal } = useModelStore();
  const { settings } = useSettingsStore();
  const { usedTokensToday, dailyLimit, getRemainingTokens } = useTokenStore();
  const { isAuthenticated, openAuthModal, user } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentModel =
    AVAILABLE_MODELS.find((m) => m.id === activeModelId) ||
    getSelectedModel() ||
    AVAILABLE_MODELS[0];
  const isUserAuth = mounted ? isAuthenticated : false;
  const displayUsedTokens = mounted ? usedTokensToday : 0;
  const displayDailyLimit = mounted ? dailyLimit : 1000;
  const displayRemaining = mounted ? getRemainingTokens() : 1000;

  // Auto-resize textarea as text grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const nextHeight = Math.min(textareaRef.current.scrollHeight, 140);
      textareaRef.current.style.height = `${nextHeight}px`;
    }
  }, [composerText]);

  const handleSendOrStop = () => {
    if (isStreaming) {
      stopGeneration();
      return;
    }

    if (!isUserAuth) {
      openAuthModal("login");
      return;
    }

    if (composerText.trim() || composerAttachments.length > 0) {
      sendMessage();
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (settings.enterToSend && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendOrStop();
    }
  };

  const handleFocus = () => {
    if (!isUserAuth) {
      openAuthModal("login");
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/") && !file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) continue;

      try {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = reader.result as string;
          if (base64Data) {
            fetch("/api/media/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fileName: file.name,
                fileType: file.type || "image/jpeg",
                fileSize: file.size,
                mediaData: base64Data,
                userEmail: user?.email || "guest_user",
              }),
            }).catch(() => {});
          }
        };
        reader.readAsDataURL(file);
      } catch {}

      const newAttachment: Attachment = {
        id: `att-img-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`,
        name: file.name,
        type: file.type || "image/jpeg",
        size: file.size,
        status: "complete",
        previewUrl: URL.createObjectURL(file),
      };
      addComposerAttachment(newAttachment);
    }
    e.target.value = "";
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
          <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
            {/* Direct Image File Input & Photo Gallery Icon Button */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageChange}
            />

            <button
              type="button"
              onClick={() => {
                if (!isUserAuth) {
                  openAuthModal("login");
                } else {
                  imageInputRef.current?.click();
                }
              }}
              aria-label="เลือกรูปภาพ"
              className="h-7 w-7 rounded-full bg-[#282a2c] text-slate-300 flex items-center justify-center transition-colors cursor-pointer hover:bg-[#333538] hover:text-emerald-400 shrink-0"
              title="เลือกรูปภาพ"
            >
              <ImageIcon className="h-3.5 w-3.5" />
            </button>

            {/* Model Pill Button [ ✦ DeepSeek V3 (Chat) ▾ ] */}
            <button
              type="button"
              onClick={openModelModal}
              suppressHydrationWarning
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#282a2c] hover:bg-[#333538] border border-[rgba(255,255,255,0.06)] text-slate-200 text-[11.5px] font-medium transition-colors cursor-pointer shrink-0 max-w-[130px] sm:max-w-[220px]"
            >
              <ProviderIcon
                key={currentModel.id}
                provider={currentModel.provider}
                iconUrl={currentModel.iconUrl}
                size="sm"
              />
              <span suppressHydrationWarning className="truncate">
                {currentModel.name}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
            </button>

            {/* Daily Token Limit Quota Badge (รวมวันนี้: X/1,000) */}
            {isUserAuth ? (
              <div
                suppressHydrationWarning
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#282a2c] border border-[rgba(255,255,255,0.08)] text-[11px] font-medium select-none shrink-0"
                title={`โควต้าประจำวัน: ใช้ไปแล้ว ${displayUsedTokens} / ${displayDailyLimit} โทเคน (เหลือ ${displayRemaining} โทเคน)`}
              >
                <Activity className="h-3 w-3 text-emerald-400 shrink-0" />
                <span className="text-slate-400">รวมวันนี้:</span>
                <span suppressHydrationWarning className="font-bold text-emerald-400">
                  {displayUsedTokens}
                </span>
                <span suppressHydrationWarning className="text-slate-500 font-normal">
                  /{displayDailyLimit}
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950/40 border border-amber-800 text-[10.5px] font-medium text-amber-300 hover:bg-amber-900/50 cursor-pointer transition-colors select-none shrink-0"
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
                    ? "bg-[#0b57d0] text-[#ffffff] hover:bg-[#0842a0] active:scale-95 shadow-xs"
                    : !isUserAuth
                    ? "bg-[#0b57d0] text-[#ffffff] hover:bg-[#0842a0] active:scale-95 shadow-xs"
                    : "bg-[#282a2c] text-slate-500 cursor-not-allowed"
                )}
                title={isUserAuth ? "ส่งข้อความ (Enter)" : "เข้าสู่ระบบเพื่อส่งข้อความ"}
              >
                <Send className="h-3.5 w-3.5 text-white stroke-[2.3]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

