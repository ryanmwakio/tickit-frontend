"use client";

import { useState, useEffect } from "react";
import { Plug, CreditCard, Mail, Settings, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/contexts/toast-context";

// Helper to get organiserId
async function getUserOrganiserId(): Promise<string | null> {
  try {
    const events = await apiClient.get<Array<{ organiserId?: string }>>("/events?limit=1");
    if (events && events.length > 0 && events[0].organiserId) {
      return events[0].organiserId;
    }
    return null;
  } catch {
    return null;
  }
}

type Integration = {
  id: string;
  name: string;
  type: string;
  status: "connected" | "disconnected";
  connectedAt?: string;
};

export function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [organiserId, setOrganiserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    async function loadIntegrations() {
      try {
        setLoading(true);
        const orgId = await getUserOrganiserId();
        if (!orgId) {
          return;
        }
        setOrganiserId(orgId);

        // Get organiser to check for integrations in metadata
        const organiser = await apiClient.get<{
          id: string;
          metadata?: {
            integrations?: Integration[];
          };
        }>(`/organisers/${orgId}`);

        setIntegrations((organiser.metadata?.integrations as Integration[]) || []);
      } catch (err: unknown) {
        console.error("Failed to load integrations:", err);
      } finally {
        setLoading(false);
      }
    }

    loadIntegrations();
  }, [toast]);

  const defaultIntegrations: Integration[] = [
    { id: "payment-mpesa", name: "MPesa", type: "payment", status: "connected" },
    { id: "payment-card", name: "Card Payments", type: "payment", status: "connected" },
    { id: "marketing-email", name: "Email Marketing", type: "marketing", status: "disconnected" },
    { id: "marketing-sms", name: "SMS Gateway", type: "marketing", status: "disconnected" },
    { id: "business-accounting", name: "Accounting Software", type: "business", status: "disconnected" },
  ];

  const allIntegrations = integrations.length > 0 ? integrations : defaultIntegrations;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="mx-auto size-8 animate-spin text-slate-400" />
          <p className="mt-4 text-sm text-slate-600">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Integrations</h2>
        <p className="mt-1 text-sm text-slate-600">Connect third-party services to enhance your event management</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {allIntegrations.map((integration) => (
          <div
            key={integration.id}
            className="rounded-xl border border-slate-200 bg-white p-6 transition hover:shadow-lg"
          >
            <div className="mb-4 flex items-start justify-between">
              {integration.type === "payment" ? (
                <CreditCard className="size-8 text-green-600" />
              ) : integration.type === "marketing" ? (
                <Mail className="size-8 text-blue-600" />
              ) : (
                <Settings className="size-8 text-purple-600" />
              )}
              {integration.status === "connected" ? (
                <CheckCircle2 className="size-5 text-green-600" />
              ) : (
                <XCircle className="size-5 text-slate-400" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{integration.name}</h3>
            <p className="mt-2 text-sm text-slate-600 capitalize">{integration.type}</p>
            <div className="mt-4">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                  integration.status === "connected"
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {integration.status === "connected" ? (
                  <CheckCircle2 className="size-3" />
                ) : (
                  <XCircle className="size-3" />
                )}
                {integration.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

