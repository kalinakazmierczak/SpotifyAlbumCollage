import { memo, useState, useCallback } from "react";

const PREVIEW_COLORS = [
  "#E91E63", "#9C27B0", "#3F51B5",
  "#2196F3", "#00BCD4", "#4CAF50",
  "#FF9800", "#F44336", "#1DB954",
];

const VinylRecord = memo(function VinylRecord({
  imageUrl,
  title,
  artist,
  spotifyUrl,
  size = 90,
  previewColor = null,
}) {
  const isPreview = !!previewColor;
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleClick = useCallback(() => {
    if (spotifyUrl) window.open(spotifyUrl, "_blank", "noopener");
  }, [spotifyUrl]);

  return (
    <div className="flex flex-col items-center">
      {/* Disc */}
      <div
        className="vinyl-record rounded-full relative"
        style={{ width: `${size}px`, height: `${size}px` }}
        onClick={handleClick}
        role={spotifyUrl ? "link" : undefined}
        aria-label={title ? `Play ${title}${artist ? ` by ${artist}` : ""}` : undefined}
      >
        {/* Grooves */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "repeating-radial-gradient(circle at center, #1a1a1a 0px, #1a1a1a 1px, #0a0a0a 1px, #0a0a0a 3px)",
          }}
        />

        {/* Center — album art or colored placeholder */}
        {isPreview ? (
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] h-[55%] rounded-full"
            style={{
              background: `linear-gradient(135deg, ${previewColor}, ${previewColor}99)`,
              boxShadow: `0 0 20px ${previewColor}40`,
            }}
          />
        ) : imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={title || ""}
            crossOrigin="anonymous"
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] h-[55%] rounded-full object-cover shadow-lg transition-opacity duration-300 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : null}

        {/* Center hole */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 rounded-full border border-zinc-700 ${
            size > 70 ? "w-2 h-2" : "w-1.5 h-1.5"
          }`}
        />

        {/* Shine */}
        <div
          className="absolute inset-0 rounded-full opacity-20 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)",
          }}
        />
      </div>

      {/* Label (only for real items) */}
      {!isPreview && title && (
        <div className="text-center mt-1.5 w-full" style={{ maxWidth: `${size}px` }}>
          <p className={`font-medium truncate ${size > 70 ? "text-[10px]" : "text-[8px]"}`}>
            {title}
          </p>
          {artist && (
            <p className={`text-muted truncate ${size > 70 ? "text-[9px]" : "text-[7px]"}`}>
              {artist}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

VinylRecord.PREVIEW_COLORS = PREVIEW_COLORS;

export default VinylRecord;
