import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      aria-label="Go back"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-[#d09abd]/50 hover:text-white"
    >
      <ArrowLeft className="h-4 w-4" />
    </Link>
  );
}
