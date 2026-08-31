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

function syncUserToDb(user: AuthUser, authProvider = "email") {
  try {
    fetch("/api/user/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        authProvider,
        role: user.role,
      }),
    }).catch(() => {});
  } catch {}
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
        const newUser: AuthUser = {
          id: `usr-${Date.now()}`,
          name: username,
          email: email,
          role: "ผู้ใช้ทั่วไป",
        };

        set({
          user: newUser,
          isAuthenticated: true,
          isAuthModalOpen: false,
        });

        syncUserToDb(newUser, "email");
        return true;
      },

      register: async (name: string, email: string) => {
        const newUser: AuthUser = {
          id: `usr-${Date.now()}`,
          name: name.trim() || email.split("@")[0] || "user",
          email: email,
          role: "สมาชิกใหม่",
        };

        set({
          user: newUser,
          isAuthenticated: true,
          isAuthModalOpen: false,
        });

        syncUserToDb(newUser, "email");
        return true;
      },

      loginWithGoogle: async () => {
        const newUser: AuthUser = {
          id: `usr-google-${Date.now()}`,
          name: BRAND_CONFIG.defaultUser.name,
          email: BRAND_CONFIG.defaultUser.email,
          role: "ผู้ใช้บัญชี Google",
        };

        set({
          user: newUser,
          isAuthenticated: true,
          isAuthModalOpen: false,
        });

        syncUserToDb(newUser, "google");
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
