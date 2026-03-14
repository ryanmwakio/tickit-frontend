"use client";

import { useState, useEffect } from "react";
import { Plus, Megaphone, Mail, MessageSquare, RefreshCw, Edit2, Trash2, Send, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { useToast } from "@/contexts/toast-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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

type Campaign = {
  id: string;
  name: string;
  type: string;
  status: string;
  scheduledAt?: string;
  content?: string;
  targetAudience?: string[];
  createdAt: string;
};

export function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [organiserId, setOrganiserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    campaignId: string | null;
  }>({ open: false, campaignId: null });
  const toast = useToast();

  useEffect(() => {
    async function loadCampaigns() {
      try {
        setLoading(true);
        const orgId = await getUserOrganiserId();
        if (!orgId) {
          setError("Could not determine organiser ID");
          return;
        }
        setOrganiserId(orgId);

        const data = await apiClient.get<Campaign[]>(`/organisers/${orgId}/marketing/campaigns`);
        setCampaigns(data || []);
      } catch (err: unknown) {
        console.error("Failed to load campaigns:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load campaigns";
        setError(errorMessage);
        toast.error("Failed to load campaigns", errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadCampaigns();
  }, [toast]);

  const handleDelete = async () => {
    if (!deleteConfirm.campaignId || !organiserId) return;

    try {
      // For now, we'll remove from local state
      // In a real system, you'd have a DELETE endpoint
      setCampaigns(campaigns.filter((c) => c.id !== deleteConfirm.campaignId));
      setDeleteConfirm({ open: false, campaignId: null });
      toast.success("Campaign deleted", "Campaign has been deleted successfully");
    } catch (err: unknown) {
      console.error("Failed to delete campaign:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to delete campaign";
      toast.error("Failed to delete campaign", errorMessage);
      setDeleteConfirm({ open: false, campaignId: null });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="mx-auto size-8 animate-spin text-slate-400" />
          <p className="mt-4 text-sm text-slate-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <Megaphone className="mx-auto size-8 text-red-600" />
        <p className="mt-4 text-sm font-semibold text-red-900">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Marketing Campaigns</h3>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 size-4" />
          Create Campaign
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <Megaphone className="mx-auto size-12 text-slate-300" />
          <p className="mt-4 text-lg font-semibold text-slate-900">No campaigns yet</p>
          <p className="mt-2 text-sm text-slate-600">Launch SMS, email, or push notification campaigns</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="rounded-xl border border-slate-200 bg-white p-6 transition hover:shadow-lg"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-slate-900">{campaign.name}</h4>
                  <p className="mt-1 text-sm text-slate-600 capitalize">{campaign.type}</p>
                </div>
                {campaign.status === "sent" ? (
                  <CheckCircle2 className="size-5 text-green-600" />
                ) : (
                  <Clock className="size-5 text-amber-600" />
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Status:</span>
                  <span className="font-semibold text-slate-900 capitalize">{campaign.status}</span>
                </div>
                {campaign.scheduledAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Scheduled:</span>
                    <span className="font-semibold text-slate-900">
                      {new Date(campaign.scheduledAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setSelectedCampaign(campaign);
                    setShowCreateModal(true);
                  }}
                >
                  <Edit2 className="mr-2 size-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteConfirm({ open: true, campaignId: campaign.id })}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CampaignModal
          organiserId={organiserId}
          campaign={selectedCampaign ?? undefined}
          onSave={async (campaignData) => {
            if (!organiserId) return;
            try {
              if (selectedCampaign) {
                // Update existing campaign
                const updated = campaigns.map((c) =>
                  c.id === selectedCampaign.id ? { ...selectedCampaign, ...campaignData } : c
                );
                setCampaigns(updated);
                toast.success("Campaign updated", "Campaign has been updated successfully");
              } else {
                // Create new campaign
                const newCampaign = await apiClient.post<Campaign>(
                  `/organisers/${organiserId}/marketing/campaigns`,
                  campaignData
                );
                setCampaigns([...campaigns, newCampaign]);
                toast.success("Campaign created", "Campaign has been created successfully");
              }
              setShowCreateModal(false);
              setSelectedCampaign(null);
            } catch (err: unknown) {
              console.error("Failed to save campaign:", err);
              const errorMessage = err instanceof Error ? err.message : "Failed to save campaign";
              toast.error("Failed to save campaign", errorMessage);
            }
          }}
          onCancel={() => {
            setShowCreateModal(false);
            setSelectedCampaign(null);
          }}
        />
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, campaignId: open ? deleteConfirm.campaignId : null })}
        title="Delete Campaign"
        description="Are you sure you want to delete this campaign? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}

function CampaignModal({
  organiserId,
  campaign,
  onSave,
  onCancel,
}: {
  organiserId: string | null;
  campaign?: Campaign;
  onSave: (data: {
    name: string;
    type: string;
    status: string;
    scheduledAt?: string;
    content?: string;
    targetAudience?: string[];
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: campaign?.name || "",
    type: campaign?.type || "email",
    status: campaign?.status || "draft",
    scheduledAt: campaign?.scheduledAt ? new Date(campaign.scheduledAt).toISOString().split("T")[0] : "",
    content: campaign?.content || "",
  });

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{campaign ? "Edit Campaign" : "Create Campaign"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Campaign Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1"
              placeholder="Summer Sale 2024"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="push">Push Notification</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Scheduled Date</Label>
            <Input
              type="date"
              value={formData.scheduledAt}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Content</Label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-slate-900 focus:ring-slate-900"
              rows={4}
              placeholder="Campaign message content..."
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
              type: formData.type,
              status: formData.status,
              scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : undefined,
              content: formData.content || undefined,
            })}
            disabled={!formData.name}
          >
            {campaign ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
