"use client";

import React, { useEffect, useRef } from "react";
import { useChatStore } from "@/lib/store/useChatStore";
import { WelcomeScreen } from "./WelcomeScreen";
import { QuickActionChips } from "./QuickActionChips";
import { ChatMessage } from "./ChatMessage";
import { ChatComposer } from "./ChatComposer";

export function ChatView() {
  const { activeConversationId, messages, isStreaming } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentMessages = activeConversationId
    ? messages[activeConversationId] || []
    : [];

  const isWelcome = !activeConversationId || currentMessages.length === 0;

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, isStreaming]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#131314] text-[#f1f5f9]">
      {/* Scrollable Message List or Welcome Screen */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-4 flex flex-col justify-between">
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
