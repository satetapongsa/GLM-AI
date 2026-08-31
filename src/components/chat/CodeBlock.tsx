"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

export interface CodeBlockProps {
  language: string;
  code: string;
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="relative my-4 rounded-2xl overflow-hidden border border-zinc-700/60 bg-zinc-950 text-zinc-100 font-mono shadow-md text-xs">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 select-none">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="คัดลอกโค้ด"
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          {isCopied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">คัดลอกแล้ว</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>คัดลอก</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-xs leading-relaxed text-zinc-200 whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
