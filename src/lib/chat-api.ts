import { apiClient } from './api';

export enum MessageSenderType {
  USER = 'USER',
  BOT = 'BOT',
  AGENT = 'AGENT',
}

export enum ChatSessionStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
  ESCALATED = 'ESCALATED',
  CLOSED = 'CLOSED',
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderType: MessageSenderType;
  userId?: string;
  message: string;
  metadata?: {
    quickReplies?: string[];
    attachments?: Array<{
      type: string;
      url: string;
      name?: string;
    }>;
    intent?: string;
    confidence?: number;
    [key: string]: any;
  };
  isRead: boolean;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  userId?: string;
  user?: { name?: string; email?: string };
  guestId?: string;
  guestName?: string;
  guestEmail?: string;
  status: ChatSessionStatus;
  assignedToId?: string;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    pageUrl?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
}

export interface CreateMessageDto {
  message: string;
  sessionId?: string;
  metadata?: {
    guestName?: string;
    guestEmail?: string;
    pageUrl?: string;
    [key: string]: any;
  };
}

export interface CreateSessionDto {
  guestName?: string;
  guestEmail?: string;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    pageUrl?: string;
    [key: string]: any;
  };
}

// Create or get chat session
export async function createOrGetSession(dto?: CreateSessionDto): Promise<ChatSession> {
  return apiClient.post<ChatSession>('/chat/sessions', dto);
}

// Get session with messages
export async function getSession(sessionId: string): Promise<ChatSession> {
  return apiClient.get<ChatSession>(`/chat/sessions/${sessionId}`);
}

// Get user sessions
export async function getUserSessions(): Promise<ChatSession[]> {
  return apiClient.get<ChatSession[]>('/chat/sessions');
}

// Send message
export async function sendMessage(sessionId: string, dto: CreateMessageDto): Promise<{ userMessage: ChatMessage; botMessage?: ChatMessage }> {
  return apiClient.post<{ userMessage: ChatMessage; botMessage?: ChatMessage }>(`/chat/sessions/${sessionId}/messages`, dto);
}

// Mark messages as read
export async function markMessagesAsRead(sessionId: string): Promise<void> {
  await apiClient.patch(`/chat/sessions/${sessionId}/read`);
}

// Close session
export async function closeSession(sessionId: string): Promise<ChatSession> {
  return apiClient.patch<ChatSession>(`/chat/sessions/${sessionId}/close`);
}

// Agent functions
export interface ChatFilters {
  status?: ChatSessionStatus;
  assignedToId?: string;
  search?: string;
}

// Get all chat sessions (admin/organizer)
export async function getAllChatSessions(filters?: ChatFilters): Promise<ChatSession[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.assignedToId) params.append('assignedToId', filters.assignedToId);
  if (filters?.search) params.append('search', filters.search);
  
  const query = params.toString();
  return apiClient.get<ChatSession[]>(`/chat/admin/sessions${query ? `?${query}` : ''}`);
}

// Send agent message
export async function sendAgentMessage(sessionId: string, message: string): Promise<ChatMessage> {
  return apiClient.post<ChatMessage>(`/chat/admin/sessions/${sessionId}/messages`, { message });
}

// Assign session to agent
export async function assignSession(sessionId: string): Promise<ChatSession> {
  return apiClient.patch<ChatSession>(`/chat/admin/sessions/${sessionId}/assign`);
}

// Get unread count for agent
export async function getAgentUnreadCount(): Promise<{ count: number }> {
  return apiClient.get<{ count: number }>('/chat/admin/unread-count');
}

