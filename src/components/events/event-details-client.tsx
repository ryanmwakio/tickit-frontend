"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { EventContent } from "@/data/events";
import { TicketPurchaseButton } from "./ticket-purchase-button";

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
  showViewTickets = true,
}: AutoOpenTicketButtonProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Clean up URL by removing the openTickets parameter if it exists
    // but don't auto-open the modal
    const openTickets = searchParams.get("openTickets");
    if (openTickets === "true") {
      if (window.history.replaceState) {
        const url = new URL(window.location.href);
        url.searchParams.delete("openTickets");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [searchParams]);

  return (
    <TicketPurchaseButton
      event={event}
      isPast={isPast}
      fullWidth={fullWidth}
      showViewTickets={showViewTickets}
      autoOpen={false}
    />
  );
}
