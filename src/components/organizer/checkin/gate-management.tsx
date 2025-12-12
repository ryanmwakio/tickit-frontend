"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  DoorOpen,
  Users,
  Ticket,
  Settings,
  XCircle,
  UserPlus,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Gate = {
  id: string;
  name: string;
  gateNumber: string;
  gateType: "vip" | "general" | "backstage" | "reentry";
  assignedStaff: GateStaff[];
  allowedTicketTypes: string[];
  entryRestrictions: {
    earlyCheckIn: boolean;
    lateEntry: boolean;
    reEntry: boolean;
  };
  status: "active" | "inactive";
};

type GateStaff = {
  id: string;
  name: string;
  role: string;
  deviceId: string | null;
};

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

// Map API gate to component format
function mapApiGateToComponentGate(apiGate: {
  gateId: string;
  gateName: string;
  scannedCount: number;
  expectedCount: number;
  duplicateScans: number;
  fraudAttempts: number;
  throughput: number;
  status: "active" | "warning" | "error";
  lastScan: string;
  staff: Array<{ id: string; name: string; scans: number; deviceId: string }>;
}): Gate {
  return {
    id: apiGate.gateId,
    name: apiGate.gateName,
    gateNumber: apiGate.gateId.replace("gate-", "G-"),
    gateType: "general", // Default, can be enhanced later
    assignedStaff: apiGate.staff.map((s) => ({
      id: s.id,
      name: s.name,
      role: "Scanner",
      deviceId: s.deviceId,
    })),
    allowedTicketTypes: [], // Can be enhanced later
    entryRestrictions: {
      earlyCheckIn: true,
      lateEntry: true,
      reEntry: true,
    },
    status: apiGate.status === "error" ? "inactive" : "active",
  };
}

export function GateManagement() {
  const [gates, setGates] = useState<Gate[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGate, setEditingGate] = useState<string | null>(null);
  const [organiserId, setOrganiserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    gateId: string | null;
  }>({ open: false, gateId: null });

  useEffect(() => {
    async function loadGates() {
      try {
        setLoading(true);
        const orgId = await getUserOrganiserId();
        if (!orgId) {
          setError("Could not determine organiser ID");
          return;
        }
        setOrganiserId(orgId);

        // Fetch both registered gates and check-in derived gates
        const [registeredGates, checkinGates] = await Promise.all([
          apiClient.get<Array<{
            id: string;
            name: string;
            gateNumber: string;
            gateType: string;
            assignedStaff: Array<{ id: string; name: string; role: string; deviceId: string }>;
            allowedTicketTypes: string[];
            entryRestrictions: {
              earlyCheckIn: boolean;
              lateEntry: boolean;
              reEntry: boolean;
            };
            status: string;
          }>>(`/organisers/${orgId}/gates`).catch(() => []),
          apiClient.get<Array<{
            gateId: string;
            gateName: string;
            scannedCount: number;
            expectedCount: number;
            duplicateScans: number;
            fraudAttempts: number;
            throughput: number;
            status: "active" | "warning" | "error";
            lastScan: string;
            staff: Array<{ id: string; name: string; scans: number; deviceId: string }>;
          }>>(`/organisers/${orgId}/checkin/gates`).catch(() => []),
        ]);

        // Merge registered gates with check-in gates
        const gateMap = new Map<string, Gate>();
        
        // First, add registered gates
        (registeredGates || []).forEach((gate) => {
          gateMap.set(gate.id, {
            id: gate.id,
            name: gate.name,
            gateNumber: gate.gateNumber,
            gateType: gate.gateType as "vip" | "general" | "backstage" | "reentry",
            assignedStaff: gate.assignedStaff,
            allowedTicketTypes: gate.allowedTicketTypes,
            entryRestrictions: gate.entryRestrictions,
            status: gate.status as "active" | "inactive",
          });
        });

        // Then, add check-in gates (only if not already registered)
        (checkinGates || []).forEach((checkinGate) => {
          const gateId = checkinGate.gateId;
          if (!gateMap.has(gateId)) {
            gateMap.set(gateId, mapApiGateToComponentGate(checkinGate));
          }
        });

        setGates(Array.from(gateMap.values()));
      } catch (err: unknown) {
        console.error("Failed to load gates:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load gates";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadGates();
  }, []);

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ open: true, gateId: id });
  };

  const handleDelete = async () => {
    if (!deleteConfirm.gateId || !organiserId) return;

    try {
      await apiClient.delete(`/organisers/${organiserId}/gates/${deleteConfirm.gateId}`);
      setGates(gates.filter((g) => g.id !== deleteConfirm.gateId));
      setDeleteConfirm({ open: false, gateId: null });
    } catch (err: unknown) {
      console.error("Failed to delete gate:", err);
      alert(err instanceof Error ? err.message : "Failed to delete gate");
      setDeleteConfirm({ open: false, gateId: null });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="mx-auto size-8 animate-spin text-slate-400" />
          <p className="mt-4 text-sm text-slate-600">Loading gates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <DoorOpen className="mx-auto size-8 text-red-600" />
        <p className="mt-4 text-sm font-semibold text-red-900">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Gate Management</h3>
          <p className="mt-1 text-sm text-slate-600">
            Configure gates, assign staff, and set entry restrictions
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus className="size-4" />
          Add Gate
        </button>
      </div>

      {gates.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <DoorOpen className="mx-auto size-12 text-slate-300" />
          <p className="mt-4 text-lg font-semibold text-slate-900">No gates configured</p>
          <p className="mt-2 text-sm text-slate-600">
            Add your first gate to start managing entry points
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gates.map((gate) => (
            <GateCard
              key={gate.id}
              gate={gate}
              onEdit={() => setEditingGate(gate.id)}
              onDelete={() => handleDeleteClick(gate.id)}
            />
          ))}
        </div>
      )}

      {showAddModal && (
        <GateEditor
          organiserId={organiserId}
          onSave={async (gate) => {
            if (!organiserId) return;
            try {
              await apiClient.post(`/organisers/${organiserId}/gates`, {
                name: gate.name,
                gateNumber: gate.gateNumber,
                gateType: gate.gateType,
                allowedTicketTypes: gate.allowedTicketTypes,
                entryRestrictions: gate.entryRestrictions,
              });
              setGates([...gates, gate]);
              setShowAddModal(false);
            } catch (err: unknown) {
              console.error("Failed to create gate:", err);
              alert(err instanceof Error ? err.message : "Failed to create gate");
            }
          }}
          onCancel={() => setShowAddModal(false)}
        />
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, gateId: open ? deleteConfirm.gateId : null })}
        title="Delete Gate"
        description="Are you sure you want to delete this gate? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}

