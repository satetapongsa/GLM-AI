"use client";

import React, { useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useChatStore } from "@/lib/store/useChatStore";

function AuthSessionSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  // 1. Initial mount sync if already authenticated in local store
  useEffect(() => {
    const localUser = useAuthStore.getState().user;
    if (localUser?.email && localUser.email !== "guest_user") {
      useChatStore.getState().syncFromCloud(localUser.email);
    }
  }, []);

  // 2. NextAuth Google Session Sync & Cloud Chat Data Pull
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const googleUser = session.user;
      const email = googleUser.email || "user@gmail.com";

      useAuthStore.setState({
        user: {
          id: (googleUser as { id?: string }).id || `usr-google-${Date.now()}`,
          name: googleUser.name || "Google User",
          email,
          avatar: googleUser.image || undefined,
          role: "ผู้ใช้บัญชี Google",
        },
        isAuthenticated: true,
        isAuthModalOpen: false,
      });

      // Synchronize all conversations & messages from Neon PostgreSQL across all devices
      useChatStore.getState().syncFromCloud(email);
    }
  }, [session, status]);

  return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthSessionSync>{children}</AuthSessionSync>
    </SessionProvider>
  );
}
