"use client";

import React, { useState } from "react";
import { Message } from "@/lib/types";
import { CodeBlock } from "./CodeBlock";
import { MessageActions } from "./MessageActions";
import { formatFileSize, formatRelativeTime } from "@/lib/utils/formatters";
import { useChatStore } from "@/lib/store/useChatStore";
import { useTokenStore } from "@/lib/store/useTokenStore";
import {
  FileText,
  Brain,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Edit2,
  Check,
  X,
  Clock,
  Coins,
  Activity,
} from "lucide-react";

export interface ChatMessageProps {
  message: Message;
}

/**
 * Parses inline markdown tokens:
 * - **bold text**
 * - *italic*
 * - `code`
 */
function renderInlineText(text: string): React.ReactNode {
  if (!text) return null;

  // Split by bold (**...**), inline code (`...`), and italics (*...*)
  const tokens = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);

  return tokens.map((token, idx) => {
    if (token.startsWith("**") && token.endsWith("**") && token.length >= 4) {
      return (
        <strong key={idx} className="font-semibold text-[#f1f5f9]">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith("`") && token.endsWith("`") && token.length >= 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-[#131314] border border-[rgba(255,255,255,0.08)] text-sky-400 font-mono text-xs"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith("*") && token.endsWith("*") && token.length >= 2) {
      return (
        <em key={idx} className="italic text-slate-300">
          {token.slice(1, -1)}
        </em>
      );
    }
    return <span key={idx}>{token}</span>;
  });
}

/**
 * Parses content and instantly recognizes both completed and in-progress streaming code blocks.
 */
function parseContentWithCodeBlocks(content: string) {
  const result: { type: "code" | "text"; language?: string; content: string }[] = [];

  let remaining = content;
  while (remaining.length > 0) {
    const codeStartIndex = remaining.indexOf("```");
    if (codeStartIndex === -1) {
      result.push({ type: "text", content: remaining });
      break;
    }

    // Push text before code block
    if (codeStartIndex > 0) {
      result.push({ type: "text", content: remaining.slice(0, codeStartIndex) });
    }

    const afterStart = remaining.slice(codeStartIndex + 3);
    const codeEndIndex = afterStart.indexOf("```");

    if (codeEndIndex === -1) {
      // In-progress streaming code block (renders instantly!)
      const newlineIndex = afterStart.indexOf("\n");
      let language = "code";
      let code = afterStart;
      if (newlineIndex !== -1) {
        language = afterStart.slice(0, newlineIndex).trim() || "code";
        code = afterStart.slice(newlineIndex + 1);
      }
      result.push({ type: "code", language, content: code });
      break;
    } else {
      // Complete code block
      const fullBlock = afterStart.slice(0, codeEndIndex);
      const newlineIndex = fullBlock.indexOf("\n");
      let language = "code";
      let code = fullBlock;
      if (newlineIndex !== -1) {
        language = fullBlock.slice(0, newlineIndex).trim() || "code";
        code = fullBlock.slice(newlineIndex + 1);
      }
      result.push({ type: "code", language, content: code });
      remaining = afterStart.slice(codeEndIndex + 3);
    }
  }
  return result;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const { editMessageAndResend } = useChatStore();
  const { usedTokensToday, dailyLimit } = useTokenStore();
  const [showReasoning, setShowReasoning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== message.content) {
      editMessageAndResend(message.id, editText.trim());
    }
    setIsEditing(false);
  };

  // Helper to render markdown content
  const renderFormattedContent = (content: string) => {
    if (!content) return null;

    const sections = parseContentWithCodeBlocks(content);

    return sections.map((section, sIdx) => {
      if (section.type === "code") {
        return (
          <CodeBlock
            key={sIdx}
            language={section.language || "code"}
            code={section.content}
          />
        );
      }

      // Format pure text
      const lines = section.content.split("\n");
      return (
        <div key={sIdx} className="space-y-1.5 my-1 text-slate-200 leading-relaxed text-[13.5px]">
          {lines.map((line, lIdx) => {
            const trimmed = line.trim();
            if (!trimmed) {
              return <div key={lIdx} className="h-1.5" />;
            }

            // Bullet Point Line
            if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
              return (
                <div key={lIdx} className="flex items-start gap-2 pl-2">
                  <span className="text-blue-400 mt-1.5 text-[8px]">●</span>
                  <div className="flex-1">{renderInlineText(trimmed.slice(2))}</div>
                </div>
              );
            }

            // Numbered List Line
            const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
            if (numberedMatch) {
              return (
                <div key={lIdx} className="flex items-start gap-2 pl-2">
                  <span className="font-semibold text-blue-400 min-w-[16px] text-xs">
                    {numberedMatch[1]}.
                  </span>
                  <div className="flex-1">{renderInlineText(numberedMatch[2])}</div>
                </div>
              );
            }

            // Heading 3
            if (trimmed.startsWith("### ")) {
              return (
                <h4 key={lIdx} className="text-[14.5px] font-bold text-white mt-3 mb-1">
                  {renderInlineText(trimmed.slice(4))}
                </h4>
              );
            }

            // Heading 2
            if (trimmed.startsWith("## ")) {
              return (
                <h3 key={lIdx} className="text-base font-bold text-white mt-3.5 mb-1.5">
                  {renderInlineText(trimmed.slice(3))}
                </h3>
              );
            }

            // Regular paragraph line
            return <p key={lIdx}>{renderInlineText(line)}</p>;
          })}
        </div>
      );
    });
  };

  // User Message
  if (isUser) {
    return (
      <div className="flex justify-end my-3 px-1 select-text group/msg">
        <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%] space-y-1.5">
          {/* Attached Files / Images Preview */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-end mb-1">
              {message.attachments.map((att) => {
                const isImg = att.type?.startsWith("image/") || att.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                return (
                  <div
                    key={att.id}
                    className="flex items-center gap-2 p-1.5 px-2.5 rounded-xl bg-[#1e1f20] border border-[rgba(255,255,255,0.08)] text-xs text-slate-300 shadow-xs max-w-xs"
                  >
                    {isImg && att.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={att.url}
                        alt={att.name}
                        className="h-7 w-7 rounded-lg object-cover border border-white/10 shrink-0"
                      />
                    ) : (
                      <div className="p-1 rounded-md bg-blue-500/10 text-blue-400 shrink-0">
                        <FileText className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-[11px] text-slate-200">{att.name}</p>
                      <p className="text-[9.5px] text-slate-500">{formatFileSize(att.size)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* User Bubble */}
          <div className="relative group/bubble">
            {isEditing ? (
              <div className="p-3 rounded-2xl bg-[#1e1f20] border border-blue-500 shadow-lg space-y-2 min-w-[260px]">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-2 bg-[#131314] text-white text-xs sm:text-sm rounded-xl focus:outline-none resize-none min-h-[60px]"
                  autoFocus
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-1 px-2.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                    <span>ยกเลิก</span>
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="p-1 px-2.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Check className="h-3 w-3" />
                    <span>บันทึก & ส่งใหม่</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 py-2.5 rounded-[20px] rounded-tr-sm bg-[#0b57d0] text-white text-xs sm:text-sm font-normal leading-relaxed shadow-xs">
                {message.content}
              </div>
            )}

            {/* Quick Edit Button on Hover */}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover/bubble:opacity-100 absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                title="แก้ไขข้อความ"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Calculate Tokens for this message
  const currentTokens =
    message.tokensUsed !== undefined && message.tokensUsed > 0
      ? message.tokensUsed
      : Math.max(1, Math.round((message.content.length + 30) / 4));

  // Assistant Message
  return (
    <div className="flex items-start gap-3 my-4 px-1 select-text group animate-fade-up">
      {/* GML Avatar Icon */}
      <div className="shrink-0 mt-0.5">
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#0842a0] via-[#0b57d0] to-[#38bdf8] flex items-center justify-center text-white shadow-xs">
          <Sparkles className="h-4 w-4" />
        </div>
      </div>

      <div className="flex-1 min-w-0 max-w-[90%] sm:max-w-[85%] space-y-2">
        {/* Model Metadata Header */}
        <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-400">
          <span className="font-semibold text-slate-200">
            {message.modelName || "GML AI (DeepSeek)"}
          </span>

          <span className="text-[10px] text-slate-500">
            {formatRelativeTime(message.createdAt)}
          </span>

          {/* Thinking Time Badge */}
          <span className="flex items-center gap-1 text-[10.5px] text-slate-300 bg-[#1e1f20] px-2 py-0.5 rounded-md border border-[rgba(255,255,255,0.08)]">
            <Clock className="h-3 w-3 text-slate-400" />
            <span>{message.thinkingTimeSeconds !== undefined && message.thinkingTimeSeconds > 0 ? `${message.thinkingTimeSeconds.toFixed(1)}s` : "0.8s"}</span>
          </span>

          {/* Token Used in this Turn Badge */}
          <span className="flex items-center gap-1 text-[11px] font-semibold text-sky-400 bg-sky-950/50 px-2 py-0.5 rounded-md border border-sky-800/40 shadow-2xs">
            <Coins className="h-3 w-3 text-sky-400" />
            <span>{currentTokens} โทเคน</span>
          </span>
        </div>

        {/* Thought Process (Reasoning Trace) Dropdown */}
        {message.reasoning && (
          <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#1e1f20]/60 overflow-hidden text-xs">
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className="w-full flex items-center justify-between px-3.5 py-2 text-slate-300 hover:text-white transition-colors cursor-pointer bg-[#1e1f20]/90"
            >
              <div className="flex items-center gap-2">
                <Brain className="h-3.5 w-3.5 text-sky-400" />
                <span className="font-medium text-[11px]">กระบวนการคิด (Thought Process)</span>
              </div>
              {showReasoning ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {showReasoning && (
              <div className="p-3.5 border-t border-[rgba(255,255,255,0.06)] font-mono text-[11px] text-slate-300 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap bg-[#131314]">
                {message.reasoning}
              </div>
            )}
          </div>
        )}

        {/* Formatted Content with Real-time CodeBlock Rendering */}
        <div className="prose-clean">
          {renderFormattedContent(message.content)}
        </div>

        {/* Action Toolbar */}
        <div className="pt-1">
          <MessageActions message={message} />
        </div>
      </div>
    </div>
  );
}
