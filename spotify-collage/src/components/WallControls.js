import { memo, useCallback } from "react";

const TIME_PERIODS = [
  { value: "short_term", label: "4 weeks" },
  { value: "medium_term", label: "6 months" },
  { value: "long_term", label: "all time" },
];

const GRID_OPTIONS = [
  { value: 9, label: "3×3" },
  { value: 16, label: "4×4" },
];

export { TIME_PERIODS, GRID_OPTIONS };

const WallControls = memo(function WallControls({
  timePeriod,
  setTimePeriod,
  contentType,
  setContentType,
  gridSize,
  setGridSize,
  onRefresh,
  onSave,
  loading,
  saving,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 mb-8 animate-fade-in">
      {/* Time period */}
      <fieldset className="flex items-center gap-2" aria-label="Time period">
        {TIME_PERIODS.map((o) => (
          <button
            key={o.value}
            onClick={() => setTimePeriod(o.value)}
            className={`chip ${timePeriod === o.value ? "active" : ""}`}
            aria-pressed={timePeriod === o.value}
          >
            {o.label}
          </button>
        ))}
      </fieldset>

      <Divider />

      {/* Content type */}
      <fieldset className="flex items-center gap-2" aria-label="Content type">
        {["tracks", "albums"].map((t) => (
          <button
            key={t}
            onClick={() => setContentType(t)}
            className={`chip ${contentType === t ? "active" : ""}`}
            aria-pressed={contentType === t}
          >
            {t}
          </button>
        ))}
      </fieldset>

      <Divider />

      {/* Grid size */}
      <fieldset className="flex items-center gap-2" aria-label="Grid size">
        {GRID_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => setGridSize(o.value)}
            className={`chip ${gridSize === o.value ? "active" : ""}`}
            aria-pressed={gridSize === o.value}
          >
            {o.label}
          </button>
        ))}
      </fieldset>

      {/* Refresh */}
      <button
        onClick={onRefresh}
        className="chip hover:bg-zinc-700 transition-colors"
        disabled={loading}
        aria-label="Refresh data"
        title="Refresh data"
      >
        ↻ refresh
      </button>

      {/* Save */}
      <div className="w-full sm:w-auto sm:ml-auto">
        <button
          onClick={onSave}
          className="btn-primary w-full"
          disabled={saving || loading}
        >
          {saving ? "saving…" : "save wall"}
        </button>
      </div>
    </div>
  );
});

export default WallControls;

function Divider() {
  return <div className="hidden sm:block w-px h-5 bg-zinc-800 mx-1" aria-hidden="true" />;
}
