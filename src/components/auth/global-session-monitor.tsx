"use client";

import { useEffect } from "react";
import { useSessionMonitor } from "@/hooks/use-session-monitor";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { useRouter } from "next/navigation";

interface GlobalSessionMonitorProps {
  /**
   * Whether to show toast notifications for session events
   * Default: true
   */
  showNotifications?: boolean;
  
  /**
   * How often to check session status (in milliseconds)
   * Default: 60 seconds for global monitor (less frequent than form-specific)
   */
  checkInterval?: number;
  
  /**
   * How long to wait before warning about inactivity (in milliseconds)
   * Default: 20 minutes
   */
  inactivityThreshold?: number;
}

/**
 * Global session monitor that tracks authentication state across the entire app.
 * Should be placed in the root layout or a high-level component.
 * 
 * This component:
 * - Monitors session expiration globally
 * - Shows notifications when session expires
 * - Tracks user activity to warn about inactivity
 * - Only activates for users who were previously authenticated
 */
export function GlobalSessionMonitor({
  showNotifications = true,
  checkInterval = 60 * 1000, // 1 minute
  inactivityThreshold = 20 * 60 * 1000, // 20 minutes
}: GlobalSessionMonitorProps = {}) {
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const {
    wasAuthenticated,
    isSessionExpired,
    wasAuthenticatedButNowExpired,
    timeSinceLastActivity,
    clearSessionState,
  } = useSessionMonitor({
    checkInterval,
    inactivityWarningThreshold: inactivityThreshold,
    showWarnings: showNotifications,
    hasUnsavedData: false, // Global monitor doesn't track specific form data
    onSessionExpired: () => {
      if (showNotifications) {
        // Show a more general notification since we don't know about specific unsaved data
        toast.error(
          "Session Expired",
          "Your session has expired. You may need to log in again to continue.",
          8000
        );
      }
    },
    onInactivityWarning: () => {
      if (showNotifications) {
        toast.warning(
          "Inactive Session",
          "You've been inactive for a while. Your session will expire soon.",
          6000
        );
      }
    },
  });

  // Clear session state when user explicitly logs out
  useEffect(() => {
    if (!isAuthenticated && wasAuthenticated && !isSessionExpired) {
      // User logged out normally, clear session tracking
      clearSessionState();
    }
  }, [isAuthenticated, wasAuthenticated, isSessionExpired, clearSessionState]);

  // Monitor for critical session states that need immediate attention
  useEffect(() => {
    if (wasAuthenticatedButNowExpired && showNotifications) {
      // This is a session expiration while user was working
      const currentPath = window.location.pathname;
      
      // Check if user is on a protected route that requires authentication
      const protectedRoutes = [
        "/organizer",
        "/admin",
        "/dashboard",
        "/profile",
        "/settings",
      ];
      
      const isOnProtectedRoute = protectedRoutes.some(route => 
        currentPath.startsWith(route)
      );

      if (isOnProtectedRoute) {
        // Show a more persistent notification for protected routes
        setTimeout(() => {
          if (!isAuthenticated) {
            toast.error(
              "Authentication Required",
              "This page requires authentication. Redirecting to login...",
              5000
            );
            
            // Redirect after a brief delay to allow user to see the message
            setTimeout(() => {
              router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
            }, 3000);
          }
        }, 2000);
      }
    }
  }, [
    wasAuthenticatedButNowExpired,
    showNotifications,
    isAuthenticated,
    router,
  ]);

  // Log session events for debugging (development only)
  useEffect(() => {
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      if (wasAuthenticatedButNowExpired) {
        console.log("🔐 Session expired - user was authenticated but session is now invalid");
      }
      if (isAuthenticated && wasAuthenticated) {
        console.log("✅ Session active - user is authenticated");
      }
      if (timeSinceLastActivity > inactivityThreshold * 0.8) {
        console.log(`⏰ User inactive for ${Math.round(timeSinceLastActivity / 1000 / 60)} minutes`);
      }
    }
  }, [
    wasAuthenticatedButNowExpired,
    isAuthenticated,
    wasAuthenticated,
    timeSinceLastActivity,
    inactivityThreshold,
  ]);

  // This component doesn't render anything - it's purely for monitoring
  return null;
}

/**
 * Hook for components that want to check global session state
 */
export function useGlobalSessionState() {
  const {
    wasAuthenticated,
    isSessionExpired,
    wasAuthenticatedButNowExpired,
    timeSinceLastActivity,
  } = useSessionMonitor({
    showWarnings: false, // Don't show warnings from this hook
    checkInterval: 30 * 1000, // Check every 30 seconds
  });

  return {
    wasAuthenticated,
    isSessionExpired,
    wasAuthenticatedButNowExpired,
    timeSinceLastActivity,
    isInactive: timeSinceLastActivity > 15 * 60 * 1000, // 15 minutes
  };
}

/**
 * Higher-order component to wrap components with session monitoring
 */
export function withSessionMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requireAuth?: boolean;
    redirectOnExpiry?: boolean;
    showWarnings?: boolean;
  }
) {
  const {
    requireAuth = false,
    redirectOnExpiry = false,
    showWarnings = true,
  } = options || {};

  return function SessionMonitoredComponent(props: P) {
    const { isAuthenticated } = useAuth();
    const { wasAuthenticatedButNowExpired } = useGlobalSessionState();
    const router = useRouter();

    useEffect(() => {
      if (requireAuth && !isAuthenticated) {
        // Component requires auth but user is not authenticated
        router.push("/auth/login");
        return;
      }

      if (redirectOnExpiry && wasAuthenticatedButNowExpired) {
        // Session expired and component wants to redirect
        router.push("/auth/login");
        return;
      }
    }, [isAuthenticated, wasAuthenticatedButNowExpired, router]);

    // Render component with session monitoring
    return (
      <>
        <GlobalSessionMonitor showNotifications={showWarnings} />
        <Component {...props} />
      </>
    );
  };
}