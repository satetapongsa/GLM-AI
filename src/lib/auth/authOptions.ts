import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { upsertUser } from "@/lib/db/neon";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const displayName = credentials.name || credentials.email.split("@")[0] || "User";
        return {
          id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: displayName,
          email: credentials.email,
        };
      },
    }),
  ],
  pages: {
    signIn: "/",
    error: "/",
  },
  secret: process.env.NEXTAUTH_SECRET || "goomiru-secret-auth-key-2026-production-token",
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
            name: user.name || user.email.split("@")[0],
            avatar: user.image || undefined,
            authProvider: account?.provider || "credentials",
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
