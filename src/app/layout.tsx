import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConditionalNavigation } from "@/components/conditional-navigation";
import { ScrollToTop } from "@/components/scroll-to-top";
// import { ChatWidget } from "@/components/chat/chat-widget";
import { AuthProvider } from "@/contexts/auth-context";
import { ToastProvider } from "@/contexts/toast-context";
import { GoogleOAuthProvider } from "@react-oauth/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tickit | Premium Kenya-first ticketing OS",
  description:
    "Tickit is a Kenya-first event, ticketing, and operations platform spanning discovery, MPesa commerce, onsite command, and intelligence.",
  metadataBase: new URL("https://tickit.app"),
  icons: {
    icon: [
      { url: "/logo-icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/logo-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/logo-64x64.png", sizes: "64x64", type: "image/png" },
      { url: "/logo-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/logo-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/logo-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/logo-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/logo-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Tickit | Premium Kenya-first ticketing OS",
    description:
      "Web + mobile experience that unifies attendees, organisers, operations, and finance with MPesa, safety, and analytics baked in.",
    url: "https://tickit.local",
    siteName: "Tickit",
    images: [
      {
        url: "/logo-1200x630.png",
        width: 1200,
        height: 630,
        alt: "Tickit Logo",
        type: "image/png",
      },
      {
        url: "/logo-1200x630.jpg",
        width: 1200,
        height: 630,
        alt: "Tickit Logo",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tickit | Premium ticketing suite",
    description:
      "Discovery to payouts, Kenya-first ticketing stack with MPesa and operational intelligence.",
    images: ["/logo-1200x630.png", "/logo-1200x630.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden`}
      >
        {googleClientId ? (
          <GoogleOAuthProvider clientId={googleClientId}>
            <AuthProvider>
              <ToastProvider>
                <ConditionalNavigation />
                {children}
                <ScrollToTop />
                {/* <ChatWidget /> */}
              </ToastProvider>
            </AuthProvider>
          </GoogleOAuthProvider>
        ) : (
          <AuthProvider>
            <ToastProvider>
              <ConditionalNavigation />
              {children}
              <ScrollToTop />
              {/* <ChatWidget /> */}
            </ToastProvider>
          </AuthProvider>
        )}
      </body>
    </html>
  );
}
