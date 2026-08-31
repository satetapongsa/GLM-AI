import { create } from "zustand";
import { Assistant } from "@/lib/types";
import { INITIAL_ASSISTANTS } from "@/lib/config/defaultData";

interface AssistantState {
  assistants: Assistant[];
  activeAssistantId: string | null;
  searchQuery: string;

  // Actions
  setActiveAssistant: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  togglePinAssistant: (id: string) => void;
  addAssistant: (assistant: Omit<Assistant, "id" | "createdAt">) => void;
  updateAssistant: (id: string, data: Partial<Assistant>) => void;
  deleteAssistant: (id: string) => void;
}

export const useAssistantStore = create<AssistantState>((set) => ({
  assistants: INITIAL_ASSISTANTS,
  activeAssistantId: null,
  searchQuery: "",

  setActiveAssistant: (id) => set({ activeAssistantId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  togglePinAssistant: (id) =>
    set((s) => ({
      assistants: s.assistants.map((a) =>
        a.id === id ? { ...a, isPinned: !a.isPinned } : a
      ),
    })),

  addAssistant: (assistantData) => {
    const newAssistant: Assistant = {
      ...assistantData,
      id: `asst-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ assistants: [...s.assistants, newAssistant] }));
  },

  updateAssistant: (id, data) =>
    set((s) => ({
      assistants: s.assistants.map((a) => (a.id === id ? { ...a, ...data } : a)),
    })),

  deleteAssistant: (id) =>
    set((s) => ({
      assistants: s.assistants.filter((a) => a.id !== id),
      activeAssistantId: s.activeAssistantId === id ? null : s.activeAssistantId,
    })),
}));
