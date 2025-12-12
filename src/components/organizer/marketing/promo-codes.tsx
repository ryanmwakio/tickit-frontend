"use client";

import { useState, useEffect } from "react";
import { Plus, Tag, Percent, DollarSign, Calendar, Users, Search, RefreshCw, Edit2, Trash2, Copy, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { useToast } from "@/contexts/toast-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

type PromoCode = {
  id: string;
  code: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  validFrom?: string;
  validUntil?: string;
  maxUses?: number;
  usesCount?: number;
  isActive: boolean;
  organiserId: string;
  createdAt: string;
  updatedAt: string;
};

export function PromoCodes() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [organiserId, setOrganiserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<PromoCode | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    promoId: string | null;
  }>({ open: false, promoId: null });
  const toast = useToast();

  useEffect(() => {
    async function loadPromoCodes() {
      try {
        setLoading(true);
        const orgId = await getUserOrganiserId();
        if (!orgId) {
          setError("Could not determine organiser ID");
          return;
        }
        setOrganiserId(orgId);

        const data = await apiClient.get<PromoCode[]>(`/promo-codes?organiserId=${orgId}`);
        setPromoCodes(data || []);
      } catch (err: unknown) {
        console.error("Failed to load promo codes:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load promo codes";
        setError(errorMessage);
        toast.error("Failed to load promo codes", errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadPromoCodes();
  }, [toast]);

  const filteredPromoCodes = promoCodes.filter((promo) =>
    promo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    promo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Copied!", "Promo code copied to clipboard");
  };

  const handleDelete = async () => {
    if (!deleteConfirm.promoId || !organiserId) return;

    try {
      await apiClient.delete(`/promo-codes/${deleteConfirm.promoId}`);
      setPromoCodes(promoCodes.filter((p) => p.id !== deleteConfirm.promoId));
      setDeleteConfirm({ open: false, promoId: null });
      toast.success("Promo code deleted", "Promo code has been deleted successfully");
    } catch (err: unknown) {
      console.error("Failed to delete promo code:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to delete promo code";
      toast.error("Failed to delete promo code", errorMessage);
      setDeleteConfirm({ open: false, promoId: null });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="mx-auto size-8 animate-spin text-slate-400" />
          <p className="mt-4 text-sm text-slate-600">Loading promo codes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <Tag className="mx-auto size-8 text-red-600" />
        <p className="mt-4 text-sm font-semibold text-red-900">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Promo Codes</h3>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 size-4" />
          Create Promo Code
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          placeholder="Search promo codes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-slate-900 focus:ring-slate-900"
        />
      </div>

      {filteredPromoCodes.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <Tag className="mx-auto size-12 text-slate-300" />
          <p className="mt-4 text-lg font-semibold text-slate-900">No promo codes yet</p>
          <p className="mt-2 text-sm text-slate-600">Create promo codes to offer discounts to customers</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPromoCodes.map((promo) => (
            <div
              key={promo.id}
              className="rounded-xl border border-slate-200 bg-white p-6 transition hover:shadow-lg"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-slate-900 px-3 py-1 text-sm font-bold text-white">
                      {promo.code}
                    </span>
                    <button
                      onClick={() => handleCopyCode(promo.code)}
                      className="rounded-lg p-1 hover:bg-slate-100"
                    >
                      <Copy className="size-4 text-slate-600" />
                    </button>
                  </div>
                  {promo.description && (
                    <p className="mt-2 text-sm text-slate-600">{promo.description}</p>
                  )}
                </div>
                {promo.isActive ? (
                  <CheckCircle2 className="size-5 text-green-600" />
                ) : (
                  <XCircle className="size-5 text-red-600" />
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Discount:</span>
                  <span className="font-semibold text-slate-900">
                    {promo.type === "PERCENTAGE" ? `${promo.value}%` : `KES ${(promo.value / 100).toLocaleString()}`}
                  </span>
                </div>
                {promo.maxUses && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Uses:</span>
                    <span className="font-semibold text-slate-900">
                      {promo.usesCount || 0} / {promo.maxUses}
                    </span>
                  </div>
                )}
                {promo.validUntil && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Valid until:</span>
                    <span className="font-semibold text-slate-900">
                      {new Date(promo.validUntil).toLocaleDateString()}
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
                    setSelectedPromo(promo);
                    setShowEditModal(true);
                  }}
                >
                  <Edit2 className="mr-2 size-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteConfirm({ open: true, promoId: promo.id })}
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
        <PromoCodeModal
          organiserId={organiserId}
          onSave={async (promoData) => {
            if (!organiserId) return;
            try {
              const newPromo = await apiClient.post<PromoCode>("/promo-codes", {
                ...promoData,
                organiserId,
              });
              setPromoCodes([...promoCodes, newPromo]);
              setShowCreateModal(false);
              toast.success("Promo code created", "Promo code has been created successfully");
            } catch (err: unknown) {
              console.error("Failed to create promo code:", err);
              const errorMessage = err instanceof Error ? err.message : "Failed to create promo code";
              toast.error("Failed to create promo code", errorMessage);
            }
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      )}

      {showEditModal && selectedPromo && (
        <PromoCodeModal
          organiserId={organiserId}
          promo={selectedPromo}
          onSave={async (promoData) => {
            if (!selectedPromo) return;
            try {
              const updated = await apiClient.put<PromoCode>(`/promo-codes/${selectedPromo.id}`, promoData);
              setPromoCodes(promoCodes.map((p) => (p.id === selectedPromo.id ? updated : p)));
              setShowEditModal(false);
              setSelectedPromo(null);
              toast.success("Promo code updated", "Promo code has been updated successfully");
            } catch (err: unknown) {
              console.error("Failed to update promo code:", err);
              const errorMessage = err instanceof Error ? err.message : "Failed to update promo code";
              toast.error("Failed to update promo code", errorMessage);
            }
          }}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedPromo(null);
          }}
        />
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, promoId: open ? deleteConfirm.promoId : null })}
        title="Delete Promo Code"
        description="Are you sure you want to delete this promo code? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}

function PromoCodeModal({
  organiserId,
  promo,
  onSave,
  onCancel,
}: {
  organiserId: string | null;
  promo?: PromoCode;
  onSave: (data: {
    code: string;
    description?: string;
    type: "PERCENTAGE" | "FIXED_AMOUNT";
    value: number;
    validFrom?: string;
    validUntil?: string;
    maxUses?: number;
    isActive?: boolean;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    code: promo?.code || "",
    description: promo?.description || "",
    type: (promo?.type || "PERCENTAGE") as "PERCENTAGE" | "FIXED_AMOUNT",
    value: promo?.value || 0,
    validFrom: promo?.validFrom ? new Date(promo.validFrom).toISOString().split("T")[0] : "",
    validUntil: promo?.validUntil ? new Date(promo.validUntil).toISOString().split("T")[0] : "",
    maxUses: promo?.maxUses?.toString() || "",
    isActive: promo?.isActive ?? true,
  });

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{promo ? "Edit Promo Code" : "Create Promo Code"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Code *</Label>
            <Input
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="mt-1"
              placeholder="EARLYBIRD2024"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1"
              placeholder="Early bird discount"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as "PERCENTAGE" | "FIXED_AMOUNT" })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value *</Label>
              <Input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                className="mt-1"
                placeholder={formData.type === "PERCENTAGE" ? "10" : "1000"}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Valid From</Label>
              <Input
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Valid Until</Label>
              <Input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label>Max Uses</Label>
            <Input
              type="number"
              value={formData.maxUses}
              onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
              className="mt-1"
              placeholder="100"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => onSave({
              code: formData.code,
              description: formData.description || undefined,
              type: formData.type,
              value: formData.value,
              validFrom: formData.validFrom ? new Date(formData.validFrom).toISOString() : undefined,
              validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : undefined,
              maxUses: formData.maxUses ? parseInt(formData.maxUses, 10) : undefined,
              isActive: formData.isActive,
            })}
            disabled={!formData.code || !formData.value}
          >
            {promo ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
