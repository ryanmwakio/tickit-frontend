import { apiClient } from "./api";

export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  priceCents: number;
  currency: string;
  quantityTotal: number;
  quantitySold: number;
  minPerOrder?: number;
  maxPerOrder?: number;
  salesStartsAt?: string;
  salesEndsAt?: string;
  isVisible: boolean;
  isRefundable: boolean;
  category?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  unitPriceCents: number;
  totalPriceCents: number;
  tickets?: Ticket[];
  ticketType?: {
    id: string;
    name: string;
    event?: {
      id: string;
      title: string;
      coverImageUrl?: string;
    };
  };
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  orderItemId: string;
  buyerId?: string;
  attendeeName?: string;
  attendeeEmail?: string;
  attendeePhone?: string;
  status: string;
  qrCode?: string;
  checkedInAt?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  buyerId?: string;
  organiserId: string;
  status: string;
  totalAmountCents: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  organiser?: {
    id: string;
    name: string;
  };
  buyer?: {
    id: string;
    email?: string;
    phoneNumber?: string;
    firstName?: string;
    lastName?: string;
  };
  payments?: Array<{
    id: string;
    method: string;
    reference?: string;
    transactionId?: string;
    status: string;
    amountCents: number;
  }>;
}

export interface OrdersResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TicketInventoryItem {
  eventId: string;
  eventName: string;
  eventDate: string;
  eventImage?: string;
  ticketTypeId: string;
  ticketType: string;
  totalQuantity: number;
  soldQuantity: number;
  availableQuantity: number;
  price: number;
  revenue: number;
  status: string;
}

// Ticket Types API
export async function getTicketTypes(eventId: string): Promise<TicketType[]> {
  const response = await apiClient.get(`/ticket-types/events/${eventId}`);
  return response.data || [];
}

export async function getTicketType(id: string): Promise<TicketType> {
  const response = await apiClient.get(`/ticket-types/${id}`);
  return response.data;
}

export async function createTicketType(
  eventId: string,
  data: Partial<TicketType>
): Promise<TicketType> {
  const response = await apiClient.post(`/ticket-types/events/${eventId}`, data);
  return response.data;
}

export async function updateTicketType(
  id: string,
  data: Partial<TicketType>
): Promise<TicketType> {
  const response = await apiClient.put(`/ticket-types/${id}`, data);
  return response.data;
}

export async function deleteTicketType(id: string): Promise<void> {
  await apiClient.delete(`/ticket-types/${id}`);
}

// Orders API
export async function getOrders(params: {
  organiserId?: string;
  page?: number;
  limit?: number;
  status?: string;
}): Promise<OrdersResponse> {
  const queryParams = new URLSearchParams();
  if (params.organiserId) queryParams.append("organiserId", params.organiserId);
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.status) queryParams.append("status", params.status);

  const response = await apiClient.get(`/orders?${queryParams.toString()}`);
  return response.data || { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
}

export async function getOrder(id: string): Promise<Order> {
  const response = await apiClient.get<Order>(`/orders/${id}`);
  return response;
}

export async function resendTickets(
  orderId: string,
  method: "email" | "sms"
): Promise<void> {
  await apiClient.post(`/orders/${orderId}/resend`, { method });
}

// Tickets API
export async function transferTicket(
  ticketId: string,
  data: { email?: string; phoneNumber?: string }
): Promise<Ticket> {
  const response = await apiClient.post(`/tickets/${ticketId}/transfer`, data);
  return response.data;
}

export async function voidTicket(
  ticketId: string,
  reason: string
): Promise<Ticket> {
  const response = await apiClient.post(`/tickets/${ticketId}/void`, { reason });
  return response.data;
}

export async function getTicketByNumber(ticketNumber: string): Promise<Ticket> {
  const response = await apiClient.get(`/tickets/number/${ticketNumber}`);
  return response.data;
}

