import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Bot,
  Coins,
  MapPin,
  QrCode,
  ScanBarcode,
  ScanLine,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How it works · KauCash",
  description:
    "Turn store-specific kaucja slips into one balance you can spend at any participating checkout.",
};

const problems = [
  "Your deposit is locked to the chain that printed the slip.",
  "The value sits on paper that is easy to lose and quick to expire.",
  "Finding a machine that actually works is guesswork.",
];

const steps = [
  {
    icon: ScanBarcode,
    title: "Scan the slip",
    text: "Point your camera at the barcode on a deposit receipt from Biedronka, Lidl or Żabka. No camera? Type the code by hand.",
  },
  {
    icon: Wallet,
    title: "One balance, not a pile of coupons",
    text: "Every voucher you scan lands in the same wallet in PLN, whichever chain issued it.",
  },
  {
    icon: QrCode,
    title: "Pay with a QR code",
    text: "At a participating checkout, show your code. The cashier scans it, enters the amount, and it leaves your balance.",
  },
  {
    icon: Coins,
    title: "Collect points as you return",
    text: "Every deposit earns points that turn into sponsored vouchers and partner discounts.",
  },
];

const mapFacts = [
  "Nearby return points, ranked by how far you have to walk.",
  "Community status at a glance: working, long queue, or out of order.",
  "What each point accepts — bottles, cans, glass.",
  "Report what you found, so the next person doesn't waste the trip.",
];

const trustFacts = [
  "A voucher code can be claimed exactly once.",
  "Payment codes are single-use and tied to your account.",
  "Top-ups and payments are written to an append-only ledger.",
  "Raw scans are kept, so a disputed claim can always be audited.",
];

const roadmap = [
  {
    icon: Bot,
    title: "Scan bottles at home",
    text: "AI estimates the deposit and credits you up front; you settle it when the bottles physically go back.",
  },
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

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5 text-sm text-white/60">
      <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#d09abd]" />
      <span>{children}</span>
    </li>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0d070f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,60,110,0.45),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(208,154,189,0.18),transparent_55%)]" />

      <header className="relative z-10 mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-5">
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
            Paper deposit slips in. One balance out, spendable at any participating checkout.
          </p>
        </section>

        <section className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="font-display text-xl font-semibold">Why it needs fixing</h2>
          <ul className="mt-4 space-y-2.5">
            {problems.map((problem) => (
              <Bullet key={problem}>{problem}</Bullet>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold">Four steps, start to finish</h2>
          <ol className="mt-5 grid gap-4 sm:grid-cols-2">
            {steps.map(({ icon: StepIcon, title, text }, index) => (
              <li key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between gap-3">
                  <StepIcon className="h-6 w-6 text-[#d09abd]" />
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#d09abd]/30 bg-[#d09abd]/10 font-display text-xs font-semibold text-[#d09abd]">
                    {index + 1}
                  </span>
                </div>
                <h3 className="mt-3 font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-white/60">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <MapPin className="h-6 w-6 text-[#d09abd]" />
            <h2 className="mt-3 font-display text-lg font-semibold">Find a machine that works</h2>
            <ul className="mt-4 space-y-2.5">
              {mapFacts.map((fact) => (
                <Bullet key={fact}>{fact}</Bullet>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <ShieldCheck className="h-6 w-6 text-[#d09abd]" />
            <h2 className="mt-3 font-display text-lg font-semibold">Built to be trusted</h2>
            <ul className="mt-4 space-y-2.5">
              {trustFacts.map((fact) => (
                <Bullet key={fact}>{fact}</Bullet>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl font-semibold">Coming next</h2>
            <span className="rounded-full border border-[#d09abd]/30 px-2.5 py-1 text-[11px] font-semibold text-[#d09abd]">
              In design
            </span>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
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
          <h2 className="font-display text-2xl font-semibold">Ready to stop collecting paper?</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link href="/login" className="btn btn-primary px-8 py-3 text-base">
              Open my wallet
            </Link>
            <Link href="/returnpoints" className="btn btn-secondary px-8 py-3 text-base">
              See return points
            </Link>
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-xs text-white/40">
            KauCash is a universal wallet layer on top of today&apos;s store-specific deposit
            vouchers. Checkout redemption runs as a participating-merchant concept and machine status
            is crowdsourced.
          </p>
        </section>
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-4xl px-6 py-6 text-xs text-white/40">
        Kaucja Boys · 42 Warsaw
      </footer>
    </div>
  );
}
