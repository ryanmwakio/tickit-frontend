"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { navLinks } from "@/data/content";
import { useAuth } from "@/contexts/auth-context";
import {
  UserCircle,
  X,
  Menu,
  Home,
  Calendar,
  Plus,
  User,
  Settings,
  LogIn,
  Ticket,
  Sparkles,
  Layers,
  Cpu,
  Briefcase,
  Route,
  Shield,
  Brain,
  ShieldCheck,
  Info,
} from "lucide-react";
import { NotificationBell } from "./notifications/notification-bell";

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(href);
}

const activeClasses =
  "border-slate-900 text-slate-900 bg-slate-100 shadow-sm shadow-slate-200";
const inactiveClasses =
  "border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-900";

function DesktopNav({ pathname }: { pathname: string }) {
  const { isAuthenticated, hasRole } = useAuth();
  
  // Admin-only routes
  const adminOnlyRoutes = ["/system", "/suites", "/journeys", "/ops", "/intelligence"];
  
  // Filter nav links based on authentication and roles
  const filteredLinks = navLinks.filter((link) => {
    // Public links
    if (link.href === "/" || link.href === "/events" || link.href === "/calendar" || link.href === "/features") {
      return true;
    }
    
    // Admin-only links (system, suites, journeys, ops, intelligence)
    if (adminOnlyRoutes.includes(link.href)) {
      return isAuthenticated && hasRole("ADMIN");
    }
    
    // Admin dashboard link
    if (link.href.startsWith("/admin")) {
      return isAuthenticated && hasRole("ADMIN");
    }
    
    // Organizer-only links
    if (link.href.startsWith("/organizer")) {
      return isAuthenticated && hasRole("ORGANISER");
    }
    
    // Authenticated user links
    if (link.href === "/tickets" || link.href === "/profile") {
      return isAuthenticated;
    }
    
    return true;
  });

  return (
    <div className="hidden items-center gap-2 text-sm lg:flex">
      {filteredLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`whitespace-nowrap rounded-xl border px-4 py-2 transition ${
            isActivePath(pathname, link.href) ? activeClasses : inactiveClasses
          }`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

function MobileMenu({
  pathname,
  open,
  onClose,
}: {
  pathname: string;
  open: boolean;
  onClose: () => void;
}) {
  const { isAuthenticated, user, logout, hasRole } = useAuth();
  
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        onClose();
      }
    };
    
    if (open) {
      // Prevent body scroll when menu is open
      const scrollY = window.scrollY;
      const body = document.body;
      const html = document.documentElement;
      
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.width = "100%";
      body.style.height = "100%";
      body.style.overflow = "hidden";
      html.style.overflow = "hidden";
      html.style.height = "100%";
      
      window.addEventListener("keydown", handler);
      // Prevent touch scrolling on iOS
      const preventTouchMove = (e: TouchEvent) => e.preventDefault();
      document.addEventListener("touchmove", preventTouchMove, { passive: false });
      
      return () => {
        const body = document.body;
        const html = document.documentElement;
        body.style.position = "";
        body.style.top = "";
        body.style.width = "";
        body.style.height = "";
        body.style.overflow = "";
        html.style.overflow = "";
        html.style.height = "";
        window.removeEventListener("keydown", handler);
        document.removeEventListener("touchmove", preventTouchMove);
      };
    } else {
      // Restore scroll position
      const body = document.body;
      const html = document.documentElement;
      const scrollY = body.style.top;
      
      body.style.position = "";
      body.style.top = "";
      body.style.width = "";
      body.style.height = "";
      body.style.overflow = "";
      html.style.overflow = "";
      html.style.height = "";
      
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
      
      window.removeEventListener("keydown", handler);
    }
  }, [open, onClose]);

  const handleLinkClick = () => {
    onClose();
  };

  const getIconForLink = (href: string) => {
    if (href === "/") return Home;
    if (href === "/events") return Ticket;
    if (href === "/calendar") return Calendar;
    if (href === "/features") return Sparkles;
    if (href === "/journeys") return Route;
    if (href === "/intelligence") return Brain;
    if (href === "/ops") return Shield;
    if (href === "/suites") return Layers;
    if (href === "/system") return Cpu;
    if (href === "/organizer") return Briefcase;
    if (href === "/admin") return ShieldCheck;
    return Info;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-md transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden
      />

      {/* Slide-in Menu */}
      <div
        className={`fixed right-0 top-0 z-[60] h-screen w-80 max-w-[85vw] transform transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        } ${!open ? "pointer-events-none" : ""}`}
        style={{
          background: "rgba(255, 255, 255, 1)",
          borderLeft: "1px solid rgba(226, 232, 240, 0.8)",
          boxShadow: open ? "-4px 0 24px rgba(0, 0, 0, 0.2), inset 1px 0 0 rgba(255, 255, 255, 1)" : "none",
          visibility: open ? "visible" : "hidden",
          height: "100vh",
          maxHeight: "100vh",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-icon.svg"
              alt="Tickit"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <div>
              <p className="text-sm font-bold text-slate-900">Tickit</p>
              <p className="text-xs text-slate-500">Menu</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex size-12 items-center justify-center rounded-xl border-2 border-slate-900 bg-slate-900 text-white shadow-lg transition hover:bg-slate-800 hover:scale-105 active:scale-95"
            aria-label="Close menu"
          >
            <X className="size-6 font-bold" strokeWidth={3} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex flex-col h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)] bg-white overflow-hidden">
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          <div className="space-y-1">
            {/* Main Navigation Links */}
            {navLinks
              .filter((link) => {
                // Admin-only routes
                const adminOnlyRoutes = ["/system", "/suites", "/journeys", "/ops", "/intelligence"];
                
                // Public links
                if (link.href === "/" || link.href === "/events" || link.href === "/calendar" || link.href === "/features") {
                  return true;
                }
                
                // Admin-only links
                if (adminOnlyRoutes.includes(link.href)) {
                  return isAuthenticated && hasRole("ADMIN");
                }
                
                // Admin dashboard link
                if (link.href.startsWith("/admin")) {
                  return isAuthenticated && hasRole("ADMIN");
                }
                
                // Organizer-only links
                if (link.href.startsWith("/organizer")) {
                  return isAuthenticated && hasRole("ORGANISER");
                }
                
                // Authenticated user links
                if (link.href === "/tickets" || link.href === "/profile") {
                  return isAuthenticated;
                }
                
                return true;
              })
              .map((link, index) => {
              const Icon = getIconForLink(link.href);
              const isActive = isActivePath(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleLinkClick}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-slate-900 text-white shadow-lg"
                      : "bg-white text-slate-900 hover:bg-slate-50 border border-slate-100"
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <Icon
                    className={`size-5 shrink-0 ${
                      isActive ? "text-white" : "text-slate-600 group-hover:text-slate-900"
                    }`}
                  />
                  <span className="font-semibold">{link.label}</span>
                  {isActive && (
                    <div className="ml-auto size-2 rounded-full bg-white" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-slate-200" />

          {/* Quick Actions */}
          <div className="space-y-2">
            <p className="px-4 text-xs font-bold uppercase tracking-wider text-slate-600">
              Quick Actions
            </p>
            <Link
              href="/calendar"
              onClick={handleLinkClick}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <Calendar className="size-5 text-slate-600" />
              <span className="font-semibold">View Calendar</span>
            </Link>
            <Link
              href="/host"
              onClick={handleLinkClick}
              className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3.5 text-sm font-bold text-white shadow-lg transition hover:from-slate-800 hover:to-slate-700"
            >
              <Plus className="size-5" />
              <span>Host on Tickit</span>
            </Link>
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-slate-200" />

          {/* Account Section */}
          <div className="space-y-2">
            <p className="px-4 text-xs font-bold uppercase tracking-wider text-slate-600">
              Account
            </p>
            <Link
              href="/profile"
              onClick={handleLinkClick}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <User className="size-5 text-slate-600" />
              <span className="font-semibold">Profile</span>
            </Link>
            <Link
              href="/settings"
              onClick={handleLinkClick}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <Settings className="size-5 text-slate-600" />
              <span className="font-semibold">Settings</span>
            </Link>
          </div>

          {/* Sign In/User Menu */}
          <div className="mt-8 space-y-2">
            {isAuthenticated && user ? (
              <>
                <div className="px-4 py-2 border-t border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Account</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user.email || user.phoneNumber || "User"}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">{user.activeRole.toLowerCase()}</p>
                </div>
                {hasRole("ORGANISER") && (
                  <Link
                    href="/organizer"
                    onClick={handleLinkClick}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    <Briefcase className="size-5" />
                    <span>Organizer Dashboard</span>
                  </Link>
                )}
                {hasRole("ADMIN") && (
                  <Link
                    href="/admin"
                    onClick={handleLinkClick}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    <Shield className="size-5" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    handleLinkClick();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-red-200 bg-white px-4 py-3.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
                >
                  <LogIn className="size-5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={handleLinkClick}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-900 bg-white px-4 py-3.5 text-sm font-bold text-slate-900 transition hover:bg-slate-900 hover:text-white"
              >
                <LogIn className="size-5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
          </div>
          
          {/* Footer - Fixed at bottom */}
          <div className="border-t border-slate-200 bg-white px-6 py-4 mt-auto shrink-0">
            <p className="text-center text-xs font-medium text-slate-600">
              © 2025 Tickit. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function UserMenu() {
  const { isAuthenticated, user, logout, hasRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    // Close menu on escape key
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  if (isAuthenticated && user) {
    const displayName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user.email || user.phoneNumber || "User";

    return (
      <div className="relative hidden lg:block" ref={menuRef}>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-2 text-slate-600 transition hover:border-slate-400 hover:text-slate-900 whitespace-nowrap"
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label="User menu"
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={displayName} className="size-6 rounded-full flex-shrink-0" />
          ) : (
            <UserCircle className="size-5 flex-shrink-0" aria-hidden />
          )}
          <span className="text-sm font-medium max-w-[150px] truncate">{displayName}</span>
          <svg
            className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-100 bg-white p-2 text-sm text-slate-700 shadow-xl shadow-slate-200/70 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-3 py-2 border-b border-slate-100">
              <p className="font-semibold text-slate-900">{displayName}</p>
              <p className="text-xs text-slate-500 capitalize">{user.activeRole.toLowerCase()}</p>
            </div>
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="block rounded-xl px-3 py-2 text-slate-700 transition hover:bg-slate-50"
            >
              Profile
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="block rounded-xl px-3 py-2 text-slate-700 transition hover:bg-slate-50"
            >
              Settings
            </Link>
            {hasRole("ORGANISER") && (
              <Link
                href="/organizer"
                onClick={() => setIsOpen(false)}
                className="block rounded-xl px-3 py-2 text-slate-700 transition hover:bg-slate-50"
              >
                Organizer Dashboard
              </Link>
            )}
            {hasRole("ADMIN") && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="block rounded-xl px-3 py-2 text-slate-700 transition hover:bg-slate-50"
              >
                Admin Dashboard
              </Link>
            )}
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="mt-1 w-full rounded-xl px-3 py-2 text-left text-red-600 transition hover:bg-red-50"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-2 lg:flex">
      <Link
        href="/auth/login"
        className="rounded-xl border border-slate-200/80 px-4 py-2 text-sm text-slate-600 transition hover:border-slate-400 whitespace-nowrap"
      >
        Sign in
      </Link>
    </div>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur-lg shadow-sm lg:sticky lg:shadow-none">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src="/logo-small.svg"
            alt="Tickit Logo"
            width={120}
            height={40}
            className="h-8 w-auto"
            priority
          />
        </Link>
        <DesktopNav pathname={pathname} />
        <div className="flex items-center gap-2 text-sm">
          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/calendar"
              className="rounded-xl border border-slate-200/80 px-4 py-2 text-slate-600 transition hover:border-slate-400 whitespace-nowrap"
            >
              View calendar
            </Link>
            <Link
              href="/host"
              className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white shadow-lg shadow-slate-300/80 transition hover:bg-slate-800 whitespace-nowrap"
            >
              Host on Tickit
            </Link>
          </div>
          <NotificationBell />
          <div className="hidden lg:block">
            <UserMenu />
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 lg:hidden"
            aria-expanded={isMobileMenuOpen}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
            <span>Menu</span>
          </button>
        </div>
      </div>
      <MobileMenu
        pathname={pathname}
        open={isMobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </header>
  );
}

