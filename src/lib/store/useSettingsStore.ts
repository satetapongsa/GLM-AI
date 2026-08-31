import { create } from "zustand";
import { UserSettings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/config/defaultData";

interface SettingsState {
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,

  updateSettings: (partial) =>
    set((state) => ({
      settings: { ...state.settings, ...partial },
    })),

  resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
}));
