"use client";

import { useState } from "react";
import { TicketTypesManager } from "./tickets/ticket-types-manager";
import { TicketInventory } from "./tickets/ticket-inventory";
import { TicketOperations } from "./tickets/ticket-operations";
import { TicketSales } from "./tickets/ticket-sales";
import {
  Ticket,
  Package,
  Settings,
  TrendingUp,
  FileText,
  Search,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type TabId = "inventory" | "types" | "sales" | "operations";

export function TicketManagement() {
  const [activeTab, setActiveTab] = useState<TabId>("inventory");

  const tabs = [
    {
      id: "inventory" as TabId,
      label: "Inventory Overview",
      icon: Package,
      description: "Real-time ticket availability and sales tracking",
    },
    {
      id: "types" as TabId,
      label: "Ticket Types",
      icon: Ticket,
      description: "Manage ticket types, pricing, and settings",
    },
    {
      id: "sales" as TabId,
      label: "Sales & Orders",
      icon: TrendingUp,
      description: "View and manage all ticket sales",
    },
    {
      id: "operations" as TabId,
      label: "Operations",
      icon: Settings,
      description: "Manual tickets, void, resend, and transfers",
    },
  ];

  return (
    <div className="space-y-8">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabId)}
        className="space-y-6"
      >
        <TabsList className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-transparent p-0 h-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-6 py-4 text-sm font-semibold transition rounded-none data-[state=active]:shadow-none ${
                  activeTab === tab.id
                    ? "border-slate-900 text-slate-900 bg-transparent"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="size-4" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="space-y-6">
          <TabsContent value="inventory" className="mt-0">
            <TicketInventory />
          </TabsContent>

          <TabsContent value="types" className="mt-0">
            <TicketTypesManager />
          </TabsContent>

          <TabsContent value="sales" className="mt-0">
            <TicketSales />
          </TabsContent>

          <TabsContent value="operations" className="mt-0">
            <TicketOperations />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