function GateCard({
  gate,
  onEdit,
  onDelete,
}: {
  gate: Gate;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const gateTypeConfig = {
    vip: { label: "VIP", color: "bg-amber-100 text-amber-700 border-amber-200" },
    general: { label: "General", color: "bg-slate-100 text-slate-700 border-slate-200" },
    backstage: { label: "Backstage", color: "bg-purple-100 text-purple-700 border-purple-200" },
    reentry: { label: "Re-entry", color: "bg-blue-100 text-blue-700 border-blue-200" },
  };

  const config = gateTypeConfig[gate.gateType];

  return (
    <div
      className={`rounded-xl border-2 p-6 transition hover:shadow-lg ${
        gate.status === "inactive"
          ? "border-slate-200 bg-slate-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">{gate.name}</h4>
          <p className="mt-1 text-xs text-slate-600">{gate.gateNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.color}`}
          >
            {config.label}
          </span>
          <button
            onClick={onEdit}
            className="rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-100"
          >
            <Edit2 className="size-4" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg p-1.5 text-red-600 transition hover:bg-red-50"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <div className="mb-4 space-y-3">
        <div>
          <p className="mb-2 text-xs font-semibold text-slate-600">Assigned Staff</p>
          {gate.assignedStaff.length > 0 ? (
            <div className="space-y-2">
              {gate.assignedStaff.map((staff) => (
                <div
                  key={staff.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2"
                >
                  <span className="text-sm text-slate-900">{staff.name}</span>
                  <span className="text-xs text-slate-600">{staff.role}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">No staff assigned</p>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-slate-600">Allowed Ticket Types</p>
          <div className="flex flex-wrap gap-1">
            {gate.allowedTicketTypes.map((type) => (
              <span
                key={type}
                className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700"
              >
                {type}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-slate-600">Entry Restrictions</p>
          <div className="space-y-1 text-xs text-slate-600">
            {gate.entryRestrictions.earlyCheckIn && (
              <span className="block">✓ Early check-in allowed</span>
            )}
            {gate.entryRestrictions.lateEntry && (
              <span className="block">✓ Late entry allowed</span>
            )}
            {gate.entryRestrictions.reEntry && (
              <span className="block">✓ Re-entry allowed</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GateEditor({
  organiserId,
  onSave,
  onCancel,
}: {
  organiserId: string | null;
  onSave: (gate: Gate) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    gateNumber: "",
    gateType: "general" as Gate["gateType"],
    allowedTicketTypes: [] as string[],
    entryRestrictions: {
      earlyCheckIn: false,
      lateEntry: false,
      reEntry: false,
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900">Add Gate</h3>
          <button
            onClick={onCancel}
            className="rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-100"
          >
            <XCircle className="size-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Gate Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., VIP Gate 1"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Gate Number</Label>
              <Input
                value={formData.gateNumber}
                onChange={(e) => setFormData({ ...formData, gateNumber: e.target.value })}
                placeholder="e.g., G-001"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Gate Type</Label>
            <Select
              value={formData.gateType}
              onValueChange={(value) =>
                setFormData({ ...formData, gateType: value as Gate["gateType"] })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="backstage">Backstage</SelectItem>
                <SelectItem value="reentry">Re-entry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="mb-3 font-semibold text-slate-900">Entry Restrictions</h4>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.entryRestrictions.earlyCheckIn}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      entryRestrictions: {
                        ...formData.entryRestrictions,
                        earlyCheckIn: e.target.checked,
                      },
                    })
                  }
                  className="size-4 rounded border-slate-300"
                />
                <span className="text-sm font-semibold text-slate-900">Allow Early Check-in</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.entryRestrictions.lateEntry}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      entryRestrictions: {
                        ...formData.entryRestrictions,
                        lateEntry: e.target.checked,
                      },
                    })
                  }
                  className="size-4 rounded border-slate-300"
                />
                <span className="text-sm font-semibold text-slate-900">Allow Late Entry</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.entryRestrictions.reEntry}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      entryRestrictions: {
                        ...formData.entryRestrictions,
                        reEntry: e.target.checked,
                      },
                    })
                  }
                  className="size-4 rounded border-slate-300"
                />
                <span className="text-sm font-semibold text-slate-900">Allow Re-entry</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!formData.name.trim()) {
                alert("Gate name is required");
                return;
              }
              const newGate: Gate = {
                id: `gate-${Date.now()}`,
                name: formData.name,
                gateNumber: formData.gateNumber,
                gateType: formData.gateType,
                assignedStaff: [],
                allowedTicketTypes: formData.allowedTicketTypes,
                entryRestrictions: formData.entryRestrictions,
                status: "active",
              };
              onSave(newGate);
            }}
            disabled={!organiserId}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Create Gate
          </button>
        </div>
      </div>
    </div>
  );
}

