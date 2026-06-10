"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import L from "leaflet";
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const OSM_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const DEFAULT_CENTER: [number, number] = [41.015137, 28.97953];

export function MapView({
  center = DEFAULT_CENTER,
  zoom = 13,
  className,
  children,
}: {
  center?: [number, number];
  zoom?: number;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      className={cn("h-full w-full", className)}
      preferCanvas
    >
      <TileLayer url={OSM_URL} attribution={OSM_ATTRIBUTION} maxZoom={19} />
      {children}
    </MapContainer>
  );
}

function makeDotIcon(self: boolean): L.DivIcon {
  return L.divIcon({
    className: `lt-marker${self ? " lt-marker-self" : ""}`,
    html: '<div class="lt-dot"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export function PositionMarker({
  lat,
  lng,
  accuracy,
  self = false,
  popup,
}: {
  lat: number;
  lng: number;
  accuracy?: number | null;
  self?: boolean;
  popup?: ReactNode;
}) {
  const icon = useMemo(() => makeDotIcon(self), [self]);
  return (
    <>
      {accuracy != null && accuracy > 10 && accuracy < 5_000 && (
        <Circle
          center={[lat, lng]}
          radius={accuracy}
          pathOptions={{ color: "transparent", fillColor: self ? "#3b82f6" : "#10b981", fillOpacity: 0.12 }}
        />
      )}
      <Marker position={[lat, lng]} icon={icon}>
        {popup ? <Popup>{popup}</Popup> : null}
      </Marker>
    </>
  );
}

export function TrackLine({ points }: { points: [number, number][] }) {
  if (points.length < 2) return null;
  return <Polyline positions={points} pathOptions={{ color: "#10b981", weight: 4, opacity: 0.8 }} />;
}

/** Imperatively recenters the map when the target moves. */
export function FollowTarget({ lat, lng, follow }: { lat: number; lng: number; follow: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (follow) map.panTo([lat, lng], { animate: true });
  }, [map, lat, lng, follow]);
  return null;
}

/** Fits the map to a set of coordinates once they become available. */
export function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  const key = points.length;
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0]!, 15);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 16 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);
  return null;
}
