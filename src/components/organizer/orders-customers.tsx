"use client";

import { useState } from "react";
import { CustomerProfiles } from "./orders/customer-profiles";
import { OrderWorkbench } from "./orders/order-workbench";
import { RefundManagement } from "./orders/refund-management";
import {
  Users,
  Search,
  DollarSign,
  FileText,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type TabId = "customers" | "orders" | "refunds";

export function OrdersCustomers() {
  const [activeTab, setActiveTab] = useState<TabId>("customers");

  const tabs = [
    {
      id: "customers" as TabId,
      label: "Customer Profiles",
      icon: Users,
      description: "Unified customer timelines and profiles",
    },
    {
      id: "orders" as TabId,
      label: "Order Workbench",
      icon: Search,
      description: "Search, view, and manage all orders",
    },
    {
      id: "refunds" as TabId,
      label: "Refunds & Disputes",
      icon: DollarSign,
      description: "Manage refunds and payment disputes",
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
          <TabsContent value="customers" className="mt-0">
            <CustomerProfiles />
          </TabsContent>

          <TabsContent value="orders" className="mt-0">
            <OrderWorkbench />
          </TabsContent>

          <TabsContent value="refunds" className="mt-0">
            <RefundManagement />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

