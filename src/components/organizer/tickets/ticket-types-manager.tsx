"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Copy,
  Ticket,
  DollarSign,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Settings,
  Tag,
  Loader2,
  ChevronDown,
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
import { DateTimePicker } from "@/components/ui/date-picker";
import { useAuth } from "@/contexts/auth-context";
import { getTicketTypes, createTicketType, updateTicketType, deleteTicketType, TicketType as ApiTicketType } from "@/lib/tickets-api";
import { fetchOrganiserEvents } from "@/lib/events-api";
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

type TicketType = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  quantity: number;
  soldQuantity: number;
  minPerOrder: number | null;
  maxPerOrder: number | null;
  salesStartsAt: string | null;
  salesEndsAt: string | null;
  isVisible: boolean;
  isRefundable: boolean;
  category: "early_bird" | "standard" | "vip" | "vvip" | "backstage" | "reserved" | "free" | "promo";
  ticketDesignId: string | null;
  seatMapSection: string | null;
  platformFee: number;
  organizerFee: number;
  tax: number;
  status: "draft" | "active" | "paused" | "sold_out" | "ended";
  autoSwitchTier: boolean;
  switchToTierId: string | null;
  pauseAtQuantity: number | null;
};

const categoryConfig: Record<
  TicketType["category"],
  { label: string; color: string; icon: React.ElementType }
> = {
  early_bird: {
    label: "Early Bird",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Clock,
  },
  standard: {
    label: "Standard",
    color: "bg-slate-100 text-slate-700 border-slate-200",
    icon: Ticket,
  },
  vip: {
    label: "VIP",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Tag,
  },
  vvip: {
    label: "VVIP",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    icon: Tag,
  },
  backstage: {
    label: "Backstage",
    color: "bg-pink-100 text-pink-700 border-pink-200",
    icon: Tag,
  },
  reserved: {
    label: "Reserved",
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    icon: Tag,
  },
  free: {
    label: "Free",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: Tag,
  },
  promo: {
    label: "Promo",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    icon: Tag,
  },
};

