"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Copy,
  Save,
  Settings,
  Calendar,
  Ticket,
  FileText,
  DollarSign,
  BarChart3,
  Users,
  Send,
  Lock,
  Unlock,
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

type PermissionLevel = "none" | "read" | "write" | "delete" | "admin";
type PermissionCategory =
  | "events"
  | "tickets"
  | "orders"
  | "finance"
  | "analytics"
  | "checkin"
  | "marketing"
  | "staff"
  | "settings";

type RolePermission = {
  category: PermissionCategory;
  level: PermissionLevel;
  resources?: string[]; // Specific event IDs, ticket types, etc.
};

type Role = {
  id: string;
  name: string;
  description: string;
  badge?: string;
  permissions: RolePermission[];
  isSystem: boolean;
  staffCount: number;
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

// Derive roles from staff data
function deriveRolesFromStaff(staff: Array<{ title?: string; permissions?: string[] }>): Role[] {
  const roleMap = new Map<string, { count: number; permissions: string[] }>();

  staff.forEach((member) => {
    const roleName = member.title || "Staff";
    if (!roleMap.has(roleName)) {
      roleMap.set(roleName, { count: 0, permissions: member.permissions || [] });
    }
    const role = roleMap.get(roleName)!;
    role.count++;
  });

  // Convert to Role format
  return Array.from(roleMap.entries()).map(([name, data]) => {
    // Parse permissions to RolePermission format
    const permissions: RolePermission[] = [];
    data.permissions.forEach((perm) => {
      const parts = perm.split(":");
      if (parts.length >= 2) {
        permissions.push({
          category: parts[0] as PermissionCategory,
          level: parts[1] as PermissionLevel,
        });
      }
    });

    return {
      id: `role-${name.toLowerCase().replace(/\s+/g, "-")}`,
      name,
      description: `Role for ${name}`,
      isSystem: false,
      staffCount: data.count,
      createdAt: new Date().toISOString().split("T")[0],
      permissions,
    };
  });
}

const permissionCategories: {
  id: PermissionCategory;
  label: string;
  icon: any;
  description: string;
}[] = [
  { id: "events", label: "Events", icon: Calendar, description: "Create, edit, and manage events" },
  {
    id: "tickets",
    label: "Tickets",
    icon: Ticket,
    description: "Manage ticket types, inventory, and pricing",
  },
  {
    id: "orders",
    label: "Orders",
    icon: FileText,
    description: "View and process customer orders",
  },
  {
    id: "finance",
    label: "Finance",
    icon: DollarSign,
    description: "Access financial reports and settlements",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    description: "View analytics and reports",
  },
  {
    id: "checkin",
    label: "Check-in",
    icon: Users,
    description: "Scan tickets and manage check-ins",
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: Send,
    description: "Create campaigns and promo codes",
  },
  {
    id: "staff",
    label: "Staff",
    icon: Users,
    description: "Manage staff members and permissions",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    description: "Access organization settings",
  },
];

const permissionLevels: {
  value: PermissionLevel;
  label: string;
  description: string;
  color: string;
}[] = [
  {
    value: "none",
    label: "No Access",
    description: "Cannot view or modify",
    color: "slate",
  },
  {
    value: "read",
    label: "Read Only",
    description: "Can view but not modify",
    color: "blue",
  },
  {
    value: "write",
    label: "Read & Write",
    description: "Can view and modify",
    color: "green",
  },
  {
    value: "delete",
    label: "Full Access",
    description: "Can view, modify, and delete",
    color: "purple",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Full control including settings",
    color: "red",
  },
];

export function RolePermissions() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [organiserId, setOrganiserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    roleId: string | null;
  }>({ open: false, roleId: null });
  const toast = useToast();

  // Fetch staff and derive roles
  useEffect(() => {
    async function loadRoles() {
      try {
        setLoading(true);
        const orgId = await getUserOrganiserId();
        if (!orgId) {
          setError("Could not determine organiser ID");
          return;
        }
        setOrganiserId(orgId);

        const staffData = await apiClient.get<Array<{
          title?: string;
          permissions?: string[];
        }>>(`/staff?organiserId=${orgId}`).catch(() => []);

        const derivedRoles = deriveRolesFromStaff(staffData || []);
        setRoles(derivedRoles);
      } catch (err: unknown) {
        console.error("Failed to load roles:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load roles";
        setError(errorMessage);
        toast.error("Failed to load roles", errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadRoles();
  }, [toast]);

  const filteredRoles = useMemo(() => {
    if (!searchQuery) return roles;
    const query = searchQuery.toLowerCase();
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(query) ||
        role.description.toLowerCase().includes(query)
    );
  }, [roles, searchQuery]);

  const handleCreateRole = (newRole: Omit<Role, "id" | "staffCount" | "createdAt">) => {
    const role: Role = {
      ...newRole,
      id: `role-${Date.now()}`,
      staffCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
      isSystem: false,
    };
    setRoles([...roles, role]);
    setShowCreateModal(false);
  };

  const handleUpdateRole = (updatedRole: Role) => {
    setRoles(roles.map((r) => (r.id === updatedRole.id ? updatedRole : r)));
    setShowEditModal(false);
    setSelectedRole(null);
  };

  const handleDeleteRoleClick = (roleId: string) => {
    setDeleteConfirm({ open: true, roleId });
  };

  const handleDeleteRole = async () => {
    if (!deleteConfirm.roleId) return;
    // Note: Roles are derived from staff, so we can't delete them directly
    // This would require updating all staff with this role
    toast.info("Role management", "Roles are derived from staff titles. To remove a role, update staff members' titles.");
    setDeleteConfirm({ open: false, roleId: null });
  };

  const handleDuplicateRole = (role: Role) => {
    const duplicated: Role = {
      ...role,
      id: `role-${Date.now()}`,
      name: `${role.name} (Copy)`,
      isSystem: false,
      staffCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setRoles([...roles, duplicated]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="mx-auto size-8 animate-spin text-slate-400" />
          <p className="mt-4 text-sm text-slate-600">Loading roles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <Shield className="mx-auto size-8 text-red-600" />
        <p className="mt-4 text-sm font-semibold text-red-900">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Roles & Permissions</h3>
          <p className="mt-1 text-sm text-slate-600">
            Define roles with granular permissions and access controls
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 size-4" />
          Create Role
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          placeholder="Search roles by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-slate-900 focus:ring-slate-900"
        />
      </div>

      {/* Roles Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRoles.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            onEdit={() => {
              setSelectedRole(role);
              setShowEditModal(true);
            }}
            onDelete={() => handleDeleteRoleClick(role.id)}
            onDuplicate={() => handleDuplicateRole(role)}
          />
        ))}
      </div>

      {filteredRoles.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <Shield className="mx-auto size-12 text-slate-300" />
          <p className="mt-4 text-lg font-semibold text-slate-900">No roles found</p>
          <p className="mt-2 text-sm text-slate-600">Create your first custom role</p>
        </div>
      )}

      {/* Permissions Matrix */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h4 className="mb-4 text-lg font-semibold text-slate-900">Permissions Matrix</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Permission
                </th>
                {roles.map((role) => (
                  <th
                    key={role.id}
                    className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {permissionCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <tr key={category.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Icon className="size-4 text-slate-600" />
                        <div>
                          <div className="text-sm font-medium text-slate-900">{category.label}</div>
                          <div className="text-xs text-slate-500">{category.description}</div>
                        </div>
                      </div>
                    </td>
                    {roles.map((role) => {
                      const perm = role.permissions.find((p) => p.category === category.id);
                      const level = perm?.level || "none";
                      const levelConfig = permissionLevels.find((l) => l.value === level);
                      return (
                        <td key={`${role.id}-${category.id}`} className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              level === "none"
                                ? "bg-slate-100 text-slate-600"
                                : level === "read"
                                ? "bg-blue-100 text-blue-700"
                                : level === "write"
                                ? "bg-green-100 text-green-700"
                                : level === "delete"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {levelConfig?.label}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <RoleModal
          onSave={handleCreateRole}
          onCancel={() => setShowCreateModal(false)}
        />
      )}

      {showEditModal && selectedRole && (
        <RoleModal
          role={selectedRole}
          onSave={(updatedRole) => {
            handleUpdateRole({ ...selectedRole, ...updatedRole });
          }}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedRole(null);
          }}
        />
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, roleId: open ? deleteConfirm.roleId : null })}
        title="Delete Role"
        description="Roles are derived from staff titles. To remove a role, update staff members' titles. This action cannot delete the role directly."
        confirmText="OK"
        cancelText="Cancel"
        variant="default"
        onConfirm={handleDeleteRole}
      />
    </div>
  );
}

function RoleCard({
  role,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  role: Role;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 transition hover:shadow-lg">
      <div className="mb-4 flex items-start justify-between">
        <div>
          {role.badge && (
            <span className="mb-2 inline-block rounded-full border border-slate-300 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
              {role.badge}
            </span>
          )}
          <h4 className="text-lg font-semibold text-slate-900">{role.name}</h4>
          <p className="mt-1 text-sm text-slate-600">{role.description}</p>
        </div>
        {role.isSystem && (
          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
            System
          </span>
        )}
      </div>

      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Permissions:</span>
          <span className="font-semibold text-slate-900">{role.permissions.length}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Staff Members:</span>
          <span className="font-semibold text-slate-900">{role.staffCount}</span>
        </div>
      </div>

      {/* Permission Summary */}
      <div className="mb-4 rounded-lg bg-slate-50 p-3">
        <div className="flex flex-wrap gap-2">
          {role.permissions.slice(0, 6).map((perm) => {
            const category = permissionCategories.find((c) => c.id === perm.category);
            const levelConfig = permissionLevels.find((l) => l.value === perm.level);
            return (
              <span
                key={perm.category}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                  perm.level === "none"
                    ? "bg-slate-100 text-slate-600"
                    : perm.level === "read"
                    ? "bg-blue-100 text-blue-700"
                    : perm.level === "write"
                    ? "bg-green-100 text-green-700"
                    : perm.level === "delete"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {category?.label}: {levelConfig?.label}
              </span>
            );
          })}
          {role.permissions.length > 6 && (
            <span className="text-xs text-slate-500">
              +{role.permissions.length - 6} more
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
          <Edit2 className="mr-2 size-4" />
          Edit
        </Button>
        <Button variant="outline" size="sm" onClick={onDuplicate}>
          <Copy className="size-4" />
        </Button>
        {!role.isSystem && (
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash2 className="size-4 text-red-600" />
          </Button>
        )}
      </div>
    </div>
  );
}

function RoleModal({
  role,
  onSave,
  onCancel,
}: {
  role?: Role;
  onSave: (role: Omit<Role, "id" | "staffCount" | "createdAt">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(role?.name || "");
  const [description, setDescription] = useState(role?.description || "");
  const [badge, setBadge] = useState(role?.badge || "");
  const [permissions, setPermissions] = useState<RolePermission[]>(
    role?.permissions || []
  );

  const handlePermissionChange = (category: PermissionCategory, level: PermissionLevel) => {
    setPermissions((prev) => {
      const filtered = prev.filter((p) => p.category !== category);
      if (level !== "none") {
        return [...filtered, { category, level }];
      }
      return filtered;
    });
  };

  const getPermissionLevel = (category: PermissionCategory): PermissionLevel => {
    const perm = permissions.find((p) => p.category === category);
    return perm?.level || "none";
  };

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{role ? "Edit Role" : "Create New Role"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Role Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
                placeholder="e.g., Senior Event Manager"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
                placeholder="Describe the role's responsibilities..."
              />
            </div>
            <div>
              <Label>Badge (Optional)</Label>
              <Input
                value={badge}
                onChange={(e) => setBadge(e.target.value.toUpperCase())}
                className="mt-1"
                placeholder="e.g., MANAGER"
                maxLength={10}
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h4 className="mb-4 text-sm font-semibold text-slate-900">Permissions</h4>
            <div className="space-y-3">
              {permissionCategories.map((category) => {
                const Icon = category.icon;
                const currentLevel = getPermissionLevel(category.id);
                return (
                  <div
                    key={category.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="size-5 text-slate-600" />
                      <div>
                        <div className="font-semibold text-slate-900">{category.label}</div>
                        <div className="text-xs text-slate-600">{category.description}</div>
                      </div>
                    </div>
                    <Select
                      value={currentLevel}
                      onValueChange={(value) =>
                        handlePermissionChange(category.id, value as PermissionLevel)
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {permissionLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave({
                name,
                description,
                badge: badge || undefined,
                permissions,
                isSystem: false,
              });
            }}
            disabled={!name.trim()}
          >
            <Save className="mr-2 size-4" />
            {role ? "Update Role" : "Create Role"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
