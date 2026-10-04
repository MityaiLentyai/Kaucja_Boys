"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface AppShellProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  onBack?: () => void;
  children: React.ReactNode;
}

export default function AppShell({
  title,
  subtitle,
  backHref = "/dashboard",
  onBack,
  children,
}: AppShellProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    router.push(backHref);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0d070f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,60,110,0.45),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(208,154,189,0.18),transparent_55%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-xl flex-col gap-5 px-4 py-6">
        <header className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
          <button
            onClick={handleBack}
            aria-label="Go back"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-[#d09abd]/50 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0 text-center">
            <h1 className="truncate font-display text-xl font-semibold">{title}</h1>
            {subtitle && <p className="truncate text-sm text-white/50">{subtitle}</p>}
          </div>

          <Link href="/" className="shrink-0">
            <Image
              src="/kaucash-logo.jpg"
              alt="KauCash cow logo"
              width={40}
              height={40}
              className="rounded-full ring-2 ring-[#d09abd]/60"
            />
          </Link>
        </header>

        {children}

        <p className="pt-2 text-center text-xs text-white/40">
          One wallet. Every store. Every time.
        </p>
      </div>
    </div>
  );
}
