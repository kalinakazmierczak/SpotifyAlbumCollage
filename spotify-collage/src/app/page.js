"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const { data: session } = useSession();
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timePeriod, setTimePeriod] = useState("short_term");
  const [contentType, setContentType] = useState("tracks");
  const [gridSize, setGridSize] = useState(9); // 9 = 3x3, 12 = 4x3, 16 = 4x4
  const wallRef = useRef(null);
  const username = session?.user?.name || "you";

  const timePeriodOptions = [
    { value: "short_term", label: "4 weeks" },
    { value: "medium_term", label: "6 months" },
    { value: "long_term", label: "all time" },
  ];

  const gridOptions = [
    { value: 9, label: "3×3" },
    { value: 16, label: "4×4" },
  ];

  useEffect(() => {
    if (!session?.accessToken) return;

    setLoading(true);
    const url = `https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${timePeriod}`;

    fetch(url, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (contentType === "albums") {
          const albumsMap = new Map();
          for (const track of data.items) {
            const album = track.album;
            if (!albumsMap.has(album.id)) {
              albumsMap.set(album.id, {
                ...album,
                trackName: track.name,
              });
            }
          }
          setTopItems(Array.from(albumsMap.values()).slice(0, gridSize));
        } else {
          setTopItems(data.items.slice(0, gridSize));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [session?.accessToken, timePeriod, contentType, gridSize]);

  // Load image as base64 via proxy
  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      // Use proxy for Spotify images
      if (url.includes("spotify") || url.includes("scdn")) {
        img.src = `/api/proxy-image?url=${encodeURIComponent(url)}`;
      } else {
        img.src = url;
      }
    });
  };

  const [saving, setSaving] = useState(false);

  const handleShare = async () => {
    setSaving(true);

    try {
      const width = 1080;
      const height = 1920;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#1a1a1a");
      gradient.addColorStop(1, "#0d0d0d");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Header text
      ctx.fillStyle = "#71717a";
      ctx.font = "32px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      const periodLabel = timePeriodOptions.find(o => o.value === timePeriod)?.label || "";
      ctx.fillText(periodLabel.toUpperCase(), width / 2, 120);

      ctx.fillStyle = "#fafafa";
      ctx.font = "600 48px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(`${username}'s top ${contentType}`, width / 2, 180);

      // Grid settings
      const cols = gridSize === 9 ? 3 : 4;
      const rows = gridSize === 9 ? 3 : 4;
      const vinylSize = gridSize === 9 ? 260 : 200;
      const gap = gridSize === 9 ? 60 : 40;
      const gridWidth = cols * vinylSize + (cols - 1) * gap;
      const gridHeight = rows * vinylSize + (rows - 1) * gap + rows * 50; // extra for text
      const startX = (width - gridWidth) / 2;
      const startY = 260;

      // Draw vinyls
      for (let i = 0; i < topItems.length && i < gridSize; i++) {
        const item = topItems[i];
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * (vinylSize + gap) + vinylSize / 2;
        const y = startY + row * (vinylSize + gap + 50) + vinylSize / 2;

        // Vinyl base (black circle with grooves effect)
        ctx.beginPath();
        ctx.arc(x, y, vinylSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = "#0a0a0a";
        ctx.fill();

        // Grooves
        for (let r = vinylSize / 2; r > vinylSize * 0.3; r -= 6) {
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.strokeStyle = r % 12 === 0 ? "#1a1a1a" : "#0f0f0f";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Album art
        const imageUrl = contentType === "albums"
          ? item.images?.[0]?.url
          : item.album?.images?.[0]?.url;

        if (imageUrl) {
          try {
            const img = await loadImage(imageUrl);
            const artSize = vinylSize * 0.55;
            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, artSize / 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, x - artSize / 2, y - artSize / 2, artSize, artSize);
            ctx.restore();
          } catch (e) {
            console.log("Could not load image:", e);
          }
        }

        // Center hole
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = "#1a1a1a";
        ctx.fill();
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Track info below vinyl
        const title = item.name || "";
        const artist = item.artists?.[0]?.name || "";
        
        ctx.fillStyle = "#fafafa";
        ctx.font = "600 24px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.textAlign = "center";
        const maxTextWidth = vinylSize;
        const truncatedTitle = title.length > 15 ? title.slice(0, 15) + "..." : title;
        ctx.fillText(truncatedTitle, x, y + vinylSize / 2 + 30);

        ctx.fillStyle = "#71717a";
        ctx.font = "22px -apple-system, BlinkMacSystemFont, sans-serif";
        const truncatedArtist = artist.length > 18 ? artist.slice(0, 18) + "..." : artist;
        ctx.fillText(truncatedArtist, x, y + vinylSize / 2 + 55);
      }

      // Footer
      ctx.fillStyle = "#1DB954";
      ctx.beginPath();
      ctx.arc(width / 2 - 40, height - 100, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#71717a";
      ctx.font = "28px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("spindle", width / 2 + 10, height - 92);

      // Download
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "spindle-wall.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Couldn't save image. Try taking a screenshot instead!");
    } finally {
      setSaving(false);
    }
  };

  const getGridCols = () => {
    if (gridSize === 9) return "grid-cols-3";
    return "grid-cols-4";
  };

  // Landing page
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="grain-overlay" />

        <div className="text-center max-w-md animate-fade-in">
          {/* Logo */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="black">
                  <circle cx="12" cy="12" r="10" stroke="black" strokeWidth="2" fill="none" />
                  <circle cx="12" cy="12" r="3" fill="black" />
                </svg>
              </div>
              <span className="text-3xl font-semibold tracking-tight">spindle</span>
            </div>
            <p className="text-muted text-base">
              your vinyl wall, visualized
            </p>
          </div>

          {/* Preview wall */}
          <div className="wall-container p-6 mb-10">
            <div className="grid grid-cols-3 gap-3">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-full relative"
                  style={{
                    background: "repeating-radial-gradient(circle at center, #1a1a1a 0px, #1a1a1a 1px, #0f0f0f 1px, #0f0f0f 2px)",
                    opacity: 0.5 + (i % 3) * 0.15,
                  }}
                >
                  {/* Center hole */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-zinc-900 rounded-full border border-zinc-700" />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted text-center mt-4">
              hover to spin • click to play
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={() => signIn("spotify")}
            className="btn-primary"
          >
            connect with spotify
          </button>

          <p className="text-xs text-muted mt-6 opacity-60">
            we only read your listening history
          </p>
        </div>
      </div>
    );
  }

  // Main app
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="grain-overlay" />

      {/* Header */}
      <header className="flex items-center justify-between mb-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#1DB954] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="black">
              <circle cx="12" cy="12" r="10" stroke="black" strokeWidth="2" fill="none" />
              <circle cx="12" cy="12" r="3" fill="black" />
            </svg>
          </div>
          <span className="font-semibold tracking-tight">spindle</span>
        </div>

        <button
          onClick={() => signOut()}
          className="text-sm text-muted hover:text-white transition-colors"
        >
          sign out
        </button>
      </header>

      <div className="max-w-5xl mx-auto">
        {/* Controls */}
        <div className="flex flex-col md:flex-row md:flex-wrap items-start md:items-center gap-3 mb-8">
          {/* Time Period */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            {timePeriodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimePeriod(option.value)}
                className={`chip ${timePeriod === option.value ? "active" : ""}`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="hidden md:block w-px h-5 bg-zinc-800 mx-2" />

          {/* Content Type */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setContentType("tracks")}
              className={`chip ${contentType === "tracks" ? "active" : ""}`}
            >
              tracks
            </button>
            <button
              onClick={() => setContentType("albums")}
              className={`chip ${contentType === "albums" ? "active" : ""}`}
            >
              albums
            </button>
          </div>

          <div className="hidden md:block w-px h-5 bg-zinc-800 mx-2" />

          {/* Grid Size */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            {gridOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setGridSize(option.value)}
                className={`chip ${gridSize === option.value ? "active" : ""}`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Save Button */}
          <div className="w-full md:w-auto md:ml-auto">
            <button 
              onClick={handleShare} 
              className="btn-primary w-full"
              disabled={saving}
            >
              {saving ? "saving..." : "save wall"}
            </button>
          </div>
        </div>

        {/* Wall - 1080x1920 (9:16) aspect ratio */}
        <div className="flex justify-center">
          <div
            ref={wallRef}
            className="wall-container flex flex-col"
            style={{
              width: "360px",
              height: "640px",
              padding: "24px",
            }}
          >
          {/* Header inside wall */}
          <div className="text-center mb-6">
            <p className="text-[10px] text-muted uppercase tracking-widest mb-1">
              {timePeriodOptions.find((o) => o.value === timePeriod)?.label}
            </p>
            <h2 className="text-lg font-semibold">
              {username}'s top {contentType}
            </h2>
          </div>

          {loading ? (
            <div className="py-16 text-center flex-1 flex flex-col items-center justify-center">
              <div className="inline-block w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
              <p className="text-sm text-muted mt-4">loading your wall...</p>
            </div>
          ) : (
            <div className={`grid ${getGridCols()} gap-3 flex-1 content-center`}>
              {topItems.map((item, index) => {
                const originalImageUrl =
                  contentType === "albums"
                    ? item.images?.[0]?.url
                    : item.album?.images?.[0]?.url;
                // Use proxy URL for images to avoid CORS issues when saving
                const imageUrl = originalImageUrl 
                  ? `/api/proxy-image?url=${encodeURIComponent(originalImageUrl)}`
                  : null;
                const title = item.name;
                const artist = item.artists?.[0]?.name;
                const spotifyUrl = item.external_urls?.spotify;

                // Smaller vinyls for 4x4 grid
                const vinylSize = gridSize === 9 ? 90 : 65;

                return (
                  <div
                    key={`${item.id}-${index}`}
                    className="flex flex-col items-center"
                  >
                    {/* Vinyl Record - circular container */}
                    <div
                      className="vinyl-record rounded-full relative"
                      style={{ width: `${vinylSize}px`, height: `${vinylSize}px` }}
                      onClick={() => window.open(spotifyUrl, "_blank")}
                    >
                      {/* Vinyl grooves */}
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background:
                            "repeating-radial-gradient(circle at center, #1a1a1a 0px, #1a1a1a 1px, #0a0a0a 1px, #0a0a0a 3px)",
                        }}
                      />

                      {/* Album art center */}
                      {imageUrl && (
                        <img
                          key={`img-${item.id}-${index}`}
                          src={imageUrl}
                          alt={title}
                          crossOrigin="anonymous"
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] h-[55%] rounded-full object-cover shadow-lg"
                        />
                      )}

                      {/* Center hole */}
                      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 rounded-full border border-zinc-700 ${gridSize === 9 ? 'w-2 h-2' : 'w-1.5 h-1.5'}`} />

                      {/* Shine effect */}
                      <div
                        className="absolute inset-0 rounded-full opacity-20 pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)",
                        }}
                      />
                    </div>

                    {/* Track info */}
                    <div className="text-center mt-1.5 w-full" style={{ maxWidth: `${vinylSize}px` }}>
                      <p className={`font-medium truncate ${gridSize === 9 ? 'text-[10px]' : 'text-[8px]'}`}>
                        {title}
                      </p>
                      <p className={`text-muted truncate ${gridSize === 9 ? 'text-[9px]' : 'text-[7px]'}`}>{artist}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer inside wall */}
          <div className="text-center mt-auto pt-4 border-t border-zinc-800">
            <div className="flex items-center justify-center gap-2 text-muted">
              <div className="w-4 h-4 rounded-full bg-[#1DB954] flex items-center justify-center">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="black">
                  <circle cx="12" cy="12" r="10" stroke="black" strokeWidth="3" fill="none" />
                  <circle cx="12" cy="12" r="4" fill="black" />
                </svg>
              </div>
              <span className="text-xs">spindle</span>
            </div>
          </div>
        </div>
        </div>

        {/* Tip */}
        <p className="text-center text-xs text-muted mt-6 opacity-60">
          hover vinyls to spin • click to open in spotify
        </p>
      </div>
    </div>
  );
}
