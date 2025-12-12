"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EventContent } from "@/data/events";
import { TicketPurchaseButton } from "./ticket-purchase-button";
import { isEventPast } from "@/lib/event-utils";

interface AutoOpenTicketButtonProps {
  event: EventContent;
  isPast: boolean;
  fullWidth?: boolean;
  showViewTickets?: boolean;
}

export function AutoOpenTicketButton({ 
  event, 
  isPast, 
  fullWidth = false,
  showViewTickets = true 
}: AutoOpenTicketButtonProps) {
  const searchParams = useSearchParams();
  const [autoOpen, setAutoOpen] = useState(false);

  useEffect(() => {
    // Check if we should auto-open the ticket modal
    const openTickets = searchParams.get("openTickets");
    if (openTickets === "true" && !isPast) {
      setAutoOpen(true);
      // Clean up URL by removing the query parameter
      if (window.history.replaceState) {
        const url = new URL(window.location.href);
        url.searchParams.delete("openTickets");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [searchParams, isPast]);

  return (
    <TicketPurchaseButton 
      event={event} 
      isPast={isPast} 
      fullWidth={fullWidth}
      showViewTickets={showViewTickets}
      autoOpen={autoOpen}
    />
  );
}

