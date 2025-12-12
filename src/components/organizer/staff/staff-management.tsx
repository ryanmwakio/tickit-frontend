"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Mail,
  Phone,
  UserPlus,
  Trash2,
  Edit2,
  Shield,
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Download,
  Upload,
  MoreVertical,
  Ticket,
  DollarSign,
  Settings,
  FileText,
  BarChart3,
  Users,
  Building2,
  Send,
  Copy,
  Ban,
  Unlock,
  Eye,
  EyeOff,
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
  DialogTrigger,
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

type Permission = {
  category: PermissionCategory;
  resource?: string; // Event ID, ticket type, etc.
  level: PermissionLevel;
};

type StaffMember = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department?: string;
  status: "active" | "invited" | "suspended" | "inactive";
  assignedEvents: { eventId: string; eventName: string; permissions: Permission[] }[];
  globalPermissions: Permission[];
  inviteSentAt: string | null;
  lastActive: string | null;
  location?: string;
  twoFactorEnabled: boolean;
  apiAccess: boolean;
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

// Map API staff to component format
function mapApiStaffToComponentStaff(apiStaff: {
  id: string;
  userId: string;
  organiserId: string;
  department?: string;
  title?: string;
  status: string;
  permissions?: string[];
  metadata?: Record<string, any>;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    metadata?: Record<string, any>;
  };
  createdAt: string;
  updatedAt: string;
}): StaffMember {
  const name = apiStaff.user
    ? `${apiStaff.user.firstName || ""} ${apiStaff.user.lastName || ""}`.trim() || apiStaff.user.email || "Unknown"
    : "Unknown";
  const email = apiStaff.user?.email || "";
  const phone = apiStaff.user?.phoneNumber || "";

  // Map permissions from string array to Permission objects
  const globalPermissions: Permission[] = [];
  const assignedEvents: { eventId: string; eventName: string; permissions: Permission[] }[] = [];

  // Parse permissions if they exist
  if (apiStaff.permissions) {
    apiStaff.permissions.forEach((perm) => {
      // Assuming permissions are stored as "category:level" or "category:level:resourceId"
      const parts = perm.split(":");
      if (parts.length >= 2) {
        const category = parts[0] as PermissionCategory;
        const level = parts[1] as PermissionLevel;
        if (parts.length === 3 && parts[2]) {
          // Event-specific permission
          const eventId = parts[2];
          let event = assignedEvents.find((e) => e.eventId === eventId);
          if (!event) {
            event = { eventId, eventName: "Unknown Event", permissions: [] };
            assignedEvents.push(event);
          }
          event.permissions.push({ category, level });
        } else {
          // Global permission
          globalPermissions.push({ category, level });
        }
      }
    });
  }

  return {
    id: apiStaff.id,
    name,
    email,
    phone,
    role: apiStaff.title || "Staff",
    department: apiStaff.department,
    status: apiStaff.status.toLowerCase() as "active" | "invited" | "suspended" | "inactive",
    assignedEvents,
    globalPermissions,
    inviteSentAt: apiStaff.createdAt,
    lastActive: apiStaff.metadata?.lastActive || null,
    location: apiStaff.user?.metadata?.location,
    twoFactorEnabled: apiStaff.user?.metadata?.twoFactorEnabled || false,
    apiAccess: apiStaff.metadata?.apiAccess || false,
  };
}

const permissionCategories: { id: PermissionCategory; label: string; icon: any }[] = [
  { id: "events", label: "Events", icon: Calendar },
  { id: "tickets", label: "Tickets", icon: Ticket },
  { id: "orders", label: "Orders", icon: FileText },
  { id: "finance", label: "Finance", icon: DollarSign },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "checkin", label: "Check-in", icon: Users },
  { id: "marketing", label: "Marketing", icon: Send },
  { id: "staff", label: "Staff", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];

const permissionLevels: { value: PermissionLevel; label: string; description: string }[] = [
  { value: "none", label: "No Access", description: "Cannot view or modify" },
  { value: "read", label: "Read Only", description: "Can view but not modify" },
  { value: "write", label: "Read & Write", description: "Can view and modify" },
  { value: "delete", label: "Full Access", description: "Can view, modify, and delete" },
  { value: "admin", label: "Admin", description: "Full control including settings" },
];

