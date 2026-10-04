"use client";

import Image from "next/image";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";

const fields = [
  { id: "name", label: "Name", type: "text", placeholder: "Jan", autoComplete: "given-name" },
  {
    id: "surname",
    label: "Surname",
    type: "text",
    placeholder: "Kowalski",
    autoComplete: "family-name",
  },
  {
    id: "phone",
    label: "Phone number",
    type: "tel",
    placeholder: "+48 600 000 000",
    autoComplete: "tel",
  },
  {
    id: "email",
    label: "Email",
    type: "email",
    placeholder: "jan@kaucja.pl",
    autoComplete: "email",
  },
];

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0d070f] px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,60,110,0.45),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(208,154,189,0.18),transparent_55%)]" />

      <div className="relative z-10 w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_30px_80px_-20px_rgba(208,154,189,0.35)] backdrop-blur">
        <Link href="/" className="flex flex-col items-center gap-4">
          <Image
            src="/kaucash-logo.jpg"
            alt="KauCash cow logo"
            width={80}
            height={80}
            className="rounded-full ring-2 ring-[#d09abd]/60"
          />
          <h1 className="bg-gradient-to-r from-white via-[#f3d9ea] to-[#d09abd] bg-clip-text text-center font-display text-3xl font-semibold text-transparent">
            Create your account
          </h1>
        </Link>

        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <p className="text-sm text-amber-200/90">
            <span className="font-semibold">Work in progress.</span> Sign-up is not live yet, so
            this form cannot be submitted. Use the demo account on the sign-in page instead.
          </p>
        </div>

        <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
          {fields.map(({ id, label, type, placeholder, autoComplete }) => (
            <div key={id} className="space-y-1.5">
              <label htmlFor={id} className="block text-xs font-semibold text-white/50">
                {label}
              </label>
              <input
                id={id}
                name={id}
                type={type}
                placeholder={placeholder}
                autoComplete={autoComplete}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#d09abd] focus:ring-2 focus:ring-[#d09abd]/30"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled
            title="Registration is not available yet"
            className="btn btn-primary w-full px-4 py-3"
          >
            Create account
          </button>
        </form>

        <p className="text-center text-sm text-white/50">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#d09abd] hover:text-[#e2b5d2]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
