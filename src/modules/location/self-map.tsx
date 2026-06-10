"use client";

import { FollowTarget, MapView, PositionMarker } from "@/components/map/map-view";
import type { CurrentPosition } from "@/hooks/use-location-sharing";

export default function SelfMap({ position }: { position: CurrentPosition | null }) {
  return (
    <MapView center={position ? [position.lat, position.lng] : undefined} zoom={15}>
      {position && (
        <>
          <PositionMarker lat={position.lat} lng={position.lng} accuracy={position.accuracy} self />
          <FollowTarget lat={position.lat} lng={position.lng} follow />
        </>
      )}
    </MapView>
  );
}
