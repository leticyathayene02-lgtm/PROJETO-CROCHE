import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // After sign-in, redirect to /app/overview
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/app/overview`;
    },
  },
  events: {
    async createUser({ user }) {
      // Auto-create workspace for new users
      if (!user.id || !user.name) return;

      const slug = user.email!
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-");

      const uniqueSlug = `${slug}-${Date.now()}`;

      const workspace = await prisma.workspace.create({
        data: {
          name: `Ateliê de ${user.name}`,
          slug: uniqueSlug,
          ownerId: user.id,
          members: {
            create: {
              userId: user.id,
              role: "OWNER",
            },
          },
          subscription: {
            create: {
              plan: "FREE",
              status: "ACTIVE",
            },
          },
        },
      });

      // Initialize usage counter for current month
      const now = new Date();
      const monthYYYYMM = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;

      await prisma.usageCounter.create({
        data: {
          workspaceId: workspace.id,
          monthYYYYMM,
        },
      });
    },
  },
});

// Extend types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
