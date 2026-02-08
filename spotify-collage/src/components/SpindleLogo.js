import { memo } from "react";

const SIZES = {
  sm: { outer: "w-8 h-8", svg: 16, text: "text-sm font-semibold" },
  md: { outer: "w-12 h-12", svg: 24, text: "text-3xl font-semibold" },
};

const SpindleLogo = memo(function SpindleLogo({ size = "md" }) {
  const s = SIZES[size] ?? SIZES.md;

  return (
    <div className="inline-flex items-center gap-2" aria-label="Spindle">
      <div className={`${s.outer} rounded-full bg-[#1DB954] flex items-center justify-center`}>
        <svg width={s.svg} height={s.svg} viewBox="0 0 24 24" fill="black" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="black" strokeWidth="2" fill="none" />
          <circle cx="12" cy="12" r="3" fill="black" />
        </svg>
      </div>
      <span className={`${s.text} tracking-tight`}>spindle</span>
    </div>
  );
});

export default SpindleLogo;
