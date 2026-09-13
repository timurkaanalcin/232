export function BrandMark({
  size = 40,
  animated = false,
  className = "",
}: {
  size?: number;
  animated?: boolean;
  className?: string;
}) {
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
        <radialGradient id="havuz-well" cx="50%" cy="42%" r="58%">
          <stop offset="0%" stopColor="#12343c" />
          <stop offset="70%" stopColor="#07141a" />
          <stop offset="100%" stopColor="#05090c" />
        </radialGradient>
        <radialGradient id="havuz-gold" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fff4c8" />
          <stop offset="45%" stopColor="#e8c56a" />
          <stop offset="100%" stopColor="#a67d28" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="31" fill="url(#havuz-well)" />
      <circle className="ripple r1" cx="32" cy="32" r="8" stroke="#3ce6c8" strokeOpacity="0.95" strokeWidth="1.15" />
      <circle className="ripple r2" cx="32" cy="32" r="14" stroke="#3ce6c8" strokeOpacity="0.55" strokeWidth="1.1" />
      <circle className="ripple r3" cx="32" cy="32" r="20" stroke="#3ce6c8" strokeOpacity="0.32" strokeWidth="1.05" />
      <circle className="ripple r4" cx="32" cy="32" r="26" stroke="#3ce6c8" strokeOpacity="0.16" strokeWidth="1" />
      <circle cx="32" cy="32" r="2.35" fill="url(#havuz-gold)" />
      <circle cx="31.2" cy="31.1" r="0.7" fill="#fff8d8" fillOpacity="0.85" />
    </svg>
  );
}
