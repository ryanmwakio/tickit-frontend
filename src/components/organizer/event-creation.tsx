"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { FeatureSelection } from "./event-creation/feature-selection";
import { EventBasicInfo } from "./event-creation/basic-info";
import { EventGalleryEditor } from "./event-creation/gallery-editor";
import { TicketDesignEditor } from "./event-creation/ticket-editor";
import { SeatMapCreator } from "./event-creation/seat-map-creator";
import { PricingPackages } from "./event-creation/pricing-packages";
import { SponsorsManager } from "./event-creation/sponsors-manager";
import { TermsConditions } from "./event-creation/terms-conditions";
import { MerchandiseManager, type MerchandiseItem } from "./event-creation/merchandise-manager";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { SessionProtectedForm } from "@/components/auth/session-protected-form";
import {
  createEvent,
  updateEvent,
  CreateEventDto,
  UpdateEventDto,
} from "@/lib/events-api";
import { apiClient } from "@/lib/api";

type TabId =
  | "features"
  | "basic"
  | "gallery"
  | "tickets"
  | "seatmap"
  | "pricing"
  | "sponsors"
  | "merchandise"
  | "terms";

// Map features to tabs - determines which tabs should be shown
const featureToTabMap: Record<string, TabId[]> = {
  // Design & Branding features
  custom_ticket_design: ["tickets"],
  premium_templates: ["tickets"],
  custom_gallery_layout: ["gallery"],
  event_branding: ["gallery", "tickets"],

  // Ticketing features
  seat_selection: ["seatmap"],
  dynamic_pricing: ["pricing"],

  // Add-ons
  sponsor_management: ["sponsors"],
  merchandise: ["merchandise"],
};

// All tabs with their feature requirements
// A tab is shown if ANY of its requiredFeatures are selected
const allTabs: {
  id: TabId;
  label: string;
  requiredFeatures?: string[];
  showInEdit?: boolean;
}[] = [
  { id: "features", label: "Features", showInEdit: false },
  { id: "basic", label: "Basic Info" }, // Always shown - no feature requirement
  { id: "gallery", label: "Gallery" }, // Always shown - no feature requirement
  {
    id: "tickets",
    label: "Ticket Design",
    requiredFeatures: [
      "custom_ticket_design",
      "premium_templates",
      "event_branding",
    ],
  },
  {
    id: "seatmap",
    label: "Seat Map",
    requiredFeatures: ["seat_selection"],
  },
  {
    id: "pricing",
    label: "Pricing & Packages",
    requiredFeatures: ["dynamic_pricing"],
  },
  {
    id: "sponsors",
    label: "Sponsors",
    requiredFeatures: ["sponsor_management"],
  },
  {
    id: "merchandise",
    label: "Merchandise",
    requiredFeatures: ["merchandise"],
  },
  { id: "terms", label: "Terms & Conditions" }, // Always shown - no feature requirement
];

// Function to determine which tabs should be visible based on selected features
function getVisibleTabs(
  selectedFeatures: string[],
  mode: "create" | "edit",
): typeof allTabs {
  return allTabs.filter((tab) => {
    // Features tab only shown in create mode
    if (tab.id === "features" && mode === "edit") {
      return false;
    }

    // Basic, Gallery, and Terms are always shown
    if (tab.id === "basic" || tab.id === "gallery" || tab.id === "terms") {
      return true;
    }

    // If tab has required features, check if any are selected
    if (tab.requiredFeatures && tab.requiredFeatures.length > 0) {
      return tab.requiredFeatures.some((featureId) =>
        selectedFeatures.includes(featureId),
      );
    }

    // If no required features, show the tab
    return true;
  });
}

type EventInitialData = {
  id?: string;
  title?: string;
  slug?: string;
  status?: string;
  location?: string;
  region?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  price?: string;
  description?: string;
  summary?: string;
  categories?: string[];
  tags?: string[];
  timeline?: Array<{
    id: string;
    label: string;
    date: string;
    time: string;
    description?: string;
  }>;
  [key: string]: any;
};

type EventCreationPageProps = {
  initialData?: EventInitialData;
  mode?: "create" | "edit";
};

