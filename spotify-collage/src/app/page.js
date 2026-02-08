"use client";

import dynamic from "next/dynamic";

// Dynamically import the client component with no SSR
// This avoids pre-rendering issues with useSession and client hooks
const HomeClient = dynamic(() => import("@/components/HomeClient"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="inline-block w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
    </div>
  ),
});

export default function Home() {
  return <HomeClient />;
}
