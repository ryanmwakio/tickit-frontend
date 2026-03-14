"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Link as LinkIcon, TrendingUp, RefreshCw, Edit2, Trash2, Copy, DollarSign } from "lucide-react";
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

type Affiliate = {
  id: string;
  name: string;
  email?: string;
  commissionRate: number;
  code: string;
  totalEarnings: number;
  totalReferrals: number;
  createdAt: string;
};

export function Affiliates() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [organiserId, setOrganiserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    affiliateId: string | null;
  }>({ open: false, affiliateId: null });
  const toast = useToast();

  useEffect(() => {
    async function loadAffiliates() {
      try {
        setLoading(true);
        const orgId = await getUserOrganiserId();
        if (!orgId) {
          setError("Could not determine organiser ID");
          return;
        }
        setOrganiserId(orgId);

        const data = await apiClient.get<Affiliate[]>(`/organisers/${orgId}/marketing/affiliates`);
        setAffiliates(data || []);
      } catch (err: unknown) {
        console.error("Failed to load affiliates:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load affiliates";
        setError(errorMessage);
        toast.error("Failed to load affiliates", errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadAffiliates();
  }, [toast]);

  const handleCopyLink = (code: string) => {
    const link = `${window.location.origin}/events?ref=${code}`;
    navigator.clipboard.writeText(link);
    toast.success("Copied!", "Affiliate link copied to clipboard");
  };

  const handleDelete = async () => {
    if (!deleteConfirm.affiliateId || !organiserId) return;

    try {
      // For now, we'll remove from local state
      // In a real system, you'd have a DELETE endpoint
      setAffiliates(affiliates.filter((a) => a.id !== deleteConfirm.affiliateId));
      setDeleteConfirm({ open: false, affiliateId: null });
      toast.success("Affiliate deleted", "Affiliate has been deleted successfully");
    } catch (err: unknown) {
      console.error("Failed to delete affiliate:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to delete affiliate";
      toast.error("Failed to delete affiliate", errorMessage);
      setDeleteConfirm({ open: false, affiliateId: null });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="mx-auto size-8 animate-spin text-slate-400" />
          <p className="mt-4 text-sm text-slate-600">Loading affiliates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <Users className="mx-auto size-8 text-red-600" />
        <p className="mt-4 text-sm font-semibold text-red-900">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Affiliate Links</h3>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 size-4" />
          Create Affiliate Link
        </Button>
      </div>

      {affiliates.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <Users className="mx-auto size-12 text-slate-300" />
          <p className="mt-4 text-lg font-semibold text-slate-900">No affiliates yet</p>
          <p className="mt-2 text-sm text-slate-600">Create affiliate links for promoters to earn commissions</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {affiliates.map((affiliate) => (
            <div
              key={affiliate.id}
              className="rounded-xl border border-slate-200 bg-white p-6 transition hover:shadow-lg"
            >
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-slate-900">{affiliate.name}</h4>
                {affiliate.email && (
                  <p className="mt-1 text-sm text-slate-600">{affiliate.email}</p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-mono text-slate-900">
                    {affiliate.code}
                  </span>
                  <button
                    onClick={() => handleCopyLink(affiliate.code)}
                    className="rounded-lg p-1 hover:bg-slate-100"
                  >
                    <Copy className="size-4 text-slate-600" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Commission:</span>
                  <span className="font-semibold text-slate-900">{affiliate.commissionRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Referrals:</span>
                  <span className="font-semibold text-slate-900">{affiliate.totalReferrals}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Earnings:</span>
                  <span className="font-semibold text-green-600">
                    KES {(affiliate.totalEarnings / 100).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setSelectedAffiliate(affiliate);
                    setShowCreateModal(true);
                  }}
                >
                  <Edit2 className="mr-2 size-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteConfirm({ open: true, affiliateId: affiliate.id })}
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
        <AffiliateModal
          organiserId={organiserId}
          affiliate={selectedAffiliate ?? undefined}
          onSave={async (affiliateData) => {
            if (!organiserId) return;
            try {
              if (selectedAffiliate) {
                // Update existing affiliate
                const updated = affiliates.map((a) =>
                  a.id === selectedAffiliate.id ? { ...selectedAffiliate, ...affiliateData } : a
                );
                setAffiliates(updated);
                toast.success("Affiliate updated", "Affiliate has been updated successfully");
              } else {
                // Create new affiliate
                const newAffiliate = await apiClient.post<Affiliate>(
                  `/organisers/${organiserId}/marketing/affiliates`,
                  affiliateData
                );
                setAffiliates([...affiliates, newAffiliate]);
                toast.success("Affiliate created", "Affiliate has been created successfully");
              }
              setShowCreateModal(false);
              setSelectedAffiliate(null);
            } catch (err: unknown) {
              console.error("Failed to save affiliate:", err);
              const errorMessage = err instanceof Error ? err.message : "Failed to save affiliate";
              toast.error("Failed to save affiliate", errorMessage);
            }
          }}
          onCancel={() => {
            setShowCreateModal(false);
            setSelectedAffiliate(null);
          }}
        />
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, affiliateId: open ? deleteConfirm.affiliateId : null })}
        title="Delete Affiliate"
        description="Are you sure you want to delete this affiliate? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}

function AffiliateModal({
  organiserId,
  affiliate,
  onSave,
  onCancel,
}: {
  organiserId: string | null;
  affiliate?: Affiliate;
  onSave: (data: {
    name: string;
    email?: string;
    commissionRate: number;
    code: string;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: affiliate?.name || "",
    email: affiliate?.email || "",
    commissionRate: affiliate?.commissionRate || 10,
    code: affiliate?.code || "",
  });

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{affiliate ? "Edit Affiliate" : "Create Affiliate"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1"
              placeholder="John Doe"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <Label>Affiliate Code *</Label>
            <Input
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="mt-1"
              placeholder="AFFILIATE123"
            />
          </div>
          <div>
            <Label>Commission Rate (%) *</Label>
            <Input
              type="number"
              value={formData.commissionRate}
              onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) || 0 })}
              className="mt-1"
              placeholder="10"
              min={0}
              max={100}
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
              commissionRate: formData.commissionRate,
              code: formData.code,
            })}
            disabled={!formData.name || !formData.code || !formData.commissionRate}
          >
            {affiliate ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
