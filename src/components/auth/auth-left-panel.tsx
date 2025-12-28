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
    <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
          backgroundAttachment: 'fixed'
        }}
      />
      
      {/* Gradient Overlay - Elegant Deep Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-indigo-900/75 to-slate-900/85" />
      <div className="absolute inset-0 bg-gradient-to-tl from-emerald-600/25 via-transparent to-blue-600/20" />
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/15 via-transparent to-indigo-600/20" />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      {/* Floating Orbs - Elegant Accent Colors */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-32 right-16 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-float-reverse" />
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-teal-500/12 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-white/90 hover:text-white transition mb-8 group"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs uppercase tracking-[0.3em]">Back to home</span>
        </Link>
        
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-white">
              Kenya&apos;s Premier Ticketing Platform
            </span>
          </div>
          
          <h1 className="text-5xl font-bold text-white leading-tight">
            Welcome to
            <br />
            <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-blue-300 bg-clip-text text-transparent">Tickit</span>
          </h1>
          
          <p className="text-xl text-white/80 max-w-md leading-relaxed">
            The all-in-one platform for discovering, creating, and managing events across Kenya.
          </p>
        </div>
      </div>
      
      {/* Bottom Features */}
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-3 text-white/80">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-white">MPesa Integration</p>
            <p className="text-sm text-white/70">Seamless payments</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-white/80">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-white">Secure & Reliable</p>
            <p className="text-sm text-white/70">Enterprise-grade security</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-white/80">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-white">Real-time Analytics</p>
            <p className="text-sm text-white/70">Live insights & reports</p>
          </div>
        </div>
      </div>
    </div>
  );
}

