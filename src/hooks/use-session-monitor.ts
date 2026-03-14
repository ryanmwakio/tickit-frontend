"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";

interface SessionState {
  isAuthenticated: boolean;
  wasAuthenticated: boolean;
  lastActivity: number;
  sessionExpiredAt: number | null;
}

interface UseSessionMonitorOptions {
  /**
   * How often to check session status (in milliseconds)
   * Default: 30 seconds
   */
  checkInterval?: number;

  /**
   * How long to wait before warning about inactivity (in milliseconds)
   * Default: 25 minutes (assuming 30 min session timeout)
   */
  inactivityWarningThreshold?: number;

  /**
   * Activities that should reset the activity timer
   * Default: ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
   */
  activityEvents?: string[];

  /**
   * Whether to show warnings about session expiration
   * Default: true
   */
  showWarnings?: boolean;

  /**
   * Whether this component contains form data that could be lost
   * Default: false
   */
  hasUnsavedData?: boolean;

  /**
   * Custom callback when session expires
   */
  onSessionExpired?: () => void;

  /**
   * Custom callback when inactivity warning should be shown
   */
  onInactivityWarning?: () => void;
}

const SESSION_STORAGE_KEY = "tickit_session_state";
const DEFAULT_CHECK_INTERVAL = 30 * 1000; // 30 seconds
const DEFAULT_INACTIVITY_THRESHOLD = 25 * 60 * 1000; // 25 minutes
const DEFAULT_ACTIVITY_EVENTS = [
  "mousedown",
  "mousemove",
  "keypress",
  "scroll",
  "touchstart",
  "click",
];

