"use client";

import { useState, useMemo } from "react";
import {
  Shield,
  AlertTriangle,
  Lock,
  Eye,
  Search,
  Download,
  Ban,
  CheckCircle2,
  XCircle,
  Activity,
  FileText,
  Users,
  Plus,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type FraudAlert = {
  id: string;
  type: "duplicate_ticket" | "suspicious_ip" | "velocity_check" | "device_fingerprint" | "payment_fraud";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  entity: string;
  timestamp: string;
  status: "open" | "investigating" | "resolved" | "false_positive";
};

const mockAlerts: FraudAlert[] = [
  {
    id: "alert-1",
    type: "duplicate_ticket",
    severity: "high",
    description: "Same ticket scanned multiple times",
    entity: "TIX-2024-001234",
    timestamp: "2024-03-15T18:45:00Z",
    status: "open",
  },
  {
    id: "alert-2",
    type: "suspicious_ip",
    severity: "medium",
    description: "Multiple login attempts from suspicious IP",
    entity: "203.0.113.45",
    timestamp: "2024-03-15T15:00:00Z",
    status: "investigating",
  },
];

export function FraudPreventionSecurity() {
  const [alerts, setAlerts] = useState<FraudAlert[]>(mockAlerts);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"alerts" | "blacklist" | "audit">("alerts");

  const stats = useMemo(() => {
    return {
      total: alerts.length,
      open: alerts.filter((a) => a.status === "open").length,
      critical: alerts.filter((a) => a.severity === "critical").length,
      resolved: alerts.filter((a) => a.status === "resolved").length,
    };
  }, [alerts]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Total Alerts</div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Open</div>
          <p className="mt-2 text-2xl font-bold text-red-600">{stats.open}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Critical</div>
          <p className="mt-2 text-2xl font-bold text-red-600">{stats.critical}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Resolved</div>
          <p className="mt-2 text-2xl font-bold text-green-600">{stats.resolved}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="alerts">Fraud Alerts</TabsTrigger>
            <TabsTrigger value="blacklist">Blacklist</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm">
            <Download className="mr-2 size-4" />
            Export
          </Button>
        </div>

        <TabsContent value="alerts" className="mt-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm"
                />
              </div>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="blacklist" className="mt-6">
          <BlacklistTab />
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <AuditLogsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AlertCard({ alert }: { alert: FraudAlert }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <SeverityBadge severity={alert.severity} />
            <span className="text-sm font-semibold text-slate-900">{alert.description}</span>
          </div>
          <div className="mt-2 text-sm text-slate-600">Entity: {alert.entity}</div>
          <div className="mt-1 text-xs text-slate-500">
            {new Date(alert.timestamp).toLocaleString()}
          </div>
        </div>
        <StatusBadge status={alert.status} />
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const config = {
    critical: { label: "Critical", className: "bg-red-100 text-red-700" },
    high: { label: "High", className: "bg-orange-100 text-orange-700" },
    medium: { label: "Medium", className: "bg-amber-100 text-amber-700" },
    low: { label: "Low", className: "bg-blue-100 text-blue-700" },
  };
  const statusConfig = config[severity as keyof typeof config];
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusConfig.className}`}
    >
      {statusConfig.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    open: { label: "Open", className: "bg-red-100 text-red-700", icon: AlertTriangle },
    investigating: { label: "Investigating", className: "bg-amber-100 text-amber-700", icon: Eye },
    resolved: { label: "Resolved", className: "bg-green-100 text-green-700", icon: CheckCircle2 },
    false_positive: { label: "False Positive", className: "bg-slate-100 text-slate-700", icon: XCircle },
  };
  const statusConfig = config[status as keyof typeof config];
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

function BlacklistTab() {
  const [blacklist] = useState([
    { id: "bl-1", type: "email", value: "fraud@example.com", reason: "Chargeback fraud", addedAt: "2024-03-01" },
    { id: "bl-2", type: "phone", value: "+254 700 999 999", reason: "Ticket scalping", addedAt: "2024-03-05" },
    { id: "bl-3", type: "ip", value: "203.0.113.0/24", reason: "Suspicious activity", addedAt: "2024-03-10" },
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Blacklist Database</h3>
        <Button size="sm">
          <Plus className="mr-2 size-4" />
          Add Entry
        </Button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Reason
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Added
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {blacklist.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                    {item.type.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-mono text-slate-900">{item.value}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.reason}</td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(item.addedAt).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <Button variant="outline" size="sm">
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AuditLogsTab() {
  const [logs] = useState([
    {
      id: "log-1",
      action: "Modified transaction",
      actor: "Sarah Johnson",
      target: "TXN-12345",
      timestamp: "2024-03-15T10:30:00Z",
      changes: { status: { from: "pending", to: "success" } },
    },
    {
      id: "log-2",
      action: "Blacklisted IP",
      actor: "Michael Chen",
      target: "203.0.113.45",
      timestamp: "2024-03-15T09:15:00Z",
      changes: {},
    },
  ]);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Actor
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Target
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Changes
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900">
                  {log.action}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{log.actor}</td>
                <td className="px-6 py-4 text-sm font-mono text-slate-600">{log.target}</td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {Object.keys(log.changes).length > 0 ? (
                    <pre className="text-xs">
                      {JSON.stringify(log.changes, null, 2)}
                    </pre>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

