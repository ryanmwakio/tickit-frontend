/**
 * Toast Notification System - Usage Examples
 * 
 * This file demonstrates how to use the toast notification system throughout the application.
 * The toast system provides four types: success, error, info, and warning.
 */

"use client";

import { useToast } from "@/contexts/toast-context";
import { Button } from "./button";

export function ToastExamples() {
  const toast = useToast();

  return (
    <div className="space-y-4 p-8">
      <h2 className="text-2xl font-bold">Toast Notification Examples</h2>
      
      <div className="flex flex-wrap gap-4">
        {/* Success Toast */}
        <Button
          onClick={() => {
            toast.success(
              "Event created successfully!",
              "Your event has been saved and is ready to publish."
            );
          }}
        >
          Show Success Toast
        </Button>

        {/* Error Toast */}
        <Button
          onClick={() => {
            toast.error(
              "Failed to save event",
              "Please check all required fields are filled."
            );
          }}
        >
          Show Error Toast
        </Button>

        {/* Info Toast */}
        <Button
          onClick={() => {
            toast.info(
              "New feature available",
              "You can now customize your event gallery with new layouts."
            );
          }}
        >
          Show Info Toast
        </Button>

        {/* Warning Toast */}
        <Button
          onClick={() => {
            toast.warning(
              "Event capacity reached",
              "Consider adding more tickets or creating a waitlist."
            );
          }}
        >
          Show Warning Toast
        </Button>

        {/* Custom Duration */}
        <Button
          onClick={() => {
            toast.success(
              "Auto-dismiss in 2 seconds",
              "This toast will disappear automatically.",
              2000
            );
          }}
        >
          Custom Duration (2s)
        </Button>

        {/* Persistent Toast (no auto-dismiss) */}
        <Button
          onClick={() => {
            toast.info(
              "Persistent notification",
              "This toast will stay until manually closed.",
              0 // 0 means no auto-dismiss
            );
          }}
        >
          Persistent Toast
        </Button>
      </div>
    </div>
  );
}

/**
 * USAGE IN COMPONENTS:
 * 
 * 1. Import the hook:
 *    import { useToast } from "@/contexts/toast-context";
 * 
 * 2. Use in your component:
 *    const toast = useToast();
 * 
 * 3. Show toasts:
 *    toast.success("Title", "Optional message");
 *    toast.error("Title", "Optional message");
 *    toast.info("Title", "Optional message");
 *    toast.warning("Title", "Optional message");
 * 
 * 4. Custom duration (default is 5000ms):
 *    toast.success("Title", "Message", 3000); // 3 seconds
 *    toast.success("Title", "Message", 0); // No auto-dismiss
 * 
 * EXAMPLES:
 * 
 * // Success - Event created
 * toast.success("Event created successfully!", "Your event has been saved as a draft.");
 * 
 * // Error - Save failed
 * toast.error("Failed to save event", err.message || "Please try again.");
 * 
 * // Info - Feature announcement
 * toast.info("New feature available", "Check out our new ticket design options.");
 * 
 * // Warning - Capacity warning
 * toast.warning("Event capacity reached", "Consider adding more tickets.");
 */

