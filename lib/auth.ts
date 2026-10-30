import { db } from "@/lib/db";
import { LOCALE_COOKIE_MAX_AGE, LOCALE_COOKIE_NAME, isValidLocale } from "@/lib/i18n/config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { cookies } from "next/headers";
import { updateWelcomeTourFlag } from "@/lib/onboarding";

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async signIn({ user, account, profile }) {

      if (account && user.id && profile) {
        const { db } = await import("@/lib/db");
        await db.user.update({
          where: { id: user.id },
          data: {
            name: profile.name || user.name,
            image: (profile as { picture?: string }).picture || user.image,
          },
        }).catch(() => {});

        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { locale: true },
        }).catch(() => null);

        if (dbUser?.locale && isValidLocale(dbUser.locale)) {
          const cookieStore = await cookies();
          cookieStore.set(LOCALE_COOKIE_NAME, dbUser.locale, {
            maxAge: LOCALE_COOKIE_MAX_AGE,
            path: "/",
            sameSite: "lax",
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      token.showWelcomeTour = updateWelcomeTourFlag(
        token.showWelcomeTour,
        trigger,
        session,
      );
      if (user && user.id) {
        token.id = user.id;

        const { db } = await import("@/lib/db");
        const { randomUUID } = await import("crypto");
        const sessionId = randomUUID();

        const device = account?.provider
          ? `Login via ${account.provider.charAt(0).toUpperCase() + account.provider.slice(1)}`
          : "Navegador";

        await db.session.create({
          data: {
            id: sessionId,
            sessionToken: sessionId,
            userId: user.id,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            device,
          },
        }).catch(() => {});

        token.sessionId = sessionId;
      }

      if (token.sessionId) {
        try {
          const { db } = await import("@/lib/db");
          const activeSession = await db.session.findUnique({
            where: { id: token.sessionId as string },
            select: { id: true },
          });

          if (!activeSession) {
            token.id = undefined;
            token.sessionId = undefined;
            token.invalidated = true;
            return token;
          }

          db.session.update({
            where: { id: token.sessionId as string },
            data: { lastActive: new Date() },
          }).catch(() => {});
        } catch {
          
          
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token.invalidated) {

        session.user = { ...session.user, id: "" } as typeof session.user;
        return session;
      }
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.showWelcomeTour = token.showWelcomeTour === true;
        (session as { sessionId?: string }).sessionId = token.sessionId as string;
      }
      return session;
    },
  },
});
