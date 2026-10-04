"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Store } from "lucide-react";
import AppShell from "@/components/AppShell";
import { apiFetch } from "@/lib/api";

// The payment token is generated in the browser, so skip it during SSR.
const PaymentCode = dynamic(() => import("./PaymentCode"), {
  ssr: false,
  loading: () => <div className="mx-auto h-60 w-60 animate-pulse rounded-2xl bg-white/10" />,
});

export default function PayWithQrPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<{ balance: number } | null>(null);

  useEffect(() => {
    async function loadWallet() {
      try {
        setWallet(await apiFetch<{ balance: number }>("/wallet"));
      } catch {
        router.push("/login");
      }
    }
    loadWallet();
  }, [router]);

  return (
    <AppShell title="Pay with QR" subtitle="Spend at any store">
      <div className="space-y-2 rounded-3xl border border-white/10 bg-gradient-to-br from-[#3a1d36] via-[#24121f] to-[#140b17] p-6 shadow-[0_30px_80px_-20px_rgba(208,154,189,0.45)]">
        <p className="text-sm font-medium text-white/60">Payable Balance</p>
        <p className="font-display text-4xl font-semibold tracking-tight">
          {wallet ? wallet.balance.toFixed(2).replace(".", ",") : "—"}{" "}
          <span className="text-xl text-[#d09abd]">PLN</span>
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <PaymentCode />
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <Store className="mt-0.5 h-5 w-5 shrink-0 text-[#d09abd]" />
        <p className="text-sm text-white/60">
          Show this code to the cashier at any participating store. They scan it, pick the amount,
          and it is taken straight from your KauCash balance.
        </p>
      </div>
    </AppShell>
  );
}
