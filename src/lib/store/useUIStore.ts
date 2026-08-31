import { create } from "zustand";

interface UIState {
  isSidebarCollapsed: boolean;
  isMobileDrawerOpen: boolean;
  isSearchModalOpen: boolean;
  isCreatePromptModalOpen: boolean;
  isCreateAssistantModalOpen: boolean;
  isUploadModalOpen: boolean;
  activeTab: "chat" | "prompts" | "saved" | "library" | "learn" | "assistants" | "settings";

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileDrawer: () => void;
  setMobileDrawerOpen: (open: boolean) => void;
  setSearchModalOpen: (open: boolean) => void;
  setCreatePromptModalOpen: (open: boolean) => void;
  setCreateAssistantModalOpen: (open: boolean) => void;
  setUploadModalOpen: (open: boolean) => void;
  setActiveTab: (tab: UIState["activeTab"]) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarCollapsed: false,
  isMobileDrawerOpen: false,
  isSearchModalOpen: false,
  isCreatePromptModalOpen: false,
  isCreateAssistantModalOpen: false,
  isUploadModalOpen: false,
  activeTab: "chat",

  toggleSidebar: () => set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  toggleMobileDrawer: () => set((s) => ({ isMobileDrawerOpen: !s.isMobileDrawerOpen })),
  setMobileDrawerOpen: (open) => set({ isMobileDrawerOpen: open }),
  setSearchModalOpen: (open) => set({ isSearchModalOpen: open }),
  setCreatePromptModalOpen: (open) => set({ isCreatePromptModalOpen: open }),
  setCreateAssistantModalOpen: (open) => set({ isCreateAssistantModalOpen: open }),
  setUploadModalOpen: (open) => set({ isUploadModalOpen: open }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
