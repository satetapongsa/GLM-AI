"use client";

import React, { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/lib/store/useChatStore";
import { WelcomeScreen } from "./WelcomeScreen";
import { QuickActionChips } from "./QuickActionChips";
import { ChatMessage } from "./ChatMessage";
import { ChatComposer } from "./ChatComposer";
import { Download, Check, Share2 } from "lucide-react";

export function ChatView() {
  const { activeConversationId, messages, isStreaming, conversations } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isExported, setIsExported] = useState(false);

  const currentMessages = activeConversationId
    ? messages[activeConversationId] || []
    : [];

  const currentConv = conversations.find((c) => c.id === activeConversationId);
  const isWelcome = !activeConversationId || currentMessages.length === 0;

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, isStreaming]);

  // Export chat function (Downloads as formatted Markdown file)
  const handleExportChat = () => {
    if (currentMessages.length === 0) return;

    const title = currentConv?.title || "การสนทนา Goomiru AI";
    const dateStr = new Date().toLocaleString("th-TH");

    let markdownContent = `# ${title}\n`;
    markdownContent += `> บันทึกการสนทนาจาก Goomiru AI • ${dateStr}\n\n---\n\n`;

    currentMessages.forEach((msg) => {
      const roleName = msg.role === "user" ? "คุณ (User)" : (msg.modelName || "Goomairu AI");
      markdownContent += `### ${roleName}\n${msg.content}\n\n---\n\n`;
    });

    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `goomiru_chat_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsExported(true);
    setTimeout(() => setIsExported(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#131314] text-[#f1f5f9]">
      {/* Top Header Bar when in active chat */}
      {!isWelcome && (
        <div className="w-full max-w-3xl mx-auto flex items-center justify-between px-4 pt-3 pb-1 shrink-0 select-none">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-xs">
              {currentConv?.title || "การสนทนา"}
            </span>
            <span className="text-[10.5px] text-slate-500">• {currentMessages.length} ข้อความ</span>
          </div>

          <button
            type="button"
            onClick={handleExportChat}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#1e1f20] hover:bg-[#282a2c] text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer text-xs font-medium active:scale-95 shadow-xs"
            title="ส่งออกบทสนทนานี้เป็นไฟล์ Markdown (.md)"
          >
            {isExported ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">ส่งออกแล้ว</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                <span>ส่งออกแชท</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Scrollable Message List or Welcome Screen */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-2 flex flex-col justify-between">
        {isWelcome ? (
          <div className="flex-1 flex flex-col justify-center items-center">
            <WelcomeScreen />
          </div>
        ) : (
          <div className="w-full max-w-3xl mx-auto flex-1">
            {currentMessages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Quick Action Chips & Composer Footer */}
      <div className="shrink-0 pb-2">
        {isWelcome && (
          <div className="w-full max-w-3xl mx-auto">
            <QuickActionChips />
          </div>
        )}
        <ChatComposer />
      </div>
    </div>
  );
}
