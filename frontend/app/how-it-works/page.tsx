import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  MapPin,
  QrCode,
  Recycle,
  ScanBarcode,
  ScanLine,
  Truck,
  Wallet,
} from "lucide-react";
import BackButton from "../../components/BackButton";

export const metadata: Metadata = {
  title: "How it works · KauCash",
  description:
    "Scan slips or bottles, keep one wallet, pay with QR, and find a working return point.",
};

const features = [
  {
    icon: ScanBarcode,
    title: "Scan a slip",
    text: "Camera or type the code. A Biedronka, Lidl, or Żabka voucher is claimed once and added to your wallet.",
  },
  {
    icon: Recycle,
    title: "Scan bottles at home",
    text: "Scan bottles and cans. The deposit is credited now and grouped into a return batch.",
  },
  {
    icon: Clock,
    title: "Return in 48 hours",
    text: "Each batch stays pending until you take the bottles back — or it expires. Mark it returned from the dashboard.",
  },
  {
    icon: Wallet,
    title: "One wallet",
    text: "Slips and home scans land in the same PLN balance, whichever store issued the deposit.",
  },
  {
    icon: QrCode,
    title: "Pay with QR",
    text: "Show a one-time code at a participating checkout. Copy it or generate a new one.",
  },
  {
    icon: MapPin,
    title: "Find a machine that works",
    text: "Nearby return points with status, what they accept, and directions.",
  },
];

const roadmap = [
  {
    icon: ScanLine,
    title: "Your QR at the machine",
    text: "Identify yourself before you return, so the machine already knows where the deposit belongs.",
  },
  {
    icon: Truck,
    title: "Courier pickup",
    text: "Hand off a bulk return and receive the deposit minus a collection fee.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0d070f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,60,110,0.45),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(208,154,189,0.18),transparent_55%)]" />

      <header className="relative z-10 mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <BackButton href="/" />
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/kaucash-logo.jpg"
              alt="KauCash cow logo"
              width={40}
              height={40}
              className="rounded-full ring-2 ring-[#d09abd]/60"
            />
            <span className="font-display text-lg font-semibold">KauCash</span>
          </Link>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/login" className="rounded-full px-4 py-2 text-white/80 hover:text-white">
            Sign in
          </Link>
          <Link href="/register" className="btn btn-outline px-4 py-2">
            Register
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-4xl flex-1 px-6 pb-16">
        <section className="pt-8 text-center">
          <h1 className="bg-gradient-to-r from-white via-[#f3d9ea] to-[#d09abd] bg-clip-text font-display text-4xl font-semibold tracking-tight text-transparent sm:text-5xl">
            How KauCash works
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
            Scan slips or bottles. One balance. Spend it anywhere that takes KauCash.
          </p>
        </section>

        <section className="mt-12">
          <ol className="grid gap-4 sm:grid-cols-2">
            {features.map(({ icon: FeatureIcon, title, text }, index) => (
              <li key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between gap-3">
                  <FeatureIcon className="h-6 w-6 text-[#d09abd]" />
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#d09abd]/30 bg-[#d09abd]/10 font-display text-xs font-semibold text-[#d09abd]">
                    {index + 1}
                  </span>
                </div>
                <h2 className="mt-3 font-semibold">{title}</h2>
                <p className="mt-1.5 text-sm text-white/60">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl font-semibold">Coming next</h2>
            <span className="rounded-full border border-[#d09abd]/30 px-2.5 py-1 text-[11px] font-semibold text-[#d09abd]">
              In design
            </span>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {roadmap.map(({ icon: RoadmapIcon, title, text }) => (
              <div
                key={title}
                className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5"
              >
                <RoadmapIcon className="h-5 w-5 text-[#d09abd]/80" />
                <h3 className="mt-3 text-sm font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-white/50">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/login" className="btn btn-primary px-8 py-3 text-base">
              Open my wallet
            </Link>
            <Link href="/returnpoints" className="btn btn-secondary px-8 py-3 text-base">
              See return points
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-4xl px-6 py-6 text-xs text-white/40">
        Kaucja Boys · 42 Warsaw
      </footer>
    </div>
  );
}
