import { create } from "zustand";
import { Prompt, PromptCategory } from "@/lib/types";
import { INITIAL_PROMPTS } from "@/lib/config/defaultData";

interface PromptState {
  prompts: Prompt[];
  selectedCategory: PromptCategory | "All";
  searchQuery: string;

  // Actions
  setSelectedCategory: (category: PromptCategory | "All") => void;
  setSearchQuery: (query: string) => void;
  toggleFavorite: (id: string) => void;
  addPrompt: (prompt: Omit<Prompt, "id" | "createdAt">) => void;
  updatePrompt: (id: string, prompt: Partial<Prompt>) => void;
  deletePrompt: (id: string) => void;
}

export const usePromptStore = create<PromptState>((set) => ({
  prompts: INITIAL_PROMPTS,
  selectedCategory: "All",
  searchQuery: "",

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleFavorite: (id) =>
    set((s) => ({
      prompts: s.prompts.map((p) =>
        p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
      ),
    })),

  addPrompt: (promptData) => {
    const newPrompt: Prompt = {
      ...promptData,
      id: `prompt-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isCustom: true,
    };
    set((s) => ({ prompts: [newPrompt, ...s.prompts] }));
  },

  updatePrompt: (id, data) =>
    set((s) => ({
      prompts: s.prompts.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
      ),
    })),

  deletePrompt: (id) =>
    set((s) => ({
      prompts: s.prompts.filter((p) => p.id !== id),
    })),
}));
