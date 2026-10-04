import Image from "next/image";
import Link from "next/link";
import QRCode from "react-qr-code";
import { ArrowUp, MapPin, Recycle, ScanBarcode, QrCode, Wallet } from "lucide-react";

const features = [
  {
    icon: ScanBarcode,
    title: "Scan any receipt",
    text: "Feed the cow your deposit receipts from Biedronka, Lidl or Żabka.",
  },
  {
    icon: Wallet,
    title: "One wallet",
    text: "Every voucher lands in a single balance instead of a pile of paper.",
  },
  {
    icon: QrCode,
    title: "Pay with QR",
    text: "Show a one-time QR code at any participating checkout.",
  },
  {
    icon: MapPin,
    title: "Find return points",
    text: "See nearby deposit machines and whether they actually work.",
  },
];

function PhoneMockup() {
  return (
    <div className="relative w-[260px] shrink-0 rounded-[2.5rem] border border-white/15 bg-gradient-to-b from-zinc-700 to-zinc-900 p-2 shadow-[0_30px_80px_-20px_rgba(208,154,189,0.45)]">
      <div className="rounded-[2rem] bg-[#140b17] px-5 pb-6 pt-8 text-white">
        <div className="mx-auto mb-6 h-5 w-24 rounded-full bg-black" />

        <p className="text-xs text-white/60">Wallet Balance</p>
        <p className="mt-1 text-3xl font-bold tracking-tight">
          8,50 <span className="text-lg font-semibold">PLN</span>
        </p>
        <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">
          <ArrowUp className="h-3 w-3" /> Available
        </span>

        <div className="mt-5 flex items-center justify-between rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
          <div>
            <p className="text-sm font-semibold">Deposit Item</p>
            <p className="text-xs text-white/60">Green PET Bottle</p>
          </div>
          <Recycle className="h-8 w-8 text-[#d09abd]" />
        </div>

        <p className="mt-5 text-center text-xs text-white/60">Show QR to return</p>
        <div className="mx-auto mt-2 w-fit rounded-xl bg-white p-2">
          <QRCode value="kaucash://demo-token" size={96} fgColor="#140b17" />
        </div>

        <p className="mt-5 text-center text-[10px] text-white/50">
          One wallet. Every store. Every time.
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0d070f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,60,110,0.45),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(208,154,189,0.18),transparent_55%)]" />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
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
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/login" className="rounded-full px-4 py-2 text-white/80 hover:text-white">
            Sign in
          </Link>
          <Link
            href="/scan"
            className="rounded-full bg-[#d09abd] px-4 py-2 font-semibold text-[#1a0d1a] hover:bg-[#e2b5d2]"
          >
            Scan a receipt
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-6">
        <section className="pt-10 text-center">
          <h1 className="bg-gradient-to-r from-white via-[#f3d9ea] to-[#d09abd] bg-clip-text font-display text-6xl font-semibold tracking-tight text-transparent sm:text-8xl">
            KauCash
          </h1>
          <p className="mt-4 text-xl text-white/80 sm:text-2xl">Kaucja that works everywhere.</p>
        </section>

        <section className="mt-10 flex flex-col items-center justify-center gap-10 lg:flex-row lg:gap-4">
          <Image
            src="/kaucash-cow.jpg"
            alt="Piggy-bank cow swallowing deposit receipts"
            width={600}
            height={370}
            priority
            className="w-full max-w-[600px]"
            style={{
              maskImage: "radial-gradient(ellipse at center, black 55%, transparent 78%)",
              WebkitMaskImage: "radial-gradient(ellipse at center, black 55%, transparent 78%)",
            }}
          />
          <PhoneMockup />
        </section>

        <section className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/login"
            className="rounded-full bg-[#d09abd] px-8 py-3 text-base font-semibold text-[#1a0d1a] shadow-[0_0_30px_rgba(208,154,189,0.4)] hover:bg-[#e2b5d2]"
          >
            Open my wallet
          </Link>
          <Link
            href="/scan"
            className="rounded-full border border-white/20 px-8 py-3 text-base font-semibold text-white hover:bg-white/10"
          >
            Scan a receipt
          </Link>
        </section>

        <section className="mt-20 grid gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: FeatureIcon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur"
            >
              <FeatureIcon className="h-6 w-6 text-[#d09abd]" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-white/60">{text}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-6xl px-6 py-6 text-xs text-white/40">
        Kaucja Boys · Hackathon
      </footer>
    </div>
  );
}
