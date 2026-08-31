"use client";

import React, { useState } from "react";
import { Message } from "@/lib/types";
import { CodeBlock } from "./CodeBlock";
import { MessageActions } from "./MessageActions";
import { formatFileSize, formatRelativeTime } from "@/lib/utils/formatters";
import { useChatStore } from "@/lib/store/useChatStore";
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

      // Regular text formatting (headings, lists, bold, blockquotes, tables)
      const paragraphs = section.content.split("\n\n");
      return (
        <div key={sIdx} className="space-y-3">
          {paragraphs.map((para, pIdx) => {
            const trimmed = para.trim();
            if (!trimmed) return null;

            // Headings
            if (trimmed.startsWith("### ")) {
              return (
                <h4 key={pIdx} className="text-sm sm:text-base font-bold text-white mt-3 mb-1">
                  {renderInlineText(trimmed.replace("### ", ""))}
                </h4>
              );
            }
            if (trimmed.startsWith("## ")) {
              return (
                <h3 key={pIdx} className="text-base sm:text-lg font-bold text-white mt-4 mb-2 border-b border-[rgba(255,255,255,0.08)] pb-1">
                  {renderInlineText(trimmed.replace("## ", ""))}
                </h3>
              );
            }

            // Blockquote
            if (trimmed.startsWith("> ")) {
              return (
                <blockquote
                  key={pIdx}
                  className="border-l-3 border-blue-500 bg-blue-500/10 px-3.5 py-2 rounded-r-xl text-xs sm:text-sm text-slate-200 italic my-2"
                >
                  {renderInlineText(trimmed.replace(/^>\s*/gm, ""))}
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
                  <div key={pIdx} className="my-3 overflow-x-auto rounded-xl border border-[rgba(255,255,255,0.08)]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#1e1f20] text-white font-semibold">
                        <tr>
                          {headerCells.map((h, hIdx) => (
                            <th key={hIdx} className="px-3.5 py-2 border-b border-[rgba(255,255,255,0.08)]">
                              {renderInlineText(h)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgba(255,255,255,0.06)] bg-[#131314]">
                        {bodyRows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-[#1e1f20]/50">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-3.5 py-2">
                                {renderInlineText(cell)}
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
                <ul key={pIdx} className="list-disc list-inside space-y-1.5 my-2 pl-1">
                  {items.map((item, iIdx) => {
                    const cleanItem = item.replace(/^[-*]\s+/, "");
                    return (
                      <li key={iIdx} className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                        {renderInlineText(cleanItem)}
                      </li>
                    );
                  })}
                </ul>
              );
            }

            // Numbered Lists
            if (/^\d+\.\s+/.test(trimmed)) {
              const items = trimmed.split(/\n\d+\.\s+/).filter(Boolean);
              return (
                <ol key={pIdx} className="list-decimal list-inside space-y-1.5 my-2 pl-1">
                  {items.map((item, iIdx) => (
                    <li key={iIdx} className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {renderInlineText(item)}
                    </li>
                  ))}
                </ol>
              );
            }

            // Regular Paragraph with line breaks and inline styling
            const lines = trimmed.split("\n");
            return (
              <p key={pIdx} className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {lines.map((line, lIdx) => (
                  <React.Fragment key={lIdx}>
                    {lIdx > 0 && <br />}
                    {renderInlineText(line)}
                  </React.Fragment>
                ))}
              </p>
            );
          })}
        </div>
      );
    });
  };

  if (isUser) {
    return (
      <div className="flex justify-end my-4 px-1 select-text group animate-fade-up">
        <div className="max-w-[85%] sm:max-w-[75%] flex flex-col items-end">
          {/* Attached Files */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 justify-end">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 p-1.5 px-3 rounded-xl bg-[#1e1f20] border border-[rgba(255,255,255,0.08)] text-xs"
                >
                  <FileText className="h-4 w-4 text-blue-400" />
                  <div className="flex flex-col">
                    <span className="font-medium truncate max-w-[150px]">{att.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {formatFileSize(att.size)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* User Message Bubble */}
          <div className="relative group/bubble">
            {isEditing ? (
              <div className="flex flex-col gap-2 p-3 rounded-2xl bg-[#1e1f20] border border-blue-500 w-full min-w-[280px]">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full bg-transparent border-0 resize-none text-xs sm:text-sm text-white focus:outline-none"
                  rows={3}
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
            {message.modelName || "DeepSeek V3 (Chat)"}
          </span>

          <span className="text-[10px] text-slate-500">
            {formatRelativeTime(message.createdAt)}
          </span>

          {message.thinkingTimeSeconds !== undefined && message.thinkingTimeSeconds > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-slate-400 bg-[#1e1f20] px-1.5 py-0.5 rounded-md border border-[rgba(255,255,255,0.06)]">
              <Clock className="h-2.5 w-2.5" />
              <span>{message.thinkingTimeSeconds.toFixed(1)}s</span>
            </span>
          )}

          {message.tokensUsed !== undefined && message.tokensUsed > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-sky-400 bg-sky-950/40 px-1.5 py-0.5 rounded-md border border-sky-800/40">
              <Coins className="h-2.5 w-2.5" />
              <span>{message.tokensUsed} โทเคน</span>
            </span>
          )}
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
