import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { AuthLeftPanel } from "@/components/auth/auth-left-panel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Left Side - Branding Panel */}
      <AuthLeftPanel />
      
      {/* Right Side - Form Panel */}
      <div className="flex-1 flex flex-col lg:justify-center px-4 py-8 lg:py-12 lg:px-12">
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {children}
        </div>
      </div>
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo-icon.svg"
              alt="Tixhub"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-sm font-bold text-slate-900">Tixhub</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
          >
            <ArrowLeft className="size-3" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

