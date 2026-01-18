"use client";

import { SessionProvider } from "next-auth/react";

export default function SessionProviderWrapper({ children }) {
  return (
    <SessionProvider 
      // Re-fetch session every 5 minutes to keep it fresh
      refetchInterval={5 * 60}
      // Re-fetch session when window is focused
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
}
