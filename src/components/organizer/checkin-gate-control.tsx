"use client";

import { useState, useEffect } from "react";
import { CheckInDashboard } from "./checkin/checkin-dashboard";
import { DeviceManagement } from "./checkin/device-management";
import { GateManagement } from "./checkin/gate-management";
import {
  Activity,
  Smartphone,
  DoorOpen,
  TrendingUp,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type TabId = "dashboard" | "devices" | "gates";

export function CheckInGateControl() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  const tabs = [
    {
      id: "dashboard" as TabId,
      label: "Real-time Dashboard",
      icon: Activity,
      description: "Live scan monitoring and gate throughput",
    },
    {
      id: "devices" as TabId,
      label: "Device Management",
      icon: Smartphone,
      description: "Register and manage scanning devices",
    },
    {
      id: "gates" as TabId,
      label: "Gate Management",
      icon: DoorOpen,
      description: "Configure gates and assign staff",
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
          <TabsContent value="dashboard" className="mt-0">
            <CheckInDashboard />
          </TabsContent>

          <TabsContent value="devices" className="mt-0">
            <DeviceManagement />
          </TabsContent>

          <TabsContent value="gates" className="mt-0">
            <GateManagement />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

