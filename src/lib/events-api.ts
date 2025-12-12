import { apiClient } from "./api";
import { EventContent } from "@/data/events";

export interface EventResponseDto {
  id: string;
  organiserId: string;
  venueId?: string;
  title: string;
  slug: string;
  description?: string;
  category?: string;
  tags?: string[];
  visibility: string;
  status: string;
  startsAt: string | Date;
  endsAt: string | Date;
  timezone?: string;
  capacity?: number;
  coverImageUrl?: string;
  imageGalleryUrls?: string[];
  salesStartsAt?: string | Date;
  salesEndsAt?: string | Date;
  metadata?: Record<string, unknown>;
  createdAt: string | Date;
  updatedAt: string | Date;
  organiser?: {
    id: string;
    name: string;
    logoUrl?: string;
  };
  venue?: {
    id: string;
    name: string;
    address: string;
    city: string;
  };
  ticketTypes?: Array<{
    id: string;
    name: string;
    priceCents: number;
    currency: string;
    quantityTotal?: number;
    quantitySold?: number;
  }>;
  featured?: boolean;
  livePulse?: boolean;
  hotRightNow?: boolean;
}

export interface EventsListResponse {
  data: EventResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EventQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
  status?: string;
  visibility?: string;
  organiserId?: string;
  venueId?: string;
  startsFrom?: string;
  startsTo?: string;
  city?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  featured?: boolean;
  livePulse?: boolean;
  hotRightNow?: boolean;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Fetch events from the API with optional filters
 */
export async function fetchEvents(params: EventQueryParams = {}): Promise<EventsListResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.set("page", params.page.toString());
  if (params.limit) queryParams.set("limit", params.limit.toString());
  if (params.search) queryParams.set("search", params.search);
  if (params.category) queryParams.set("category", params.category);
  if (params.tag) queryParams.set("tag", params.tag);
  if (params.status) queryParams.set("status", params.status);
  if (params.visibility) queryParams.set("visibility", params.visibility);
  if (params.organiserId) queryParams.set("organiserId", params.organiserId);
  if (params.venueId) queryParams.set("venueId", params.venueId);
  if (params.startsFrom) queryParams.set("startsFrom", params.startsFrom);
  if (params.startsTo) queryParams.set("startsTo", params.startsTo);
  if (params.city) queryParams.set("city", params.city);
  if (params.sortBy) queryParams.set("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.set("sortOrder", params.sortOrder);
  if (params.featured !== undefined) queryParams.set("featured", params.featured.toString());
  if (params.livePulse !== undefined) queryParams.set("livePulse", params.livePulse.toString());
  if (params.hotRightNow !== undefined) queryParams.set("hotRightNow", params.hotRightNow.toString());

  const queryString = queryParams.toString();
  const url = `/events${queryString ? `?${queryString}` : ""}`;
  
  const response = await apiClient.get<EventsListResponse>(url);
  
  // The API client extracts the 'data' field from the response
  // So if backend returns { success: true, data: { data: [...], total: ... } }
  // The client returns { data: [...], total: ... }
  // Ensure we always return a valid EventsListResponse structure
  if (Array.isArray(response)) {
    // If response is directly an array (unexpected but handle it)
    return {
      data: response,
      total: response.length,
      page: 1,
      limit: response.length,
      totalPages: 1,
    };
  }
  
  // Normal case: response should have data, total, page, limit, totalPages
  return {
    data: response?.data || [],
    total: response?.total || 0,
    page: response?.page || 1,
    limit: response?.limit || 20,
    totalPages: response?.totalPages || 0,
  };
}

/**
 * Fetch a single event by ID or slug
 */
export async function fetchEvent(idOrSlug: string): Promise<EventResponseDto> {
  return apiClient.get<EventResponseDto>(`/events/${idOrSlug}`);
}

/**
 * Create a new event
 */
export interface CreateEventDto {
  title: string;
  slug?: string;
  description?: string;
  category?: string;
  tags?: string[];
  visibility?: string;
  status?: string;
  startsAt: string;
  endsAt: string;
  timezone?: string;
  capacity?: number;
  coverImageUrl?: string;
  imageGalleryUrls?: string[];
  salesStartsAt?: string;
  salesEndsAt?: string;
  venueId?: string;
  metadata?: Record<string, unknown>;
}

export async function createEvent(
  organiserId: string,
  eventData: CreateEventDto
): Promise<EventResponseDto> {
  return apiClient.post<EventResponseDto>(
    `/events?organiserId=${organiserId}`,
    eventData
  );
}

/**
 * Update an existing event
 */
export interface UpdateEventDto {
  title?: string;
  slug?: string;
  description?: string;
  category?: string;
  tags?: string[];
  visibility?: string;
  status?: string;
  startsAt?: string;
  endsAt?: string;
  timezone?: string;
  capacity?: number;
  coverImageUrl?: string;
  imageGalleryUrls?: string[];
  salesStartsAt?: string;
  salesEndsAt?: string;
  venueId?: string;
  metadata?: Record<string, unknown>;
}

export async function updateEvent(
  eventId: string,
  eventData: UpdateEventDto
): Promise<EventResponseDto> {
  return apiClient.patch<EventResponseDto>(`/events/${eventId}`, eventData);
}

/**
 * Delete an event
 */
export async function deleteEvent(eventId: string): Promise<void> {
  return apiClient.delete<void>(`/events/${eventId}`);
}

/**
 * Request approval for an event (publish)
 */
export async function requestEventApproval(eventId: string): Promise<EventResponseDto> {
  return apiClient.post<EventResponseDto>(`/events/${eventId}/request-approval`, {});
}

/**
 * Get events for a specific organiser
 */
export async function fetchOrganiserEvents(
  organiserId: string,
  params: EventQueryParams = {}
): Promise<EventsListResponse> {
  return fetchEvents({ ...params, organiserId });
}

// No image transformation - use URLs as-is from database

/**
 * Event placeholder image - SVG data URI
 * A simple, reliable placeholder that works even if external images fail
 */
const EVENT_PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'%3E%3Crect fill='%23f1f5f9' width='1200' height='800'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, -apple-system, sans-serif' font-size='48' font-weight='600' fill='%2394a3b8'%3EEvent Image%3C/text%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, -apple-system, sans-serif' font-size='24' fill='%23cbd5e1'%3EPlaceholder%3C/text%3E%3C/svg%3E";

/**
 * Map backend EventResponseDto to frontend EventContent format
 */
// Feature types
export interface FeatureDto {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  pricingType: "one_time" | "per_ticket" | "per_event" | "per_month";
  pricingUnit?: string;
  popular?: boolean;
  required?: boolean;
  category: string;
}

export interface FeatureCategoryDto {
  id: string;
  name: string;
  description: string;
  features: FeatureDto[];
}

/**
 * Fetch available features from the API
 */
export async function fetchAvailableFeatures(): Promise<FeatureCategoryDto[]> {
  try {
    const response = await apiClient.get<FeatureCategoryDto[]>("/features");
    return response || [];
  } catch (error) {
    console.error("Failed to fetch features from API, using fallback:", error);
    // Return empty array - component will use fallback
    return [];
  }
}

/**
 * Create a new feature
 */
export interface CreateFeatureDto {
  name: string;
  description: string;
  basePrice: number;
  pricingType: "one_time" | "per_ticket" | "per_event" | "per_month";
  pricingUnit?: string;
  popular?: boolean;
  required?: boolean;
  categoryId: string;
}

export interface CreateFeatureCategoryDto {
  name: string;
  description: string;
}

export async function createFeature(featureData: CreateFeatureDto): Promise<FeatureDto> {
  return apiClient.post<FeatureDto>("/features", featureData);
}

export async function createFeatureCategory(categoryData: CreateFeatureCategoryDto): Promise<FeatureCategoryDto> {
  return apiClient.post<FeatureCategoryDto>("/features/categories", categoryData);
}

export async function updateFeature(featureId: string, featureData: Partial<CreateFeatureDto>): Promise<FeatureDto> {
  return apiClient.patch<FeatureDto>(`/features/${featureId}`, featureData);
}

export async function updateFeatureCategory(
  categoryId: string,
  categoryData: Partial<CreateFeatureCategoryDto>
): Promise<FeatureCategoryDto> {
  return apiClient.patch<FeatureCategoryDto>(`/features/categories/${categoryId}`, categoryData);
}

export async function deleteFeature(featureId: string): Promise<void> {
  return apiClient.delete<void>(`/features/${featureId}`);
}

export async function deleteFeatureCategory(categoryId: string): Promise<void> {
  return apiClient.delete<void>(`/features/categories/${categoryId}`);
}

export function mapEventToEventContent(event: EventResponseDto): EventContent {
  const startsAt = new Date(event.startsAt);
  const endsAt = event.endsAt ? new Date(event.endsAt) : null;
  
  // Format date
  const dateOptions: Intl.DateTimeFormatOptions = { 
    weekday: 'short', 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  };
  const dateShort = startsAt.toLocaleDateString('en-US', dateOptions);
  
  const dateFullOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  const dateFull = startsAt.toLocaleDateString('en-US', dateFullOptions);

  // Format date for event cards - full date with day, month, year, and time
  // Format: "Mon, Jan 15, 2024, 2:00 PM"
  const dateCardOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  const dateCard = startsAt.toLocaleDateString('en-US', dateCardOptions);

  // Get minimum price from ticket types
  // Backend returns priceCents, convert to actual price (divide by 100)
  let price = "Free";
  if (event.ticketTypes && event.ticketTypes.length > 0) {
    const prices = event.ticketTypes
      .map(t => t.priceCents ? t.priceCents / 100 : 0)
      .filter(p => p > 0);
    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      price = `From KES ${minPrice.toLocaleString()}`;
    }
  }

