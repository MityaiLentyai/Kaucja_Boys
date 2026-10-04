import { getToken } from "./auth";

export const RETURN_WINDOW_HOURS = 48;
const RETURN_WINDOW_MS = RETURN_WINDOW_HOURS * 60 * 60 * 1000;
const EXPAND_KEY = "kaucash:expand-batch";

/** Every eligible container carries the same deposit in the Polish system. */
export const DEPOSIT_VALUE = 0.5;

export type BatchStatus = "pending" | "returned" | "expired";

/** `expired` is never persisted: it is derived from the clock on read. */
type StoredStatus = "pending" | "returned";

export interface BatchItem {
  barcode: string;
  name: string;
  value: number;
  scannedAt: string;
}

export interface ReturnBatch {
  id: string;
  createdAt: string;
  expiresAt: string;
  status: StoredStatus;
  items: BatchItem[];
}

/**
 * Impure helpers live at module scope so components can read the clock without
 * tripping the react-hooks/purity rule inside a render body.
 */
export const nowMs = (): number => Date.now();
export const nowIso = (): string => new Date().toISOString();

function decodeSubject(token: string): string | null {
  const segment = token.split(".")[1];
  if (!segment) return null;
  try {
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const payload: unknown = JSON.parse(atob(padded));
    const sub = (payload as { sub?: unknown })?.sub;
    return typeof sub === "string" ? sub : null;
  } catch {
    return null;
  }
}

/** Batches are scoped per account so two demo logins never see each other's. */
function storageKey(): string {
  const token = getToken();
  return `kaucash:batches:${(token && decodeSubject(token)) ?? "anonymous"}`;
}

function isBatch(value: unknown): value is ReturnBatch {
  if (typeof value !== "object" || value === null) return false;
  const batch = value as Partial<ReturnBatch>;
  return (
    typeof batch.id === "string" &&
    typeof batch.createdAt === "string" &&
    typeof batch.expiresAt === "string" &&
    (batch.status === "pending" || batch.status === "returned") &&
    Array.isArray(batch.items) &&
    batch.items.every(
      (item) =>
        typeof item?.barcode === "string" &&
        typeof item?.name === "string" &&
        typeof item?.value === "number" &&
        typeof item?.scannedAt === "string",
    )
  );
}

function readStored(): ReturnBatch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey());
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isBatch)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  } catch {
    return [];
  }
}

function persist(batches: ReturnBatch[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(storageKey(), JSON.stringify(batches));
    return true;
  } catch {
    return false;
  }
}

/**
 * First visit on an account with no scans yet still needs something to show
 * the judges — one pending ticket, one already returned, one expired.
 * Real sessions from /itemscan are prepended on top and never overwritten.
 */
function seedDemoBatches(): ReturnBatch[] {
  const pendingCreated = new Date(nowMs());
  const returnedCreated = new Date("2026-10-02T14:40:00.000Z");
  const expiredCreated = new Date("2026-09-28T09:05:00.000Z");

  const demo: ReturnBatch[] = [
    {
      id: "batch-demo-pending",
      createdAt: pendingCreated.toISOString(),
      expiresAt: new Date(pendingCreated.getTime() + RETURN_WINDOW_MS).toISOString(),
      status: "pending",
      items: [
        {
          barcode: "5901234567890",
          name: "Żywiec Light Beer Bottle 0.5L",
          value: DEPOSIT_VALUE,
          scannedAt: pendingCreated.toISOString(),
        },
        {
          barcode: "5900001002003",
          name: "Coca-Cola Zero 0.33L Can",
          value: DEPOSIT_VALUE,
          scannedAt: pendingCreated.toISOString(),
        },
      ],
    },
    {
      id: "batch-demo-returned",
      createdAt: returnedCreated.toISOString(),
      expiresAt: new Date(returnedCreated.getTime() + RETURN_WINDOW_MS).toISOString(),
      status: "returned",
      items: [
        {
          barcode: "5000112678062",
          name: "Coca-Cola Zero 0.33L Plastic Bottle",
          value: DEPOSIT_VALUE,
          scannedAt: returnedCreated.toISOString(),
        },
      ],
    },
    {
      id: "batch-demo-expired",
      createdAt: expiredCreated.toISOString(),
      expiresAt: new Date(expiredCreated.getTime() + RETURN_WINDOW_MS).toISOString(),
      status: "pending",
      items: [
        {
          barcode: "5902448246222",
          name: "Strzal Energi 120ml",
          value: DEPOSIT_VALUE,
          scannedAt: expiredCreated.toISOString(),
        },
      ],
    },
  ];

  persist(demo);
  return demo;
}

export function loadBatches(): ReturnBatch[] {
  const stored = readStored();
  return stored.length > 0 ? stored : seedDemoBatches();
}

export function rememberExpand(id: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(EXPAND_KEY, id);
  } catch {
    /* private mode — expand is a nicety, not a requirement */
  }
}

export function consumeExpandId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const id = window.sessionStorage.getItem(EXPAND_KEY);
    if (id) window.sessionStorage.removeItem(EXPAND_KEY);
    return id;
  } catch {
    return null;
  }
}

export function addBatch(items: BatchItem[]): ReturnBatch | null {
  if (items.length === 0) return null;

  const createdAt = new Date(nowMs());
  const batch: ReturnBatch = {
    id: `batch-${createdAt.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: createdAt.toISOString(),
    expiresAt: new Date(createdAt.getTime() + RETURN_WINDOW_MS).toISOString(),
    status: "pending",
    items: items.map((item) => ({
      barcode: item.barcode,
      name: item.name,
      value: DEPOSIT_VALUE,
      scannedAt: item.scannedAt || createdAt.toISOString(),
    })),
  };

  const next = [batch, ...readStored().filter((existing) => existing.id !== batch.id)];
  if (!persist(next)) return null;
  rememberExpand(batch.id);
  return batch;
}

export function markBatchReturned(id: string): ReturnBatch[] {
  const next = readStored().map((batch) =>
    batch.id === id ? { ...batch, status: "returned" as StoredStatus } : batch,
  );
  persist(next);
  return next;
}

export function resolveStatus(batch: ReturnBatch, now: number): BatchStatus {
  if (batch.status === "returned") return "returned";
  return now >= Date.parse(batch.expiresAt) ? "expired" : "pending";
}

export function batchTotal(batch: ReturnBatch): number {
  return batch.items.length * DEPOSIT_VALUE;
}

/**
 * Remaining window, rounded up so a fresh batch reads "48hrs" rather than
 * "47hrs". Minutes only appear in the last hour.
 */
export function formatRemaining(expiresAt: string, now: number): string {
  const ms = Date.parse(expiresAt) - now;
  if (ms <= 0) return "0hrs";
  if (ms >= 60 * 60 * 1000) return `${Math.ceil(ms / (60 * 60 * 1000))}hrs`;
  return `${Math.max(1, Math.ceil(ms / 60000))}m`;
}

export function formatAmount(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatTimestamp(iso: string): string {
  const parsed = Date.parse(iso);
  return Number.isNaN(parsed) ? "—" : dateTimeFormatter.format(new Date(parsed));
}
