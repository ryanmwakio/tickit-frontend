"use client";

import React from "react";
import { Ticket } from "lucide-react";
import { EventContent } from "@/data/events";
import { TicketPurchaseFlow } from "./ticket-purchase-flow";
import { ViewMyTickets } from "./view-my-tickets";

interface TicketPurchaseButtonProps {
  event: EventContent;
  isPast: boolean;
  fullWidth?: boolean;
  showViewTickets?: boolean;
  autoOpen?: boolean; // Auto-open modal when component mounts
}

export function TicketPurchaseButton({ 
  event, 
  isPast, 
  fullWidth = false,
  showViewTickets = true,
  autoOpen = false
}: TicketPurchaseButtonProps) {
  const [isPurchaseOpen, setIsPurchaseOpen] = React.useState(autoOpen);
  const [isViewTicketsOpen, setIsViewTicketsOpen] = React.useState(false);

  // Handle auto-open when prop changes
  React.useEffect(() => {
    if (autoOpen && !isPast) {
      setIsPurchaseOpen(true);
    }
  }, [autoOpen, isPast]);

  if (isPast) {
    return (
      <button
        disabled
        className={`${fullWidth ? 'w-full' : 'inline-flex'} items-center justify-center rounded-xl sm:rounded-2xl bg-slate-300 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-500 shadow-sm cursor-not-allowed`}
      >
        Event Ended
      </button>
    );
  }

  const buttonClassName = fullWidth
    ? "w-full rounded-xl sm:rounded-2xl bg-slate-900 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white"
    : "inline-flex items-center justify-center rounded-xl sm:rounded-2xl bg-slate-900 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm shadow-slate-900/20 transition hover:-translate-y-0.5";

  return (
    <>
      <div className={fullWidth ? "space-y-2 sm:space-y-3" : "flex items-center gap-2"}>
        {showViewTickets && !fullWidth && (
          <button
            onClick={() => setIsViewTicketsOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl sm:rounded-2xl border border-slate-200 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-900 transition hover:border-slate-400"
          >
            <Ticket className="size-4" />
            View my tickets
          </button>
        )}
        <button
          onClick={() => setIsPurchaseOpen(true)}
          className={buttonClassName}
        >
          Get tickets
        </button>
      </div>
      <TicketPurchaseFlow
        event={event}
        isOpen={isPurchaseOpen}
        onClose={() => setIsPurchaseOpen(false)}
      />
      <ViewMyTickets
        event={event}
        isOpen={isViewTicketsOpen}
        onClose={() => setIsViewTicketsOpen(false)}
      />
    </>
  );
}

