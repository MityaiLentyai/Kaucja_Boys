"use client";

import { useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import AppShell from "@/components/AppShell";
import StoreBadge from "@/components/StoreBadge";
import {
  demoUserLocation,
  formatDistance,
  returnPoints,
  statusStyles,
} from "@/lib/returnPoints";

const PADDING = 0.003;

const latitudes = [demoUserLocation.latitude, ...returnPoints.map((p) => p.latitude)];
const longitudes = [demoUserLocation.longitude, ...returnPoints.map((p) => p.longitude)];

const bounds = {
  minLat: Math.min(...latitudes) - PADDING,
  maxLat: Math.max(...latitudes) + PADDING,
  minLng: Math.min(...longitudes) - PADDING,
  maxLng: Math.max(...longitudes) + PADDING,
};

function project(latitude: number, longitude: number) {
  const x = ((longitude - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
  const y = ((bounds.maxLat - latitude) / (bounds.maxLat - bounds.minLat)) * 100;
  return { left: `${x}%`, top: `${y}%` };
}

export default function ReturnPointsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <AppShell title="Return Points" subtitle={`Near ${demoUserLocation.label}`}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-[#140b17]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:36px_36px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(208,154,189,0.18),transparent_65%)]" />

        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={project(demoUserLocation.latitude, demoUserLocation.longitude)}
        >
          <span className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-[#d09abd]/25" />
          <span className="relative block h-3.5 w-3.5 rounded-full bg-[#d09abd] ring-4 ring-[#d09abd]/30" />
          <span className="absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-white/70">
            You are here
          </span>
        </div>

        {returnPoints.map((point) => {
          const isSelected = selectedId === point.id;
          return (
            <button
              key={point.id}
              onClick={() => setSelectedId(isSelected ? null : point.id)}
              aria-label={`${point.name}, ${formatDistance(point.distanceMeters)}`}
              className="absolute -translate-x-1/2 -translate-y-full transition hover:scale-110"
              style={project(point.latitude, point.longitude)}
            >
              <span
                className={`block rounded-full p-0.5 ${
                  isSelected ? "bg-[#d09abd] ring-2 ring-white/70" : "bg-white/20"
                }`}
              >
                <StoreBadge brand={point.brand} size={28} />
              </span>
              <span
                className={`mx-auto block h-2 w-0.5 ${isSelected ? "bg-[#d09abd]" : "bg-white/30"}`}
              />
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-wider text-white/40">
          {returnPoints.length} return points nearby
        </p>

        {returnPoints.map((point) => {
          const status = statusStyles[point.status];
          const isSelected = selectedId === point.id;

          return (
            <div
              key={point.id}
              onClick={() => setSelectedId(isSelected ? null : point.id)}
              className={`cursor-pointer rounded-2xl border bg-white/[0.04] p-4 transition ${
                isSelected
                  ? "border-[#d09abd]/60 bg-white/[0.08]"
                  : "border-white/10 hover:border-[#d09abd]/40"
              }`}
            >
              <div className="flex items-start gap-3">
                <StoreBadge brand={point.brand} />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-semibold">{point.name}</p>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status.border} ${status.background} ${status.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                  </div>

                  <p className="mt-0.5 flex items-center gap-1 text-sm text-white/50">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{point.address}</span>
                    <span className="shrink-0 text-white/30">·</span>
                    <span className="shrink-0 text-[#d09abd]">
                      {formatDistance(point.distanceMeters)}
                    </span>
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {point.accepts.map((type) => (
                      <span
                        key={type}
                        className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/60"
                      >
                        {type}
                      </span>
                    ))}
                    <span className="text-[11px] text-white/35">
                      Reported {point.lastReport}
                    </span>
                  </div>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#d09abd] hover:text-[#e2b5d2]"
                  >
                    <Navigation className="h-3.5 w-3.5" /> Directions
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
