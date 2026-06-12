"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type { LiveSession } from "@/hooks/use-live-map";

const OSM_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

function makeDotIcon(self: boolean): L.DivIcon {
  return L.divIcon({
    className: `lt-marker${self ? " lt-marker-self" : ""}`,
    html: '<div class="lt-dot lt-dot-live"></div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);
  return null;
}

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function ClusterMarkers({
  sessions,
  selectedId,
  onSelect,
  addresses,
}: {
  sessions: LiveSession[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  addresses: Map<string, string>;
}) {
  const map = useMap();
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!clusterRef.current) {
      clusterRef.current = L.markerClusterGroup({
        maxClusterRadius: 60,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        disableClusteringAtZoom: 16,
      });
      map.addLayer(clusterRef.current);
    }

    const group = clusterRef.current;
    group.clearLayers();

    for (const entry of sessions) {
      if (entry.lat == null || entry.lng == null) continue;
      const marker = L.marker([entry.lat, entry.lng], {
        icon: makeDotIcon(entry.session.id === selectedId),
      });
      const name = entry.session.userName || entry.session.userEmail || "Kullanıcı";
      const address = addresses.get(entry.session.id);
      const popupHtml = address
        ? `<div style="min-width:200px;max-width:280px"><strong>${escapeHtml(name)}</strong><br/><span style="font-size:12px;line-height:1.4">${escapeHtml(address)}</span></div>`
        : `<strong>${escapeHtml(name)}</strong><br/><span style="font-size:11px;color:#666">Adres yükleniyor…</span>`;
      marker.bindPopup(popupHtml);
      marker.on("click", () => onSelectRef.current(entry.session.id));
      group.addLayer(marker);
    }

    if (sessions.length > 0) {
      const bounds = group.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
      }
    }
  }, [map, sessions, selectedId, addresses]);

  useEffect(() => {
    return () => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current);
        clusterRef.current = null;
      }
    };
  }, [map]);

  return null;
}

export default function LiveMapCanvas({
  sessions,
  selectedId,
  onSelect,
  addresses = new Map(),
}: {
  sessions: LiveSession[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  addresses?: Map<string, string>;
}) {
  const positioned = sessions.filter((e) => e.lat != null && e.lng != null);
  const center: [number, number] =
    positioned[0] != null ? [positioned[0].lat!, positioned[0].lng!] : [41.015137, 28.97953];

  return (
    <MapContainer
      key={positioned.map((p) => p.session.id).join(",") || "empty"}
      center={center}
      zoom={positioned.length > 0 ? 16 : 11}
      scrollWheelZoom
      className="h-full w-full"
      preferCanvas
    >
      <TileLayer url={OSM_URL} attribution={OSM_ATTRIBUTION} maxZoom={19} />
      <MapResizer />
      <ClusterMarkers
        sessions={positioned}
        selectedId={selectedId}
        onSelect={onSelect}
        addresses={addresses}
      />
    </MapContainer>
  );
}
