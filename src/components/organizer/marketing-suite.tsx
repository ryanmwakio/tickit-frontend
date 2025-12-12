"use client";

import { useState } from "react";
import { PromoCodes } from "./marketing/promo-codes";
import { Affiliates } from "./marketing/affiliates";
import { Campaigns } from "./marketing/campaigns";
import { Tag, Users, Megaphone } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type TabId = "promo" | "affiliates" | "campaigns";

export function MarketingSuite() {
  const [activeTab, setActiveTab] = useState<TabId>("promo");

  const tabs = [
    { id: "promo" as TabId, label: "Promo Codes", icon: Tag },
    { id: "affiliates" as TabId, label: "Affiliates", icon: Users },
    { id: "campaigns" as TabId, label: "Campaigns", icon: Megaphone },
  ];

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabId)} className="space-y-6">
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
          <TabsContent value="promo" className="mt-0"><PromoCodes /></TabsContent>
          <TabsContent value="affiliates" className="mt-0"><Affiliates /></TabsContent>
          <TabsContent value="campaigns" className="mt-0"><Campaigns /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

