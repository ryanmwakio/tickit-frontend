import { Metadata } from "next";
import { EventCreationPage } from "@/components/organizer/event-creation";

export const metadata: Metadata = {
  title: "Create Event | Organizer Portal",
  description: "Comprehensive event creation studio with drag-and-drop gallery, ticket design, and seat map builder.",
};

export default function CreateEventPage() {
  return <EventCreationPage />;
}

