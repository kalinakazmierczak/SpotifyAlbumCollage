"use client";

import { useState, useRef, useCallback } from "react";
import { signIn, useSession, signOut } from "next-auth/react";

import LandingHero from "@/components/LandingHero";
import SpindleLogo from "@/components/SpindleLogo";
import WallControls, { TIME_PERIODS } from "@/components/WallControls";
import VinylWall from "@/components/VinylWall";
import useSpotifyData from "@/lib/useSpotifyData";
import { saveWallAsImage } from "@/lib/saveWall";

export default function HomeClient() {
  /* ---------- state ---------- */
  const [timePeriod, setTimePeriod] = useState("short_term");
  const [contentType, setContentType] = useState("albums");
  const [gridSize, setGridSize] = useState(9);
  const [saving, setSaving] = useState(false);
  const wallRef = useRef(null);

  /* ---------- session ---------- */
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isSessionLoading = status === "loading";

  /* ---------- data ---------- */
  const {
    topItems,
    loading,
    error,
    refetch,
    insufficientData,
  } = useSpotifyData({ timePeriod, contentType, gridSize });

  /* ---------- derived ---------- */
  const timePeriodLabel =
    TIME_PERIODS.find((t) => t.value === timePeriod)?.label ?? timePeriod;
  const username = session?.user?.name ?? "you";

  /* ---------- handlers ---------- */
  const handleLogin = useCallback(() => {
    // Use 127.0.0.1 to match the Spotify redirect URI
    signIn("spotify", { callbackUrl: "http://127.0.0.1:3000/" });
  }, []);

  const handleSave = useCallback(async () => {
    if (topItems.length === 0) return;
    setSaving(true);
    try {
      await saveWallAsImage({
        topItems,
        contentType,
        gridSize,
        timePeriodLabel,
        username,
      });
    } catch (err) {
      console.error("[Save] Failed:", err);
    } finally {
      setSaving(false);
    }
  }, [topItems, contentType, gridSize, timePeriodLabel, username]);

  const handleLogout = useCallback(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  /* ---------- session loading ---------- */
  if (isSessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  /* ---------- landing ---------- */
  if (!isAuthenticated) {
    return <LandingHero onLogin={handleLogin} />;
  }

  /* ---------- main app ---------- */
  return (
    <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto">
      <div className="grain-overlay" />

      {/* Top bar */}
      <header className="flex items-center justify-between mb-8 animate-fade-in">
        <SpindleLogo size="sm" />
        <button onClick={handleLogout} className="btn-ghost text-xs">
          sign out
        </button>
      </header>

      {/* Controls */}
      <WallControls
        timePeriod={timePeriod}
        setTimePeriod={setTimePeriod}
        contentType={contentType}
        setContentType={setContentType}
        gridSize={gridSize}
        setGridSize={setGridSize}
        onRefresh={refetch}
        onSave={handleSave}
        loading={loading}
        saving={saving}
      />

      {/* Wall */}
      <VinylWall
        topItems={topItems}
        contentType={contentType}
        gridSize={gridSize}
        loading={loading}
        insufficientData={insufficientData}
        error={error}
        refetch={refetch}
        username={username}
        timePeriodLabel={timePeriodLabel}
        wallRef={wallRef}
      />
    </div>
  );
}
