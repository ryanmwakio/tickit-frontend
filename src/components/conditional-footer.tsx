"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./footer";

export function ConditionalFooter() {
  const pathname = usePathname();
  
  // Hide footer on auth pages and certain admin/ops pages where it might interfere
  const hideFooterPaths = [
    "/auth",
    "/admin",
    "/ops/live", // Live operations might need full screen
    "/seat-maps", // Seat map editor might need full screen
  ];
  
  // Check if current path should hide footer
  const shouldHideFooter = hideFooterPaths.some(path => pathname?.startsWith(path));
  
  if (shouldHideFooter) {
    return null;
  }

  return <Footer />;
}