export function StaffManagement() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [organiserId, setOrganiserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    staffId: string | null;
  }>({ open: false, staffId: null });
  const toast = useToast();

  // Fetch staff from API
  useEffect(() => {
    async function loadStaff() {
      try {
        setLoading(true);
        const orgId = await getUserOrganiserId();
        if (!orgId) {
          setError("Could not determine organiser ID");
          return;
        }
        setOrganiserId(orgId);

        const staffData = await apiClient.get<Array<{
          id: string;
          userId: string;
          organiserId: string;
          department?: string;
          title?: string;
          status: string;
          permissions?: string[];
          metadata?: Record<string, any>;
          user?: {
            id: string;
            firstName?: string;
            lastName?: string;
            email?: string;
            phoneNumber?: string;
            metadata?: Record<string, any>;
          };
          createdAt: string;
          updatedAt: string;
        }>>(`/staff?organiserId=${orgId}`);

        const mappedStaff = (staffData || []).map(mapApiStaffToComponentStaff);
        setStaff(mappedStaff);
      } catch (err: unknown) {
        console.error("Failed to load staff:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load staff";
        setError(errorMessage);
        toast.error("Failed to load staff", errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadStaff();
  }, [toast]);

  const filteredStaff = useMemo(() => {
    let members = staff;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      members = members.filter(
        (member) =>
          member.name.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query) ||
          member.phone.includes(query) ||
          member.role.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      members = members.filter((member) => member.status === statusFilter);
    }

    if (roleFilter !== "all") {
      members = members.filter((member) => member.role === roleFilter);
    }

    if (departmentFilter !== "all") {
      members = members.filter((member) => member.department === departmentFilter);
    }

    return members;
  }, [staff, searchQuery, statusFilter, roleFilter, departmentFilter]);

  const departments = useMemo(() => {
    const depts = new Set(staff.map((s) => s.department).filter(Boolean));
    return Array.from(depts);
  }, [staff]);

  const roles = useMemo(() => {
    const roleSet = new Set(staff.map((s) => s.role));
    return Array.from(roleSet);
  }, [staff]);

  const handleEditPermissions = (member: StaffMember) => {
    setSelectedStaff(member);
    setShowPermissionsModal(true);
  };

  const handleUpdatePermissions = async (updatedPermissions: {
    global: Permission[];
    eventPermissions: { eventId: string; permissions: Permission[] }[];
  }) => {
    if (!selectedStaff || !organiserId) return;

    try {
      // Convert permissions to string array format
      const permissions: string[] = [];
      updatedPermissions.global.forEach((perm) => {
        permissions.push(`${perm.category}:${perm.level}`);
      });
      updatedPermissions.eventPermissions.forEach((ep) => {
        ep.permissions.forEach((perm) => {
          permissions.push(`${perm.category}:${perm.level}:${ep.eventId}`);
        });
      });

      await apiClient.put(`/staff/${selectedStaff.id}`, {
        permissions,
      });

      // Update local state
      setStaff(
        staff.map((s) =>
          s.id === selectedStaff.id
            ? {
                ...s,
                globalPermissions: updatedPermissions.global,
                assignedEvents: s.assignedEvents.map((evt) => {
                  const updated = updatedPermissions.eventPermissions.find((ep) => ep.eventId === evt.eventId);
                  return updated
                    ? { ...evt, permissions: updated.permissions }
                    : evt;
                }),
              }
            : s
        )
      );
      setShowPermissionsModal(false);
      setSelectedStaff(null);
      toast.success("Permissions updated", "Staff permissions have been updated successfully");
    } catch (err: unknown) {
      console.error("Failed to update permissions:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to update permissions";
      toast.error("Failed to update permissions", errorMessage);
    }
  };

  const handleStatusChange = async (memberId: string, status: StaffMember["status"]) => {
    if (!organiserId) return;

    try {
      const statusMap: Record<string, string> = {
        active: "ACTIVE",
        invited: "ACTIVE", // Invited staff are still ACTIVE
        suspended: "SUSPENDED",
        inactive: "INACTIVE",
      };

      await apiClient.put(`/staff/${memberId}`, {
        status: statusMap[status] || "ACTIVE",
      });

      setStaff(staff.map((s) => (s.id === memberId ? { ...s, status } : s)));
      toast.success("Status updated", "Staff status has been updated successfully");
    } catch (err: unknown) {
      console.error("Failed to update status:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to update status";
      toast.error("Failed to update status", errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.staffId || !organiserId) return;

    try {
      await apiClient.delete(`/staff/${deleteConfirm.staffId}`);
      setStaff(staff.filter((s) => s.id !== deleteConfirm.staffId));
      setDeleteConfirm({ open: false, staffId: null });
      toast.success("Staff removed", "Staff member has been removed successfully");
    } catch (err: unknown) {
      console.error("Failed to delete staff:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to remove staff";
      toast.error("Failed to remove staff", errorMessage);
      setDeleteConfirm({ open: false, staffId: null });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="mx-auto size-8 animate-spin text-slate-400" />
          <p className="mt-4 text-sm text-slate-600">Loading staff...</p>
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Staff Members</h3>
          <p className="mt-1 text-sm text-slate-600">
            Manage staff invitations, roles, and granular access permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 size-4" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 size-4" />
            Export
          </Button>
          <Button onClick={() => setShowInviteModal(true)} size="sm">
            <Plus className="mr-2 size-4" />
            Invite Staff
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search staff by name, email, phone, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-slate-900 focus:ring-slate-900"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="invited">Invited</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {roles.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            Table
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users className="size-4 text-blue-600" />
            <span>Total Staff</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{staff.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CheckCircle2 className="size-4 text-green-600" />
            <span>Active</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {staff.filter((s) => s.status === "active").length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="size-4 text-amber-600" />
            <span>Invited</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {staff.filter((s) => s.status === "invited").length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Shield className="size-4 text-purple-600" />
            <span>With 2FA</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {staff.filter((s) => s.twoFactorEnabled).length}
          </p>
        </div>
      </div>

      {/* Staff List */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStaff.map((member) => (
            <StaffCard
              key={member.id}
              member={member}
              onEdit={() => handleEditPermissions(member)}
              onStatusChange={(status) => handleStatusChange(member.id, status)}
              onDelete={() => setDeleteConfirm({ open: true, staffId: member.id })}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Staff
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Assigned Events
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStaff.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{member.name}</div>
                      <div className="text-sm text-slate-600">{member.email}</div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">
                    {member.role}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                    {member.department || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {member.assignedEvents.length > 0 ? (
                      <div className="space-y-1">
                        {member.assignedEvents.slice(0, 2).map((evt) => (
                          <div key={evt.eventId} className="text-xs">
                            {evt.eventName}
                          </div>
                        ))}
                        {member.assignedEvents.length > 2 && (
                          <div className="text-xs text-slate-500">
                            +{member.assignedEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      {member.globalPermissions.length > 0 && (
                        <span className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                          {member.globalPermissions.length} global
                        </span>
                      )}
                      {member.assignedEvents.length > 0 && (
                        <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                          Event-specific
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <StatusBadge status={member.status} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPermissions(member)}
                      >
                        <Shield className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm({ open: true, staffId: member.id })}
                      >
                        <Trash2 className="size-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredStaff.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <UserPlus className="mx-auto size-12 text-slate-300" />
          <p className="mt-4 text-lg font-semibold text-slate-900">No staff members found</p>
          <p className="mt-2 text-sm text-slate-600">
            Invite your first staff member to get started
          </p>
        </div>
      )}

      {showInviteModal && (
        <InviteStaffModal
          organiserId={organiserId}
          onSave={async (newStaff) => {
            if (!organiserId) return;
            try {
              // Note: The staff API requires a userId. 
              // For now, we'll show an error that the user must exist first.
              // TODO: Add user lookup by email endpoint or handle user creation in the invite flow
              toast.error(
                "User lookup required", 
                "The user must exist in the system first. Please ensure the user has an account before adding them as staff."
              );
              // Future implementation when user lookup is available:
              // const user = await apiClient.get(`/users?email=${encodeURIComponent(newStaff.email)}`);
              // if (!user) {
              //   toast.error("User not found", "Please create the user account first");
              //   return;
              // }
              // await apiClient.post("/staff", {
              //   userId: user.id,
              //   organiserId,
              //   department: newStaff.department,
              //   title: newStaff.role,
              //   permissions: [],
              // });
              // Reload staff list
              // const staffData = await apiClient.get(`/staff?organiserId=${organiserId}`);
              // const mappedStaff = (staffData || []).map(mapApiStaffToComponentStaff);
              // setStaff(mappedStaff);
              // setShowInviteModal(false);
              // toast.success("Staff added", "Staff member has been added successfully");
            } catch (err: unknown) {
              console.error("Failed to invite staff:", err);
              const errorMessage = err instanceof Error ? err.message : "Failed to invite staff";
              toast.error("Failed to invite staff", errorMessage);
            }
          }}
          onCancel={() => setShowInviteModal(false)}
        />
      )}

      {showPermissionsModal && selectedStaff && (
        <PermissionsModal
          staff={selectedStaff}
          onSave={handleUpdatePermissions}
          onCancel={() => {
            setShowPermissionsModal(false);
            setSelectedStaff(null);
          }}
        />
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, staffId: open ? deleteConfirm.staffId : null })}
        title="Remove Staff Member"
        description="Are you sure you want to remove this staff member? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}

function StaffCard({
  member,
  onEdit,
  onStatusChange,
  onDelete,
}: {
  member: StaffMember;
  onEdit: () => void;
  onStatusChange: (status: StaffMember["status"]) => void;
  onDelete?: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 transition hover:shadow-lg">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">{member.name}</h4>
          <p className="mt-1 text-sm text-slate-600">{member.role}</p>
          {member.department && (
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <Building2 className="size-3" />
              {member.department}
            </p>
          )}
        </div>
        <StatusBadge status={member.status} />
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Mail className="size-4" />
          <span className="truncate">{member.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="size-4" />
          <span>{member.phone}</span>
        </div>
        {member.lastActive && (
          <div className="flex items-center gap-2">
            <Clock className="size-4" />
            <span>Last active: {new Date(member.lastActive).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Permissions Summary */}
      <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">Permissions:</span>
          <span className="text-slate-600">
            {member.globalPermissions.length} global, {member.assignedEvents.length} events
          </span>
        </div>
        {member.assignedEvents.length > 0 && (
          <div className="space-y-1">
            {member.assignedEvents.slice(0, 2).map((evt) => (
              <div key={evt.eventId} className="flex items-center justify-between text-xs">
                <span className="text-slate-600">{evt.eventName}</span>
                <span className="text-slate-500">{evt.permissions.length} permissions</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Info */}
      <div className="mt-3 flex items-center gap-3 text-xs">
        {member.twoFactorEnabled && (
          <span className="flex items-center gap-1 text-green-600">
            <Shield className="size-3" />
            2FA
          </span>
        )}
        {member.apiAccess && (
          <span className="flex items-center gap-1 text-blue-600">
            <Settings className="size-3" />
            API Access
          </span>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onEdit}
        >
          <Shield className="mr-2 size-4" />
          Permissions
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onStatusChange(member.status === "active" ? "suspended" : "active")}
        >
          {member.status === "active" ? <Ban className="size-4" /> : <Unlock className="size-4" />}
        </Button>
        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: StaffMember["status"] }) {
  const config = {
    active: { label: "Active", className: "bg-green-100 text-green-700", icon: CheckCircle2 },
    invited: { label: "Invited", className: "bg-blue-100 text-blue-700", icon: Clock },
    suspended: { label: "Suspended", className: "bg-red-100 text-red-700", icon: XCircle },
    inactive: { label: "Inactive", className: "bg-slate-100 text-slate-700", icon: XCircle },
  };
  const statusConfig = config[status];
  const Icon = statusConfig.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${statusConfig.className}`}
    >
      <Icon className="size-3" />
      {statusConfig.label}
    </span>
  );
}

function InviteStaffModal({
  organiserId,
  onSave,
  onCancel,
}: {
  organiserId: string | null;
  onSave: (staff: StaffMember) => Promise<void>;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
  });

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invite Staff Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Full Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1"
              placeholder="John Doe"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email Address *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1"
                placeholder="+254 700 123 456"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event_owner">Event Owner</SelectItem>
                  <SelectItem value="event_manager">Event Manager</SelectItem>
                  <SelectItem value="finance">Finance Manager</SelectItem>
                  <SelectItem value="marketing">Marketing Manager</SelectItem>
                  <SelectItem value="door_staff">Door Staff</SelectItem>
                  <SelectItem value="analyst">Analyst</SelectItem>
                  <SelectItem value="support">Support Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Department</Label>
              <Input
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="mt-1"
                placeholder="Operations"
              />
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (!formData.name || !formData.email || !formData.role) {
                return;
              }
              const newStaff: StaffMember = {
                id: `staff-${Date.now()}`,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role: formData.role,
                department: formData.department || undefined,
                status: "invited",
                assignedEvents: [],
                globalPermissions: [],
                inviteSentAt: new Date().toISOString(),
                lastActive: null,
                twoFactorEnabled: false,
                apiAccess: false,
              };
              await onSave(newStaff);
            }}
            disabled={!organiserId || !formData.name || !formData.email || !formData.role}
          >
            <Send className="mr-2 size-4" />
            Send Invite
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PermissionsModal({
  staff,
  onSave,
  onCancel,
}: {
  staff: StaffMember;
  onSave: (permissions: {
    global: Permission[];
    eventPermissions: { eventId: string; permissions: Permission[] }[];
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [globalPermissions, setGlobalPermissions] = useState<Permission[]>(
    staff.globalPermissions
  );
  const [eventPermissions, setEventPermissions] = useState<
    { eventId: string; eventName: string; permissions: Permission[] }[]
  >(staff.assignedEvents);
  const [activeTab, setActiveTab] = useState<"global" | "events">("global");

  const handleGlobalPermissionChange = (
    category: PermissionCategory,
    level: PermissionLevel
  ) => {
    setGlobalPermissions((prev) => {
      const filtered = prev.filter((p) => p.category !== category);
      if (level !== "none") {
        return [...filtered, { category, level }];
      }
      return filtered;
    });
  };

  const handleEventPermissionChange = (
    eventId: string,
    category: PermissionCategory,
    level: PermissionLevel
  ) => {
    setEventPermissions((prev) =>
      prev.map((evt) =>
        evt.eventId === eventId
          ? {
              ...evt,
              permissions: level === "none"
                ? evt.permissions.filter((p) => p.category !== category)
                : [
                    ...evt.permissions.filter((p) => p.category !== category),
                    { category, level },
                  ],
            }
          : evt
      )
    );
  };

  const getPermissionLevel = (
    permissions: Permission[],
    category: PermissionCategory
  ): PermissionLevel => {
    const perm = permissions.find((p) => p.category === category);
    return perm?.level || "none";
  };

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Permissions: {staff.name}</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="flex gap-2 border-b border-slate-200">
            <button
              onClick={() => setActiveTab("global")}
              className={`border-b-2 px-4 py-2 text-sm font-semibold transition ${
                activeTab === "global"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Global Permissions
            </button>
            <button
              onClick={() => setActiveTab("events")}
              className={`border-b-2 px-4 py-2 text-sm font-semibold transition ${
                activeTab === "events"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Event-Specific Permissions ({eventPermissions.length})
            </button>
          </div>

          {activeTab === "global" && (
            <div className="mt-6 space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h4 className="mb-4 text-sm font-semibold text-slate-900">
                  Global Permissions (Apply to All Events)
                </h4>
                <div className="space-y-4">
                  {permissionCategories.map((category) => {
                    const Icon = category.icon;
                    const currentLevel = getPermissionLevel(globalPermissions, category.id);
                    return (
                      <div
                        key={category.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="size-5 text-slate-600" />
                          <div>
                            <div className="font-semibold text-slate-900">{category.label}</div>
                            <div className="text-xs text-slate-600">
                              {permissionLevels.find((l) => l.value === currentLevel)?.description}
                            </div>
                          </div>
                        </div>
                        <Select
                          value={currentLevel}
                          onValueChange={(value) =>
                            handleGlobalPermissionChange(category.id, value as PermissionLevel)
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
          )}

          {activeTab === "events" && (
            <div className="mt-6 space-y-6">
              {eventPermissions.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <Calendar className="mx-auto size-12 text-slate-300" />
                  <p className="mt-4 text-sm font-semibold text-slate-900">
                    No event-specific permissions
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Assign staff to events to set event-specific permissions
                  </p>
                </div>
              ) : (
                eventPermissions.map((evt) => (
                  <div key={evt.eventId} className="rounded-xl border border-slate-200 bg-white p-6">
                    <h4 className="mb-4 text-sm font-semibold text-slate-900">{evt.eventName}</h4>
                    <div className="space-y-3">
                      {permissionCategories.map((category) => {
                        const Icon = category.icon;
                        const currentLevel = getPermissionLevel(evt.permissions, category.id);
                        return (
                          <div
                            key={category.id}
                            className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3"
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="size-4 text-slate-600" />
                              <span className="text-sm font-medium text-slate-900">
                                {category.label}
                              </span>
                            </div>
                            <Select
                              value={currentLevel}
                              onValueChange={(value) =>
                                handleEventPermissionChange(
                                  evt.eventId,
                                  category.id,
                                  value as PermissionLevel
                                )
                              }
                            >
                              <SelectTrigger className="w-[150px]">
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
                ))
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              await onSave({
                global: globalPermissions,
                eventPermissions: eventPermissions.map((evt) => ({
                  eventId: evt.eventId,
                  permissions: evt.permissions,
                })),
              });
            }}
          >
            Save Permissions
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
