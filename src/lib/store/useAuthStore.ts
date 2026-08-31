import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BRAND_CONFIG } from "@/lib/config/brand";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "register";

  // Actions
  login: (email: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, password?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  openAuthModal: (mode?: "login" | "register") => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: "login" | "register") => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: {
        id: BRAND_CONFIG.defaultUser.id,
        name: BRAND_CONFIG.defaultUser.name,
        email: BRAND_CONFIG.defaultUser.email,
        avatar: BRAND_CONFIG.defaultUser.avatar,
        role: BRAND_CONFIG.defaultUser.role,
      },
      isAuthenticated: true,
      isAuthModalOpen: false,
      authModalMode: "login",

      login: async (email: string) => {
        const username = email.split("@")[0] || "user";
        set({
          user: {
            id: `usr-${Date.now()}`,
            name: username,
            email: email,
            role: "User",
          },
          isAuthenticated: true,
          isAuthModalOpen: false,
        });
        return true;
      },

      register: async (name: string, email: string) => {
        set({
          user: {
            id: `usr-${Date.now()}`,
            name: name.trim() || email.split("@")[0] || "user",
            email: email,
            role: "User",
          },
          isAuthenticated: true,
          isAuthModalOpen: false,
        });
        return true;
      },

      loginWithGoogle: async () => {
        set({
          user: {
            id: `usr-google-${Date.now()}`,
            name: BRAND_CONFIG.defaultUser.name,
            email: BRAND_CONFIG.defaultUser.email,
            role: "User",
          },
          isAuthenticated: true,
          isAuthModalOpen: false,
        });
        return true;
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isAuthModalOpen: false,
        });
      },

      openAuthModal: (mode = "login") =>
        set({ isAuthModalOpen: true, authModalMode: mode }),

      closeAuthModal: () => set({ isAuthModalOpen: false }),

      setAuthModalMode: (mode) => set({ authModalMode: mode }),
    }),
    {
      name: "gml-auth-storage",
    }
  )
);
