"use client";

import { useEffect, useState } from "react";

export function HudClock({ className }: { className?: string }) {
  const [now, setNow] = useState<string>("--:--:--");

  useEffect(() => {
    const tick = () => {
      setNow(
        new Date().toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <time className={className} dateTime={now} aria-label="Sistem saati">
      {now}
    </time>
  );
}
