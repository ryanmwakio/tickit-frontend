"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Check, Loader2, CreditCard, Smartphone, Wallet, Download, Mail, MessageSquare, UserPlus } from "lucide-react";
import { EventContent } from "@/data/events";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { downloadTicketPDF } from "@/lib/ticket-pdf";

interface TicketPurchaseFlowProps {
  event: EventContent;
  isOpen: boolean;
  onClose: () => void;
}

type PaymentMethod = "mpesa_express" | "card" | "airtel_money";

interface TicketSelection {
  ticketTypeId: string;
  name: string;
  price: number;
  priceCents: number;
  quantity: number;
  available: number;
}

interface ContactDetails {
  fullName: string;
  email: string;
  phone: string;
  sendToEmail: boolean;
  sendToPhone: boolean;
}

interface OrderResponse {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmountCents: number;
    items?: Array<{
      id: string;
      tickets?: Array<{
        id: string;
        qrCode: string;
        ticketNumber: string;
      }>;
    }>;
  };
  paymentInstructions?: {
    checkoutToken?: string;
    expiresAt?: string;
    skipped?: boolean;
    message?: string;
  };
  tickets?: Array<{
    id: string;
    qrCode: string;
    ticketNumber: string;
  }>;
}

const STEPS = [
  { id: "tickets", label: "Select Tickets" },
  { id: "contact", label: "Your Details" },
  { id: "payment", label: "Payment" },
  { id: "success", label: "Complete" },
];

// Generate or retrieve device/tracking ID
function getOrCreateTrackingId(): string {
  if (typeof window === "undefined") return "";
  
  let trackingId = localStorage.getItem("tixhub_tracking_id");
  if (!trackingId) {
    trackingId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem("tixhub_tracking_id", trackingId);
  }
  return trackingId;
}

