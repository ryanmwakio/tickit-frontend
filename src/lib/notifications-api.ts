import { apiClient } from './api';

export enum NotificationType {
  PAYMENT_SUCCESSFUL = 'PAYMENT_SUCCESSFUL',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  TICKET_DELIVERED = 'TICKET_DELIVERED',
  REFUND_PROCESSED = 'REFUND_PROCESSED',
  EVENT_DATE_CHANGE = 'EVENT_DATE_CHANGE',
  EVENT_VENUE_CHANGE = 'EVENT_VENUE_CHANGE',
  EVENT_TIME_CHANGE = 'EVENT_TIME_CHANGE',
  EVENT_CANCELLED = 'EVENT_CANCELLED',
  ORGANIZER_MESSAGE = 'ORGANIZER_MESSAGE',
  ORGANIZER_ANNOUNCEMENT = 'ORGANIZER_ANNOUNCEMENT',
  LOGIN_ALERT = 'LOGIN_ALERT',
  ACCOUNT_CHANGED = 'ACCOUNT_CHANGED',
  SUBSCRIPTION_UPDATE = 'SUBSCRIPTION_UPDATE',
  NEW_EVENTS_SUGGESTED = 'NEW_EVENTS_SUGGESTED',
  EARLY_BIRD_TICKETS = 'EARLY_BIRD_TICKETS',
  DISCOUNT_AVAILABLE = 'DISCOUNT_AVAILABLE',
  TRENDING_EVENTS = 'TRENDING_EVENTS',
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  metadata?: {
    eventId?: string;
    ticketId?: string;
    orderId?: string;
    amount?: number;
    paymentMethod?: string;
    link?: string;
    [key: string]: any;
  };
  createdAt: string;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  email: boolean;
  sms: boolean;
  inApp: boolean;
  push: boolean;
  paymentUpdates: boolean;
  eventChanges: boolean;
  organizerMessages: boolean;
  systemNotifications: boolean;
  promoAllowed: boolean;
  ticketReminders: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationQueryParams {
  type?: NotificationType;
  isRead?: boolean;
  page?: number;
  limit?: number;
}

export interface NotificationsResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
}

export interface UnreadCountResponse {
  count: number;
}

// Get all notifications
export async function getNotifications(
  params?: NotificationQueryParams,
): Promise<NotificationsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.append('type', params.type);
  if (params?.isRead !== undefined) searchParams.append('isRead', String(params.isRead));
  if (params?.page) searchParams.append('page', String(params.page));
  if (params?.limit) searchParams.append('limit', String(params.limit));

  const query = searchParams.toString();
  const url = query ? `/notifications?${query}` : '/notifications';
  const response = await apiClient.get<NotificationsResponse>(url);
  
  // Ensure response has the expected structure
  if (response && typeof response === 'object') {
    // If response is already in the correct format, return it
    if ('data' in response && 'total' in response) {
      return response as NotificationsResponse;
    }
    // If response is an array (unwrapped), wrap it
    if (Array.isArray(response)) {
      return {
        data: response,
        total: response.length,
        page: params?.page || 1,
        limit: params?.limit || 20,
      };
    }
  }
  
  // Default fallback
  return {
    data: [],
    total: 0,
    page: params?.page || 1,
    limit: params?.limit || 20,
  };
}

// Get unread count
export async function getUnreadCount(): Promise<number> {
  const response = await apiClient.get<UnreadCountResponse>('/notifications/unread');
  return response.count;
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string): Promise<Notification> {
  return apiClient.patch<Notification>(`/notifications/${notificationId}/read`);
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(): Promise<{ count: number }> {
  return apiClient.patch<{ count: number }>('/notifications/read-all');
}

// Delete notification
export async function deleteNotification(notificationId: string): Promise<void> {
  await apiClient.delete(`/notifications/${notificationId}`);
}

// Get notification preferences
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  return apiClient.get<NotificationPreferences>('/notifications/preferences');
}

// Update notification preferences
export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  return apiClient.patch<NotificationPreferences>('/notifications/preferences', preferences);
}

