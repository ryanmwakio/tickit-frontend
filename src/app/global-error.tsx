'use client';

import { useEffect } from 'react';
import Image from "next/image";
import { AlertTriangle, RefreshCw, Home, Music, PartyPopper, Sparkles } from "lucide-react";
import { logger } from '@/lib/logger';

// Cheerful event images - premium experiences
const eventImages = [
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=400&q=80",
];

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log global error to file
    logger.error('Global Error', error, 'GLOBAL_ERROR');

    // Add custom animations
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes floatImage {
        0%, 100% {
          transform: translate(0, 0) rotate(0deg);
        }
        25% {
          transform: translate(10px, -15px) rotate(2deg);
        }
        50% {
          transform: translate(-10px, -25px) rotate(-2deg);
        }
        75% {
          transform: translate(15px, -10px) rotate(1deg);
        }
      }
      @keyframes pulse {
        0%, 100% {
          opacity: 0.4;
        }
        50% {
          opacity: 0.8;
        }
      }
      .animate-fade-in-up {
        animation: fadeInUp 0.8s ease-out forwards;
      }
      .animate-float-image {
        animation: floatImage 20s ease-in-out infinite;
      }
      .animate-pulse-slow {
        animation: pulse 3s ease-in-out infinite;
      }
      .delay-100 { animation-delay: 0.1s; opacity: 0; }
      .delay-200 { animation-delay: 0.2s; opacity: 0; }
      .delay-300 { animation-delay: 0.3s; opacity: 0; }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased bg-white text-slate-900 overflow-x-hidden">
        <div className="flex min-h-screen flex-col bg-white text-slate-900 overflow-x-hidden relative">
          {/* Background Pattern */}
          <div className="pointer-events-none absolute inset-0 opacity-60 overflow-hidden">
            <div className="absolute inset-0 tix-grid" />
          </div>

          {/* Gradient Overlays */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 opacity-60 animate-pulse-slow" style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(239,68,68,0.12), transparent 55%), radial-gradient(circle at 80% 0%, rgba(220,38,38,0.15), transparent 50%)",
            }} />
          </div>

          {/* Floating Event Images */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {eventImages.map((img, idx) => (
              <div
                key={idx}
                className="absolute animate-float-image"
                style={{
                  left: `${10 + idx * 25}%`,
                  top: `${15 + (idx % 2) * 40}%`,
                  animationDelay: `${idx * 3.5}s`,
                  animationDuration: `${22 + idx * 2}s`,
                }}
              >
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden shadow-2xl shadow-red-900/25 border-2 border-white/80 backdrop-blur-sm">
                  <Image
                    src={img}
                    alt="Premium Event"
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-red-900/50 via-red-900/20 to-transparent" />
                  <div className="absolute top-2 right-2">
                    <div className="rounded-full bg-white/90 p-1.5 shadow-lg">
                      <Sparkles className="size-3 text-amber-400 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="relative flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 z-10">
            <div className="relative mx-auto w-full max-w-5xl">
              {/* Main Content Container */}
              <div className="relative rounded-[40px] border border-red-200/80 bg-white/80 backdrop-blur-xl p-8 sm:p-12 lg:p-16 shadow-2xl shadow-red-900/10">
                <div className="text-center">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2.5 rounded-full border border-red-200 bg-gradient-to-r from-red-50 to-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.4em] text-red-600 shadow-lg shadow-red-200/60 mb-10 animate-fade-in-up delay-100">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="size-4 text-red-500 animate-pulse" />
                      <span>Critical Error</span>
                    </div>
                  </div>

                  {/* Large Error Message */}
                  <div className="mb-8 animate-fade-in-up delay-200">
                    <div className="relative inline-block">
                      <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-slate-900 leading-none tracking-tight">
                        <span className="relative bg-gradient-to-br from-red-600 via-red-500 to-red-700 bg-clip-text text-transparent">
                          Error
                          <span className="absolute -top-2 -right-2 text-red-400 opacity-20 blur-xl">Error</span>
                        </span>
                      </h1>
                    </div>
                  </div>

                  {/* Main Message */}
                  <div className="space-y-5 mb-12 animate-fade-in-up delay-300">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 leading-tight">
                      Application Error
                    </h2>
                    <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                      A critical error occurred in the application. Our team has been notified. 
                      Even in chaos, we keep the premium experience alive.
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-8">
                      <div className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 border border-red-100">
                        <Music className="size-5 text-red-500 animate-pulse" />
                        <span className="text-sm font-medium text-red-700">Live Events</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 border border-amber-100">
                        <PartyPopper className="size-5 text-amber-500 animate-pulse" />
                        <span className="text-sm font-medium text-amber-700">Premium</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 border border-indigo-100">
                        <Sparkles className="size-5 text-indigo-500 animate-pulse" />
                        <span className="text-sm font-medium text-indigo-700">Experience</span>
                      </div>
                    </div>
                    {error.message && (
                      <div className="mt-8 rounded-2xl border border-red-200 bg-gradient-to-br from-red-50/80 to-white p-5 max-w-xl mx-auto shadow-lg">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600 mb-2">Error Details</p>
                        <p className="text-sm text-red-700 font-mono break-all">{error.message}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap justify-center gap-4 mb-10 animate-fade-in-up delay-400">
                    <button
                      onClick={reset}
                      className="group inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/40"
                    >
                      <RefreshCw className="size-5" />
                      Reload Application
                    </button>
                    <a
                      href="/"
                      className="group inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 px-8 py-4 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/80"
                    >
                      <Home className="size-5" />
                      Go Home
                    </a>
                  </div>

                  {/* Helpful Info */}
                  <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white/95 to-slate-50/95 p-8 shadow-lg shadow-slate-200/60 backdrop-blur-sm animate-fade-in-up delay-500">
                    <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500 mb-4">
                      What happened?
                    </p>
                    <p className="text-sm text-slate-600">
                      This is a critical application error. If the problem persists after reloading, 
                      please contact support or try again later.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

