"use client";

import { useState, useEffect } from "react";
import { Building2, Palette, Key, Globe, RefreshCw, Save, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api";
import { useToast } from "@/contexts/toast-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Helper to get organiserId
async function getUserOrganiserId(): Promise<string | null> {
  try {
    const events = await apiClient.get<Array<{ organiserId?: string }>>("/events?limit=1");
    if (events && events.length > 0 && events[0].organiserId) {
      return events[0].organiserId;
    }
    return null;
  } catch {
    return null;
  }
}

export function OrganizerSettings() {
  const [organiser, setOrganiser] = useState<{
    id: string;
    name: string;
    email?: string;
    phoneNumber?: string;
    website?: string;
    logoUrl?: string;
    metadata?: Record<string, any>;
  } | null>(null);
  const [organiserId, setOrganiserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const toast = useToast();

  useEffect(() => {
    async function loadOrganiser() {
      try {
        setLoading(true);
        const orgId = await getUserOrganiserId();
        if (!orgId) {
          setError("Could not determine organiser ID");
          return;
        }
        setOrganiserId(orgId);

        const data = await apiClient.get<{
          id: string;
          name: string;
          email?: string;
          phoneNumber?: string;
          website?: string;
          logoUrl?: string;
          metadata?: Record<string, any>;
        }>(`/organisers/${orgId}`);
        setOrganiser(data);
      } catch (err: unknown) {
        console.error("Failed to load organiser:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load organiser";
        setError(errorMessage);
        toast.error("Failed to load organiser", errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadOrganiser();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="mx-auto size-8 animate-spin text-slate-400" />
          <p className="mt-4 text-sm text-slate-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error || !organiser) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <Building2 className="mx-auto size-8 text-red-600" />
        <p className="mt-4 text-sm font-semibold text-red-900">{error || "Failed to load organiser"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Organizer Settings</h2>
          <p className="mt-1 text-sm text-slate-600">Manage your organizer account and preferences</p>
        </div>
        <Button onClick={() => setShowEditModal(true)}>
          <Edit2 className="mr-2 size-4" />
          Edit Settings
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <Building2 className="mb-4 size-8 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">Account & Branding</h3>
          <p className="mt-2 text-sm text-slate-600">{organiser.name}</p>
          {organiser.email && (
            <p className="mt-1 text-xs text-slate-500">{organiser.email}</p>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <Key className="mb-4 size-8 text-green-600" />
          <h3 className="text-lg font-semibold text-slate-900">API Keys</h3>
          <p className="mt-2 text-sm text-slate-600">Manage API keys and webhooks</p>
          <p className="mt-1 text-xs text-slate-500">Available in API documentation</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <Globe className="mb-4 size-8 text-purple-600" />
          <h3 className="text-lg font-semibold text-slate-900">Domain & Notifications</h3>
          <p className="mt-2 text-sm text-slate-600">Domain mapping and preferences</p>
          {organiser.website && (
            <p className="mt-1 text-xs text-slate-500">{organiser.website}</p>
          )}
        </div>
      </div>

      {showEditModal && (
        <SettingsModal
          organiser={organiser}
          organiserId={organiserId}
          onSave={async (updateData) => {
            if (!organiserId) return;
            try {
              const updated = await apiClient.put(`/organisers/${organiserId}`, updateData);
              setOrganiser(updated as Parameters<typeof setOrganiser>[0]);
              setShowEditModal(false);
              toast.success("Settings updated", "Organizer settings have been updated successfully");
            } catch (err: unknown) {
              console.error("Failed to update settings:", err);
              const errorMessage = err instanceof Error ? err.message : "Failed to update settings";
              toast.error("Failed to update settings", errorMessage);
            }
          }}
          onCancel={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}

function SettingsModal({
  organiser,
  organiserId,
  onSave,
  onCancel,
}: {
  organiser: {
    id: string;
    name: string;
    email?: string;
    phoneNumber?: string;
    website?: string;
    logoUrl?: string;
  };
  organiserId: string | null;
  onSave: (data: {
    name?: string;
    email?: string;
    phoneNumber?: string;
    website?: string;
    logoUrl?: string;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: organiser.name,
    email: organiser.email || "",
    phoneNumber: organiser.phoneNumber || "",
    website: organiser.website || "",
    logoUrl: organiser.logoUrl || "",
  });

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Organizer Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Organizer Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Phone Number</Label>
            <Input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Website</Label>
            <Input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="mt-1"
              placeholder="https://example.com"
            />
          </div>
          <div>
            <Label>Logo URL</Label>
            <Input
              type="url"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              className="mt-1"
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => onSave({
              name: formData.name,
              email: formData.email || undefined,
              phoneNumber: formData.phoneNumber || undefined,
              website: formData.website || undefined,
              logoUrl: formData.logoUrl || undefined,
            })}
            disabled={!formData.name}
          >
            <Save className="mr-2 size-4" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

