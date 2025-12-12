"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { adminSections } from "@/data/admin";

const navItems = adminSections.map((section) => ({
  id: section.id,
  label: section.title,
  href: `/admin/${section.id}`,
}));

const baseClasses =
  "flex items-center rounded-2xl px-3 py-2 text-left transition";
const activeClasses =
  "bg-slate-900 text-white shadow-lg shadow-slate-900/20 border border-slate-900";
const inactiveClasses =
  "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent";

export function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      // Prevent body scroll when menu is open
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      window.addEventListener("keydown", handler);
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
      window.removeEventListener("keydown", handler);
    }

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [isMobileMenuOpen]);

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const renderNavContent = (isMobile = false) => (
    <nav className={isMobile ? "p-6" : "sticky top-[calc(60px+1.5rem)] sm:top-[calc(72px+1.5rem)] lg:top-[calc(72px+2.5rem)] rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/70"}>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
        Admin Sections
      </p>
      <ul className="mt-4 space-y-1 text-sm font-medium">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname === `/admin/${item.id}/`;
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                onClick={handleLinkClick}
                className={`${baseClasses} ${
                  isActive ? activeClasses : inactiveClasses
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 lg:block">
        {renderNavContent(false)}
      </aside>

      {/* Mobile Menu Button - Minimal floating button */}
      <button
        type="button"
        onClick={() => setIsMobileMenuOpen(true)}
        className="fixed bottom-6 left-6 z-[40] flex size-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg shadow-slate-900/30 transition hover:bg-slate-800 hover:scale-110 active:scale-95 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" strokeWidth={2.5} />
      </button>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[45] bg-slate-900/75 backdrop-blur-md transition-opacity duration-300 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden
        />
      )}

      {/* Mobile Slide-in Menu */}
      <aside
        className={`fixed left-0 top-0 z-[50] h-screen w-80 max-w-[85vw] transform bg-white transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } ${!isMobileMenuOpen ? "pointer-events-none" : ""}`}
        style={{
          boxShadow: isMobileMenuOpen ? "4px 0 24px rgba(0, 0, 0, 0.2)" : "none",
          visibility: isMobileMenuOpen ? "visible" : "hidden",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Admin</p>
              <p className="text-xs text-slate-500">Portal</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex size-12 items-center justify-center rounded-xl border-2 border-slate-900 bg-slate-900 text-white shadow-lg transition hover:bg-slate-800 hover:scale-105 active:scale-95"
            aria-label="Close menu"
          >
            <X className="size-6 font-bold" strokeWidth={3} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex h-[calc(100vh-5rem)] flex-col bg-white overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {renderNavContent(true)}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 bg-white px-6 py-4 shrink-0">
            <p className="text-center text-xs font-medium text-slate-600">
              © 2025 Tixhub. All rights reserved.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

