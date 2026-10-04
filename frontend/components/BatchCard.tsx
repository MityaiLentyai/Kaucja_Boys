"use client";

import { Check, ChevronDown, Clock, Recycle, TriangleAlert } from "lucide-react";
import {
  DEPOSIT_VALUE,
  batchTotal,
  formatAmount,
  formatRemaining,
  formatTimestamp,
  type BatchStatus,
  type ReturnBatch,
} from "../lib/batches";

const statusStyles: Record<
  BatchStatus,
  { label: string; chip: string; icon: typeof Clock }
> = {
  pending: {
    label: "Pending",
    chip: "border-amber-300/50 bg-amber-300/15 text-amber-100",
    icon: Clock,
  },
  returned: {
    label: "Returned",
    chip: "border-emerald-300/40 bg-emerald-300/15 text-emerald-100",
    icon: Check,
  },
  expired: {
    label: "Expired",
    chip: "border-red-300/40 bg-red-300/15 text-red-100",
    icon: TriangleAlert,
  },
};

const bannerStyles: Record<BatchStatus, string> = {
  pending: "border-[#f5e6a8]/40 bg-[#f5e6a8] text-[#3d2e0a]",
  returned: "border-emerald-300/30 bg-emerald-300/15 text-emerald-100",
  expired: "border-red-300/30 bg-red-300/15 text-red-100",
};

interface BatchCardProps {
  batch: ReturnBatch;
  status: BatchStatus;
  now: number;
  expanded: boolean;
  onToggle: () => void;
  onMarkReturned: () => void;
}

export default function BatchCard({
  batch,
  status,
  now,
  expanded,
  onToggle,
  onMarkReturned,
}: BatchCardProps) {
  const style = statusStyles[status];
  const NoticeIcon = style.icon;
  const count = batch.items.length;
  const panelId = `${batch.id}-items`;

  const notice =
    status === "pending"
      ? `${formatRemaining(batch.expiresAt, now)} left to return the bottles`
      : status === "returned"
        ? "Bottles returned — this batch is settled"
        : "Return window closed — this batch expired";

  return (
    <article>
      <div
        className={`flex items-center gap-2 rounded-t-2xl border border-b-0 px-4 py-2 text-xs font-semibold ${bannerStyles[status]}`}
      >
        <NoticeIcon className="h-3.5 w-3.5 shrink-0" />
        <p>{notice}</p>
      </div>

      <div className="overflow-hidden rounded-b-2xl border border-white/10 bg-white/[0.04]">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={panelId}
          className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-white/[0.04]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#d09abd]/15 ring-1 ring-[#d09abd]/30">
            <Recycle className="h-5 w-5 text-[#d09abd]" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">
                {count} {count === 1 ? "item" : "items"}
              </span>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${style.chip}`}
              >
                {style.label}
              </span>
            </span>
            <span className="mt-0.5 block text-xs text-white/50">
              Scanned {formatTimestamp(batch.createdAt)}
            </span>
          </span>

          <span className="shrink-0 text-right">
            <span className="block font-display text-lg font-semibold text-[#d09abd]">
              +{formatAmount(batchTotal(batch))} zł
            </span>
            <span className="mt-0.5 flex items-center justify-end gap-1 text-[10px] uppercase tracking-wider text-white/40">
              {expanded ? "Hide" : "Details"}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              />
            </span>
          </span>
        </button>

        <div
          id={panelId}
          inert={!expanded ? true : undefined}
          className={`batch-expand ${expanded ? "batch-expand-open" : ""}`}
        >
          <div className="overflow-hidden">
            <ul className="divide-y divide-white/[0.07] border-t border-white/10 px-4">
              {batch.items.map((item) => (
                <li
                  key={`${batch.id}-${item.barcode}`}
                  className="flex items-start justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white/90">{item.name}</p>
                    <p className="mt-0.5 truncate font-mono text-xs text-white/40">
                      {item.barcode}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-emerald-300">
                      {formatAmount(DEPOSIT_VALUE)} zł
                    </p>
                    <p className="mt-0.5 text-xs text-white/40">
                      {formatTimestamp(item.scannedAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {status === "pending" && (
              <div className="px-4 pb-4">
                <button
                  type="button"
                  onClick={onMarkReturned}
                  className="btn btn-outline mt-1 w-full px-4 py-2 text-xs"
                >
                  Mark as returned
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
