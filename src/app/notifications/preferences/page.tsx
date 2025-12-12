"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Bell, Mail, MessageSquare, Smartphone, Zap } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  NotificationPreferences,
} from "@/lib/notifications-api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function NotificationPreferencesPage() {
  const { isAuthenticated } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadPreferences();
    }
  }, [isAuthenticated]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await getNotificationPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error("Failed to load preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;
    try {
      setSaving(true);
      // Only send updatable fields (exclude id, userId, createdAt, updatedAt)
      const updatableFields = {
        email: preferences.email,
        sms: preferences.sms,
        inApp: preferences.inApp,
        push: preferences.push,
        paymentUpdates: preferences.paymentUpdates,
        eventChanges: preferences.eventChanges,
        organizerMessages: preferences.organizerMessages,
        systemNotifications: preferences.systemNotifications,
        promoAllowed: preferences.promoAllowed,
        ticketReminders: preferences.ticketReminders,
      };
      const updated = await updateNotificationPreferences(updatableFields);
      setPreferences(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save preferences:", error);
      alert("Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (field: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [field]: value });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900 mb-2">Please sign in</p>
          <Link href="/auth/login" className="text-sm text-green-600 hover:underline">
            Sign in to manage notifications
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      </div>
    );
  }

  if (!preferences) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/notifications"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition mb-4"
          >
            <ArrowLeft className="size-4" />
            Back to notifications
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50">
              <Bell className="size-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
                Notification Preferences
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Choose how you want to receive notifications
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Delivery Channels */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/70">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Zap className="size-5 text-slate-900" />
              Delivery Channels
            </h2>
            <div className="space-y-4">
              <PreferenceToggle
                icon={Mail}
                label="Email"
                description="Receive notifications via email"
                checked={preferences.email}
                onChange={(checked) => updatePreference("email", checked)}
              />
              <PreferenceToggle
                icon={MessageSquare}
                label="SMS"
                description="Receive notifications via SMS"
                checked={preferences.sms}
                onChange={(checked) => updatePreference("sms", checked)}
              />
              <PreferenceToggle
                icon={Bell}
                label="In-App"
                description="Show notifications in the app"
                checked={preferences.inApp}
                onChange={(checked) => updatePreference("inApp", checked)}
              />
              <PreferenceToggle
                icon={Smartphone}
                label="Push Notifications"
                description="Receive push notifications on mobile"
                checked={preferences.push}
                onChange={(checked) => updatePreference("push", checked)}
              />
            </div>
          </div>

          {/* Notification Categories */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/70">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Notification Categories</h2>
            <div className="space-y-4">
              <PreferenceToggle
                label="Payment Updates"
                description="Payment successful, failed, refunds"
                checked={preferences.paymentUpdates}
                onChange={(checked) => updatePreference("paymentUpdates", checked)}
              />
              <PreferenceToggle
                label="Event Changes"
                description="Date, venue, time changes, cancellations"
                checked={preferences.eventChanges}
                onChange={(checked) => updatePreference("eventChanges", checked)}
              />
              <PreferenceToggle
                label="Organizer Messages"
                description="Messages and announcements from organizers"
                checked={preferences.organizerMessages}
                onChange={(checked) => updatePreference("organizerMessages", checked)}
              />
              <PreferenceToggle
                label="System Notifications"
                description="Login alerts, account changes"
                checked={preferences.systemNotifications}
                onChange={(checked) => updatePreference("systemNotifications", checked)}
              />
              <PreferenceToggle
                label="Promotional Notifications"
                description="New events, early bird tickets, discounts"
                checked={preferences.promoAllowed}
                onChange={(checked) => updatePreference("promoAllowed", checked)}
              />
              <PreferenceToggle
                label="Ticket Reminders"
                description="Reminders before events"
                checked={preferences.ticketReminders}
                onChange={(checked) => updatePreference("ticketReminders", checked)}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/70">
            <div>
              {saved && (
                <p className="text-sm font-medium text-green-600">Preferences saved successfully!</p>
              )}
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-50"
            >
              <Save className="size-4 mr-2" />
              {saving ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreferenceToggle({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon?: React.ElementType;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
      <div className="flex items-start gap-3 flex-1">
        {Icon && (
          <div className="flex-shrink-0 mt-0.5">
            <Icon className="size-5 text-slate-600" />
          </div>
        )}
        <div className="flex-1">
          <Label className="text-sm font-semibold text-slate-900 cursor-pointer">{label}</Label>
          <p className="text-xs text-slate-600 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 ${
          checked ? "bg-green-600" : "bg-slate-200"
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