export function TicketPurchaseFlow({ event, isOpen, onClose }: TicketPurchaseFlowProps) {
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [ticketSelections, setTicketSelections] = useState<TicketSelection[]>([]);
  const [buyForAnotherPerson, setBuyForAnotherPerson] = useState(false);
  const [contactDetails, setContactDetails] = useState<ContactDetails>({
    fullName: "",
    email: "",
    phone: "",
    sendToEmail: true,
    sendToPhone: true,
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa_express");
  const [isProcessing, setIsProcessing] = useState(false);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [trackingId] = useState<string>(getOrCreateTrackingId());

  // Load ticket types from event
  useEffect(() => {
    if (isOpen && event.ticketTiers) {
      // Map ticket tiers to selections
      const selections: TicketSelection[] = event.ticketTiers.map((tier) => {
        // Use priceCents if available, otherwise extract from price string
        const priceCents = tier.priceCents || 0;
        const price = priceCents > 0 ? priceCents / 100 : 0;
        
        return {
          ticketTypeId: tier.id || "", // Use ticket type ID from API
          name: tier.name,
          price,
          priceCents,
          quantity: 0,
          available: tier.available || 0,
        };
      });
      setTicketSelections(selections);
    }
  }, [isOpen, event]);

  // Auto-fill contact details if user is logged in and not buying for another person
  useEffect(() => {
    if (isOpen && isAuthenticated && user && !buyForAnotherPerson) {
      const fullName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`.trim()
        : user.firstName || user.lastName || "";
      
      setContactDetails({
        fullName,
        email: user.email || "",
        phone: user.phoneNumber || "",
        sendToEmail: true,
        sendToPhone: true,
      });
    } else if (isOpen && (!isAuthenticated || buyForAnotherPerson)) {
      // Reset if not logged in or buying for another person
      setContactDetails({
        fullName: "",
        email: "",
        phone: "",
        sendToEmail: true,
        sendToPhone: true,
      });
    }
  }, [isOpen, isAuthenticated, user, buyForAnotherPerson]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setTicketSelections([]);
      setBuyForAnotherPerson(false);
      setContactDetails({
        fullName: "",
        email: "",
        phone: "",
        sendToEmail: true,
        sendToPhone: true,
      });
      setPaymentMethod("mpesa_express");
      setIsProcessing(false);
      setOrder(null);
      setError(null);
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    }
  }, [isOpen]);

  const updateQuantity = (index: number, delta: number) => {
    setTicketSelections((prev) => {
      const updated = [...prev];
      const current = updated[index];
      const newQuantity = Math.max(0, Math.min(current.available, current.quantity + delta));
      updated[index] = { ...current, quantity: newQuantity };
      return updated;
    });
  };

  const totalAmount = ticketSelections.reduce(
    (sum, selection) => sum + selection.priceCents * selection.quantity,
    0
  );

  const totalQuantity = ticketSelections.reduce((sum, selection) => sum + selection.quantity, 0);

  const canProceedToContact = totalQuantity > 0;
  const canProceedToPayment =
    contactDetails.fullName.trim() !== "" &&
    (contactDetails.email.trim() !== "" || contactDetails.phone.trim() !== "");

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digits
    let cleaned = phone.replace(/\D/g, "");
    
    // If starts with 0, replace with 254
    if (cleaned.startsWith("0")) {
      cleaned = "254" + cleaned.substring(1);
    }
    
    // If doesn't start with 254, add it
    if (!cleaned.startsWith("254")) {
      cleaned = "254" + cleaned;
    }
    
    // Format as +254XXXXXXXXX
    return "+" + cleaned;
  };

  const handleCheckout = async () => {
    if (!canProceedToPayment) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Format phone number
      const formattedPhone = contactDetails.phone ? formatPhoneNumber(contactDetails.phone) : "";

      // Create checkout payload
      const checkoutData = {
        organiserId: event.organiserId || "", // Need to get from event
        items: ticketSelections
          .filter((s) => s.quantity > 0)
          .map((selection) => ({
            ticketTypeId: selection.ticketTypeId,
            quantity: selection.quantity,
            attendees: Array(selection.quantity)
              .fill(null)
              .map(() => ({
                name: contactDetails.fullName,
                email: contactDetails.email || undefined,
                phoneNumber: formattedPhone || undefined,
              })),
          })),
        payment: {
          method: paymentMethod,
          metadata:
            paymentMethod === "mpesa_express"
              ? { phone: formattedPhone }
              : paymentMethod === "airtel_money"
              ? { phone: formattedPhone }
              : {},
        },
        metadata: {
          // Store tracking ID for guest purchases
          trackingId: !isAuthenticated ? trackingId : undefined,
          deviceId: trackingId,
          buyForAnotherPerson: isAuthenticated && buyForAnotherPerson,
        },
        skipPayment: true, // Always skip payment - just generate tickets and PDF
      };

      // Generate idempotency key
      const idempotencyKey = `checkout-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      // Call checkout API
      const response = await apiClient.post<OrderResponse>("/orders/checkout", checkoutData, {
        headers: {
          "X-Idempotency-Key": idempotencyKey,
        },
      });

      // Handle response format - API client may return data directly or wrapped
      const orderResponse = (response as any).data || response;
      
      setOrder(orderResponse);
      
      // If payment was skipped, tickets should be generated - poll for them
      if (orderResponse.paymentInstructions?.skipped) {
        setCurrentStep(3); // Move to success step
        // Poll for tickets to be available
        pollForTickets(orderResponse.order.id);
      } else {
        // For real payments (when payment gateway is integrated), show processing step
        setCurrentStep(3); // For now, also go to success (processing will be added when payment gateway is integrated)
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err?.message || "Failed to process checkout. Please try again.");
      setIsProcessing(false);
    }
  };

  const startPollingOrderStatus = (orderId: string) => {
    const interval = setInterval(() => {
      checkOrderStatus(orderId);
    }, 3000); // Poll every 3 seconds

    setPollingInterval(interval);

    // Stop polling after 5 minutes
    setTimeout(() => {
      if (interval) {
        clearInterval(interval);
        setPollingInterval(null);
      }
    }, 5 * 60 * 1000);
  };

  const checkOrderStatus = async (orderId: string) => {
    try {
      const response = await apiClient.get<OrderResponse>(`/orders/${orderId}`);
      
      // Handle response format - API client may return data directly or wrapped
      const orderResponse = (response as any).data || response;
      const order = orderResponse.order || orderResponse;
      
      if (order.status === "PAID" || order.status === "COMPLETED") {
        // Payment successful
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        
        // Fetch tickets with QR codes
        const ticketsResponse = await apiClient.get(`/orders/${orderId}`);
        const ticketsData = (ticketsResponse as any).data || ticketsResponse;
        setOrder(ticketsData);
        setCurrentStep(3); // Move to success step
        setIsProcessing(false);
      } else if (order.status === "FAILED" || order.status === "CANCELLED") {
        // Payment failed
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        setError("Payment failed. Please try again.");
        setIsProcessing(false);
        setCurrentStep(2); // Go back to payment step
      }
    } catch (err) {
      console.error("Error checking order status:", err);
    }
  };

  const pollForTickets = async (orderId: string) => {
    let attempts = 0;
    const maxAttempts = 20; // Poll for up to 20 seconds (20 * 1 second)
    
    const pollInterval = setInterval(async () => {
      attempts++;
      
      try {
        const response = await apiClient.get<OrderResponse>(`/orders/${orderId}`);
        const orderData = (response as any).data || response;
        
        // Check if tickets are available in the order
        let hasTickets = false;
        if (orderData.order?.items) {
          for (const item of orderData.order.items) {
            if (item.tickets && Array.isArray(item.tickets) && item.tickets.length > 0) {
              hasTickets = true;
              break;
            }
          }
        }
        
        if (hasTickets) {
          // Tickets are ready!
          clearInterval(pollInterval);
          setOrder(orderData);
          setIsProcessing(false);
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        } else if (attempts >= maxAttempts) {
          // Stop polling after max attempts
          clearInterval(pollInterval);
          setIsProcessing(false);
          setError("Tickets are taking longer than expected. Please refresh the page or contact support.");
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        }
      } catch (err) {
        console.error("Error polling for tickets:", err);
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          setIsProcessing(false);
          setError("Failed to load tickets. Please try refreshing the page.");
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        }
      }
    }, 1000); // Poll every 1 second
    
    // Store interval for cleanup
    setPollingInterval(pollInterval);
  };

  const handleNext = () => {
    if (currentStep === 0 && canProceedToContact) {
      setCurrentStep(1);
    } else if (currentStep === 1 && canProceedToPayment) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      handleCheckout();
    }
  };

  const handleBack = () => {
    if (currentStep > 0 && currentStep < 4) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] bg-white shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-3xl border border-slate-200 max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div className="flex-1">
              <Dialog.Title className="text-lg font-semibold text-slate-900">
                {currentStep < 3 ? "Get Your Tickets" : "Payment Successful!"}
              </Dialog.Title>
              <p className="text-sm text-slate-500 mt-1">{event.title}</p>
            </div>
            {currentStep < 3 && (
              <Dialog.Close asChild>
                <button className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition">
                  <X className="size-5" />
                </button>
              </Dialog.Close>
            )}
          </div>

          {/* Progress Indicator */}
          {currentStep < 4 && (
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                {STEPS.slice(0, 4).map((step, index) => (
                  <React.Fragment key={step.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition",
                          index < currentStep
                            ? "border-slate-900 bg-slate-900 text-white"
                            : index === currentStep
                            ? "border-slate-900 bg-white text-slate-900"
                            : "border-slate-300 bg-white text-slate-400"
                        )}
                      >
                        {index < currentStep ? (
                          <Check className="size-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span
                        className={cn(
                          "hidden sm:block text-xs font-medium",
                          index <= currentStep ? "text-slate-900" : "text-slate-400"
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < 3 && (
                      <div
                        className={cn(
                          "h-0.5 flex-1 mx-2 transition",
                          index < currentStep ? "bg-slate-900" : "bg-slate-200"
                        )}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            )}

            {/* Step 1: Ticket Selection */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">Select your tickets</p>
                {ticketSelections.map((selection, index) => (
                  <div
                    key={selection.ticketTypeId}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{selection.name}</h3>
                        <p className="mt-1 text-lg font-semibold text-slate-900">
                          KES {selection.price.toLocaleString()}
                        </p>
                        {selection.available < 10 && (
                          <p className="mt-1 text-xs text-amber-600">
                            Only {selection.available} left!
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(index, -1)}
                          disabled={selection.quantity === 0}
                          className="flex size-8 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="text-lg">−</span>
                        </button>
                        <span className="min-w-[2rem] text-center font-semibold text-slate-900">
                          {selection.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(index, 1)}
                          disabled={selection.quantity >= selection.available}
                          className="flex size-8 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="text-lg">+</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {ticketSelections.length === 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
                    <p className="text-slate-600">No tickets available for this event.</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Contact Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">We'll send your tickets here</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={contactDetails.fullName}
                      onChange={(e) =>
                        setContactDetails({ ...contactDetails, fullName: e.target.value })
                      }
                      placeholder="John Doe"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Email <span className="text-slate-400 text-xs">(optional)</span>
                    </label>
                    <input
                      type="email"
                      value={contactDetails.email}
                      onChange={(e) =>
                        setContactDetails({ ...contactDetails, email: e.target.value })
                      }
                      placeholder="john@example.com"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Phone Number <span className="text-slate-400 text-xs">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={contactDetails.phone}
                      onChange={(e) =>
                        setContactDetails({ ...contactDetails, phone: e.target.value })
                      }
                      placeholder="0712 345 678"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Required for MPesa payments
                    </p>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <input
                      type="checkbox"
                      id="sendToEmail"
                      checked={contactDetails.sendToEmail}
                      onChange={(e) =>
                        setContactDetails({ ...contactDetails, sendToEmail: e.target.checked })
                      }
                      className="mt-0.5 size-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <label htmlFor="sendToEmail" className="flex-1 text-sm text-slate-700">
                      Send ticket to this email & phone
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment Method */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">Choose your payment method</p>
                <div className="space-y-3">
                  <button
                    onClick={() => setPaymentMethod("mpesa_express")}
                    className={cn(
                      "w-full rounded-2xl border-2 p-4 text-left transition",
                      paymentMethod === "mpesa_express"
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-green-100">
                        <Smartphone className="size-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">MPesa STK Push</span>
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                            Fastest
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600">
                          Enter your PIN on your phone
                        </p>
                      </div>
                      {paymentMethod === "mpesa_express" && (
                        <div className="flex size-5 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-900">
                          <Check className="size-3 text-white" />
                        </div>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={cn(
                      "w-full rounded-2xl border-2 p-4 text-left transition",
                      paymentMethod === "card"
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100">
                        <CreditCard className="size-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-slate-900">Card (Visa/Mastercard)</span>
                        <p className="mt-1 text-xs text-slate-600">
                          Secure payment via Stripe
                        </p>
                      </div>
                      {paymentMethod === "card" && (
                        <div className="flex size-5 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-900">
                          <Check className="size-3 text-white" />
                        </div>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("airtel_money")}
                    className={cn(
                      "w-full rounded-2xl border-2 p-4 text-left transition",
                      paymentMethod === "airtel_money"
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-red-100">
                        <Wallet className="size-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-slate-900">Airtel Money</span>
                        <p className="mt-1 text-xs text-slate-600">
                          Pay with your Airtel account
                        </p>
                      </div>
                      {paymentMethod === "airtel_money" && (
                        <div className="flex size-5 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-900">
                          <Check className="size-3 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Total</span>
                    <span className="text-2xl font-bold text-slate-900">
                      KES {(totalAmount / 100).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {currentStep === 3 && order && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-green-100">
                  <Check className="size-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                  Payment Successful!
                </h3>
                <p className="text-sm text-slate-600 mb-6">
                  Your tickets have been sent to your email and phone.
                </p>

                {(() => {
                  // Flatten tickets from all order items
                  const allTickets: Array<{
                    id: string;
                    qrCode: string;
                    ticketNumber: string;
                  }> = [];
                  
                  if (order.order?.items) {
                    order.order.items.forEach((item: any) => {
                      if (item.tickets && Array.isArray(item.tickets)) {
                        allTickets.push(...item.tickets);
                      }
                    });
                  }
                  
                  // Also check for top-level tickets (backward compatibility)
                  if (order.tickets && Array.isArray(order.tickets)) {
                    allTickets.push(...order.tickets);
                  }
                  
                  // Download all tickets handler
                  const handleDownloadAllTickets = async () => {
                    if (allTickets.length === 0) return;
                    
                    try {
                      // Show loading state
                      setIsProcessing(true);
                      
                      // Download each ticket PDF sequentially
                      for (let i = 0; i < allTickets.length; i++) {
                        const ticket = allTickets[i];
                        try {
                          await downloadTicketPDF(ticket.id);
                          // Small delay between downloads to avoid browser blocking
                          if (i < allTickets.length - 1) {
                            await new Promise(resolve => setTimeout(resolve, 500));
                          }
                        } catch (error) {
                          console.error(`Failed to download ticket ${ticket.id}:`, error);
                          // Continue with other tickets even if one fails
                        }
                      }
                      
                      setIsProcessing(false);
                    } catch (error) {
                      console.error("Failed to download tickets:", error);
                      setIsProcessing(false);
                      alert("Failed to download some tickets. Please try again.");
                    }
                  };
                  
                  return allTickets.length > 0 ? (
                    <>
                      {/* Download All Button */}
                      <div className="mb-6 w-full">
                        <button
                          onClick={handleDownloadAllTickets}
                          disabled={isProcessing}
                          className="w-full rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="size-5 animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="size-5" />
                              Download All Tickets ({allTickets.length})
                            </>
                          )}
                        </button>
                      </div>
                    <div className="w-full space-y-4">
                      {allTickets.map((ticket) => {
                      const handleDownloadPDF = async () => {
                        try {
                          await downloadTicketPDF(ticket.id);
                        } catch (error) {
                          console.error("Failed to download PDF:", error);
                          alert("Failed to download PDF. Please try again.");
                        }
                      };

                      const handleSendEmail = async () => {
                        try {
                          await apiClient.post(`/orders/${order.order.id}/resend`, {
                            method: "email",
                          });
                          alert("Ticket sent to your email!");
                        } catch (error) {
                          console.error("Failed to send email:", error);
                          alert("Failed to send email. Please try again.");
                        }
                      };

                      const handleSendSMS = async () => {
                        try {
                          await apiClient.post(`/orders/${order.order.id}/resend`, {
                            method: "sms",
                          });
                          alert("Ticket sent to your phone!");
                        } catch (error) {
                          console.error("Failed to send SMS:", error);
                          alert("Failed to send SMS. Please try again.");
                        }
                      };

                      return (
                        <div
                          key={ticket.id}
                          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg"
                        >
                          <div className="mb-4 flex justify-center">
                            {ticket.qrCode && (
                              <img
                                src={ticket.qrCode}
                                alt="Ticket QR Code"
                                className="size-48 rounded-xl border-4 border-slate-200"
                              />
                            )}
                          </div>
                          <p className="text-center text-sm font-semibold text-slate-900">
                            Ticket #{ticket.ticketNumber}
                          </p>
                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <button
                              onClick={handleDownloadPDF}
                              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                            >
                              <Download className="size-4" />
                              PDF
                            </button>
                            <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
                              Add to Wallet
                            </button>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <button
                              onClick={handleSendEmail}
                              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                            >
                              <Mail className="size-4" />
                              Email
                            </button>
                            <button
                              onClick={handleSendSMS}
                              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                            >
                              <MessageSquare className="size-4" />
                              SMS
                            </button>
                          </div>
                        </div>
                      );
                      })}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                      <Loader2 className="size-8 animate-spin text-slate-600 mx-auto mb-4" />
                      <p className="text-sm font-medium text-slate-900 mb-2">Tickets are being generated...</p>
                      <p className="text-xs text-slate-500">This usually takes just a few seconds</p>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Footer with Navigation */}
          {currentStep < 4 && (
            <div className="border-t border-slate-200 bg-white px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                {currentStep > 0 && currentStep < 3 ? (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    <ChevronLeft className="size-4" />
                    Back
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex-1 text-right">
                  {currentStep < 2 && (
                    <div className="text-sm text-slate-600">
                      Total: <span className="font-semibold text-slate-900">KES {(totalAmount / 100).toLocaleString()}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 0 && !canProceedToContact) ||
                    (currentStep === 1 && !canProceedToPayment) ||
                    (currentStep === 2 && isProcessing)
                  }
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentStep === 2 ? (
                    <>
                      {isProcessing ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Confirm & Pay
                          <ChevronRight className="size-4" />
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      Continue
                      <ChevronRight className="size-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="border-t border-slate-200 bg-white px-6 py-4">
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

