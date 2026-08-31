"use client";

import React, { useState } from "react";
import { Message } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { CodeBlock } from "./CodeBlock";
import { MessageActions } from "./MessageActions";
import { formatFileSize, formatRelativeTime } from "@/lib/utils/formatters";
import { useChatStore } from "@/lib/store/useChatStore";
import {
  FileText,
  Brain,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Edit2,
  Check,
  X,
  Clock,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const { regenerateResponse, editMessageAndResend, isStreaming } = useChatStore();
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

    // Split code blocks ```lang ... ```
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const lines = part.slice(3, -3).trim().split("\n");
        const language = lines[0].trim();
        const code = lines.slice(1).join("\n");
        return <CodeBlock key={index} language={language} code={code} />;
      }

      // Regular text formatting (headings, lists, bold, blockquotes, tables)
      const paragraphs = part.split("\n\n");
      return (
        <div key={index} className="space-y-3">
          {paragraphs.map((para, pIdx) => {
            const trimmed = para.trim();
            if (!trimmed) return null;

            // Headings
            if (trimmed.startsWith("### ")) {
              return (
                <h4 key={pIdx} className="text-sm sm:text-base font-bold text-[hsl(var(--foreground))] mt-4 mb-1.5">
                  {trimmed.replace("### ", "")}
                </h4>
              );
            }
            if (trimmed.startsWith("## ")) {
              return (
                <h3 key={pIdx} className="text-base sm:text-lg font-bold text-[hsl(var(--foreground))] mt-5 mb-2 border-b border-[hsl(var(--border))] pb-1">
                  {trimmed.replace("## ", "")}
                </h3>
              );
            }

            // Blockquote
            if (trimmed.startsWith("> ")) {
              return (
                <blockquote
                  key={pIdx}
                  className="border-l-3 border-blue-500 bg-blue-500/5 px-3.5 py-2 rounded-r-xl text-xs sm:text-sm text-[hsl(var(--foreground))] italic my-2"
                >
                  {trimmed.replace(/^>\s*/gm, "")}
                </blockquote>
              );
            }

            // Tables (Markdown table)
            if (trimmed.includes("|") && trimmed.includes("\n")) {
              const rows = trimmed.split("\n").filter((r) => r.trim().startsWith("|"));
              if (rows.length >= 2) {
                const headerCells = rows[0]
                  .split("|")
                  .filter((c) => c.trim().length > 0)
                  .map((c) => c.trim());

                const bodyRows = rows.slice(2).map((r) =>
                  r
                    .split("|")
                    .filter((c) => c.trim().length > 0)
                    .map((c) => c.trim())
                );

                return (
                  <div key={pIdx} className="my-3 overflow-x-auto rounded-xl border border-[hsl(var(--border))]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] font-semibold">
                        <tr>
                          {headerCells.map((h, hIdx) => (
                            <th key={hIdx} className="px-3.5 py-2 border-b border-[hsl(var(--border))]">
                              {h.replace(/\*\*/g, "")}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[hsl(var(--border))]">
                        {bodyRows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-[hsl(var(--muted)/0.3)]">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-3.5 py-2">
                                {cell.replace(/\*\*/g, "")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }
            }

            // Bullet Lists
            if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
              const items = trimmed.split(/\n[-*]\s+/).filter(Boolean);
              return (
                <ul key={pIdx} className="list-disc list-inside space-y-1 my-2 pl-1">
                  {items.map((item, iIdx) => (
                    <li key={iIdx} className="text-xs sm:text-sm text-[hsl(var(--foreground))] leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              );
            }

            // Numbered Lists
            if (/^\d+\.\s+/.test(trimmed)) {
              const items = trimmed.split(/\n\d+\.\s+/).filter(Boolean);
              return (
                <ol key={pIdx} className="list-decimal list-inside space-y-1 my-2 pl-1">
                  {items.map((item, iIdx) => (
                    <li key={iIdx} className="text-xs sm:text-sm text-[hsl(var(--foreground))] leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ol>
              );
            }

            // Default Paragraph
            return (
              <p key={pIdx} className="text-xs sm:text-sm text-[hsl(var(--foreground))] leading-relaxed">
                {trimmed}
              </p>
            );
          })}
        </div>
      );
    });
  };

  if (isUser) {
    return (
      <div className="flex justify-end my-4 px-1 select-text group">
        <div className="max-w-[85%] sm:max-w-[75%] flex flex-col items-end">
          {/* Attached Files */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 justify-end">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 p-1.5 px-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-xs"
                >
                  <FileText className="h-4 w-4 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="font-medium truncate max-w-[150px]">{att.name}</span>
                    <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                      {formatFileSize(att.size)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* User Bubble */}
          <div className="relative rounded-2xl rounded-tr-xs bg-blue-600 text-white px-4 py-2.5 text-xs sm:text-sm shadow-sm leading-relaxed">
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full bg-black/20 text-white rounded-lg p-2 text-xs sm:text-sm outline-none resize-none"
                  rows={3}
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-1 hover:bg-white/20 rounded cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="p-1 hover:bg-white/20 rounded cursor-pointer font-bold"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <span>{message.content}</span>
            )}
          </div>

          {/* Edit trigger on hover */}
          {!isEditing && (
            <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                {formatRelativeTime(message.createdAt)}
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] cursor-pointer rounded"
                title="แก้ไขข้อความ"
              >
                <Edit2 className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // AI Assistant Message
  return (
    <div className="flex items-start gap-3.5 my-5 px-1 select-text group">
      {/* Bot Avatar */}
      <Avatar variant="bot" size="md" className="shrink-0 mt-0.5" />

      <div className="flex-1 min-w-0">
        {/* Model Badge Header + Thinking Time + Tokens Badge */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="text-xs font-bold text-[hsl(var(--foreground))] flex items-center gap-1.5">
            {message.modelName || "GML AI"}
          </span>
          <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
            {formatRelativeTime(message.createdAt)}
          </span>

          {/* Elapsed Thinking Time */}
          {message.thinkingTimeSeconds !== undefined && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10.5px] text-slate-600 dark:text-slate-400 font-medium"
              title="เวลาที่ใช้ในการประมวลผลคำตอบ"
            >
              <Clock className="h-3 w-3 text-slate-500" />
              <span>{message.thinkingTimeSeconds}s</span>
            </span>
          )}

          {/* Tokens Consumed Badge */}
          {message.tokensUsed !== undefined && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-[10.5px] text-blue-600 dark:text-blue-400 font-semibold border border-blue-200/50 dark:border-blue-800/50"
              title="จำนวนโทเคนที่ใช้ไปในคำตอบนี้"
            >
              <Coins className="h-3 w-3 text-blue-500" />
              <span>{message.tokensUsed} โทเคน</span>
            </span>
          )}
        </div>

        {/* Reasoning Dropdown (if available) */}
        {message.reasoning && (
          <div className="my-2 rounded-xl bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))] text-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setShowReasoning(!showReasoning)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] cursor-pointer font-medium"
            >
              <div className="flex items-center gap-1.5">
                <Brain className="h-3.5 w-3.5 text-indigo-500" />
                <span>กระบวนการคิด (Thought Process)</span>
              </div>
              {showReasoning ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
            {showReasoning && (
              <div className="px-3.5 py-2.5 border-t border-[hsl(var(--border))] text-xs text-[hsl(var(--muted-foreground))] leading-relaxed italic bg-[hsl(var(--card)/0.4)]">
                {message.reasoning}
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {message.isError && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs my-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="flex-1">{message.errorMessage || "เกิดข้อผิดพลาดในการตอบกลับ"}</span>
            <button
              type="button"
              disabled={isStreaming}
              onClick={() => regenerateResponse(message.id)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500 text-white font-medium text-xs hover:bg-red-600 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>ลองใหม่</span>
            </button>
          </div>
        )}

        {/* Content & Streaming Cursor */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {message.content ? (
            renderFormattedContent(message.content)
          ) : message.isStreaming ? (
            <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] py-2">
              <Sparkles className="h-4 w-4 text-blue-500 animate-spin" />
              <span>GML กำลังคิดและตอบกลับ...</span>
            </div>
          ) : null}

          {message.isStreaming && message.content && (
            <span className="inline-block w-2 h-4 ml-1 bg-blue-500 rounded-xs animate-pulse align-middle" />
          )}
        </div>

        {/* Message Actions Bar (Only show when not streaming) */}
        {!message.isStreaming && !message.isError && message.content && (
          <MessageActions message={message} />
        )}
      </div>
    </div>
  );
}
