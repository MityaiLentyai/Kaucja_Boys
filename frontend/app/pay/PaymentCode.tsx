"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Check, Copy, RefreshCw } from "lucide-react";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function createPaymentToken() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const code = Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
  return `KC-${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
}

export default function PaymentCode() {
  const [token, setToken] = useState(createPaymentToken);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timeout);
  }, [copied]);

  const qrValue = `kaucash://pay?token=${token}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrValue);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <div className="mx-auto w-fit rounded-2xl bg-white p-4">
        <QRCode value={qrValue} size={208} fgColor="#140b17" bgColor="#ffffff" />
      </div>

      <div className="mt-5 space-y-2">
        <p className="text-center text-xs uppercase tracking-wider text-white/40">QR value</p>
        <p className="break-all rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-center font-mono text-sm text-[#e9c9dd]">
          {qrValue}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy value"}
        </button>
        <button
          onClick={() => setToken(createPaymentToken())}
          className="flex items-center justify-center gap-2 rounded-full bg-[#d09abd] px-4 py-2.5 text-sm font-semibold text-[#1a0d1a] shadow-[0_0_30px_rgba(208,154,189,0.4)] transition hover:bg-[#e2b5d2]"
        >
          <RefreshCw className="h-4 w-4" /> New code
        </button>
      </div>
    </>
  );
}
