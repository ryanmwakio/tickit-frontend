"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  Users,
  Edit2,
  Trash2,
  Mail,
  Phone,
  UserPlus,
  Search,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { useToast } from "@/contexts/toast-context";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Department = {
  id: string;
  name: string;
  description: string;
  staffCount: number;
  manager?: string;
  color: string;
  createdAt: string;
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

const colors = [
  "#0ea5e9",
  "#f97316",
  "#22c55e",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#6366f1",
];

export function TeamsDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [organiserId, setOrganiserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    deptId: string | null;
  }>({ open: false, deptId: null });
  const toast = useToast();

  // Fetch departments from organiser metadata
  useEffect(() => {
    async function loadDepartments() {
      try {
        setLoading(true);
        const orgId = await getUserOrganiserId();
        if (!orgId) {
          setError("Could not determine organiser ID");
          return;
        }
        setOrganiserId(orgId);

        // Get organiser to access metadata
        const organiser = await apiClient.get<{
          id: string;
          metadata?: {
            departments?: Array<{
              id: string;
              name: string;
              description: string;
              manager?: string;
              color: string;
              createdAt: string;
            }>;
          };
        }>(`/organisers/${orgId}`);

        // Also get staff to count per department
        const staffData = await apiClient.get<Array<{ department?: string }>>(
          `/staff?organiserId=${orgId}`
        ).catch(() => []);

        const deptMap = new Map<string, number>();
        (staffData || []).forEach((staff) => {
          if (staff.department) {
            deptMap.set(staff.department, (deptMap.get(staff.department) || 0) + 1);
          }
        });

        const depts = (organiser.metadata?.departments || []).map((dept) => ({
          ...dept,
          staffCount: deptMap.get(dept.name) || 0,
        }));

        setDepartments(depts);
      } catch (err: unknown) {
        console.error("Failed to load departments:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load departments";
        setError(errorMessage);
        toast.error("Failed to load departments", errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadDepartments();
  }, [toast]);

  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async (dept: Omit<Department, "id" | "staffCount" | "createdAt">) => {
    if (!organiserId) return;

    try {
      // Get current organiser
      const organiser = await apiClient.get<{
        id: string;
        metadata?: Record<string, any>;
      }>(`/organisers/${organiserId}`);

      const newDept: Department = {
        ...dept,
        id: `dept-${Date.now()}`,
        staffCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };

      // Update organiser metadata
      const updatedMetadata = {
        ...organiser.metadata,
        departments: [...(organiser.metadata?.departments || []), {
          id: newDept.id,
          name: newDept.name,
          description: newDept.description,
          manager: newDept.manager,
          color: newDept.color,
          createdAt: newDept.createdAt,
        }],
      };

      await apiClient.put(`/organisers/${organiserId}`, {
        metadata: updatedMetadata,
      });

      setDepartments([...departments, newDept]);
      setShowCreateModal(false);
      toast.success("Department created", "Department has been created successfully");
    } catch (err: unknown) {
      console.error("Failed to create department:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to create department";
      toast.error("Failed to create department", errorMessage);
    }
  };

  const handleUpdate = async (updatedDept: Department) => {
    if (!organiserId) return;

    try {
      // Get current organiser
      const organiser = await apiClient.get<{
        id: string;
        metadata?: Record<string, any>;
      }>(`/organisers/${organiserId}`);

      // Update department in metadata
      const updatedDepartments = (organiser.metadata?.departments || []).map((d: any) =>
        d.id === updatedDept.id
          ? {
              id: updatedDept.id,
              name: updatedDept.name,
              description: updatedDept.description,
              manager: updatedDept.manager,
              color: updatedDept.color,
              createdAt: updatedDept.createdAt,
            }
          : d
      );

      await apiClient.patch(`/organisers/${organiserId}`, {
        metadata: {
          ...organiser.metadata,
          departments: updatedDepartments,
        },
      });

      setDepartments(departments.map((d) => (d.id === updatedDept.id ? updatedDept : d)));
      setShowEditModal(false);
      setSelectedDept(null);
      toast.success("Department updated", "Department has been updated successfully");
    } catch (err: unknown) {
      console.error("Failed to update department:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to update department";
      toast.error("Failed to update department", errorMessage);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ open: true, deptId: id });
  };

  const handleDelete = async () => {
    if (!deleteConfirm.deptId || !organiserId) return;

    try {
      // Get current organiser
      const organiser = await apiClient.get<{
        id: string;
        metadata?: Record<string, any>;
      }>(`/organisers/${organiserId}`);

      // Remove department from metadata
      const updatedDepartments = (organiser.metadata?.departments || []).filter(
        (d: any) => d.id !== deleteConfirm.deptId
      );

      await apiClient.patch(`/organisers/${organiserId}`, {
        metadata: {
          ...organiser.metadata,
          departments: updatedDepartments,
        },
      });

      setDepartments(departments.filter((d) => d.id !== deleteConfirm.deptId));
      setDeleteConfirm({ open: false, deptId: null });
      toast.success("Department deleted", "Department has been deleted successfully");
    } catch (err: unknown) {
      console.error("Failed to delete department:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to delete department";
      toast.error("Failed to delete department", errorMessage);
      setDeleteConfirm({ open: false, deptId: null });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="mx-auto size-8 animate-spin text-slate-400" />
          <p className="mt-4 text-sm text-slate-600">Loading departments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <Building2 className="mx-auto size-8 text-red-600" />
        <p className="mt-4 text-sm font-semibold text-red-900">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Teams & Departments</h3>
          <p className="mt-1 text-sm text-slate-600">
            Organize staff into departments and teams for better management
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 size-4" />
          Create Department
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          placeholder="Search departments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-slate-900 focus:ring-slate-900"
        />
      </div>

      {/* Departments Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDepartments.map((dept) => (
          <div
            key={dept.id}
            className="rounded-xl border border-slate-200 bg-white p-6 transition hover:shadow-lg"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex size-12 items-center justify-center rounded-lg"
                  style={{ backgroundColor: dept.color }}
                >
                  <Building2 className="size-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-900">{dept.name}</h4>
                  <p className="mt-1 text-sm text-slate-600">{dept.description}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Staff Members:</span>
                <span className="font-semibold text-slate-900">{dept.staffCount}</span>
              </div>
              {dept.manager && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Manager:</span>
                  <span className="font-semibold text-slate-900">{dept.manager}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setSelectedDept(dept);
                  setShowEditModal(true);
                }}
              >
                <Edit2 className="mr-2 size-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteClick(dept.id)}
              >
                <Trash2 className="size-4 text-red-600" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredDepartments.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <Building2 className="mx-auto size-12 text-slate-300" />
          <p className="mt-4 text-lg font-semibold text-slate-900">No departments found</p>
          <p className="mt-2 text-sm text-slate-600">Create your first department</p>
        </div>
      )}

      {showCreateModal && (
        <DepartmentModal
          onSave={handleCreate}
          onCancel={() => setShowCreateModal(false)}
        />
      )}

      {showEditModal && selectedDept && (
        <DepartmentModal
          department={selectedDept}
          onSave={(updated) => handleUpdate({ ...selectedDept, ...updated })}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedDept(null);
          }}
        />
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, deptId: open ? deleteConfirm.deptId : null })}
        title="Delete Department"
        description="Are you sure you want to delete this department? Staff members in this department will need to be reassigned. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}

function DepartmentModal({
  department,
  onSave,
  onCancel,
}: {
  department?: Department;
  onSave: (dept: Omit<Department, "id" | "staffCount" | "createdAt">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(department?.name || "");
  const [description, setDescription] = useState(department?.description || "");
  const [manager, setManager] = useState(department?.manager || "");
  const [color, setColor] = useState(department?.color || colors[0]);

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {department ? "Edit Department" : "Create Department"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Department Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
              placeholder="e.g., Operations"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              placeholder="Brief description of the department"
            />
          </div>
          <div>
            <Label>Manager</Label>
            <Input
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              className="mt-1"
              placeholder="Department manager name"
            />
          </div>
          <div>
            <Label>Color</Label>
            <div className="mt-2 flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`size-10 rounded-lg border-2 transition ${
                    color === c ? "border-slate-900 scale-110" : "border-slate-200"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave({
                name,
                description,
                manager: manager || undefined,
                color,
              });
            }}
            disabled={!name.trim()}
          >
            {department ? "Update" : "Create"} Department
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

