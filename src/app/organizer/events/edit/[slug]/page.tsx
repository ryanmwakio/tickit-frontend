"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { EventCreationPage } from "@/components/organizer/event-creation";
import { fetchEvent } from "@/lib/events-api";
import { mapEventToEventContent } from "@/lib/events-api";
import { useToast } from "@/contexts/toast-context";

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const slug = params?.slug as string;
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadEvent();
    }
  }, [slug]);

  const loadEvent = async () => {
    if (!slug) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const event = await fetchEvent(slug);
      
      // Map API event to the format expected by EventCreationPage
      const eventContent = mapEventToEventContent(event);
      const startsAt = new Date(event.startsAt);
      const endsAt = event.endsAt ? new Date(event.endsAt) : null;
      
      // Extract time from dates
      const startTime = startsAt.toTimeString().slice(0, 5); // HH:MM format
      const endTime = endsAt ? endsAt.toTimeString().slice(0, 5) : undefined;
      
      const mappedData = {
        id: event.id,
        title: event.title,
        slug: event.slug,
        status: event.status,
        location: event.venue?.address || event.venue?.name || "Location TBA",
        region: event.venue?.city || "Kenya",
        startDate: startsAt.toISOString().split("T")[0], // YYYY-MM-DD
        endDate: endsAt?.toISOString().split("T")[0],
        startTime,
        endTime,
        price: eventContent.price,
        description: event.description || "",
        summary: eventContent.summary || "",
        categories: eventContent.categories || [],
        tags: event.tags || [],
        coverImageUrl: event.coverImageUrl,
        imageGalleryUrls: event.imageGalleryUrls || [],
        category: event.category,
        visibility: event.visibility,
        capacity: event.capacity,
        timezone: event.timezone,
        venueId: event.venueId,
        salesStartsAt: event.salesStartsAt ? new Date(event.salesStartsAt).toISOString().split("T")[0] : undefined,
        salesEndsAt: event.salesEndsAt ? new Date(event.salesEndsAt).toISOString().split("T")[0] : undefined,
        metadata: event.metadata,
        // Load selected features from metadata
        selectedFeatures: event.metadata?.features || event.metadata?.selectedFeatures || [],
        // Timeline would need to come from metadata or a separate API call
      timeline: [],
      };
      
      setInitialData(mappedData);
    } catch (err: any) {
      console.error("Failed to fetch event:", err);
      
      // Extract error message from various possible error formats
      let errorMessage = "Failed to load event";
      let statusCode: number | undefined;
      
      if (err) {
        // Handle ApiError format
        if (err.message) {
          errorMessage = err.message;
        } else if (typeof err === 'string') {
          errorMessage = err;
        } else if (err.error) {
          errorMessage = err.error;
        }
        
        // Extract status code
        if (err.statusCode) {
          statusCode = err.statusCode;
        } else if (err.status) {
          statusCode = err.status;
        }
      }
      
      setError(errorMessage);
      
      // Show toast notification
      if (statusCode === 404) {
        toast.error("Event not found", "The event you're looking for doesn't exist or you don't have permission to view it.");
        // Redirect to events list after a short delay
        setTimeout(() => {
          router.push("/organizer/events");
        }, 2000);
      } else {
        toast.error("Failed to load event", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
          <p className="text-sm text-slate-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="mb-2 text-lg font-semibold text-red-900">Error loading event</p>
          <p className="mb-4 text-sm text-red-700">{error}</p>
          <button
            onClick={() => router.push("/organizer/events")}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-lg font-semibold text-slate-900">Event not found</p>
          <button
            onClick={() => router.push("/organizer/events")}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return <EventCreationPage initialData={initialData} mode="edit" />;
}

