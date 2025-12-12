"use client";

import { useState } from "react";
import { RevenueOverview } from "./finance/revenue-overview";
import { WalletPayouts } from "./finance/wallet-payouts";
import { Transactions } from "./finance/transactions";
import {
  DollarSign,
  Wallet,
  FileText,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type TabId = "revenue" | "wallet" | "transactions";

export function FinanceSettlement() {
  const [activeTab, setActiveTab] = useState<TabId>("revenue");

  const tabs = [
    {
      id: "revenue" as TabId,
      label: "Revenue Overview",
      icon: DollarSign,
      description: "Gross/net revenue, fees, VAT, and payment breakdown",
    },
    {
      id: "wallet" as TabId,
      label: "Wallet & Payouts",
      icon: Wallet,
      description: "Organizer wallet, withdrawal requests, and settlement",
    },
    {
      id: "transactions" as TabId,
      label: "Transactions",
      icon: FileText,
      description: "Transaction logs, refunds, and dispute management",
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
          <TabsContent value="revenue" className="mt-0">
            <RevenueOverview />
          </TabsContent>

          <TabsContent value="wallet" className="mt-0">
            <WalletPayouts />
          </TabsContent>

          <TabsContent value="transactions" className="mt-0">
            <Transactions />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

