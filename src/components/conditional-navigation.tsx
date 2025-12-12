"use client";

import { usePathname } from "next/navigation";
import { Navigation } from "./navigation";

export function ConditionalNavigation() {
  const pathname = usePathname();
  
  // Hide navigation only on auth pages (they have their own minimal header)
  if (pathname?.startsWith("/auth")) {
    return null;
  }

  return (
    <>
      <Navigation />
      {/* Spacer for fixed header on mobile - prevents content from hiding behind header */}
      <div className="h-[60px] sm:h-[72px] lg:h-0" />
    </>
  );
}

