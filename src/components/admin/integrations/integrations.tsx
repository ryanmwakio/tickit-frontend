"use client";

import { useState } from "react";
import {
  Plug,
  CheckCircle2,
  XCircle,
  Settings,
  Mail,
  MessageSquare,
  BarChart3,
  CreditCard,
  Code,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Integration = {
  id: string;
  name: string;
  category: "messaging" | "analytics" | "finance" | "marketing";
  status: "connected" | "disconnected" | "pending";
  description: string;
  icon: any;
};

const mockIntegrations: Integration[] = [
  {
    id: "int-1",
    name: "Twilio",
    category: "messaging",
    status: "connected",
    description: "SMS and voice messaging",
    icon: MessageSquare,
  },
  {
    id: "int-2",
    name: "Google Analytics",
    category: "analytics",
    status: "connected",
    description: "Website and event analytics",
    icon: BarChart3,
  },
  {
    id: "int-3",
    name: "Stripe",
    category: "finance",
    status: "disconnected",
    description: "Payment processing",
    icon: CreditCard,
  },
];

export function AdminIntegrations() {
  const [integrations] = useState<Integration[]>(mockIntegrations);
  const [activeTab, setActiveTab] = useState<string>("all");

  const categories = ["all", "messaging", "analytics", "finance", "marketing"];

  const filteredIntegrations =
    activeTab === "all"
      ? integrations
      : integrations.filter((i) => i.category === activeTab);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredIntegrations.map((integration) => {
              const Icon = integration.icon;
              return (
                <div
                  key={integration.id}
                  className="rounded-xl border border-slate-200 bg-white p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-slate-100 p-2">
                        <Icon className="size-5 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {integration.name}
                        </h3>
                        <p className="text-sm text-slate-600">{integration.description}</p>
                      </div>
                    </div>
                    <StatusBadge status={integration.status} />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="mr-2 size-4" />
                      Configure
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    connected: {
      label: "Connected",
      className: "bg-green-100 text-green-700",
      icon: CheckCircle2,
    },
    disconnected: {
      label: "Disconnected",
      className: "bg-slate-100 text-slate-700",
      icon: XCircle,
    },
    pending: {
      label: "Pending",
      className: "bg-amber-100 text-amber-700",
      icon: Clock,
    },
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