export function TicketTypesManager() {
  const { user } = useAuth();
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [displayedCount, setDisplayedCount] = useState(9);
  const [events, setEvents] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 9;

  // Load events and ticket types
  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const organiserId = await getUserOrganiserId(user.id);
        if (!organiserId) {
          setError("Could not determine organiser ID");
          setLoading(false);
          return;
        }

        // Fetch events with pagination
        let allEvents: any[] = [];
        let currentPage = 1;
        const pageLimit = 100; // API max limit
        
        while (true) {
          const eventsResponse = await fetchOrganiserEvents(organiserId, {
            page: currentPage,
            limit: pageLimit,
          });
          
          allEvents = [...allEvents, ...eventsResponse.data];
          
          if (eventsResponse.data.length < pageLimit || currentPage >= eventsResponse.totalPages) {
            break;
          }
          
          currentPage++;
        }
        
        setEvents(allEvents.map(e => ({ id: e.id, title: e.title })));

        // Fetch ticket types for all events
        const allTicketTypes: TicketType[] = [];
        for (const event of allEvents) {
          if (event.ticketTypes && event.ticketTypes.length > 0) {
            for (const tt of event.ticketTypes) {
              allTicketTypes.push({
                id: tt.id,
                eventId: event.id,
                name: tt.name,
                description: "",
                price: tt.priceCents / 100,
                priceCents: tt.priceCents,
                currency: tt.currency || "KES",
                quantity: tt.quantityTotal || 0,
                soldQuantity: tt.quantitySold || 0,
                minPerOrder: null,
                maxPerOrder: null,
                salesStartsAt: null,
                salesEndsAt: null,
                isVisible: true,
                isRefundable: true,
                category: "standard" as TicketType["category"],
                ticketDesignId: null,
                seatMapSection: null,
                platformFee: 0,
                organizerFee: 0,
                tax: 0,
                status: "active" as TicketType["status"],
                autoSwitchTier: false,
                switchToTierId: null,
                pauseAtQuantity: null,
              });
            }
          }
        }
        
        setTicketTypes(allTicketTypes);
      } catch (err: any) {
        console.error("Failed to load ticket types:", err);
        setError(err.message || "Failed to load ticket types");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  const handleCreate = () => {
    setSelectedType(null);
    setSelectedEventId(null);
    setIsEditing(true);
    setShowCreateModal(true);
  };

  const handleEdit = (id: string) => {
    const type = ticketTypes.find((t) => t.id === id);
    setSelectedType(id);
    setSelectedEventId(type?.eventId || null);
    setIsEditing(true);
    setShowCreateModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this ticket type?")) {
      try {
        await deleteTicketType(id);
        setTicketTypes(ticketTypes.filter((t) => t.id !== id));
      } catch (err: any) {
        alert(err.message || "Failed to delete ticket type");
      }
    }
  };

  const handleDuplicate = async (id: string) => {
    const original = ticketTypes.find((t) => t.id === id);
    if (original && original.eventId) {
      try {
        const duplicated = await createTicketType(original.eventId, {
          name: `${original.name} (Copy)`,
          description: original.description,
          priceCents: original.priceCents,
          currency: original.currency,
          quantityTotal: original.quantity,
          minPerOrder: original.minPerOrder,
          maxPerOrder: original.maxPerOrder,
          salesStartsAt: original.salesStartsAt,
          salesEndsAt: original.salesEndsAt,
          isVisible: original.isVisible,
          isRefundable: original.isRefundable,
          category: original.category,
        });
        
        // Reload ticket types
        const types = await getTicketTypes(original.eventId);
        setTicketTypes([...ticketTypes, ...types.map(tt => ({
          ...tt,
          price: tt.priceCents / 100,
          quantity: tt.quantityTotal,
          soldQuantity: tt.quantitySold,
          category: "standard" as TicketType["category"],
          status: "active" as TicketType["status"],
        }))]);
      } catch (err: any) {
        alert(err.message || "Failed to duplicate ticket type");
      }
    }
  };

  const selectedTicketType = selectedType
    ? ticketTypes.find((t) => t.id === selectedType)
    : null;

  // Get displayed ticket types (first N items)
  const displayedTicketTypes = ticketTypes.slice(0, displayedCount);
  const hasMore = ticketTypes.length > displayedCount;

  const handleLoadMore = () => {
    setDisplayedCount((prev) => prev + itemsPerPage);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Ticket Types</h3>
          <p className="mt-1 text-sm text-slate-600">
            Manage ticket types, pricing, and inventory settings
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus className="size-4" />
          Create Ticket Type
        </button>
      </div>

      {ticketTypes.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <Ticket className="mx-auto size-12 text-slate-300" />
          <p className="mt-4 text-lg font-semibold text-slate-900">No ticket types created</p>
          <p className="mt-2 text-sm text-slate-600">
            Create your first ticket type to start selling tickets
          </p>
          <button
            onClick={handleCreate}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus className="size-4" />
            Create Ticket Type
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayedTicketTypes.map((type) => {
            const CategoryIcon = categoryConfig[type.category].icon;
            const categoryInfo = categoryConfig[type.category];
            const sellThroughRate =
              type.quantity > 0 ? (type.soldQuantity / type.quantity) * 100 : 0;

            return (
              <div
                key={type.id}
                className="rounded-xl border-2 border-slate-200 bg-white p-6 transition hover:shadow-lg"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="size-5 text-slate-600" />
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${categoryInfo.color}`}
                    >
                      {categoryInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(type.id)}
                      className="rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-100"
                    >
                      <Edit2 className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(type.id)}
                      className="rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-100"
                    >
                      <Copy className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(type.id)}
                      className="rounded-lg p-1.5 text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                <h4 className="mb-2 text-lg font-semibold text-slate-900">{type.name}</h4>
                {type.description && (
                  <p className="mb-4 text-sm text-slate-600 line-clamp-2">{type.description}</p>
                )}

                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Price</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {type.currency} {type.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Sold</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {type.soldQuantity} / {type.quantity}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-gradient-to-r from-slate-900 to-slate-700 transition-all"
                      style={{ width: `${Math.min(sellThroughRate, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {type.isVisible ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                      <CheckCircle2 className="size-3" />
                      Visible
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      <XCircle className="size-3" />
                      Hidden
                    </span>
                  )}
                  {type.status === "active" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                      Active
                    </span>
                  )}
                  {type.status === "sold_out" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                      Sold Out
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-6 pb-4">
              <button
                onClick={handleLoadMore}
                className="group inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 whitespace-nowrap"
              >
                <span>Load more</span>
                <ChevronDown className="size-5 transition-transform group-hover:translate-y-0.5 shrink-0" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <TicketTypeEditor
          ticketType={selectedTicketType || undefined}
          events={events}
          selectedEventId={selectedEventId}
          onEventChange={setSelectedEventId}
          onSave={async (data) => {
            try {
              if (selectedTicketType && selectedEventId) {
                // Update existing
                await updateTicketType(selectedTicketType.id, {
                  name: data.name,
                  description: data.description,
                  priceCents: (data.price || 0) * 100,
                  currency: data.currency || "KES",
                  quantityTotal: data.quantity || 0,
                  minPerOrder: data.minPerOrder,
                  maxPerOrder: data.maxPerOrder,
                  salesStartsAt: data.salesStartsAt,
                  salesEndsAt: data.salesEndsAt,
                  isVisible: data.isVisible,
                  isRefundable: data.isRefundable,
                  category: data.category,
                });
                
                // Reload ticket types
                const types = await getTicketTypes(selectedEventId);
                setTicketTypes(ticketTypes.map(t => {
                  if (t.id === selectedTicketType.id) {
                    const updated = types.find(tt => tt.id === t.id);
                    return updated ? {
                      ...t,
                      ...updated,
                      price: updated.priceCents / 100,
                      quantity: updated.quantityTotal,
                      soldQuantity: updated.quantitySold,
                    } : t;
                  }
                  return t;
                }));
              } else if (selectedEventId) {
                // Create new
                await createTicketType(selectedEventId, {
                  name: data.name || "",
                  description: data.description,
                  priceCents: (data.price || 0) * 100,
                  currency: data.currency || "KES",
                  quantityTotal: data.quantity || 0,
                  minPerOrder: data.minPerOrder,
                  maxPerOrder: data.maxPerOrder,
                  salesStartsAt: data.salesStartsAt,
                  salesEndsAt: data.salesEndsAt,
                  isVisible: data.isVisible ?? true,
                  isRefundable: data.isRefundable ?? true,
                  category: data.category,
                });
                
                // Reload ticket types
                const types = await getTicketTypes(selectedEventId);
                setTicketTypes([...ticketTypes, ...types.map(tt => ({
                  id: tt.id,
                  eventId: selectedEventId,
                  name: tt.name,
                  description: tt.description || "",
                  price: tt.priceCents / 100,
                  priceCents: tt.priceCents,
                  currency: tt.currency,
                  quantity: tt.quantityTotal,
                  soldQuantity: tt.quantitySold,
                  minPerOrder: null,
                  maxPerOrder: null,
                  salesStartsAt: null,
                  salesEndsAt: null,
                  isVisible: true,
                  isRefundable: true,
                  category: "standard" as TicketType["category"],
                  ticketDesignId: null,
                  seatMapSection: null,
                  platformFee: 0,
                  organizerFee: 0,
                  tax: 0,
                  status: "active" as TicketType["status"],
                  autoSwitchTier: false,
                  switchToTierId: null,
                  pauseAtQuantity: null,
                }))]);
              }
              
              setShowCreateModal(false);
              setIsEditing(false);
              setSelectedType(null);
              setSelectedEventId(null);
            } catch (err: any) {
              alert(err.message || "Failed to save ticket type");
            }
          }}
          onCancel={() => {
            setShowCreateModal(false);
            setIsEditing(false);
            setSelectedType(null);
            setSelectedEventId(null);
          }}
        />
      )}
    </div>
  );
}

function TicketTypeEditor({
  ticketType,
  events,
  selectedEventId,
  onEventChange,
  onSave,
  onCancel,
}: {
  ticketType?: TicketType;
  events: Array<{ id: string; title: string }>;
  selectedEventId: string | null;
  onEventChange: (eventId: string | null) => void;
  onSave: (data: Partial<TicketType>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<TicketType>>({
    name: ticketType?.name || "",
    description: ticketType?.description || "",
    price: ticketType?.price || 0,
    currency: ticketType?.currency || "KES",
    quantity: ticketType?.quantity || 100,
    minPerOrder: ticketType?.minPerOrder || null,
    maxPerOrder: ticketType?.maxPerOrder || null,
    salesStartsAt: ticketType?.salesStartsAt || null,
    salesEndsAt: ticketType?.salesEndsAt || null,
    isVisible: ticketType?.isVisible ?? true,
    isRefundable: ticketType?.isRefundable ?? true,
    category: ticketType?.category || "standard",
    platformFee: ticketType?.platformFee || 0,
    organizerFee: ticketType?.organizerFee || 0,
    tax: ticketType?.tax || 0,
    autoSwitchTier: ticketType?.autoSwitchTier || false,
    pauseAtQuantity: ticketType?.pauseAtQuantity || null,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900">
            {ticketType ? "Edit Ticket Type" : "Create Ticket Type"}
          </h3>
          <button
            onClick={onCancel}
            className="rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-100"
          >
            <XCircle className="size-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          {!ticketType && (
            <div>
              <Label>Event *</Label>
              <Select
                value={selectedEventId || ""}
                onValueChange={(value) => onEventChange(value || null)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Ticket Type Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., VIP Pass, General Admission"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value as TicketType["category"] })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="early_bird">Early Bird</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="vvip">VVIP</SelectItem>
                  <SelectItem value="backstage">Backstage</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="promo">Promo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Describe what's included with this ticket type..."
            />
          </div>

          {/* Pricing */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="mb-4 font-semibold text-slate-900">Pricing & Fees</h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label>Price *</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                  }
                  className="mt-1"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KES">KES</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
                  }
                  className="mt-1"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Sales Window */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Sales Start Date</Label>
              <DateTimePicker
                value={formData.salesStartsAt || ""}
                onChange={(value) => setFormData({ ...formData, salesStartsAt: value || null })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Sales End Date</Label>
              <DateTimePicker
                value={formData.salesEndsAt || ""}
                onChange={(value) => setFormData({ ...formData, salesEndsAt: value || null })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Order Limits */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Min Per Order</Label>
              <Input
                type="number"
                value={formData.minPerOrder || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minPerOrder: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                placeholder="No minimum"
                className="mt-1"
                min="1"
              />
            </div>
            <div>
              <Label>Max Per Order</Label>
              <Input
                type="number"
                value={formData.maxPerOrder || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxPerOrder: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                placeholder="No maximum"
                className="mt-1"
                min="1"
              />
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isVisible}
                onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                className="size-5 rounded border-slate-300"
              />
              <span className="text-sm font-semibold text-slate-900">Visible to customers</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isRefundable}
                onChange={(e) => setFormData({ ...formData, isRefundable: e.target.checked })}
                className="size-5 rounded border-slate-300"
              />
              <span className="text-sm font-semibold text-slate-900">Refundable</span>
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {ticketType ? "Update" : "Create"} Ticket Type
          </button>
        </div>
      </div>
    </div>
  );
}

