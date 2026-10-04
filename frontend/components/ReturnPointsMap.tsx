"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { brands } from "./StoreBadge";
import { demoUserLocation, formatDistance, returnPoints } from "@/lib/returnPoints";
import type { StoreBrand } from "./StoreBadge";

const DEFAULT_CENTER: L.LatLngExpression = [demoUserLocation.latitude, demoUserLocation.longitude];
const HOME_ZOOM = 13;
const FOCUS_ZOOM = 16;

/** Rendered above the store pins, which otherwise cover it at low zoom. */
const youAreHereIcon = L.divIcon({
  className: "kaucash-you",
  html: '<span class="kaucash-you-ring"></span><span class="kaucash-you-dot"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function brandIcon(brand: StoreBrand, isSelected: boolean) {
  const size = isSelected ? 42 : 32;
  return L.icon({
    iconUrl: brands[brand].logo,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    className: `kaucash-pin${isSelected ? " kaucash-pin-selected" : ""}`,
  });
}

/** Keeps the Leaflet viewport in sync with the card the user picked. */
function MapFocus({ selectedId }: { selectedId: string | null }) {
  const map = useMap();

  useEffect(() => {
    const point = returnPoints.find((candidate) => candidate.id === selectedId);
    if (point) {
      map.flyTo([point.latitude, point.longitude], FOCUS_ZOOM, { duration: 0.6 });
    } else {
      map.flyTo(DEFAULT_CENTER, HOME_ZOOM, { duration: 0.6 });
    }
  }, [map, selectedId]);

  return null;
}

function RecenterButton() {
  const map = useMap();

  return (
    <button
      onClick={() => map.flyTo(DEFAULT_CENTER, HOME_ZOOM, { duration: 0.6 })}
      className="absolute right-3 top-3 z-[500] rounded-full border border-white/15 bg-[#140b17]/90 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur transition hover:border-[#d09abd]/60 hover:text-white"
    >
      Recenter
    </button>
  );
}

interface ReturnPointsMapProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ReturnPointsMap({ selectedId, onSelect }: ReturnPointsMapProps) {
  return (
    <div className="relative h-96 overflow-hidden rounded-3xl border border-white/10">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={HOME_ZOOM}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        {/* OSM raster tiles need no API key; globals.css inverts them to match the dark theme. */}
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <Marker position={DEFAULT_CENTER} icon={youAreHereIcon} zIndexOffset={1000}>
          <Tooltip direction="bottom" offset={[0, 10]} permanent>
            {demoUserLocation.label}
          </Tooltip>
        </Marker>

        {returnPoints.map((point) => (
          <Marker
            key={point.id}
            position={[point.latitude, point.longitude]}
            icon={brandIcon(point.brand, selectedId === point.id)}
            title={point.name}
            eventHandlers={{ click: () => onSelect(point.id) }}
          >
            <Tooltip direction="top" offset={[0, -18]}>
              {point.name} · {formatDistance(point.distanceMeters)}
            </Tooltip>
          </Marker>
        ))}

        <MapFocus selectedId={selectedId} />
        <RecenterButton />
      </MapContainer>
    </div>
  );
}
