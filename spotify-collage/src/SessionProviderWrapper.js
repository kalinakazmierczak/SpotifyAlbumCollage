"use client";

import { SessionProvider } from "next-auth/react";

export default function SessionProviderWrapper({ children }) {
  return (
    <SessionProvider
      // Re-fetch session every 4 minutes to keep tokens fresh
      refetchInterval={4 * 60}
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
}
