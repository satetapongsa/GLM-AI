import { create } from "zustand";
import { Model, ModelCategory, ModelCapability, ModelCustomSettings } from "@/lib/types";
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID } from "@/lib/config/models";
import { useChatStore } from "./useChatStore";

const DEFAULT_SETTINGS: ModelCustomSettings = {
  temperature: 0.7,
  maxTokens: 4096,
  reasoningLevel: "medium",
  responseStyle: "balanced",
  webSearch: true,
  codeInterpreter: true,
  imageUnderstanding: true,
};

interface ModelState {
  models: Model[];
  selectedCategory: ModelCategory;
  selectedCapability: ModelCapability | "All";
  searchQuery: string;
  favoriteModelIds: string[];
  recentModelIds: string[];
  modelSettings: Record<string, ModelCustomSettings>;
  isModelModalOpen: boolean;
  isModelSettingsModalOpen: boolean;
  settingsTargetModelId: string | null;

  // Actions
  setSelectedCategory: (category: ModelCategory) => void;
  setSelectedCapability: (capability: ModelCapability | "All") => void;
  setSearchQuery: (query: string) => void;
  toggleFavoriteModel: (modelId: string) => void;
  selectModel: (modelId: string) => void;
  openModelModal: () => void;
  closeModelModal: () => void;
  openModelSettingsModal: (modelId: string) => void;
  closeModelSettingsModal: () => void;
  updateModelSettings: (modelId: string, settings: Partial<ModelCustomSettings>) => void;
  getSelectedModel: () => Model;
  getSettingsForModel: (modelId: string) => ModelCustomSettings;
}

export const useModelStore = create<ModelState>((set, get) => ({
  models: AVAILABLE_MODELS,
  selectedCategory: "all",
  selectedCapability: "All",
  searchQuery: "",
  favoriteModelIds: ["gpt-5.6-terra", "claude-3.7-sonnet", "gemini-3.1-pro"],
  recentModelIds: ["gemini-3.1-pro", "claude-3.7-sonnet", "gpt-5.6-terra"],
  modelSettings: {},
  isModelModalOpen: false,
  isModelSettingsModalOpen: false,
  settingsTargetModelId: null,

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedCapability: (capability) => set({ selectedCapability: capability }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleFavoriteModel: (modelId) =>
    set((state) => ({
      favoriteModelIds: state.favoriteModelIds.includes(modelId)
        ? state.favoriteModelIds.filter((id) => id !== modelId)
        : [...state.favoriteModelIds, modelId],
    })),

  selectModel: (modelId) => {
    useChatStore.getState().setActiveModel(modelId);
    set((state) => ({
      isModelModalOpen: false,
      recentModelIds: [modelId, ...state.recentModelIds.filter((id) => id !== modelId)].slice(0, 5),
    }));
  },

  openModelModal: () => set({ isModelModalOpen: true }),
  closeModelModal: () => set({ isModelModalOpen: false }),

  openModelSettingsModal: (modelId) =>
    set({ isModelSettingsModalOpen: true, settingsTargetModelId: modelId }),
  closeModelSettingsModal: () =>
    set({ isModelSettingsModalOpen: false, settingsTargetModelId: null }),

  updateModelSettings: (modelId, newSettings) =>
    set((state) => ({
      modelSettings: {
        ...state.modelSettings,
        [modelId]: {
          ...(state.modelSettings[modelId] || DEFAULT_SETTINGS),
          ...newSettings,
        },
      },
    })),

  getSelectedModel: () => {
    const activeModelId = useChatStore.getState().activeModelId || DEFAULT_MODEL_ID;
    return (
      AVAILABLE_MODELS.find((m) => m.id === activeModelId) || AVAILABLE_MODELS[0]
    );
  },

  getSettingsForModel: (modelId) => {
    const model = AVAILABLE_MODELS.find((m) => m.id === modelId);
    const custom = get().modelSettings[modelId];
    return (
      custom || {
        ...DEFAULT_SETTINGS,
        temperature: model?.defaultTemperature ?? 0.7,
        maxTokens: model?.maxTokens ?? 4096,
      }
    );
  },
}));