  // Map images - use placeholder if no images available
  const gallery = (event.imageGalleryUrls || []).map(url => ({
    type: "image" as const,
    src: url || EVENT_PLACEHOLDER_IMAGE,
  }));
  if (event.coverImageUrl && !gallery.some(img => img.src === event.coverImageUrl)) {
    gallery.unshift({
      type: "image" as const,
      src: event.coverImageUrl,
    });
  }
  // If no gallery images at all, add placeholder
  if (gallery.length === 0) {
    gallery.push({
      type: "image" as const,
      src: EVENT_PLACEHOLDER_IMAGE,
    });
  }

  return {
    id: event.id, // Include event ID (UUID) from backend
    slug: event.slug,
    title: event.title,
    location: event.venue?.address || event.venue?.name || "Location TBA",
    region: event.venue?.city || "Kenya",
    dateShort,
    dateFull,
    dateCard: dateCard, // Full date format for event cards: "Mon, Jan 15, 2024, 2:00 PM"
    startDate: startsAt.toISOString(),
    endDate: endsAt?.toISOString(),
    price,
    heroImage: event.coverImageUrl || EVENT_PLACEHOLDER_IMAGE,
    gallery,
    summary: event.description || "",
    categories: event.category ? [event.category] : [],
    tags: event.tags || [],
    highlights: [],
    schedule: [],
    ticketTiers: event.ticketTypes?.map(t => {
      // Backend returns priceCents, convert to actual price (divide by 100)
      const priceInKES = t.priceCents ? (t.priceCents / 100) : 0;
      return {
        id: t.id, // Include ticket type ID
        name: t.name,
        price: priceInKES > 0 ? `KES ${priceInKES.toLocaleString()}` : "Free",
        priceCents: t.priceCents || 0,
        available: (t.quantityTotal || 0) - (t.quantitySold || 0),
        benefits: [],
      };
    }) || [],
    experiences: [],
    addOns: [],
    compliance: [],
    faqs: [],
    seatMap: undefined,
    insights: undefined,
    partners: undefined,
    organiserId: event.organiserId, // Include organiser ID for checkout
  };
}

