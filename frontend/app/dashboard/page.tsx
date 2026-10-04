"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUp, MapPin, QrCode, Recycle, ScanBarcode } from "lucide-react";
import { apiFetch } from "../../lib/api";
import BatchCard from "../../components/BatchCard";
import {
  consumeExpandId,
  loadBatches,
  markBatchReturned,
  nowMs,
  resolveStatus,
  type ReturnBatch,
} from "../../lib/batches";

const actions = [
  { href: "/scan", label: "Scan Voucher", text: "Add a deposit receipt", icon: ScanBarcode },
  { href: "/pay", label: "Pay with QR", text: "Spend at any store", icon: QrCode },
  { href: "/itemscan", label: "Scan Items", text: "Bottles and cans", icon: Recycle },
  { href: "/returnpoints", label: "Return Points", text: "Machines near you", icon: MapPin },
];

export default function DashboardPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<{ balance: number } | null>(null);
  const [user, setUser] = useState<{ full_name: string; email: string } | null>(null);
  const [batches, setBatches] = useState<ReturnBatch[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const userData = await apiFetch<{ full_name: string; email: string }>("/auth/me");
        const walletData = await apiFetch<{ balance: number }>("/wallet");
        setUser(userData);
        setWallet(walletData);
        // Read the clock and the stored batches only once authenticated, so the
        // per-account storage key is resolvable.
        setNow(nowMs());
        const loaded = loadBatches();
        setBatches(loaded);
        const queued = consumeExpandId();
        if (queued && loaded.some((batch) => batch.id === queued)) {
          setExpandedId(queued);
        }
      } catch {
        router.push("/login");
      }
    }
    loadData();

    // Keeps the countdown honest and flips a batch to "expired" without a reload.
    const ticker = setInterval(() => setNow(nowMs()), 60_000);
    return () => clearInterval(ticker);
  }, [router]);

  const handleMarkReturned = (id: string) => {
    setBatches(markBatchReturned(id));
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0d070f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,60,110,0.45),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(208,154,189,0.18),transparent_55%)]" />

      {!user || !wallet ? (
        <div className="relative z-10 flex min-h-screen items-center justify-center text-white/60">
          Loading...
        </div>
      ) : (
        <div className="relative z-10 mx-auto max-w-xl space-y-6 px-4 py-6">
          <header className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Image
                  src="/kaucash-logo.jpg"
                  alt="KauCash cow logo"
                  width={44}
                  height={44}
                  className="rounded-full ring-2 ring-[#d09abd]/60"
                />
              </Link>
              <div>
                <h1 className="font-display text-xl font-semibold">
                  Hello, {user.full_name || user.email}
                </h1>
                <p className="text-sm text-white/50">KauCash Wallet</p>
              </div>
            </div>
          </header>

          <div className="space-y-2 rounded-3xl border border-white/10 bg-gradient-to-br from-[#3a1d36] via-[#24121f] to-[#140b17] p-6 shadow-[0_30px_80px_-20px_rgba(208,154,189,0.45)]">
            <p className="text-sm font-medium text-white/60">Available Balance</p>
            <p className="font-display text-4xl font-semibold tracking-tight">
              {wallet.balance.toFixed(2).replace(".", ",")}{" "}
              <span className="text-xl text-[#d09abd]">PLN</span>
            </p>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">
              <ArrowUp className="h-3 w-3" /> Available
            </span>
          </div>

          {batches.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
                Return batches
              </h2>
              {batches.map((batch) => (
                <BatchCard
                  key={batch.id}
                  batch={batch}
                  status={resolveStatus(batch, now)}
                  now={now}
                  expanded={expandedId === batch.id}
                  onToggle={() => setExpandedId(expandedId === batch.id ? null : batch.id)}
                  onMarkReturned={() => handleMarkReturned(batch.id)}
                />
              ))}
            </section>
          )}

          <div className="grid grid-cols-2 gap-4">
            {actions.map(({ href, label, text, icon: ActionIcon }) => (
              <button
                key={href}
                onClick={() => router.push(href)}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-[#d09abd]/50 hover:bg-white/[0.08]"
              >
                <ActionIcon className="h-6 w-6 text-[#d09abd]" />
                <p className="mt-3 font-semibold">{label}</p>
                <p className="text-xs text-white/50">{text}</p>
              </button>
            ))}
          </div>

          <p className="pt-4 text-center text-xs text-white/40">One wallet. Every store. Every time.</p>
        </div>
      )}
    </div>
  );
}
