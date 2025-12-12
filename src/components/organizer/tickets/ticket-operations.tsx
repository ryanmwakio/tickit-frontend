"use client";

import { useState } from "react";
import {
  Plus,
  Send,
  XCircle,
  RefreshCw,
  Copy,
  Download,
  User,
  Mail,
  Phone,
  Ticket,
  FileText,
  AlertCircle,
  CheckCircle2,
  Search,
  Filter,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { transferTicket, voidTicket, getTicketByNumber, resendTickets } from "@/lib/tickets-api";
import { getOrders } from "@/lib/tickets-api";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api";

// Helper to get organiserId
async function getUserOrganiserId(userId: string): Promise<string | null> {
  try {
    const response = await apiClient.get<any>("/events?limit=1");
    const events = Array.isArray(response) ? response : (response.data || []);
    if (events.length > 0 && events[0].organiserId) {
      return events[0].organiserId;
    }
    return null;
  } catch {
    return null;
  }
}

type OperationType = "manual" | "void" | "resend" | "transfer" | "complimentary";

const operationsConfig: Array<{
  type: OperationType;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}> = [
  {
    type: "manual",
    label: "Issue Manual Ticket",
    description: "Create and assign tickets manually",
    icon: Plus,
    color: "bg-blue-500",
  },
  {
    type: "complimentary",
    label: "Complimentary Tickets",
    description: "Issue free tickets for sponsors or guests",
    icon: Ticket,
    color: "bg-green-500",
  },
  {
    type: "void",
    label: "Void Ticket",
    description: "Cancel and invalidate a ticket",
    icon: XCircle,
    color: "bg-red-500",
  },
  {
    type: "resend",
    label: "Resend Ticket",
    description: "Resend ticket via email or SMS",
    icon: Send,
    color: "bg-purple-500",
  },
  {
    type: "transfer",
    label: "Transfer Ticket",
    description: "Transfer ticket ownership to another customer",
    icon: RefreshCw,
    color: "bg-amber-500",
  },
];

type TicketOperation = {
  id: string;
  ticketId: string;
  ticketNumber: string;
  operationType: OperationType;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventName: string;
  ticketType: string;
  performedBy: string;
  performedAt: string;
  reason: string;
  status: "pending" | "completed" | "failed";
};

export function TicketOperations() {
  const [activeOperation, setActiveOperation] = useState<OperationType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [operations, setOperations] = useState<TicketOperation[]>([]);


  const filteredOperations = operations.filter((op) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        op.ticketNumber.toLowerCase().includes(query) ||
        op.customerName.toLowerCase().includes(query) ||
        op.customerEmail.toLowerCase().includes(query) ||
        op.eventName.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Ticket Operations</h3>
        <p className="mt-1 text-sm text-slate-600">
          Perform manual operations on tickets including issuing, voiding, resending, and transfers
        </p>
      </div>

      {/* Operation Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {operationsConfig.map((config) => {
          const Icon = config.icon;
          return (
            <button
              key={config.type}
              onClick={() => setActiveOperation(config.type)}
              className="group rounded-xl border-2 border-slate-200 bg-white p-6 text-left transition hover:border-slate-900 hover:shadow-lg"
            >
              <div className={`mb-4 inline-flex rounded-lg ${config.color} p-3 text-white`}>
                <Icon className="size-5" />
              </div>
              <h4 className="mb-1 text-lg font-semibold text-slate-900">{config.label}</h4>
              <p className="text-sm text-slate-600">{config.description}</p>
            </button>
          );
        })}
      </div>

      {/* Operation Forms */}
      {activeOperation && (
        <div className="rounded-xl border-2 border-slate-900 bg-white p-6">
          <OperationForm
            operationType={activeOperation}
            onComplete={(operation) => {
              setOperations([...operations, operation]);
              setActiveOperation(null);
            }}
            onCancel={() => setActiveOperation(null)}
          />
        </div>
      )}

      {/* Operations History */}
      {operations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Operations History</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Search operations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-slate-900 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredOperations.map((operation) => (
              <div
                key={operation.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {operation.operationType.toUpperCase()}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        Ticket #{operation.ticketNumber}
                      </span>
                      {operation.status === "completed" && (
                        <CheckCircle2 className="size-4 text-green-600" />
                      )}
                      {operation.status === "pending" && (
                        <AlertCircle className="size-4 text-amber-600" />
                      )}
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{operation.eventName}</p>
                    <p className="text-sm text-slate-600">{operation.ticketType}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                      <span>{operation.customerName}</span>
                      <span>{operation.customerEmail}</span>
                      <span>{operation.performedAt}</span>
                    </div>
                    {operation.reason && (
                      <p className="mt-2 text-sm text-slate-600">
                        <span className="font-semibold">Reason:</span> {operation.reason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OperationForm({
  operationType,
  onComplete,
  onCancel,
}: {
  operationType: OperationType;
  onComplete: (operation: TicketOperation) => void;
  onCancel: () => void;
}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    ticketId: "",
    ticketNumber: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    eventName: "",
    ticketType: "",
    reason: "",
    newCustomerName: "",
    newCustomerEmail: "",
    newCustomerPhone: "",
    deliveryMethod: "email" as "email" | "sms",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (operationType === "void") {
        if (!formData.ticketNumber) {
          setError("Ticket number is required");
          setLoading(false);
          return;
        }
        
        // Get ticket by number first
        const ticket = await getTicketByNumber(formData.ticketNumber);
        await voidTicket(ticket.id, formData.reason || "Voided by organizer");
        
        const operation: TicketOperation = {
          id: `op-${Date.now()}`,
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          operationType,
          customerName: ticket.attendeeName || "Unknown",
          customerEmail: ticket.attendeeEmail || "",
          customerPhone: ticket.attendeePhone || "",
          eventName: formData.eventName,
          ticketType: formData.ticketType,
          performedBy: user?.email || "Current User",
          performedAt: new Date().toISOString(),
          reason: formData.reason,
          status: "completed",
        };
        onComplete(operation);
      } else if (operationType === "transfer") {
        if (!formData.ticketNumber) {
          setError("Ticket number is required");
          setLoading(false);
          return;
        }
        
        const ticket = await getTicketByNumber(formData.ticketNumber);
        await transferTicket(ticket.id, {
          email: formData.newCustomerEmail || undefined,
          phoneNumber: formData.newCustomerPhone || undefined,
        });
        
        const operation: TicketOperation = {
          id: `op-${Date.now()}`,
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          operationType,
          customerName: formData.newCustomerName,
          customerEmail: formData.newCustomerEmail,
          customerPhone: formData.newCustomerPhone,
          eventName: formData.eventName,
          ticketType: formData.ticketType,
          performedBy: user?.email || "Current User",
          performedAt: new Date().toISOString(),
          reason: formData.reason,
          status: "completed",
        };
        onComplete(operation);
      } else if (operationType === "resend") {
        if (!formData.ticketNumber) {
          setError("Ticket number is required");
          setLoading(false);
          return;
        }
        
        const ticket = await getTicketByNumber(formData.ticketNumber);
        // Get order ID from ticket (would need to fetch order)
        const organiserId = await getUserOrganiserId(user?.id || "");
        if (organiserId) {
          // Fetch orders with pagination
          let allOrders: any[] = [];
          let currentPage = 1;
          const pageLimit = 100; // API max limit
          
          while (true) {
            const ordersResponse = await getOrders({ 
              organiserId, 
              page: currentPage,
              limit: pageLimit,
            });
            
            allOrders = [...allOrders, ...ordersResponse.data];
            
            if (ordersResponse.data.length < pageLimit || currentPage >= ordersResponse.totalPages) {
              break;
            }
            
            currentPage++;
          }
          
          const orders = { data: allOrders };
          const order = orders.data.find(o => 
            o.items?.some(item => 
              item.tickets?.some(t => t.id === ticket.id)
            )
          );
          
          if (order) {
            await resendTickets(order.id, formData.deliveryMethod);
          }
        }
        
        const operation: TicketOperation = {
          id: `op-${Date.now()}`,
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          operationType,
          customerName: ticket.attendeeName || "Unknown",
          customerEmail: ticket.attendeeEmail || "",
          customerPhone: ticket.attendeePhone || "",
          eventName: formData.eventName,
          ticketType: formData.ticketType,
          performedBy: user?.email || "Current User",
          performedAt: new Date().toISOString(),
          reason: formData.reason,
          status: "completed",
        };
        onComplete(operation);
      } else {
        // Manual/Complimentary - would need to create order and ticket
        // For now, just create a placeholder operation
        const operation: TicketOperation = {
          id: `op-${Date.now()}`,
          ticketId: formData.ticketId || `ticket-${Date.now()}`,
          ticketNumber: formData.ticketNumber || `TIX-${Date.now()}`,
          operationType,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          eventName: formData.eventName,
          ticketType: formData.ticketType,
          performedBy: user?.email || "Current User",
          performedAt: new Date().toISOString(),
          reason: formData.reason,
          status: "pending", // Manual tickets need to be created via order API
        };
        onComplete(operation);
      }
    } catch (err: any) {
      console.error("Operation failed:", err);
      setError(err.message || "Operation failed");
      setLoading(false);
      return;
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-slate-900">
          {operationsConfig.find((c) => c.type === operationType)?.label}
        </h4>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-100"
        >
          <XCircle className="size-5" />
        </button>
      </div>

      {operationType === "manual" || operationType === "complimentary" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Event *</Label>
              <Input
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                placeholder="Select event"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Ticket Type *</Label>
              <Input
                value={formData.ticketType}
                onChange={(e) => setFormData({ ...formData, ticketType: e.target.value })}
                placeholder="Select ticket type"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label>Customer Name *</Label>
            <Input
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="Full name"
              className="mt-1"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                placeholder="customer@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="+254 700 000 000"
                className="mt-1"
              />
            </div>
          </div>
        </>
      ) : operationType === "void" || operationType === "resend" ? (
        <>
          <div>
            <Label>Ticket Number *</Label>
            <Input
              value={formData.ticketNumber}
              onChange={(e) => setFormData({ ...formData, ticketNumber: e.target.value })}
              placeholder="TIX-2024-001234"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Reason *</Label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Enter reason for this operation..."
            />
          </div>
          {operationType === "resend" && (
            <div>
              <Label>Delivery Method</Label>
              <Select
                value={formData.deliveryMethod}
                onValueChange={(value) =>
                  setFormData({ ...formData, deliveryMethod: value as "email" | "sms" })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </>
      ) : operationType === "transfer" ? (
        <>
          <div>
            <Label>Ticket Number *</Label>
            <Input
              value={formData.ticketNumber}
              onChange={(e) => setFormData({ ...formData, ticketNumber: e.target.value })}
              placeholder="TIX-2024-001234"
              className="mt-1"
            />
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h5 className="mb-3 font-semibold text-slate-900">Transfer To</h5>
            <div className="space-y-3">
              <div>
                <Label>New Customer Name *</Label>
                <Input
                  value={formData.newCustomerName}
                  onChange={(e) =>
                    setFormData({ ...formData, newCustomerName: e.target.value })
                  }
                  placeholder="Full name"
                  className="mt-1"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.newCustomerEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, newCustomerEmail: e.target.value })
                    }
                    placeholder="customer@example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    value={formData.newCustomerPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, newCustomerPhone: e.target.value })
                    }
                    placeholder="+254 700 000 000"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
          <div>
            <Label>Reason</Label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Optional reason for transfer..."
            />
          </div>
        </>
      ) : null}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          {operationType === "void" ? "Void Ticket" : operationType === "resend" ? "Resend Ticket" : operationType === "transfer" ? "Transfer Ticket" : "Issue Ticket"}
        </button>
      </div>
    </form>
  );
}

