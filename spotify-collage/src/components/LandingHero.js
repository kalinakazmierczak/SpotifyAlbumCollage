"use client";

import { memo } from "react";
import SpindleLogo from "./SpindleLogo";
import VinylRecord from "./VinylRecord";

const LandingHero = memo(function LandingHero({ onLogin }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="grain-overlay" />

      <div className="text-center max-w-md animate-fade-in">
        {/* Logo */}
        <div className="mb-10">
          <div className="flex justify-center mb-6">
            <SpindleLogo size="md" />
          </div>
          <p className="text-muted text-base">your vinyl wall, visualized</p>
        </div>

        {/* Preview wall */}
        <div className="wall-container p-6 mb-10">
          <div className="grid grid-cols-3 gap-3 stagger-children">
            {VinylRecord.PREVIEW_COLORS.map((color, i) => (
              <VinylRecord key={i} size={80} previewColor={color} />
            ))}
          </div>
          <p className="text-[11px] text-muted text-center mt-4">
            hover to spin • click to play
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={onLogin}
          className="btn-primary inline-flex items-center gap-2"
          aria-label="Connect with Spotify"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          connect with spotify
        </button>

        <p className="text-xs text-muted mt-6 opacity-60">
          we only read your listening history — nothing else
        </p>
      </div>
    </div>
  );
});

export default LandingHero;
