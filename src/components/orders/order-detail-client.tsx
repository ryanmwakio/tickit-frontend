"use client";

import { useState } from "react";
import { Download, Send, FileText, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { getOrder } from "@/lib/tickets-api";
import { downloadTicketPDF } from "@/lib/ticket-pdf";

type OrderDetailClientProps = {
  orderId: string;
  isPaid: boolean;
};

export function OrderDetailClient({ orderId, isPaid }: OrderDetailClientProps) {
  const [downloading, setDownloading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      setError(null);
      setDownloadSuccess(false);

      // Fetch order to get all tickets
      const order = await getOrder(orderId);

      // Get all tickets from all order items
      const allTickets = order.items?.flatMap((item) => item.tickets || []) || [];

      if (allTickets.length === 0) {
        setError("No tickets found for this order.");
        return;
      }

      let successCount = 0;
      let failCount = 0;

      // Download each ticket PDF sequentially
      for (let i = 0; i < allTickets.length; i++) {
        const ticket = allTickets[i];
        try {
          await downloadTicketPDF(ticket.id);
          successCount++;
          // Small delay between downloads to avoid browser blocking multiple downloads
          if (i < allTickets.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        } catch (err) {
          console.error(`Failed to download PDF for ticket ${ticket.id}:`, err);
          failCount++;
        }
      }

      if (successCount > 0) {
        setDownloadSuccess(true);
        if (failCount > 0) {
          setError(`Downloaded ${successCount} ticket${successCount > 1 ? "s" : ""}, but ${failCount} failed.`);
        }
        // Clear success message after 5 seconds
        setTimeout(() => setDownloadSuccess(false), 5000);
      } else {
        setError("Failed to download tickets. Please try again.");
      }
    } catch (err: any) {
      console.error("Download error:", err);
      setError(err?.message || "Failed to download PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleResendTickets = async (method: "email" | "sms") => {
    try {
      setResending(true);
      setError(null);
      setResendSuccess(false);
      
      await apiClient.post(`/orders/${orderId}/resend`, { method });
      setResendSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (err) {
      setError(`Failed to resend tickets via ${method}. Please try again.`);
      console.error("Resend error:", err);
    } finally {
      setResending(false);
    }
  };

  if (!isPaid) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
      <h2 className="mb-6 text-xl font-semibold text-slate-900">Actions</h2>
      
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          {error}
        </div>
      )}
      
      {resendSuccess && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900 flex items-center gap-2">
          <CheckCircle2 className="size-4" />
          Tickets resent successfully!
        </div>
      )}

      {downloadSuccess && !error && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900 flex items-center gap-2">
          <CheckCircle2 className="size-4" />
          Tickets downloaded successfully!
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="size-4" />
          {downloading ? "Downloading..." : "Download PDF"}
        </button>

        <button
          onClick={() => handleResendTickets("email")}
          disabled={resending}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="size-4" />
          {resending ? "Resending..." : "Resend via Email"}
        </button>

        <button
          onClick={() => handleResendTickets("sms")}
          disabled={resending}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="size-4" />
          {resending ? "Resending..." : "Resend via SMS"}
        </button>
      </div>
    </div>
  );
}

