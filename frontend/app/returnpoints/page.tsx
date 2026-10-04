"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Navigation } from "lucide-react";
import AppShell from "@/components/AppShell";
import StoreBadge from "@/components/StoreBadge";
import { demoUserLocation, formatDistance, returnPoints, statusStyles } from "@/lib/returnPoints";

// Leaflet touches `window` on import, so it can only run in the browser.
const ReturnPointsMap = dynamic(() => import("@/components/ReturnPointsMap"), {
  ssr: false,
  loading: () => <div className="h-96 animate-pulse rounded-3xl bg-white/[0.06]" />,
});

export default function ReturnPointsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const selectFromMap = (id: string) => {
    setSelectedId(id);
    cardRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <AppShell title="Return Points" subtitle={`Near ${demoUserLocation.label}`}>
      <ReturnPointsMap selectedId={selectedId} onSelect={selectFromMap} />

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
              ref={(node) => {
                cardRefs.current[point.id] = node;
              }}
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
                    <span className="text-[11px] text-white/35">Reported {point.lastReport}</span>
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
