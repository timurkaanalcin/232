"use client";

import { FitBounds, FollowTarget, MapView, PositionMarker, TrackLine } from "@/components/map/map-view";
import type { LocationPointDTO } from "@/types";

export default function TrackMap({
  points,
  playbackIndex,
}: {
  points: LocationPointDTO[];
  playbackIndex?: number | null;
}) {
  const coordinates = points.map((point) => [point.lat, point.lng] as [number, number]);
  const activeIndex =
    playbackIndex != null && playbackIndex >= 0 && playbackIndex < points.length
      ? playbackIndex
      : points.length - 1;
  const active = points[activeIndex];
  const trail = playbackIndex != null ? coordinates.slice(0, activeIndex + 1) : coordinates;

  return (
    <MapView>
      <TrackLine points={trail} />
      {active && (
        <>
          <PositionMarker lat={active.lat} lng={active.lng} accuracy={active.accuracy} self />
          {playbackIndex != null && <FollowTarget lat={active.lat} lng={active.lng} follow />}
        </>
      )}
      <FitBounds points={coordinates} />
    </MapView>
  );
}
