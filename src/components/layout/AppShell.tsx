"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { MobileHeader } from "./MobileHeader";
import { MobileDrawer } from "./MobileDrawer";
import { SearchModal } from "@/components/search/SearchModal";
import { ModelSelectorModal } from "@/components/models/ModelSelectorModal";
import { AuthModal } from "@/components/auth/AuthModal";
import { VisitorTracker } from "@/components/analytics/VisitorTracker";
import { useUIStore } from "@/lib/store/useUIStore";
import { ChatView } from "@/components/chat/ChatView";
import { PromptLibraryView } from "@/components/prompts/PromptLibraryView";
import { FileLibraryView } from "@/components/files/FileLibraryView";
import { LearnView } from "@/components/learn/LearnView";
import { FoldersView } from "@/components/folders/FoldersView";
import { SettingsView } from "@/components/settings/SettingsView";

export function AppShell({ children }: { children?: React.ReactNode }) {
  const { activeTab } = useUIStore();

  const renderActiveView = () => {
    switch (activeTab) {
      case "chat":
        return <ChatView />;
      case "prompts":
        return <PromptLibraryView />;
      case "saved":
        return <PromptLibraryView onlyFavorites />;
      case "library":
        return <FileLibraryView />;
      case "learn":
        return <LearnView />;
      case "folders":
        return <FoldersView />;
      case "settings":
        return <SettingsView />;
      default:
        return <ChatView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#131314] text-[#f1f5f9]">
      {/* Background Silent Visitor IP Tracker */}
      <VisitorTracker />

      {/* Desktop / Tablet Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Header & Drawer */}
      <MobileDrawer />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#131314]">
        <MobileHeader />
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative bg-[#131314]">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Accessible Modals */}
      <SearchModal />
      <ModelSelectorModal />
      <AuthModal />
    </div>
  );
}
