"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveToken } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@kaucja.pl");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      if (!res.ok) throw new Error("Invalid credentials");

      const data = await res.json();
      saveToken(data.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0d070f] px-4 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,60,110,0.45),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(208,154,189,0.18),transparent_55%)]" />

      <div className="relative z-10 w-full max-w-md space-y-8 rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_30px_80px_-20px_rgba(208,154,189,0.35)] backdrop-blur">
        <Link href="/" className="flex flex-col items-center gap-4">
          <Image
            src="/kaucash-logo.jpg"
            alt="KauCash cow logo"
            width={80}
            height={80}
            className="rounded-full ring-2 ring-[#d09abd]/60"
          />
          <h2 className="bg-gradient-to-r from-white via-[#f3d9ea] to-[#d09abd] bg-clip-text text-center font-display text-3xl font-semibold text-transparent">
            Sign in to KauCash
          </h2>
        </Link>
        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-center text-sm text-red-300 ring-1 ring-red-400/30">
            {error}
          </p>
        )}
        <form className="mt-8 space-y-4" onSubmit={handleLogin}>
          <input
            type="email"
            required
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-[#d09abd] focus:ring-2 focus:ring-[#d09abd]/30"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-[#d09abd] focus:ring-2 focus:ring-[#d09abd]/30"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              type="button"
              disabled
              title="Password recovery is not available yet"
              className="cursor-not-allowed text-xs font-semibold text-white/30"
            >
              Forgot password?
            </button>
          </div>
          <button type="submit" className="btn btn-primary w-full px-4 py-3">
            Sign In
          </button>
        </form>
        <p className="text-center text-sm text-white/50">
          New here?{" "}
          <Link href="/register" className="font-semibold text-[#d09abd] hover:text-[#e2b5d2]">
            Register
          </Link>
        </p>
        <p className="text-center text-xs text-white/40">One wallet. Every store. Every time.</p>
      </div>
    </div>
  );
}
