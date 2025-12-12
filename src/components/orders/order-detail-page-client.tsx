"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Ticket,
  Loader2,
} from "lucide-react";
import { getOrder, type Order } from "@/lib/tickets-api";
import { OrderDetailClient } from "./order-detail-client";

type OrderDetailPageClientProps = {
  orderId: string;
};

export function OrderDetailPageClient({ orderId }: OrderDetailPageClientProps) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        setError(null);
        const orderData = await getOrder(orderId);
        setOrder(orderData);
      } catch (err: any) {
        console.error("Failed to fetch order:", err);
        if (err?.statusCode === 404) {
          setError("Order not found");
        } else if (err?.statusCode === 401) {
          setError("You need to be logged in to view this order");
        } else {
          setError("Failed to load order. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin text-slate-400 mx-auto mb-4" />
          <p className="text-sm text-slate-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <Link
              href="/organizer/orders"
              className="inline-flex items-center gap-2 text-sm text-slate-600 transition hover:text-slate-900"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Orders</span>
            </Link>
          </div>
        </div>
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <XCircle className="size-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-900 mb-2">Error</h2>
            <p className="text-sm text-red-700 mb-4">{error || "Order not found"}</p>
            <button
              onClick={() => router.back()}
              className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get buyer info
  const buyer = order.buyer;
  const customerName = buyer
    ? `${buyer.firstName || ""} ${buyer.lastName || ""}`.trim() || "Guest"
    : "Guest";
  const customerEmail = buyer?.email || "";
  const customerPhone = buyer?.phoneNumber || "";

  // Get first item for display
  const firstItem = order.items?.[0];
  const eventName = firstItem?.ticketType?.event?.title || "Unknown Event";
  const eventImage = firstItem?.ticketType?.event?.coverImageUrl || "";

  // Calculate totals
  const itemsTotal = order.items?.reduce((sum, item) => sum + item.totalPriceCents, 0) || 0;
  const orderTotal = order.totalAmountCents / 100;
  const fees = orderTotal - (itemsTotal / 100);

  // Get payment info
  const payment = order.payments?.[0];
  const paymentMethodRaw = payment?.method?.toLowerCase() || "unknown";
  const paymentMethodMap: Record<string, string> = {
    mpesa: "MPesa",
    card: "Card",
    bank_transfer: "Bank Transfer",
    cash: "Cash",
  };
  const paymentMethod = paymentMethodMap[paymentMethodRaw] || "MPesa";
  const paymentReference = payment?.transactionId || payment?.reference || "";

  // Map order status
  const orderStatusMap: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
    PENDING: { label: "Pending", className: "border-yellow-200 bg-yellow-50 text-yellow-900", icon: Clock },
    PAID: { label: "Confirmed", className: "border-green-200 bg-green-50 text-green-900", icon: CheckCircle2 },
    CANCELLED: { label: "Cancelled", className: "border-red-200 bg-red-50 text-red-900", icon: XCircle },
    REFUNDED: { label: "Refunded", className: "border-slate-200 bg-slate-50 text-slate-900", icon: XCircle },
    PARTIALLY_REFUNDED: { label: "Partially Refunded", className: "border-orange-200 bg-orange-50 text-orange-900", icon: Clock },
  };
  const statusInfo = orderStatusMap[order.status] || orderStatusMap.PENDING;
  const StatusIcon = statusInfo.icon;
  const isPaid = order.status === "PAID";

  // Get all ticket numbers
  const ticketNumbers: string[] = [];
  order.items?.forEach((item) => {
    item.tickets?.forEach((ticket) => {
      if (ticket.ticketNumber) {
        ticketNumbers.push(ticket.ticketNumber);
      }
    });
  });

  // Format date
  const purchaseDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/organizer/orders"
            className="inline-flex items-center gap-2 text-sm text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Orders</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Status Banner */}
        <div className={`mb-8 rounded-2xl border ${statusInfo.className} p-4`}>
          <div className="flex items-center gap-3">
            <StatusIcon className="size-5" />
            <div>
              <p className="font-semibold">Order {statusInfo.label}</p>
              <p className="text-sm opacity-80">
                Order Number: {order.orderNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Order Card */}
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          {eventImage && (
            <div className="relative h-64 w-full">
              <Image
                src={eventImage}
                alt={eventName}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              {eventName}
            </h1>
            <p className="text-sm text-slate-600 mb-6">
              Purchased on {purchaseDate}
            </p>

            {/* Order Items */}
            <div className="space-y-4 mb-6">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">
                        {item.ticketTypeName}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-slate-600">
                        Unit Price: KES {(item.unitPriceCents / 100).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        KES {(item.totalPriceCents / 100).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="border-t border-slate-200 pt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-semibold text-slate-900">
                  KES {(itemsTotal / 100).toLocaleString()}
                </span>
              </div>
              {fees > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Fees</span>
                  <span className="font-semibold text-slate-900">
                    KES {fees.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-3">
                <span className="font-semibold text-lg text-slate-900">Total</span>
                <span className="font-semibold text-lg text-slate-900">
                  KES {orderTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="mb-6 text-xl font-semibold text-slate-900">
            Customer Information
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <User className="mt-0.5 size-5 text-slate-400" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Name</p>
                <p className="mt-1 text-sm text-slate-600">{customerName}</p>
              </div>
            </div>
            {customerEmail && (
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 size-5 text-slate-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Email</p>
                  <p className="mt-1 text-sm text-slate-600">{customerEmail}</p>
                </div>
              </div>
            )}
            {customerPhone && (
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 size-5 text-slate-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Phone</p>
                  <p className="mt-1 text-sm text-slate-600">{customerPhone}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Information */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="mb-6 text-xl font-semibold text-slate-900">
            Payment Information
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">Payment Method</p>
              <p className="mt-1 text-sm text-slate-600">{paymentMethod}</p>
            </div>
            {paymentReference && (
              <div>
                <p className="text-sm font-semibold text-slate-900">Transaction Reference</p>
                <p className="mt-1 font-mono text-sm text-slate-600">{paymentReference}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tickets */}
        {ticketNumbers.length > 0 && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <h2 className="mb-6 text-xl font-semibold text-slate-900">
              Tickets ({ticketNumbers.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {ticketNumbers.map((ticketNumber) => (
                <span
                  key={ticketNumber}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono font-semibold text-slate-900"
                >
                  <Ticket className="size-4 text-slate-400" />
                  {ticketNumber}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <OrderDetailClient orderId={order.id} isPaid={isPaid} />
      </div>
    </div>
  );
}

