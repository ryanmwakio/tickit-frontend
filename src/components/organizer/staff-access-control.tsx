"use client";

import { useState } from "react";
import { StaffManagement } from "./staff/staff-management";
import { RolePermissions } from "./staff/role-permissions";
import { ActivityLogs } from "./staff/activity-logs";
import { TeamsDepartments } from "./staff/teams-departments";
import {
  Users,
  Shield,
  FileText,
  Building2,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type TabId = "staff" | "roles" | "teams" | "logs";

export function StaffAccessControl() {
  const [activeTab, setActiveTab] = useState<TabId>("staff");

  const tabs = [
    {
      id: "staff" as TabId,
      label: "Staff Management",
      icon: Users,
      description: "Invite, manage, and assign staff members",
    },
    {
      id: "roles" as TabId,
      label: "Roles & Permissions",
      icon: Shield,
      description: "Configure roles and access permissions",
    },
    {
      id: "teams" as TabId,
      label: "Teams & Departments",
      icon: Building2,
      description: "Organize staff into departments",
    },
    {
      id: "logs" as TabId,
      label: "Activity Logs",
      icon: FileText,
      description: "View staff activity and access logs",
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
          <TabsContent value="staff" className="mt-0">
            <StaffManagement />
          </TabsContent>

          <TabsContent value="roles" className="mt-0">
            <RolePermissions />
          </TabsContent>

          <TabsContent value="teams" className="mt-0">
            <TeamsDepartments />
          </TabsContent>

          <TabsContent value="logs" className="mt-0">
            <ActivityLogs />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

