import { create } from "zustand";
import { persist } from "zustand/middleware";
import { signOut } from "next-auth/react";

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
  isLogoutConfirmOpen: boolean;

  // Actions
  login: (email: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, password?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithGoogleAccount: (email: string, name?: string, avatar?: string) => Promise<boolean>;
  logout: () => void;
  openAuthModal: (mode?: "login" | "register") => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: "login" | "register") => void;
  openLogoutConfirm: () => void;
  closeLogoutConfirm: () => void;
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
      user: null,
      isAuthenticated: false,
      isAuthModalOpen: false,
      authModalMode: "login",
      isLogoutConfirmOpen: false,

      login: async (email: string) => {
        const cleanEmail = email.trim();
        const username = cleanEmail.split("@")[0] || "user";
        const newUser: AuthUser = {
          id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: username,
          email: cleanEmail,
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
        const cleanEmail = email.trim();
        const cleanName = name.trim() || cleanEmail.split("@")[0] || "user";
        const newUser: AuthUser = {
          id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: cleanName,
          email: cleanEmail,
          role: "สมาชิก Goomiru",
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
          id: `usr-google-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: "Goomiru User",
          email: "user@gmail.com",
          role: "ผู้ใช้ Google",
        };

        set({
          user: newUser,
          isAuthenticated: true,
          isAuthModalOpen: false,
        });

        syncUserToDb(newUser, "google");
        return true;
      },

      loginWithGoogleAccount: async (
        email: string,
        name?: string,
        avatar = ""
      ) => {
        const cleanEmail = email.trim();
        const cleanName = (name && name.trim()) || cleanEmail.split("@")[0] || "Google User";
        const newUser: AuthUser = {
          id: `usr-google-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: cleanName,
          email: cleanEmail,
          avatar: avatar,
          role: "ผู้ใช้ Google",
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
        try {
          signOut({ redirect: false }).catch(() => {});
        } catch {}

        set({
          user: null,
          isAuthenticated: false,
          isAuthModalOpen: false,
          isLogoutConfirmOpen: false,
        });
      },

      openAuthModal: (mode = "login") =>
        set({ isAuthModalOpen: true, authModalMode: mode }),

      closeAuthModal: () => set({ isAuthModalOpen: false }),

      setAuthModalMode: (mode) => set({ authModalMode: mode }),

      openLogoutConfirm: () => set({ isLogoutConfirmOpen: true }),

      closeLogoutConfirm: () => set({ isLogoutConfirmOpen: false }),
    }),
    {
      name: "goomairu-auth-storage",
    }
  )
);
