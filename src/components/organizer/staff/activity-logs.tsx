"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Monitor,
  Shield,
  Download,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Lock,
  Unlock,
  Edit2,
  Trash2,
  Settings,
  FileText,
  RefreshCw,
  Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";

type ActivityType =
  | "login"
  | "logout"
  | "permission_change"
  | "data_access"
  | "data_modify"
  | "settings_change"
  | "security_event"
  | "api_access"
  | "export"
  | "delete";

type ActivityLog = {
  id: string;
  staffName: string;
  staffEmail: string;
  action: string;
  type: ActivityType;
  target: string;
  targetType: string;
  timestamp: string;
  ipAddress: string;
  device: string;
  browser?: string;
  location?: string;
  status: "success" | "failed" | "warning";
  severity: "low" | "medium" | "high" | "critical";
  metadata?: Record<string, any>;
  sessionId?: string;
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

// Note: Activity logs API endpoint is not yet available
// This component will be updated when the backend endpoint is implemented
const mockLogs: ActivityLog[] = [
  {
    id: "log-1",
    staffName: "John Doe",
    staffEmail: "john.doe@example.com",
    action: "Logged in",
    type: "login",
    target: "Dashboard",
    targetType: "page",
    timestamp: "2024-03-15T10:30:00Z",
    ipAddress: "192.168.1.100",
    device: "Chrome on macOS",
    browser: "Chrome 122.0",
    location: "Nairobi, Kenya",
    status: "success",
    severity: "low",
    sessionId: "session-12345",
  },
  {
    id: "log-2",
    staffName: "Jane Smith",
    staffEmail: "jane.smith@example.com",
    action: "Changed permissions",
    type: "permission_change",
    target: "Staff: Alice Johnson",
    targetType: "staff_member",
    timestamp: "2024-03-15T11:15:00Z",
    ipAddress: "192.168.1.101",
    device: "Firefox on Windows",
    browser: "Firefox 123.0",
    location: "Nairobi, Kenya",
    status: "success",
    severity: "high",
    metadata: {
      previousPermissions: ["read_events", "read_tickets"],
      newPermissions: ["read_events", "write_events", "read_tickets"],
    },
  },
  {
    id: "log-3",
    staffName: "Alice Johnson",
    staffEmail: "alice.johnson@example.com",
    action: "Accessed financial data",
    type: "data_access",
    target: "Finance Reports: Q1 2024",
    targetType: "report",
    timestamp: "2024-03-15T12:00:00Z",
    ipAddress: "192.168.1.102",
    device: "Safari on macOS",
    browser: "Safari 17.0",
    location: "Nairobi, Kenya",
    status: "success",
    severity: "medium",
  },
  {
    id: "log-4",
    staffName: "John Doe",
    staffEmail: "john.doe@example.com",
    action: "Created event",
    type: "data_modify",
    target: "Nairobi Music Festival 2024",
    targetType: "event",
    timestamp: "2024-03-15T14:30:00Z",
    ipAddress: "192.168.1.100",
    device: "Chrome on macOS",
    browser: "Chrome 122.0",
    location: "Nairobi, Kenya",
    status: "success",
    severity: "medium",
    metadata: {
      eventId: "event-123",
      ticketTypes: 3,
    },
  },
  {
    id: "log-5",
    staffName: "Unknown",
    staffEmail: "unknown@unknown.com",
    action: "Failed login attempt",
    type: "security_event",
    target: "Dashboard",
    targetType: "page",
    timestamp: "2024-03-15T15:00:00Z",
    ipAddress: "203.0.113.45",
    device: "Unknown",
    location: "Unknown Location",
    status: "failed",
    severity: "critical",
    metadata: {
      reason: "Invalid credentials",
      attempts: 3,
    },
  },
  {
    id: "log-6",
    staffName: "Jane Smith",
    staffEmail: "jane.smith@example.com",
    action: "Scanned ticket",
    type: "data_access",
    target: "TIX-2024-001234",
    targetType: "ticket",
    timestamp: "2024-03-15T18:45:00Z",
    ipAddress: "192.168.1.101",
    device: "Mobile App",
    location: "Venue Gate 1, Nairobi",
    status: "success",
    severity: "low",
  },
  {
    id: "log-7",
    staffName: "Alice Johnson",
    staffEmail: "alice.johnson@example.com",
    action: "Exported financial data",
    type: "export",
    target: "Settlement Report Q1 2024",
    targetType: "report",
    timestamp: "2024-03-15T16:00:00Z",
    ipAddress: "192.168.1.102",
    device: "Chrome on macOS",
    browser: "Chrome 122.0",
    location: "Nairobi, Kenya",
    status: "success",
    severity: "high",
    metadata: {
      format: "CSV",
      recordCount: 1250,
    },
  },
  {
    id: "log-8",
    staffName: "John Doe",
    staffEmail: "john.doe@example.com",
    action: "Modified organization settings",
    type: "settings_change",
    target: "Payment Gateway Configuration",
    targetType: "settings",
    timestamp: "2024-03-15T17:30:00Z",
    ipAddress: "192.168.1.100",
    device: "Chrome on macOS",
    browser: "Chrome 122.0",
    location: "Nairobi, Kenya",
    status: "success",
    severity: "critical",
    metadata: {
      setting: "payment_gateway",
      previousValue: "MPesa",
      newValue: "Stripe",
    },
  },
];

const activityTypeLabels: Record<ActivityType, string> = {
  login: "Login",
  logout: "Logout",
  permission_change: "Permission Change",
  data_access: "Data Access",
  data_modify: "Data Modification",
  settings_change: "Settings Change",
  security_event: "Security Event",
  api_access: "API Access",
  export: "Data Export",
  delete: "Delete",
};

const severityColors = {
  low: "bg-green-100 text-green-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-700",
  critical: "bg-red-100 text-red-700",
};

export function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [organiserId, setOrganiserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("7days");

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        const orgId = await getUserOrganiserId();
        if (!orgId) {
          setError("Could not determine organiser ID");
          return;
        }
        setOrganiserId(orgId);

        // TODO: When activity logs API is available, fetch from:
        // const logsData = await apiClient.get(`/organisers/${orgId}/activity-logs`);
        // For now, show empty state with info message
        setLogs([]);
      } catch (err: unknown) {
        console.error("Failed to load activity logs:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load activity logs";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    let filtered = logs;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.staffName.toLowerCase().includes(query) ||
          log.staffEmail.toLowerCase().includes(query) ||
          log.action.toLowerCase().includes(query) ||
          log.target.toLowerCase().includes(query) ||
          log.ipAddress.includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((log) => log.status === statusFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((log) => log.type === typeFilter);
    }

    if (severityFilter !== "all") {
      filtered = filtered.filter((log) => log.severity === severityFilter);
    }

    return filtered.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [logs, searchQuery, statusFilter, typeFilter, severityFilter]);

  const stats = useMemo(() => {
    return {
      total: logs.length,
      success: logs.filter((l) => l.status === "success").length,
      failed: logs.filter((l) => l.status === "failed").length,
      critical: logs.filter((l) => l.severity === "critical").length,
    };
  }, [logs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="mx-auto size-8 animate-spin text-slate-400" />
          <p className="mt-4 text-sm text-slate-600">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <FileText className="mx-auto size-8 text-red-600" />
        <p className="mt-4 text-sm font-semibold text-red-900">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info banner */}
      {logs.length === 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 size-5 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-blue-900">Activity Logs Coming Soon</p>
              <p className="mt-1 text-sm text-blue-700">
                Activity logging functionality is being implemented. This will track staff actions, access, and security events.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Activity Logs</h3>
          <p className="mt-1 text-sm text-slate-600">
            Comprehensive audit trail of all staff activities and access attempts
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 size-4" />
          Export Logs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <FileText className="size-4 text-blue-600" />
            <span>Total Events</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CheckCircle2 className="size-4 text-green-600" />
            <span>Successful</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.success}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <XCircle className="size-4 text-red-600" />
            <span>Failed</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.failed}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <AlertTriangle className="size-4 text-amber-600" />
            <span>Critical</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.critical}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by staff, action, target, or IP address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-slate-900 focus:ring-slate-900"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(activityTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {filteredLogs.map((log) => (
          <LogCard key={log.id} log={log} />
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <FileText className="mx-auto size-12 text-slate-300" />
          <p className="mt-4 text-lg font-semibold text-slate-900">No activity logs found</p>
          <p className="mt-2 text-sm text-slate-600">
            Activity logs will appear here as staff members perform actions
          </p>
        </div>
      )}
    </div>
  );
}