export function useSessionMonitor(options: UseSessionMonitorOptions = {}) {
  const {
    checkInterval = DEFAULT_CHECK_INTERVAL,
    inactivityWarningThreshold = DEFAULT_INACTIVITY_THRESHOLD,
    activityEvents = DEFAULT_ACTIVITY_EVENTS,
    showWarnings = true,
    hasUnsavedData = false,
    onSessionExpired,
    onInactivityWarning,
  } = options;

  const { user, isAuthenticated, refreshUser } = useAuth();
  const toast = useToast();

  const [sessionState, setSessionState] = useState<SessionState>(() => {
    if (typeof window === "undefined") {
      return {
        isAuthenticated: false,
        wasAuthenticated: false,
        lastActivity: Date.now(),
        sessionExpiredAt: null,
      };
    }

    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Invalid stored data, reset
      }
    }

    return {
      isAuthenticated: false,
      wasAuthenticated: false,
      lastActivity: Date.now(),
      sessionExpiredAt: null,
    };
  });

  const checkIntervalRef = useRef<NodeJS.Timeout>();
  const inactivityWarningShownRef = useRef(false);
  const sessionExpiredNotificationShownRef = useRef(false);

  // Update activity timestamp
  const updateActivity = useCallback(() => {
    const now = Date.now();
    setSessionState((prev) => {
      const newState = { ...prev, lastActivity: now };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
    inactivityWarningShownRef.current = false;
  }, []);

  // Check if session has expired
  const checkSessionStatus = useCallback(async () => {
    try {
      await refreshUser();

      // If we get here, session is still valid
      if (sessionState.sessionExpiredAt && isAuthenticated) {
        // Session was expired but is now valid again (user re-authenticated)
        setSessionState((prev) => {
          const newState = {
            ...prev,
            isAuthenticated: true,
            wasAuthenticated: true,
            sessionExpiredAt: null,
          };
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newState));
          return newState;
        });
        sessionExpiredNotificationShownRef.current = false;

        if (showWarnings) {
          toast.success("Session restored", "You're logged in again.");
        }
      }
    } catch (error: any) {
      // Session check failed
      if (
        error?.statusCode === 401 &&
        sessionState.wasAuthenticated &&
        !sessionState.sessionExpiredAt
      ) {
        // User was authenticated before but now session is expired
        const expiredAt = Date.now();
        setSessionState((prev) => {
          const newState = {
            ...prev,
            isAuthenticated: false,
            sessionExpiredAt: expiredAt,
          };
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newState));
          return newState;
        });

        // Show session expired notification
        if (showWarnings && !sessionExpiredNotificationShownRef.current) {
          sessionExpiredNotificationShownRef.current = true;

          const message = hasUnsavedData
            ? "Session expired - your unsaved data may be lost!"
            : "Your session has expired";
          const description = hasUnsavedData
            ? "Please log in again to continue. Any unsaved changes may be lost."
            : "Please log in again to continue";

          toast.error(message, description, 10000); // Show for 10 seconds
        }

        onSessionExpired?.();
      }
    }
  }, [
    isAuthenticated,
    sessionState,
    refreshUser,
    showWarnings,
    hasUnsavedData,
    toast,
    onSessionExpired,
  ]);

  // Check for inactivity warning
  const checkInactivity = useCallback(() => {
    if (!isAuthenticated || !sessionState.wasAuthenticated) return;

    const timeSinceActivity = Date.now() - sessionState.lastActivity;

    if (
      timeSinceActivity > inactivityWarningThreshold &&
      !inactivityWarningShownRef.current
    ) {
      inactivityWarningShownRef.current = true;

      if (showWarnings) {
        const message = hasUnsavedData
          ? "You've been inactive - session will expire soon!"
          : "You've been inactive for a while";
        const description = hasUnsavedData
          ? "Your session will expire soon. Save your work or click anywhere to stay active."
          : "Your session will expire soon. Click anywhere to stay active.";

        toast.warning(message, description, 8000);
      }

      onInactivityWarning?.();
    }
  }, [
    isAuthenticated,
    sessionState.wasAuthenticated,
    sessionState.lastActivity,
    inactivityWarningThreshold,
    showWarnings,
    hasUnsavedData,
    toast,
    updateActivity,
    onInactivityWarning,
  ]);

  // Update session state based on auth changes
  useEffect(() => {
    setSessionState((prev) => {
      const newState = {
        ...prev,
        isAuthenticated,
        wasAuthenticated: prev.wasAuthenticated || isAuthenticated,
        ...(isAuthenticated && { sessionExpiredAt: null }),
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  }, [isAuthenticated]);

  // Set up activity listeners
  useEffect(() => {
    if (typeof window === "undefined") return;

    activityEvents.forEach((event) => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [activityEvents, updateActivity]);

  // Set up periodic checks
  useEffect(() => {
    if (sessionState.wasAuthenticated) {
      checkIntervalRef.current = setInterval(() => {
        checkSessionStatus();
        checkInactivity();
      }, checkInterval);

      return () => {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }
      };
    }
  }, [
    sessionState.wasAuthenticated,
    checkInterval,
    checkSessionStatus,
    checkInactivity,
  ]);

  // Clear session state when user explicitly logs out
  const clearSessionState = useCallback(() => {
    setSessionState({
      isAuthenticated: false,
      wasAuthenticated: false,
      lastActivity: Date.now(),
      sessionExpiredAt: null,
    });
    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionExpiredNotificationShownRef.current = false;
    inactivityWarningShownRef.current = false;
  }, []);

  return {
    isAuthenticated,
    wasAuthenticated: sessionState.wasAuthenticated,
    sessionExpiredAt: sessionState.sessionExpiredAt,
    lastActivity: sessionState.lastActivity,
    timeSinceLastActivity: Date.now() - sessionState.lastActivity,
    updateActivity,
    clearSessionState,
    isSessionExpired: !!sessionState.sessionExpiredAt,
    wasAuthenticatedButNowExpired:
      sessionState.wasAuthenticated &&
      !isAuthenticated &&
      !!sessionState.sessionExpiredAt,
  };
}

export type SessionMonitorResult = ReturnType<typeof useSessionMonitor>;
