import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TokenState {
  dailyLimit: number;
  usedTokensToday: number;
  lastResetDate: string;
  consumeTokens: (count: number) => number;
  resetDailyQuota: () => void;
  getRemainingTokens: () => number;
}

export function calculateTokensForRequest(prompt: string, responseLength: number = 100): number {
  const len = prompt.trim().length + responseLength;
  if (len < 30) return Math.floor(Math.random() * 2) + 1; // 1 - 2 tokens
  if (len < 100) return Math.floor(Math.random() * 3) + 3; // 3 - 5 tokens
  if (len < 250) return Math.floor(Math.random() * 3) + 6; // 6 - 8 tokens
  if (len < 500) return Math.floor(Math.random() * 2) + 9; // 9 - 10 tokens
  return Math.min(12, Math.floor(Math.random() * 2) + 11); // 11 - 12 tokens max
}

export const useTokenStore = create<TokenState>()(
  persist(
    (set, get) => ({
      dailyLimit: 1000,
      usedTokensToday: 12,
      lastResetDate: new Date().toISOString().split("T")[0],

      consumeTokens: (count: number) => {
        const today = new Date().toISOString().split("T")[0];
        const state = get();

        // Check if day rolled over
        let currentUsed = state.usedTokensToday;
        if (state.lastResetDate !== today) {
          currentUsed = 0;
        }

        const newUsed = Math.min(state.dailyLimit, currentUsed + count);
        set({
          usedTokensToday: newUsed,
          lastResetDate: today,
        });

        return count;
      },

      resetDailyQuota: () => {
        set({
          usedTokensToday: 0,
          lastResetDate: new Date().toISOString().split("T")[0],
        });
      },

      getRemainingTokens: () => {
        const state = get();
        return Math.max(0, state.dailyLimit - state.usedTokensToday);
      },
    }),
    {
      name: "gml-token-quota",
    }
  )
);