function LogCard({ log }: { log: ActivityLog }) {
  const [expanded, setExpanded] = useState(false);

  const getActionIcon = () => {
    switch (log.type) {
      case "login":
      case "logout":
        return <Shield className="size-4" />;
      case "permission_change":
        return <Settings className="size-4" />;
      case "data_access":
        return <Eye className="size-4" />;
      case "data_modify":
        return <Edit2 className="size-4" />;
      case "settings_change":
        return <Settings className="size-4" />;
      case "security_event":
        return <AlertTriangle className="size-4" />;
      case "delete":
        return <Trash2 className="size-4" />;
      default:
        return <FileText className="size-4" />;
    }
  };

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-4 transition hover:shadow-md ${
        log.severity === "critical" ? "border-red-200 bg-red-50/50" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-lg p-2 ${
                log.status === "success"
                  ? "bg-green-100 text-green-700"
                  : log.status === "failed"
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {getActionIcon()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">{log.staffName}</span>
                <span className="text-sm text-slate-600">{log.action}</span>
                <span className="font-semibold text-slate-900">{log.target}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {new Date(log.timestamp).toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Monitor className="size-3" />
                  {log.device}
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="size-3" />
                  {log.ipAddress}
                </span>
                {log.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    {log.location}
                  </span>
                )}
                <span
                  className={`rounded-full px-2 py-1 font-semibold ${severityColors[log.severity]}`}
                >
                  {log.severity.toUpperCase()}
                </span>
                <span
                  className={`rounded-full px-2 py-1 font-semibold ${
                    log.status === "success"
                      ? "bg-green-100 text-green-700"
                      : log.status === "failed"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {log.status}
                </span>
              </div>
            </div>
          </div>

          {expanded && log.metadata && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Details
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Type:</span>
                  <span className="font-semibold text-slate-900">
                    {activityTypeLabels[log.type]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Target Type:</span>
                  <span className="font-semibold text-slate-900">{log.targetType}</span>
                </div>
                {log.browser && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Browser:</span>
                    <span className="font-semibold text-slate-900">{log.browser}</span>
                  </div>
                )}
                {log.sessionId && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Session:</span>
                    <span className="font-mono text-xs text-slate-900">{log.sessionId}</span>
                  </div>
                )}
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <div className="mt-3 border-t border-slate-200 pt-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Metadata
                    </div>
                    <pre className="mt-2 overflow-auto rounded bg-white p-2 text-xs">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="ml-4"
        >
          {expanded ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
