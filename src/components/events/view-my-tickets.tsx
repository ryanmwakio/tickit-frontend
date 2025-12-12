"use client";

import React, { useState, useEffect } from "react";
import { X, Ticket, Download, Mail, MessageSquare, Loader2, Wallet } from "lucide-react";
import { EventContent } from "@/data/events";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import * as Dialog from "@radix-ui/react-dialog";
import { downloadTicketPDF } from "@/lib/ticket-pdf";
import { cn } from "@/lib/utils";

interface ViewMyTicketsProps {
  event: EventContent;
  isOpen: boolean;
  onClose: () => void;
}

interface TicketData {
  id: string;
  ticketNumber: string;
  qrCode: string;
  status: string;
  ticketType: {
    name: string;
    priceCents: number;
  };
  order: {
    id: string;
    orderNumber: string;
    createdAt: string;
  };
}

// Get tracking ID from localStorage
function getTrackingId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("tixhub_tracking_id");
}

export function ViewMyTickets({ event, isOpen, onClose }: ViewMyTicketsProps) {
  const { user, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTickets();
    }
  }, [isOpen, event, isAuthenticated]);

  const loadTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!event.id) {
        console.error("Event ID is missing:", event);
        setError("Event ID is missing. Cannot load tickets.");
        setLoading(false);
        return;
      }

      console.log("Loading tickets for event:", event.id, "Authenticated:", isAuthenticated);

      if (isAuthenticated && user) {
        // For logged-in users, fetch from API
        // Also include trackingId in case tickets were created as guest
        const trackingId = getTrackingId();
        console.log("Fetching tickets for logged-in user:", user.id, "trackingId:", trackingId);
        const url = trackingId 
          ? `/tickets?eventId=${event.id}&trackingId=${trackingId}`
          : `/tickets?eventId=${event.id}`;
        const response = await apiClient.get<{ data: TicketData[]; total: number }>(url);
        console.log("Tickets response:", response);
        // Handle both response formats: { data: [] } or { data: [], total, ... }
        const tickets = Array.isArray(response) ? response : (response.data || []);
        console.log("Setting tickets:", tickets.length);
        setTickets(tickets);
      } else {
        // For guests, use tracking ID
        const trackingId = getTrackingId();
        console.log("Guest user, trackingId:", trackingId);
        if (trackingId) {
          // Fetch tickets by tracking ID and eventId from API
          try {
            const response = await apiClient.get<{ data: TicketData[]; total: number }>(
              `/tickets?eventId=${event.id}&trackingId=${trackingId}`
            );
            console.log("Guest tickets response:", response);
            const tickets = Array.isArray(response) ? response : (response.data || []);
            console.log("Setting guest tickets:", tickets.length);
            setTickets(tickets);
          } catch (err: any) {
            console.error("API failed for guest, falling back to localStorage:", err);
            // Fallback to localStorage if API fails
            const storedTickets = localStorage.getItem(`tickets_${event.id}`);
            if (storedTickets) {
              const parsed = JSON.parse(storedTickets);
              const filtered = parsed.filter((t: TicketData) => 
                t.metadata?.deviceId === trackingId
              );
              setTickets(filtered);
            } else {
              setTickets([]);
            }
          }
        } else {
          console.log("No trackingId for guest user");
          setTickets([]);
        }
      }
    } catch (err: any) {
      console.error("Failed to load tickets:", err);
      setError(err?.message || "Failed to load tickets");
      // Fallback to localStorage for guests
      if (!isAuthenticated) {
        const trackingId = getTrackingId();
        if (trackingId) {
          const storedTickets = localStorage.getItem(`tickets_${event.id}`);
          if (storedTickets) {
            setTickets(JSON.parse(storedTickets));
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (ticket: TicketData) => {
    try {
      await downloadTicketPDF(ticket.id);
    } catch (error) {
      console.error("Failed to download PDF:", error);
      alert("Failed to download PDF. Please try again.");
    }
  };

  const handleSendEmail = async (orderId: string | undefined) => {
    if (!orderId) {
      alert("Order information not available.");
      return;
    }
    try {
      await apiClient.post(`/orders/${orderId}/resend`, {
        method: "email",
      });
      alert("Ticket sent to your email!");
    } catch (error) {
      console.error("Failed to send email:", error);
      alert("Failed to send email. Please try again.");
    }
  };

  const handleSendSMS = async (orderId: string | undefined) => {
    if (!orderId) {
      alert("Order information not available.");
      return;
    }
    try {
      await apiClient.post(`/orders/${orderId}/resend`, {
        method: "sms",
      });
      alert("Ticket sent to your phone!");
    } catch (error) {
      console.error("Failed to send SMS:", error);
      alert("Failed to send SMS. Please try again.");
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] bg-white shadow-2xl shadow-slate-900/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-2xl sm:rounded-3xl border border-slate-100 max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="relative border-b border-slate-100 bg-white px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex size-10 sm:size-12 items-center justify-center rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/80">
                    <Ticket className="size-5 sm:size-6 text-slate-900" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Dialog.Title className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-900">
                      My Tickets
                    </Dialog.Title>
                    {tickets.length > 0 && (
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'} for this event
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm sm:text-base text-slate-600 line-clamp-1 pl-[52px] sm:pl-[60px]">{event.title}</p>
              </div>
              <Dialog.Close asChild>
                <button className="rounded-full border border-slate-200 p-1.5 sm:p-2 text-slate-500 transition hover:border-slate-400 hover:text-slate-900 hover:bg-slate-50 shrink-0" aria-label="Close">
                  <X className="size-4 sm:size-5" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 bg-white">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                <div className="relative">
                  <Loader2 className="size-10 sm:size-12 animate-spin text-slate-900" />
                  <div className="absolute inset-0 size-10 sm:size-12 animate-ping rounded-full border-2 border-slate-900 opacity-20" />
                </div>
                <p className="mt-4 text-sm font-medium text-slate-600">Loading your tickets...</p>
              </div>
            ) : error ? (
              <div className="rounded-xl sm:rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                    <X className="size-5 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-semibold text-red-900">Error Loading Tickets</p>
                    <p className="mt-1 text-xs sm:text-sm text-red-700 break-words">{error}</p>
                  </div>
                </div>
              </div>
            ) : tickets.length === 0 ? (
              <div className="rounded-xl sm:rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80 p-8 sm:p-12 text-center">
                <div className="mx-auto mb-4 flex size-14 sm:size-16 items-center justify-center rounded-full bg-white border border-slate-100">
                  <Ticket className="size-7 sm:size-8 text-slate-400" />
                </div>
                <p className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">No tickets found</p>
                <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                  {isAuthenticated
                    ? "You don't have any tickets for this event yet. Purchase tickets to get started!"
                    : "You haven't purchased any tickets for this event on this device."}
                </p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {tickets.map((ticket, index) => {
                  const order = ticket.order || (ticket as any).orderItem?.order;
                  return (
                    <div
                      key={ticket.id}
                      className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-slate-100 bg-white shadow-lg shadow-slate-200/70 transition-all hover:shadow-xl hover:shadow-slate-200/80"
                    >
                      <div className="p-4 sm:p-6">
                        {/* Ticket Header */}
                        <div className="mb-4 sm:mb-6 flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-slate-900 px-2.5 sm:px-3 py-1 text-xs font-semibold text-white">
                                #{ticket.ticketNumber}
                              </span>
                              {ticket.ticketType && (
                                <span className="rounded-full border border-slate-200 bg-slate-50/80 px-2.5 sm:px-3 py-1 text-xs font-semibold text-slate-700">
                                  {ticket.ticketType.name}
                                </span>
                              )}
                            </div>
                            {order && (
                              <p className="text-xs text-slate-500">
                                Order #{order.orderNumber} • {order.createdAt && new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* QR Code Section */}
                        <div className="mb-4 sm:mb-6 flex justify-center">
                          {ticket.qrCode && (
                            <div className="relative">
                              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 blur-xl opacity-40" />
                              <img
                                src={ticket.qrCode}
                                alt="Ticket QR Code"
                                className="relative size-48 sm:size-56 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-slate-900 shadow-xl sm:shadow-2xl bg-white p-2 sm:p-3"
                              />
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2 sm:space-y-3">
                          {/* Primary Actions */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                            <button
                              onClick={() => handleDownloadPDF(ticket)}
                              className="group/btn flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-slate-900 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-sm shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800 active:scale-[0.98]"
                            >
                              <Download className="size-4" />
                              Download PDF
                            </button>
                            <button className="flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98]">
                              <Wallet className="size-4" />
                              Add to Wallet
                            </button>
                          </div>

                          {/* Secondary Actions */}
                          {order?.id && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                              <button
                                onClick={() => handleSendEmail(order.id)}
                                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
                              >
                                <Mail className="size-3.5 sm:size-4" />
                                Send Email
                              </button>
                              <button
                                onClick={() => handleSendSMS(order.id)}
                                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
                              >
                                <MessageSquare className="size-3.5 sm:size-4" />
                                Send SMS
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

