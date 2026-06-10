"use client";

import { MapView, PositionMarker } from "@/components/map/map-view";
import { formatAccuracy, formatRelative } from "@/lib/utils";
import type { LiveSession } from "@/hooks/use-live-map";

export default function LiveMapCanvas({
  sessions,
  selectedId,
  onSelect,
}: {
  sessions: LiveSession[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const positioned = sessions.filter((entry) => entry.lat != null && entry.lng != null);

  return (
    <MapView zoom={11}>
      {positioned.map((entry) => (
        <PositionMarker
          key={entry.session.id}
          lat={entry.lat!}
          lng={entry.lng!}
          accuracy={entry.accuracy}
          self={entry.session.id === selectedId}
          popup={
            <div className="grid gap-0.5">
              <button className="text-left font-medium underline" onClick={() => onSelect(entry.session.id)}>
                {entry.session.userName || entry.session.userEmail || "User"}
              </button>
              <span className="text-xs text-muted-foreground">{entry.session.userEmail}</span>
              <span className="text-xs">Accuracy {formatAccuracy(entry.accuracy)}</span>
              <span className="text-xs">Updated {formatRelative(entry.lastUpdateAt)}</span>
            </div>
          }
        />
      ))}
    </MapView>
  );
}
