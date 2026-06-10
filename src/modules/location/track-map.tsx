"use client";

import { FitBounds, MapView, PositionMarker, TrackLine } from "@/components/map/map-view";
import type { LocationPointDTO } from "@/types";

export default function TrackMap({ points }: { points: LocationPointDTO[] }) {
  const coordinates = points.map((point) => [point.lat, point.lng] as [number, number]);
  const last = points.at(-1);

  return (
    <MapView>
      <TrackLine points={coordinates} />
      {last && <PositionMarker lat={last.lat} lng={last.lng} accuracy={last.accuracy} />}
      <FitBounds points={coordinates} />
    </MapView>
  );
}
