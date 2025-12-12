"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px or more
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Hide scroll-to-top on dashboard pages on mobile (menu button is on left)
  const isDashboardPage = pathname?.startsWith("/organizer") || pathname?.startsWith("/admin");
  const shouldHideOnMobile = isDashboardPage && isVisible;

  if (!isVisible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-[35] flex size-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg shadow-slate-900/30 transition hover:bg-slate-800 hover:scale-110 active:scale-95 lg:bottom-8 lg:right-8 ${
        shouldHideOnMobile ? "lg:flex hidden" : ""
      }`}
      aria-label="Scroll to top"
    >
      <ArrowUp className="size-5" strokeWidth={2.5} />
    </button>
  );
}

