import type { ReactNode } from "react";

type IconProps = { size?: number; className?: string };

function Svg({ size = 18, className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16.2 16.2 21 21" />
    </Svg>
  );
}

export function IconSettings(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.2M12 18.3v2.2M4.8 6.5l1.6 1.6M17.6 15.9l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.8 17.5l1.6-1.6M17.6 8.1l1.6-1.6" />
    </Svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  );
}

export function IconSend(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4.5 12 20 4.5 13.2 20l-1.6-6.4L4.5 12Z" />
    </Svg>
  );
}

export function IconStop(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="7" y="7" width="10" height="10" rx="1.8" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconCopy(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="8.5" y="8.5" width="10" height="10" rx="1.6" />
      <path d="M5.5 15.2V5.8A1.3 1.3 0 0 1 6.8 4.5h9.4" />
    </Svg>
  );
}

export function IconRefresh(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20 12a8 8 0 1 1-2.2-5.5" />
      <path d="M20 5v5h-5" />
    </Svg>
  );
}

export function IconTrash(props: IconProps) {
  return (
    <Svg {...props} size={props.size ?? 15}>
      <path d="M5 8h14M9.5 8V6.2A1.2 1.2 0 0 1 10.7 5h2.6a1.2 1.2 0 0 1 1.2 1.2V8M8.5 8l.6 10.2A1.2 1.2 0 0 0 10.3 19.5h3.4a1.2 1.2 0 0 0 1.2-1.3L15.5 8" />
    </Svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12.5 9.2 17 19 7" />
    </Svg>
  );
}

export function IconUser(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="9" r="3.2" />
      <path d="M5.8 18.2a6.4 6.4 0 0 1 12.4 0" />
    </Svg>
  );
}
