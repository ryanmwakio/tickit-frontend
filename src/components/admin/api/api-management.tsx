"use client";

import { useState } from "react";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Activity,
  Globe,
  Settings,
  Download,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type APIKey = {
  id: string;
  name: string;
  key: string;
  organizerId?: string;
  organizerName?: string;
  scopes: string[];
  rateLimit: number;
  createdAt: string;
  lastUsed?: string;
  status: "active" | "revoked";
};

const mockKeys: APIKey[] = [
  {
    id: "key-1",
    name: "Production Key",
    key: "sk_live_abc123...",
    organizerId: "org-1",
    organizerName: "Flamingo Live",
    scopes: ["read:events", "write:events", "read:tickets"],
    rateLimit: 1000,
    createdAt: "2024-01-01",
    lastUsed: "2024-03-15T10:00:00Z",
    status: "active",
  },
];

export function APIManagement() {
  const [keys, setKeys] = useState<APIKey[]>(mockKeys);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"keys" | "webhooks" | "usage">("keys");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="keys">API Keys</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="usage">Usage Logs</TabsTrigger>
          </TabsList>
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 size-4" />
            Create Key
          </Button>
        </div>

        <TabsContent value="keys" className="mt-6">
          <div className="space-y-4">
            {keys.map((key) => (
              <div
                key={key.id}
                className="rounded-xl border border-slate-200 bg-white p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-900">{key.name}</h3>
                      <StatusBadge status={key.status} />
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                      Key: {key.key}
                    </div>
                    {key.organizerName && (
                      <div className="mt-1 text-sm text-slate-600">
                        Organizer: {key.organizerName}
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {key.scopes.map((scope) => (
                        <span
                          key={scope}
                          className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700"
                        >
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Copy className="size-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="size-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-6">
          <WebhooksTab />
        </TabsContent>

        <TabsContent value="usage" className="mt-6">
          <UsageLogsTab keys={keys} />
        </TabsContent>
      </Tabs>

      {showCreateModal && (
        <CreateKeyModal
          onSave={(keyData) => {
            setKeys([
              ...keys,
              {
                ...keyData,
                id: `key-${Date.now()}`,
                createdAt: new Date().toISOString().split("T")[0],
                status: "active" as const,
              },
            ]);
            setShowCreateModal(false);
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: "active" | "revoked" }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        status === "active"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {status}
    </span>
  );
}

function CreateKeyModal({
  onSave,
  onCancel,
}: {
  onSave: (data: Partial<APIKey>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [organizerId, setOrganizerId] = useState("");
  const [rateLimit, setRateLimit] = useState("1000");

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Key Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Rate Limit (requests/hour)</Label>
            <Input
              type="number"
              value={rateLimit}
              onChange={(e) => setRateLimit(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => onSave({ name, rateLimit: parseInt(rateLimit) })}>
            Create Key
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WebhooksTab() {
  const [webhooks] = useState([
    {
      id: "wh-1",
      url: "https://example.com/webhook",
      events: ["ticket.purchased", "order.completed"],
      status: "active",
      lastTriggered: "2024-03-15T10:30:00Z",
      failures: 2,
    },
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Webhooks</h3>
        <Button size="sm">
          <Plus className="mr-2 size-4" />
          Add Webhook
        </Button>
      </div>
      <div className="space-y-3">
        {webhooks.map((webhook) => (
          <div
            key={webhook.id}
            className="rounded-xl border border-slate-200 bg-white p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-900">{webhook.url}</span>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      webhook.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {webhook.status}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {webhook.events.map((event) => (
                    <span
                      key={event}
                      className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700"
                    >
                      {event}
                    </span>
                  ))}
                </div>
                <div className="mt-2 text-sm text-slate-600">
                  Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}
                  {webhook.failures > 0 && (
                    <span className="ml-2 text-red-600">({webhook.failures} failures)</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Settings className="size-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="size-4 text-red-600" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsageLogsTab({ keys }: { keys: APIKey[] }) {
  const [logs] = useState([
    {
      id: "log-1",
      keyName: "Production Key",
      endpoint: "/api/v1/events",
      method: "GET",
      status: 200,
      timestamp: "2024-03-15T10:30:00Z",
      responseTime: 142,
    },
    {
      id: "log-2",
      keyName: "Production Key",
      endpoint: "/api/v1/tickets",
      method: "POST",
      status: 201,
      timestamp: "2024-03-15T10:31:00Z",
      responseTime: 89,
    },
  ]);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                API Key
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Endpoint
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Response Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">
                  {log.keyName}
                </td>
                <td className="px-6 py-4 text-sm font-mono text-slate-600">{log.endpoint}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      log.method === "GET"
                        ? "bg-blue-100 text-blue-700"
                        : log.method === "POST"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {log.method}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      log.status === 200 || log.status === 201
                        ? "bg-green-100 text-green-700"
                        : log.status >= 400
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {log.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{log.responseTime}ms</td>
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

