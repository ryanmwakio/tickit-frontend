"use client";

import Link from "next/link";
import {
  MapPin,
  Mail,
  Phone,
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
  ArrowRight,
  Smartphone,
  CreditCard,
  Shield,
  Users,
  Calendar,
  BarChart3,
  Heart,
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: "/events", label: "Discover Events" },
    { href: "/host", label: "Host an Event" },
    { href: "/tickets", label: "My Tickets" },
    { href: "/calendar", label: "My Calendar" },
  ];

  const platformLinks = [
    { href: "/organizer", label: "Organizer Dashboard" },
    { href: "/ops", label: "Operations Hub" },
    { href: "/intelligence", label: "Analytics" },
    { href: "/seat-maps", label: "Seat Maps" },
  ];

  const supportLinks = [
    { href: "/help", label: "Help Center" },
    { href: "/contact", label: "Contact Support" },
    { href: "/safety", label: "Safety Guidelines" },
    { href: "/accessibility", label: "Accessibility" },
  ];

  const legalLinks = [
    { href: "/terms", label: "Terms of Service" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/cookies", label: "Cookie Policy" },
    { href: "/refunds", label: "Refund Policy" },
  ];

  const features = [
    { icon: CreditCard, label: "MPesa Integration" },
    { icon: Shield, label: "Secure Payments" },
    { icon: Users, label: "Community First" },
    { icon: BarChart3, label: "Real-time Analytics" },
  ];

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-900">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand Section */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Tickit</h3>
                <p className="text-xs text-slate-500">Premium ticketing OS</p>
              </div>
            </div>

            <p className="mb-6 text-slate-600 leading-relaxed">
              Kenya&apos;s premier event discovery and ticketing platform. From
              intimate gatherings to major festivals, we connect communities
              through unforgettable experiences.
            </p>

            {/* Key Features */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-slate-600"
                >
                  <feature.icon className="h-4 w-4 text-slate-600" />
                  {feature.label}
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              <Link
                href="https://twitter.com/tickitkenya"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <Twitter className="h-4 w-4" />
              </Link>
              <Link
                href="https://instagram.com/tickitkenya"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <Instagram className="h-4 w-4" />
              </Link>
              <Link
                href="https://linkedin.com/company/tickit"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <Linkedin className="h-4 w-4" />
              </Link>
              <Link
                href="https://facebook.com/tickitkenya"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <Facebook className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-8 md:grid-cols-4">
            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Discover</h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-slate-600 hover:text-slate-900 transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Platform */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Platform</h4>
              <ul className="space-y-3">
                {platformLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-slate-600 hover:text-slate-900 transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Support</h4>
              <ul className="space-y-3">
                {supportLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-slate-600 hover:text-slate-900 transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-3">
                {legalLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-slate-600 hover:text-slate-900 transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact & Newsletter */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-slate-900 mb-4">Get in Touch</h4>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <MapPin className="h-4 w-4 text-slate-600" />
                <span>Nairobi, Kenya</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Mail className="h-4 w-4 text-slate-600" />
                <a
                  href="mailto:hello@tickit.app"
                  className="hover:text-slate-900 transition-colors"
                >
                  hello@tickit.app
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone className="h-4 w-4 text-slate-600" />
                <a
                  href="tel:+254700000000"
                  className="hover:text-slate-900 transition-colors"
                >
                  +254 700 000 000
                </a>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h5 className="font-medium text-slate-900 mb-2">Stay Updated</h5>
              <p className="text-xs text-slate-600 mb-3">
                Get event updates and platform news
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="min-w-0 flex-1 rounded-md border border-slate-200 px-2 py-2 text-xs focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <button className="flex-shrink-0 flex items-center justify-center rounded-md bg-slate-900 px-2 py-2 text-xs font-medium text-white hover:bg-slate-700 transition-colors">
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-200 bg-slate-50/80 px-6 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex flex-col items-center gap-2 text-center md:flex-row md:gap-4">
              <p className="text-xs text-slate-500">
                © {currentYear} Tickit. All rights reserved.
              </p>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                Made with <Heart className="h-3 w-3 text-red-500" /> in Kenya
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Smartphone className="h-3 w-3" />
                <span>Mobile App Coming Soon</span>
              </div>
              <div className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                <span>MPesa Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