// Helper to get organiserId
async function getUserOrganiserId(userId: string): Promise<string | null> {
  try {
    // Get organisers for the current user (filtered by ownerId on backend)
    const response = await apiClient.get<any>("/organisers?limit=1");

    // Handle paginated response - apiClient may return { data: [...], total: ... } or just array
    const organisers = Array.isArray(response)
      ? response
      : response?.data || response?.data?.data || [];

    if (organisers && organisers.length > 0 && organisers[0].id) {
      return organisers[0].id;
    }

    // Fallback: try to get from events (for backward compatibility)
    const eventsResponse = await apiClient.get<any>("/events?limit=1");
    const events = Array.isArray(eventsResponse)
      ? eventsResponse
      : eventsResponse?.data || eventsResponse?.data?.data || [];

    if (events && events.length > 0 && events[0].organiserId) {
      return events[0].organiserId;
    }

    return null;
  } catch (error) {
    console.error("Failed to get organiserId:", error);
    return null;
  }
}

export function EventCreationPage({
  initialData,
  mode = "create",
}: EventCreationPageProps = {}) {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  // Centralized event data state - persists across tab changes
  const [eventData, setEventData] = useState<EventInitialData>(() => ({
    ...initialData,
    title: initialData?.title || "",
    description: initialData?.description || "",
    location: initialData?.location || "",
    region: initialData?.region || "",
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    startTime: initialData?.startTime || "",
    endTime: initialData?.endTime || "",
    price: initialData?.price || "",
    summary: initialData?.summary || "",
    categories: initialData?.categories || [],
    tags: initialData?.tags || [],
    timeline: initialData?.timeline || [],
    coverImageUrl: initialData?.coverImageUrl || "",
    imageGalleryUrls: initialData?.imageGalleryUrls || [],
    metadata: initialData?.metadata || {},
  }));

  // Update eventData when initialData changes (e.g., on edit page load)
  useEffect(() => {
    if (initialData) {
      setEventData((prev) => ({
        ...prev,
        ...initialData,
        // Preserve user changes by only updating if initialData has new values
        title: initialData.title !== undefined ? initialData.title : prev.title,
        description:
          initialData.description !== undefined
            ? initialData.description
            : prev.description,
        location:
          initialData.location !== undefined
            ? initialData.location
            : prev.location,
        region:
          initialData.region !== undefined ? initialData.region : prev.region,
        startDate:
          initialData.startDate !== undefined
            ? initialData.startDate
            : prev.startDate,
        endDate:
          initialData.endDate !== undefined
            ? initialData.endDate
            : prev.endDate,
        startTime:
          initialData.startTime !== undefined
            ? initialData.startTime
            : prev.startTime,
        endTime:
          initialData.endTime !== undefined
            ? initialData.endTime
            : prev.endTime,
        price: initialData.price !== undefined ? initialData.price : prev.price,
        summary:
          initialData.summary !== undefined
            ? initialData.summary
            : prev.summary,
        categories:
          initialData.categories !== undefined
            ? initialData.categories
            : prev.categories,
        tags: initialData.tags !== undefined ? initialData.tags : prev.tags,
        timeline:
          initialData.timeline !== undefined
            ? initialData.timeline
            : prev.timeline,
        coverImageUrl:
          initialData.coverImageUrl !== undefined
            ? initialData.coverImageUrl
            : prev.coverImageUrl,
        imageGalleryUrls:
          initialData.imageGalleryUrls !== undefined
            ? initialData.imageGalleryUrls
            : prev.imageGalleryUrls,
      }));
    }
  }, [initialData?.id]); // Only update when the event ID changes (new edit load)

  // Handler to update event data from child components
  const handleEventDataChange = (updates?: Partial<EventInitialData>) => {
    if (updates === undefined) return;
    setEventData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    initialData?.selectedFeatures || initialData?.metadata?.features || [],
  );
  const [activeTab, setActiveTab] = useState<TabId>(
    mode === "create" ? "features" : "basic",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [organiserId, setOrganiserId] = useState<string | null>(null);

  // Get visible tabs based on selected features
  const visibleTabs = getVisibleTabs(selectedFeatures, mode);

  // Ensure activeTab is valid - if current tab is not visible, switch to first visible tab
  useEffect(() => {
    const currentTabExists = visibleTabs.find((tab) => tab.id === activeTab);
    if (!currentTabExists && visibleTabs.length > 0) {
      const firstVisibleTab = visibleTabs[0]?.id;
      if (firstVisibleTab) {
        setActiveTab(firstVisibleTab);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFeatures, mode]);

  // Load features from initialData in edit mode
  useEffect(() => {
    if (mode === "edit" && initialData && selectedFeatures.length === 0) {
      // Try to load features from metadata or initialData
      const features =
        initialData.metadata?.features || initialData.selectedFeatures || [];
      if (features.length > 0) {
        setSelectedFeatures(features);
      }
    }
  }, [mode, initialData]);

  // Estimated values for cost calculation
  const [estimatedTickets] = useState(500);
  const eventDays = useMemo(() => {
    const startDate = eventData?.startDate || initialData?.startDate;
    const endDate = eventData?.endDate || initialData?.endDate;
    if (startDate && endDate) {
      return Math.max(
        1,
        Math.ceil(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );
    }
    return 1;
  }, [
    eventData?.startDate,
    eventData?.endDate,
    initialData?.startDate,
    initialData?.endDate,
  ]);

  useEffect(() => {
    if (user) {
      loadOrganiserId();
    }
  }, [user]);

  const loadOrganiserId = async () => {
    if (!user) return;
    const orgId = await getUserOrganiserId(user.id);
    setOrganiserId(orgId);
  };

  const handleSave = async () => {
    if (!organiserId) {
      alert("Organiser ID not found. Please refresh the page.");
      return;
    }

    setIsSaving(true);
    try {
      // Helper to convert date string to ISO string
      const toISOString = (
        dateStr?: string,
        timeStr?: string,
      ): string | undefined => {
        if (!dateStr) return undefined;
        const dateTime = timeStr ? `${dateStr}T${timeStr}` : dateStr;
        return new Date(dateTime).toISOString();
      };

      // Helper to convert to number if string
      const toNumber = (
        value: string | number | undefined,
      ): number | undefined => {
        if (value === undefined || value === null || value === "")
          return undefined;
        return typeof value === "number" ? value : parseInt(String(value), 10);
      };

      // Use centralized eventData state instead of initialData
      const saveData: CreateEventDto | UpdateEventDto = {
        title: eventData?.title || "Untitled Event",
        description: eventData?.description || undefined,
        category:
          eventData?.categories?.[0] || eventData?.category || undefined,
        tags:
          eventData?.tags && eventData.tags.length > 0
            ? eventData.tags
            : undefined,
        visibility: (eventData?.visibility || "PUBLIC") as
          | "PUBLIC"
          | "PRIVATE"
          | "UNLISTED",
        status:
          mode === "create"
            ? ("DRAFT" as
                | "DRAFT"
                | "PENDING_APPROVAL"
                | "APPROVED"
                | "REJECTED"
                | "PUBLISHED"
                | "CANCELLED"
                | "COMPLETED")
            : undefined,
        startsAt: eventData?.startDate
          ? new Date(
              eventData.startDate +
                (eventData.startTime ? `T${eventData.startTime}` : ""),
            ).toISOString()
          : new Date().toISOString(),
        endsAt: eventData?.endDate
          ? new Date(
              eventData.endDate +
                (eventData.endTime ? `T${eventData.endTime}` : ""),
            ).toISOString()
          : new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
        coverImageUrl: eventData?.coverImageUrl || undefined,
        imageGalleryUrls:
          eventData?.imageGalleryUrls && eventData.imageGalleryUrls.length > 0
            ? eventData.imageGalleryUrls
            : undefined,
        capacity: toNumber(eventData?.capacity),
        timezone: eventData?.timezone || "Africa/Nairobi",
        venueId: eventData?.venueId || undefined,
        salesStartsAt: eventData?.salesStartsAt
          ? typeof eventData.salesStartsAt === "string"
            ? eventData.salesStartsAt
            : new Date(eventData.salesStartsAt).toISOString()
          : undefined,
        salesEndsAt: eventData?.salesEndsAt
          ? typeof eventData.salesEndsAt === "string"
            ? eventData.salesEndsAt
            : new Date(eventData.salesEndsAt).toISOString()
          : undefined,
        metadata: {
          ...(eventData?.metadata || {}),
          features: selectedFeatures, // Store selected features in metadata
          selectedFeatures, // Also store for easy access
          summary: eventData?.summary,
          timeline: eventData?.timeline,
        },
      };

      // Remove undefined values to keep payload clean
      const cleanPayload = Object.fromEntries(
        Object.entries(saveData).filter(([_, value]) => value !== undefined),
      ) as CreateEventDto | UpdateEventDto;

      if (mode === "create") {
        const newEvent = await createEvent(
          organiserId,
          cleanPayload as CreateEventDto,
        );
        toast.success(
          "Event created successfully!",
          "Your event has been saved as a draft.",
        );
        // Use slug for redirect (more user-friendly URLs)
        if (newEvent.slug) {
          router.push(`/organizer/events/edit/${newEvent.slug}`);
        } else {
          // Fallback to ID if slug is not available
          router.push(`/organizer/events/edit/${newEvent.id}`);
        }
      } else if (initialData?.id) {
        await updateEvent(initialData.id, cleanPayload as UpdateEventDto);
        toast.success(
          "Event updated successfully!",
          "Your changes have been saved.",
        );
        // Optionally reload the page or navigate
        window.location.reload();
      }
    } catch (err: any) {
      console.error("Failed to save event:", err);
      toast.error(
        "Failed to save event",
        err.message || "Please check all required fields are filled.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Detect if there are unsaved changes
  const hasUnsavedData = useMemo(() => {
    if (mode === "edit") {
      // In edit mode, check if current data differs from initial data
      return JSON.stringify(eventData) !== JSON.stringify(initialData);
    } else {
      // In create mode, check if user has entered any data
      return !!(
        eventData?.title ||
        eventData?.description ||
        eventData?.location ||
        eventData?.startDate ||
        eventData?.endDate ||
        eventData?.price ||
        (eventData?.tags && eventData.tags.length > 0) ||
        (eventData?.categories && eventData.categories.length > 0) ||
        (selectedFeatures && selectedFeatures.length > 0)
      );
    }
  }, [eventData, initialData, selectedFeatures, mode]);

  // Handle local save for session protection
  const handleLocalSave = () => {
    if (typeof window !== "undefined") {
      const saveData = {
        eventData,
        selectedFeatures,
        activeTab,
        timestamp: Date.now(),
      };
      localStorage.setItem(
        `tickit_event_draft_${organiserId || "temp"}`,
        JSON.stringify(saveData),
      );
    }
  };

  return (
    <SessionProtectedForm
      hasUnsavedData={hasUnsavedData}
      onSave={handleLocalSave}
      expiredMessage="Your session has expired while creating/editing this event. Any unsaved changes may be lost!"
      inactivityMessage="You've been inactive while working on this event. Save your work to prevent data loss."
      className="min-h-screen bg-white"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/organizer/events"
              className="flex items-center gap-2 text-sm text-slate-600 transition hover:text-slate-900"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Events</span>
            </Link>
            {mode === "edit" && (eventData?.title || initialData?.title) && (
              <div className="hidden sm:block">
                <span className="text-sm text-slate-400">/</span>
                <span className="ml-4 text-sm font-semibold text-slate-900">
                  {eventData?.title || initialData?.title}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPreview(!isPreview)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <Eye className="size-4" />
              <span>Preview</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-50"
            >
              <Save className="size-4" />
              <span>
                {isSaving
                  ? "Saving..."
                  : mode === "edit"
                    ? "Save Changes"
                    : "Save Draft"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-8">
          <div className="flex gap-1 overflow-x-auto">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap border-b-2 px-6 py-4 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-7xl px-8 py-10">
        {activeTab === "features" && (
          <FeatureSelection
            selectedFeatures={selectedFeatures}
            onFeaturesChange={setSelectedFeatures}
            estimatedTickets={estimatedTickets}
            eventDays={eventDays}
            onContinue={() => setActiveTab("basic")}
          />
        )}
        {activeTab === "basic" && (
          <EventBasicInfo
            initialData={eventData}
            onDataChange={handleEventDataChange}
          />
        )}
        {activeTab === "gallery" && (
          <EventGalleryEditor
            initialData={eventData}
            onDataChange={handleEventDataChange}
          />
        )}
        {activeTab === "tickets" && (
          <TicketDesignEditor
            initialData={{
              ...eventData,
              selectedFeatures: selectedFeatures,
              organiserId: organiserId ?? undefined,
              eventId: eventData?.id ?? initialData?.id,
            }}
            onDataChange={handleEventDataChange}
          />
        )}
        {activeTab === "seatmap" && (
          <SeatMapCreator
            initialData={eventData}
            onDataChange={handleEventDataChange}
          />
        )}
        {activeTab === "pricing" && (
          <PricingPackages
            initialData={eventData}
            onDataChange={handleEventDataChange}
          />
        )}
        {activeTab === "sponsors" && (
          <SponsorsManager
            initialData={eventData}
            onDataChange={handleEventDataChange}
          />
        )}
        {activeTab === "merchandise" && (
          <MerchandiseManager
            initialData={{ merchandise: (eventData as Record<string, unknown>).merchandise as MerchandiseItem[] | undefined }}
            onDataChange={handleEventDataChange}
          />
        )}
        {activeTab === "terms" && (
          <TermsConditions
            initialData={eventData}
            onDataChange={handleEventDataChange}
          />
        )}
      </div>
    </SessionProtectedForm>
  );
}
