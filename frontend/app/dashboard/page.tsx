"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<{ balance: number } | null>(null);
  const [user, setUser] = useState<{ full_name: string; email: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const userData = await apiFetch<{ full_name: string; email: string }>("/auth/me");
        const walletData = await apiFetch<{ balance: number }>("/wallet");
        setUser(userData);
        setWallet(walletData);
      } catch {
        router.push("/login");
      }
    }
    loadData();
  }, [router]);

  if (!user || !wallet) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      <header className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-xl font-bold">Hello, {user.full_name || user.email}</h1>
          <p className="text-sm text-gray-500">KauCash Wallet</p>
        </div>
      </header>

      <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-md space-y-2">
        <p className="text-emerald-100 text-sm font-medium">Available Balance</p>
        <p className="text-4xl font-extrabold">{wallet.balance.toFixed(2)} PLN</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => router.push("/scan")}
          className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md font-semibold text-gray-800"
        >
          🎟️ Scan Voucher
        </button>
        <button
          onClick={() => router.push("/pay")}
          className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md font-semibold text-gray-800"
        >
          💳 Pay with QR
        </button>
        <button
          onClick={() => router.push("/itemscan")}
          className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md font-semibold text-gray-800"
        >
          🥫 Scan Items
        </button>
      </div>
    </div>
  );
}
