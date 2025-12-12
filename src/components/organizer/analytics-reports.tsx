"use client";

import { useState } from "react";
import { SalesAnalytics } from "./analytics/sales-analytics";
import { CustomerInsights } from "./analytics/customer-insights";
import { EventPerformance } from "./analytics/event-performance";
import { FinanceReports } from "./analytics/finance-reports";
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type TabId = "sales" | "customers" | "events" | "finance";

export function AnalyticsReports() {
  const [activeTab, setActiveTab] = useState<TabId>("sales");

  const tabs = [
    {
      id: "sales" as TabId,
      label: "Sales Analytics",
      icon: BarChart3,
      description: "Real-time sales tracking and conversion funnels",
    },
    {
      id: "customers" as TabId,
      label: "Customer Insights",
      icon: Users,
      description: "Demographic and behavioral analytics",
    },
    {
      id: "events" as TabId,
      label: "Event Performance",
      icon: TrendingUp,
      description: "Check-in rates and marketing attribution",
    },
    {
      id: "finance" as TabId,
      label: "Finance Reports",
      icon: FileText,
      description: "Settlement statements and tax breakdowns",
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
          <TabsContent value="sales" className="mt-0">
            <SalesAnalytics />
          </TabsContent>

          <TabsContent value="customers" className="mt-0">
            <CustomerInsights />
          </TabsContent>

          <TabsContent value="events" className="mt-0">
            <EventPerformance />
          </TabsContent>

          <TabsContent value="finance" className="mt-0">
            <FinanceReports />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
