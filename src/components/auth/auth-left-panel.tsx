"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const backgroundImages = {
  "/auth/login": "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1600&q=80",
  "/auth/signup": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80",
  "/auth/forgot-password": "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80",
};

export function AuthLeftPanel() {
  const pathname = usePathname();
  const backgroundImage = backgroundImages[pathname as keyof typeof backgroundImages] || backgroundImages["/auth/login"];

  return (
    <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-slate-950">
      {/* Background image - subtle, desaturated feel */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 opacity-40 grayscale"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
        }}
      />
      {/* Single minimal overlay - black/white only */}
      <div className="absolute inset-0 bg-slate-950/70" />

      <div className="relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition mb-8 group"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs uppercase tracking-[0.2em]">Back to home</span>
        </Link>

        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2">
            <span className="text-xs font-medium uppercase tracking-wider text-white/90">
              Kenya&apos;s Premier Ticketing Platform
            </span>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">
            Welcome to
            <br />
            <span className="text-white">Tickit</span>
          </h1>

          <p className="text-lg text-white/70 max-w-sm leading-relaxed">
            Discover, create, and manage events across Kenya.
          </p>
        </div>
      </div>

      {/* Bottom features - minimal, B&W */}
      <div className="relative z-10 space-y-3">
        <div className="flex items-center gap-3 text-white/70">
          <div className="flex size-9 items-center justify-center rounded-lg border border-white/20 bg-white/5">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-white/90">MPesa · Secure · Real-time</p>
        </div>
      </div>
    </div>
  );
}

