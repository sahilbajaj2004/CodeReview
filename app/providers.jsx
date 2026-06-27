"use client";

import { SessionProvider } from "next-auth/react";

// Client boundary so useSession() works across the app. Session carries only
// safe profile fields (never the GitHub access token — see auth.js).
export default function Providers({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
