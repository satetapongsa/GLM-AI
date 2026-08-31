"use client";

import React, { useEffect } from "react";
import { useUIStore } from "@/lib/store/useUIStore";
import { Sidebar } from "./Sidebar";

export function MobileDrawer() {
  const { isMobileDrawerOpen, setMobileDrawerOpen } = useUIStore();

  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileDrawerOpen]);

  if (!isMobileDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={() => setMobileDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 left-0 w-[300px] max-w-[85vw] bg-[hsl(var(--sidebar-bg))] shadow-2xl animate-in slide-in-from-left duration-200 flex flex-col z-10">
        <Sidebar />
      </div>
    </div>
  );
}
