"use client";

import { useState, useMemo, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import {
  Users,
  Shield,
  UserPlus,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  Unlock,
  Key,
  Download,
  Upload,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Monitor,
  AlertTriangle,
  Eye,
  EyeOff,
  Copy,
  Ban,
  Save,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type AdminRole = 
  | "super_admin"
  | "support"
  | "finance"
  | "events"
  | "marketing"
  | "security_fraud"
  | "developer";

type UserStatus = "active" | "inactive" | "suspended" | "pending";

type Permission = {
  id: string;
  name: string;
  category: string;
  allowed: boolean;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: AdminRole;
  status: UserStatus;
  twoFactorEnabled: boolean;
  lastLogin?: string;
  lastLoginIp?: string;
  lastLoginDevice?: string;
  loginAttempts: number;
  createdAt: string;
  permissions: Permission[];
  sessions: number;
};

const mockAdminUsers: AdminUser[] = [
  {
    id: "admin-1",
    name: "Sarah Johnson",
    email: "sarah.johnson@tickit.com",
    phone: "+254 700 123 456",
    role: "super_admin",
    status: "active",
    twoFactorEnabled: true,
    lastLogin: "2024-03-15T10:30:00Z",
    lastLoginIp: "192.168.1.100",
    lastLoginDevice: "Chrome on macOS",
    loginAttempts: 0,
    createdAt: "2024-01-01",
    permissions: [],
    sessions: 2,
  },
  {
    id: "admin-2",
    name: "Michael Chen",
    email: "michael.chen@tickit.com",
    role: "finance",
    status: "active",
    twoFactorEnabled: true,
    lastLogin: "2024-03-15T09:15:00Z",
    lastLoginIp: "192.168.1.101",
    lastLoginDevice: "Firefox on Windows",
    loginAttempts: 0,
    createdAt: "2024-01-15",
    permissions: [],
    sessions: 1,
  },
  {
    id: "admin-3",
    name: "Emma Williams",
    email: "emma.williams@tickit.com",
    role: "support",
    status: "active",
    twoFactorEnabled: false,
    lastLogin: "2024-03-14T16:45:00Z",
    lastLoginIp: "192.168.1.102",
    lastLoginDevice: "Safari on macOS",
    loginAttempts: 0,
    createdAt: "2024-02-01",
    permissions: [],
    sessions: 3,
  },
];

const roleConfig: Record<
  AdminRole,
  { label: string; color: string; description: string }
> = {
  super_admin: {
    label: "Super Admin",
    color: "bg-red-100 text-red-700",
    description: "Full platform access",
  },
  support: {
    label: "Support",
    color: "bg-blue-100 text-blue-700",
    description: "Customer support access",
  },
  finance: {
    label: "Finance",
    color: "bg-green-100 text-green-700",
    description: "Financial operations",
  },
  events: {
    label: "Events",
    color: "bg-purple-100 text-purple-700",
    description: "Event management",
  },
  marketing: {
    label: "Marketing",
    color: "bg-pink-100 text-pink-700",
    description: "Marketing tools",
  },
  security_fraud: {
    label: "Security/Fraud",
    color: "bg-orange-100 text-orange-700",
    description: "Security and fraud monitoring",
  },
  developer: {
    label: "Developer",
    color: "bg-indigo-100 text-indigo-700",
    description: "API and developer tools",
  },
};

export function UserRoleManagement() {
  const { user } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [displayedCount, setDisplayedCount] = useState(9);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<"users" | "roles" | "sessions" | "permissions">("users");

  useEffect(() => {
    if (user) {
      loadUsers(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, searchQuery, roleFilter, statusFilter]);

  const loadUsers = async (reset: boolean = true) => {
    if (!user) return;
    try {
      if (reset) {
        setLoading(true);
        setDisplayedCount(9);
      } else {
        setLoadingMore(true);
      }

      const page = reset ? 1 : Math.floor(displayedCount / 9) + 1;
      
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '9');
      if (searchQuery && searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      if (roleFilter && roleFilter !== 'all') {
        params.append('role', roleFilter);
      }
      
      const response = await apiClient.get<{
        data: Array<{
          id: string;
          firstName?: string;
          lastName?: string;
          email?: string;
          phoneNumber?: string;
          roles?: string;
          activeRole?: string;
          status?: string;
          metadata?: any;
          createdAt: string;
        }>;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`/admin/users?${params.toString()}`);

      console.log('Admin users response:', response);

      const mappedUsers: AdminUser[] = (response.data || []).map((u) => {
        const roles = u.roles ? u.roles.split(',').map(r => r.trim()) : [];
        const isAdmin = roles.includes('ADMIN') || u.activeRole === 'ADMIN';
        const status = u.metadata?.status || (u.metadata?.suspended ? 'suspended' : 'active');
        
        return {
          id: u.id,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Unknown User',
          email: u.email || '',
          phone: u.phoneNumber,
          role: isAdmin ? (roles.find(r => r !== 'ADMIN' && ['SUPPORT', 'FINANCE', 'EVENTS', 'MARKETING', 'SECURITY', 'DEVELOPER'].includes(r)) || 'super_admin') as AdminRole : 'super_admin',
          status: (u.status || status || 'active') as UserStatus,
          twoFactorEnabled: u.metadata?.twoFactorEnabled || false,
          lastLogin: u.metadata?.lastLogin,
          lastLoginIp: u.metadata?.lastLoginIp,
          lastLoginDevice: u.metadata?.lastLoginDevice,
          loginAttempts: u.metadata?.loginAttempts || 0,
          createdAt: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          permissions: [],
          sessions: u.metadata?.sessions || 0,
        };
      });

      if (reset) {
        setUsers(mappedUsers);
      } else {
        setUsers(prev => [...prev, ...mappedUsers]);
      }

      setHasMore(response.total > displayedCount + mappedUsers.length);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    setDisplayedCount(prev => prev + 9);
    loadUsers(false);
  };

  const filteredUsers = users; // Already filtered by API

  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((u) => u.status === "active").length,
      with2FA: users.filter((u) => u.twoFactorEnabled).length,
      activeSessions: users.reduce((sum, u) => sum + u.sessions, 0),
    };
  }, [users]);

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Role', 'Status', '2FA Enabled', 'Last Login', 'Sessions'],
      ...filteredUsers.map((u) => [
        u.name,
        u.email,
        u.phone || '',
        roleConfig[u.role]?.label || u.role,
        u.status,
        u.twoFactorEnabled ? 'Yes' : 'No',
        u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '',
        u.sessions.toString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported', 'Users exported to CSV');
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users className="size-4 text-blue-600" />
            <span>Total Admins</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CheckCircle2 className="size-4 text-green-600" />
            <span>Active</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.active}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Shield className="size-4 text-purple-600" />
            <span>With 2FA</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.with2FA}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Monitor className="size-4 text-amber-600" />
            <span>Active Sessions</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.activeSessions}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex items-center justify-between">
          <TabsList className="border-b border-slate-200 bg-transparent p-0">
            <TabsTrigger value="users" className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900">
              Admin Users
            </TabsTrigger>
            <TabsTrigger value="roles" className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900">
              Roles & Permissions
            </TabsTrigger>
            <TabsTrigger value="sessions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900">
              Session Logs
            </TabsTrigger>
            <TabsTrigger value="permissions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900">
              Permission Matrix
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 size-4" />
              Export
            </Button>
            <Button size="sm" onClick={() => setShowCreateModal(true)}>
              <UserPlus className="mr-2 size-4" />
              Add Admin
            </Button>
          </div>
        </div>

        <TabsContent value="users" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <div className="mx-auto size-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
                <p className="mt-4 text-sm text-slate-600">Loading users...</p>
              </div>
            </div>
          ) : (
            <UsersTab
              users={filteredUsers}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              hasMore={hasMore}
              loadingMore={loadingMore}
              onLoadMore={handleLoadMore}
              onEdit={(user) => {
                setSelectedUser(user);
                setShowCreateModal(true);
              }}
              onStatusChange={(userId, status) => {
                setUsers(users.map((u) => (u.id === userId ? { ...u, status } : u)));
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <RolesTab />
        </TabsContent>

        <TabsContent value="sessions" className="mt-6">
          <SessionsTab users={users} />
        </TabsContent>

        <TabsContent value="permissions" className="mt-6">
          <PermissionsTab />
        </TabsContent>
      </Tabs>

      {showCreateModal && (
        <CreateAdminModal
          user={selectedUser || undefined}
          onSave={async (userData) => {
            if (!user) return;
            try {
              const [firstName, ...lastNameParts] = (userData.name || '').split(' ');
              const lastName = lastNameParts.join(' ');

              if (selectedUser) {
                // Update existing user
                await apiClient.put(`/admin/users/${selectedUser.id}`, {
                  firstName,
                  lastName,
                  phoneNumber: userData.phone,
                  activeRole: userData.role === 'super_admin' ? 'ADMIN' : 'ADMIN',
                  roles: userData.role === 'super_admin' ? 'ADMIN' : `ADMIN,${userData.role.toUpperCase()}`,
                  metadata: {
                    status: userData.status,
                    twoFactorEnabled: userData.twoFactorEnabled,
                  },
                });
                toast.success('Updated', 'Admin user updated successfully');
              } else {
                // Create new user
                await apiClient.post('/admin/users', {
                  email: userData.email,
                  firstName,
                  lastName,
                  phoneNumber: userData.phone,
                  activeRole: 'ADMIN',
                  roles: userData.role === 'super_admin' ? 'ADMIN' : `ADMIN,${userData.role.toUpperCase()}`,
                  metadata: {
                    status: userData.status,
                    twoFactorEnabled: userData.twoFactorEnabled,
                  },
                });
                toast.success('Created', 'Admin user created successfully');
              }

              // Reload users list
              await loadUsers(true);
              setShowCreateModal(false);
              setSelectedUser(null);
            } catch (error) {
              console.error('Failed to save admin user:', error);
              toast.error('Failed to save', error instanceof Error ? error.message : 'Unknown error');
            }
          }}
          onCancel={() => {
            setShowCreateModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}

function UsersTab({
  users,
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  hasMore,
  loadingMore,
  onLoadMore,
  onEdit,
  onStatusChange,
}: {
  users: AdminUser[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  roleFilter: string;
  setRoleFilter: (r: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onEdit: (user: AdminUser) => void;
  onStatusChange: (userId: string, status: UserStatus) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-slate-900 focus:ring-slate-900"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {Object.entries(roleConfig).map(([value, config]) => (
              <SelectItem key={value} value={value}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Security
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Last Login
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((user) => {
              const role = roleConfig[user.role];
              return (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                      <div className="text-sm text-slate-600">{user.email}</div>
                      {user.phone && (
                        <div className="text-xs text-slate-500">{user.phone}</div>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${role.color}`}>
                      {role.label}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2">
                      {user.twoFactorEnabled ? (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <Shield className="size-3" />
                          2FA
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">No 2FA</span>
                      )}
                      {user.sessions > 0 && (
                        <span className="text-xs text-slate-500">
                          {user.sessions} session{user.sessions !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                    {user.lastLogin ? (
                      <div>
                        <div>{new Date(user.lastLogin).toLocaleDateString()}</div>
                        <div className="text-xs text-slate-500">{user.lastLoginIp}</div>
                      </div>
                    ) : (
                      <span className="text-slate-400">Never</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(user)}>
                        <Edit2 className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          onStatusChange(
                            user.id,
                            user.status === "active" ? "suspended" : "active"
                          )
                        }
                      >
                        {user.status === "active" ? (
                          <Ban className="size-4 text-red-600" />
                        ) : (
                          <Unlock className="size-4 text-green-600" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <div className="mr-2 size-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}

      {users.length === 0 && !loadingMore && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-600">No users found</p>
        </div>
      )}
    </div>
  );
}

function RolesTab() {
  const [roles] = useState(Object.entries(roleConfig).map(([id, config]) => ({
    id,
    ...config,
    userCount: Math.floor(Math.random() * 10) + 1,
    permissions: Math.floor(Math.random() * 20) + 10,
  })));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <div
            key={role.id}
            className="rounded-xl border border-slate-200 bg-white p-6"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">{role.label}</h4>
                <p className="mt-1 text-sm text-slate-600">{role.description}</p>
              </div>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${role.color}`}>
                {role.id}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Users:</span>
                <span className="font-semibold text-slate-900">{role.userCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Permissions:</span>
                <span className="font-semibold text-slate-900">{role.permissions}</span>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full">
                <Edit2 className="mr-2 size-4" />
                Manage Permissions
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SessionsTab({ users }: { users: AdminUser[] }) {
  const [sessions] = useState([
    {
      id: "session-1",
      userId: "admin-1",
      userName: "Sarah Johnson",
      ipAddress: "192.168.1.100",
      device: "Chrome on macOS",
      location: "Nairobi, Kenya",
      loginTime: "2024-03-15T10:30:00Z",
      lastActivity: "2024-03-15T18:45:00Z",
      status: "active",
    },
    {
      id: "session-2",
      userId: "admin-2",
      userName: "Michael Chen",
      ipAddress: "192.168.1.101",
      device: "Firefox on Windows",
      location: "Nairobi, Kenya",
      loginTime: "2024-03-15T09:15:00Z",
      lastActivity: "2024-03-15T17:30:00Z",
      status: "active",
    },
  ]);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Device/Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                IP Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Login Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Last Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sessions.map((session) => (
              <tr key={session.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-semibold text-slate-900">{session.userName}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-900">{session.device}</div>
                  <div className="text-xs text-slate-500">{session.location}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                  {session.ipAddress}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                  {new Date(session.loginTime).toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                  {new Date(session.lastActivity).toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                    {session.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PermissionsTab() {
  const permissionCategories = [
    { category: "Events", permissions: ["view_events", "create_events", "edit_events", "delete_events", "publish_events"] },
    { category: "Tickets", permissions: ["view_tickets", "create_tickets", "edit_tickets", "void_tickets"] },
    { category: "Finance", permissions: ["view_finance", "process_refunds", "approve_payouts"] },
    { category: "Users", permissions: ["view_users", "create_users", "edit_users", "delete_users"] },
    { category: "Settings", permissions: ["view_settings", "edit_settings"] },
  ];

  const roles = Object.keys(roleConfig);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Permission Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Permission
                </th>
                {roles.map((roleId) => {
                  const role = roleConfig[roleId as AdminRole];
                  return (
                    <th
                      key={roleId}
                      className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-700"
                    >
                      {role.label}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {permissionCategories.map((cat) => (
                <>
                  <tr key={cat.category} className="bg-slate-50">
                    <td colSpan={roles.length + 1} className="px-4 py-2 text-sm font-semibold text-slate-900">
                      {cat.category}
                    </td>
                  </tr>
                  {cat.permissions.map((perm) => (
                    <tr key={perm}>
                      <td className="px-4 py-3 text-sm text-slate-700">{perm}</td>
                      {roles.map((roleId) => (
                        <td key={roleId} className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            className="size-4 rounded border-slate-300"
                            defaultChecked={
                              roleId === "super_admin" || Math.random() > 0.5
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
          <Button>
            <Save className="mr-2 size-4" />
            Save Permission Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  const config = {
    active: { label: "Active", className: "bg-green-100 text-green-700", icon: CheckCircle2 },
    inactive: { label: "Inactive", className: "bg-slate-100 text-slate-700", icon: XCircle },
    suspended: { label: "Suspended", className: "bg-red-100 text-red-700", icon: Ban },
    pending: { label: "Pending", className: "bg-amber-100 text-amber-700", icon: Clock },
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

function CreateAdminModal({
  user,
  onSave,
  onCancel,
}: {
  user?: AdminUser;
  onSave: (data: Partial<AdminUser>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    role: (user?.role || "support") as AdminRole,
    status: (user?.status || "pending") as UserStatus,
    twoFactorEnabled: user?.twoFactorEnabled || false,
  });

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{user ? "Edit Admin User" : "Create Admin User"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Full Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Email Address *</Label>
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
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value as AdminRole })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(roleConfig).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    {config.label} - {config.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as UserStatus })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.twoFactorEnabled}
              onChange={(e) =>
                setFormData({ ...formData, twoFactorEnabled: e.target.checked })
              }
              className="size-4 rounded border-slate-300"
            />
            <Label>Require Two-Factor Authentication</Label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => onSave(formData)}
            disabled={!formData.name || !formData.email}
          >
            {user ? "Update" : "Create"} Admin
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

