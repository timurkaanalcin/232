import { useId } from "react";

export function BrandMark({
  size = 40,
  animated = false,
  className = "",
}: {
  size?: number;
  animated?: boolean;
  className?: string;
}) {
  const raw = useId().replace(/:/g, "");
  const well = `llvad-well-${raw}`;
  const ember = `llvad-ember-${raw}`;
  const ring = `llvad-ring-${raw}`;

  return (
    <svg
      className={`brand-mark ${animated ? "is-animated" : ""} ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={well} cx="38%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#2a160c" />
          <stop offset="55%" stopColor="#120c09" />
          <stop offset="100%" stopColor="#070504" />
        </radialGradient>
        <linearGradient id={ember} x1="18" y1="14" x2="46" y2="52">
          <stop offset="0%" stopColor="#ffd7a8" />
          <stop offset="38%" stopColor="#ff8a3d" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
        <linearGradient id={ring} x1="8" y1="6" x2="58" y2="58">
          <stop offset="0%" stopColor="#ffc48a" />
          <stop offset="50%" stopColor="#ff6b1a" />
          <stop offset="100%" stopColor="#7a2e0d" />
        </linearGradient>
      </defs>
      <rect x="2.5" y="2.5" width="59" height="59" rx="18" fill={`url(#${well})`} />
      <rect x="2.5" y="2.5" width="59" height="59" rx="18" stroke={`url(#${ring})`} strokeOpacity="0.85" strokeWidth="1.4" />
      <rect className="ember-glow" x="18.5" y="16" width="7.2" height="32" rx="3.4" fill={`url(#${ember})`} />
      <rect className="ember-glow" x="29.6" y="16" width="7.2" height="32" rx="3.4" fill={`url(#${ember})`} />
      <circle className="ember-core" cx="46.2" cy="20.4" r="3.1" fill="#ffb347" />
      <circle cx="45.4" cy="19.5" r="1.05" fill="#fff4e4" fillOpacity="0.9" />
    </svg>
  );
}
