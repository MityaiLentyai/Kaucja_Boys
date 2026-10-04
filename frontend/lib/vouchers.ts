const MIN_CODE_LENGTH = 4;

const PAYMENT_PREFIX = "kaucash://pay";

export function isPaymentCode(raw: string): boolean {
  return raw.trim().toLowerCase().startsWith(PAYMENT_PREFIX);
}

/**
 * Pull a claimable voucher code out of whatever the camera (or a pasted
 * payload) actually read: a raw CODE-128, a QR URL, or a small JSON blob.
 * Payment QRs are rejected so a checkout code cannot be claimed as a deposit.
 */
export function extractVoucherCode(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || isPaymentCode(trimmed)) return null;

  const fromUri = codeFromUri(trimmed);
  if (fromUri) return fromUri;

  if (trimmed.startsWith("{")) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object") {
        for (const key of ["code", "barcode", "voucher_code", "voucher"] as const) {
          const value = (parsed as Record<string, unknown>)[key];
          if (typeof value === "string" && value.trim().length >= MIN_CODE_LENGTH) {
            return value.trim();
          }
        }
      }
    } catch {
      /* fall through to the raw first token */
    }
  }

  const token = trimmed.split(/\s+/)[0]?.replace(/^['"]|['"]$/g, "") ?? "";
  return token.length >= MIN_CODE_LENGTH ? token : null;
}

function codeFromUri(value: string): string | null {
  const lowered = value.toLowerCase();
  if (
    !lowered.startsWith("kaucash://") &&
    !lowered.startsWith("http://") &&
    !lowered.startsWith("https://")
  ) {
    return null;
  }

  try {
    const url = new URL(value);
    for (const key of ["code", "barcode", "voucher", "voucher_code"]) {
      const found = url.searchParams.get(key)?.trim();
      if (found && found.length >= MIN_CODE_LENGTH) return found;
    }
    const last = url.pathname.split("/").filter(Boolean).pop();
    if (!last) return null;
    const decoded = decodeURIComponent(last).trim();
    return decoded.length >= MIN_CODE_LENGTH ? decoded : null;
  } catch {
    return null;
  }
}

export function isPlausibleVoucherCode(code: string): boolean {
  return extractVoucherCode(code) !== null;
}
