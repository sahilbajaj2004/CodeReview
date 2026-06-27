import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

/**
 * Auth.js v5 (next-auth@beta) config. GitHub OAuth.
 *
 * SECURITY: the GitHub access token is persisted ONLY in the encrypted JWT
 * (token.accessToken). It is NEVER copied onto the `session` object, so it is
 * never sent to the browser via useSession() / /api/auth/session. Server route
 * handlers read it with getToken() (see lib/auth-token.js). Scope `repo` grants
 * private read+write though we only ever read — keeping it server-only matters.
 *
 * Env (auto-read by Auth.js): AUTH_SECRET, AUTH_GITHUB_ID, AUTH_GITHUB_SECRET.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    GitHub({
      authorization: { params: { scope: "read:user repo" } },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Runs on sign-in (account/profile present) and every subsequent call.
      if (account?.access_token) token.accessToken = account.access_token;
      if (profile?.login) token.login = profile.login;
      return token;
    },
    async session({ session, token }) {
      // Expose ONLY safe, public profile fields to the client. No accessToken.
      if (token?.login && session.user) session.user.login = token.login;
      return session;
    },
  },
});
