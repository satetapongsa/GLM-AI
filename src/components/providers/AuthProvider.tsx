"use client";

import React, { useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { useAuthStore } from "@/lib/store/useAuthStore";

function AuthSessionSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const googleUser = session.user;
      useAuthStore.setState({
        user: {
          id: (googleUser as { id?: string }).id || `usr-google-${Date.now()}`,
          name: googleUser.name || "Google User",
          email: googleUser.email || "user@gmail.com",
          avatar: googleUser.image || undefined,
          role: "ผู้ใช้บัญชี Google",
        },
        isAuthenticated: true,
        isAuthModalOpen: false, // Automatically close auth popup modal on successful authentication!
      });
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
