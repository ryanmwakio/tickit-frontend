"use client";

import { ReactNode, useEffect, useState } from "react";
import { useSessionMonitor } from "@/hooks/use-session-monitor";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { AlertTriangle, LogIn, Save } from "lucide-react";

interface SessionProtectedFormProps {
  children: ReactNode;
  /**
   * Whether the form currently has unsaved data
   */
  hasUnsavedData?: boolean;
  /**
   * Custom message to show when session expires with unsaved data
   */
  expiredMessage?: string;
  /**
   * Custom message to show when user is inactive with unsaved data
   */
  inactivityMessage?: string;
  /**
   * Callback when user should save their work
   */
  onSave?: () => void;
  /**
   * Whether to show a persistent warning when session is expired
   */
  showPersistentWarning?: boolean;
  /**
   * Custom className for the wrapper
   */
  className?: string;
}

export function SessionProtectedForm({
  children,
  hasUnsavedData = false,
  expiredMessage,
  inactivityMessage,
  onSave,
  showPersistentWarning = true,
  className,
}: SessionProtectedFormProps) {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [showWarning, setShowWarning] = useState(false);
  const [warningDismissed, setWarningDismissed] = useState(false);

  const {
    wasAuthenticated,
    isSessionExpired,
    wasAuthenticatedButNowExpired,
    updateActivity,
    timeSinceLastActivity,
  } = useSessionMonitor({
    hasUnsavedData,
    showWarnings: true,
    inactivityWarningThreshold: 20 * 60 * 1000, // 20 minutes for forms
    onSessionExpired: () => {
      if (hasUnsavedData && showPersistentWarning) {
        setShowWarning(true);
        setWarningDismissed(false);
      }
    },
    onInactivityWarning: () => {
      if (hasUnsavedData) {
        const message =
          inactivityMessage ||
          "Save your work - you've been inactive for a while";
        toast.warning("Session Warning", message, 10000);
      }
    },
  });

  // Show/hide persistent warning based on session state
  useEffect(() => {
    if (
      wasAuthenticatedButNowExpired &&
      hasUnsavedData &&
      showPersistentWarning &&
      !warningDismissed
    ) {
      setShowWarning(true);
    } else if (isAuthenticated || !hasUnsavedData) {
      setShowWarning(false);
      setWarningDismissed(false);
    }
  }, [
    wasAuthenticatedButNowExpired,
    hasUnsavedData,
    showPersistentWarning,
    warningDismissed,
    isAuthenticated,
  ]);

  const handleDismissWarning = () => {
    setWarningDismissed(true);
    setShowWarning(false);
  };

  const handleLoginRedirect = () => {
    // Store current form data in session storage before redirect
    if (hasUnsavedData && onSave) {
      try {
        onSave();
        toast.info(
          "Data saved",
          "Your work has been saved locally before login",
        );
      } catch (error) {
        toast.warning(
          "Save failed",
          "Unable to save your work. Please try again after login.",
        );
      }
    }
    window.location.href = "/auth/login";
  };

  const formatTimeAgo = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  return (
    <div className={className}>
      {/* Persistent Session Expired Warning */}
      {showWarning && (
        <div className="mb-6 border border-red-200 rounded-lg bg-red-50 p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800 mb-1">
                Session Expired
              </h3>
              <p className="text-sm text-red-700 mb-3">
                {expiredMessage ||
                  "Your session has expired and any unsaved changes may be lost. Please log in again to continue working."}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleLoginRedirect}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Log In Again
                </button>
                {onSave && (
                  <button
                    onClick={() => {
                      try {
                        onSave();
                        toast.success(
                          "Work saved",
                          "Your changes have been saved locally",
                        );
                      } catch (error) {
                        toast.error("Save failed", "Unable to save your work");
                      }
                    }}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save Work Locally
                  </button>
                )}
                <button
                  onClick={handleDismissWarning}
                  className="text-sm text-red-600 hover:text-red-800 underline"
                >
                  Dismiss
                </button>
              </div>
              <p className="text-xs text-red-600 mt-2">
                Last activity: {formatTimeAgo(timeSinceLastActivity)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mini status indicator for active sessions with unsaved data */}
      {isAuthenticated && hasUnsavedData && !showWarning && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          <div className="flex items-center justify-between">
            <span>✓ Session active • Unsaved changes detected</span>
            {onSave && (
              <button
                onClick={onSave}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Save Now
              </button>
            )}
          </div>
        </div>
      )}

      {/* Render the protected form */}
      {children}
    </div>
  );
}
