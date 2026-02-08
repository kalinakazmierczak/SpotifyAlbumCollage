import { memo, useMemo } from "react";
import VinylRecord from "./VinylRecord";

const VinylWall = memo(function VinylWall({
  topItems,
  contentType,
  gridSize,
  loading,
  insufficientData,
  error,
  refetch,
  username,
  timePeriodLabel,
  wallRef,
}) {
  const cols = gridSize === 9 ? "grid-cols-3" : "grid-cols-4";
  const vinylSize = gridSize === 9 ? 90 : 65;

  const renderedItems = useMemo(
    () =>
      topItems.map((item, i) => {
        const imgUrl =
          contentType === "albums"
            ? item.images?.[0]?.url
            : item.album?.images?.[0]?.url;

        return (
          <VinylRecord
            key={item.id ?? i}
            size={vinylSize}
            imageUrl={
              imgUrl
                ? `/api/proxy-image?url=${encodeURIComponent(imgUrl)}`
                : null
            }
            title={item.name}
            artist={item.artists?.[0]?.name}
            spotifyUrl={item.external_urls?.spotify}
          />
        );
      }),
    [topItems, contentType, vinylSize]
  );

  return (
    <div className="flex justify-center">
      <div
        ref={wallRef}
        className="wall-container flex flex-col"
        style={{ width: "360px", height: "640px", padding: "24px" }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-[10px] text-muted uppercase tracking-widest mb-1">
            {timePeriodLabel}
          </p>
          <h2 className="text-lg font-semibold">
            {username}&apos;s top {contentType}
          </h2>
        </div>

        {/* Body */}
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState onRetry={refetch} />
        ) : insufficientData && topItems.length === 0 ? (
          <InsufficientState contentType={contentType} />
        ) : (
          <>
            {insufficientData && (
              <div className="mb-3 text-center">
                <p className="text-[10px] text-amber-400/80">
                  limited data available • keep streaming!
                </p>
              </div>
            )}
            <div className={`grid ${cols} gap-3 flex-1 content-center stagger-children`}>
              {renderedItems}
            </div>
          </>
        )}

        {/* Footer */}
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
  );
});

export default VinylWall;

/* ---------- sub-components ---------- */

function Loading() {
  return (
    <div className="py-16 text-center flex-1 flex flex-col items-center justify-center">
      <div className="inline-block w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
      <p className="text-sm text-muted mt-4">loading your wall…</p>
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div className="py-8 text-center flex-1 flex flex-col items-center justify-center">
      <p className="text-sm text-red-400 mb-2">couldn&apos;t load your data</p>
      <button onClick={onRetry} className="text-xs text-red-300 underline hover:text-red-200 transition-colors">
        try again
      </button>
    </div>
  );
}

function InsufficientState({ contentType }) {
  return (
    <div className="py-8 text-center flex-1 flex flex-col items-center justify-center animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-zinc-500"
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>
      <p className="text-sm text-white font-medium mb-2">
        not enough data yet!
      </p>
      <p className="text-xs text-muted px-4 max-w-[240px]">
        keep streaming and come back soon to see your top {contentType}
      </p>
    </div>
  );
}
