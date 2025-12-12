"use client";

import { useState, useEffect } from "react";
import { MessageSquare, FileText, BookOpen, Plus, RefreshCw, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { useToast } from "@/contexts/toast-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

type SupportTicket = {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  organiserId: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
};

export function SupportHelpDesk() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [organiserId, setOrganiserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const toast = useToast();

  useEffect(() => {
    async function loadTickets() {
      try {
        setLoading(true);
        const orgId = await getUserOrganiserId();
        if (!orgId) {
          setError("Could not determine organiser ID");
          return;
        }
        setOrganiserId(orgId);

        const data = await apiClient.get<SupportTicket[]>(`/support-tickets?organiserId=${orgId}`);
        setTickets(data || []);
      } catch (err: unknown) {
        console.error("Failed to load support tickets:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load support tickets";
        setError(errorMessage);
        toast.error("Failed to load support tickets", errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="mx-auto size-8 animate-spin text-slate-400" />
          <p className="mt-4 text-sm text-slate-600">Loading support tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <MessageSquare className="mx-auto size-8 text-red-600" />
        <p className="mt-4 text-sm font-semibold text-red-900">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Support & Help Desk</h2>
          <p className="mt-1 text-sm text-slate-600">Manage customer support requests and tickets</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 size-4" />
          Create Ticket
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <MessageSquare className="mb-4 size-8 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">Support Tickets</h3>
          <p className="mt-2 text-sm text-slate-600">
            {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"} total
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS" || t.status === "PENDING_CUSTOMER").length} open
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <FileText className="mb-4 size-8 text-green-600" />
          <h3 className="text-lg font-semibold text-slate-900">In-Portal Chat</h3>
          <p className="mt-2 text-sm text-slate-600">Real-time customer communication</p>
          <p className="mt-1 text-xs text-slate-500">Available via chat widget</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <BookOpen className="mb-4 size-8 text-purple-600" />
          <h3 className="text-lg font-semibold text-slate-900">Knowledge Base</h3>
          <p className="mt-2 text-sm text-slate-600">FAQs and help articles</p>
          <p className="mt-1 text-xs text-slate-500">Coming soon</p>
        </div>
      </div>

      {tickets.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4">
            <h3 className="text-lg font-semibold text-slate-900">Recent Tickets</h3>
          </div>
          <div className="divide-y divide-slate-200">
            {tickets.slice(0, 10).map((ticket) => (
              <div key={ticket.id} className="p-4 hover:bg-slate-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{ticket.subject}</h4>
                    <p className="mt-1 text-sm text-slate-600 line-clamp-2">{ticket.description}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-4 flex flex-col items-end gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                        ticket.status === "RESOLVED" || ticket.status === "CLOSED"
                          ? "bg-green-100 text-green-700"
                          : ticket.status === "OPEN"
                          ? "bg-blue-100 text-blue-700"
                          : ticket.status === "IN_PROGRESS"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {ticket.status === "RESOLVED" || ticket.status === "CLOSED" ? (
                        <CheckCircle2 className="size-3" />
                      ) : ticket.status === "OPEN" ? (
                        <AlertCircle className="size-3" />
                      ) : (
                        <Clock className="size-3" />
                      )}
                      {ticket.status.replace("_", " ")}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        ticket.priority === "HIGH"
                          ? "bg-red-100 text-red-700"
                          : ticket.priority === "MEDIUM"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateTicketModal
          organiserId={organiserId}
          onSave={async (ticketData) => {
            if (!organiserId) return;
            try {
              const newTicket = await apiClient.post<SupportTicket>("/support-tickets", {
                ...ticketData,
                organiserId,
              });
              setTickets([newTicket, ...tickets]);
              setShowCreateModal(false);
              toast.success("Ticket created", "Support ticket has been created successfully");
            } catch (err: unknown) {
              console.error("Failed to create ticket:", err);
              const errorMessage = err instanceof Error ? err.message : "Failed to create ticket";
              toast.error("Failed to create ticket", errorMessage);
            }
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

function CreateTicketModal({
  organiserId,
  onSave,
  onCancel,
}: {
  organiserId: string | null;
  onSave: (data: {
    subject: string;
    description: string;
    priority: string;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "MEDIUM",
  });

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Support Ticket</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Subject *</Label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="mt-1"
              placeholder="Issue summary"
            />
          </div>
          <div>
            <Label>Priority *</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Description *</Label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-slate-900 focus:ring-slate-900"
              rows={5}
              placeholder="Describe the issue in detail..."
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => onSave(formData)}
            disabled={!formData.subject || !formData.description}
          >
            Create Ticket
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

