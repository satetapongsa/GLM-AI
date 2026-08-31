import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { upsertUser } from "@/lib/db/neon";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "gml-secret-auth-key-2026-production-token",
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (user?.email) {
        try {
          // Persist/Update user profile in Neon PostgreSQL Database
          await upsertUser({
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.image,
            authProvider: account?.provider || "google",
            role: "user",
          });
        } catch (err) {
          console.error("Failed to sync user to Neon database:", err);
        }
      }
      return true;
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
};
