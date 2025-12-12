"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Search, Send, Loader2, User, Bot, UserCheck, Clock, CheckCircle2, XCircle } from "lucide-react";
import {
  getAllChatSessions,
  sendAgentMessage,
  assignSession,
  getAgentUnreadCount,
  getSession,
  ChatSession,
  ChatMessage,
  MessageSenderType,
  ChatSessionStatus,
} from "@/lib/chat-api";
import { getSocket } from "@/lib/websocket";

export function ChatManagement() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ChatSessionStatus | "ALL">("ALL");
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
    loadUnreadCount();
    const interval = setInterval(() => {
      loadSessions();
      loadUnreadCount();
    }, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [statusFilter, search]);

  useEffect(() => {
    if (selectedSession?.id) {
      loadSessionMessages();
      setupWebSocket();
    }
  }, [selectedSession?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadSessions = async () => {
    try {
      const filters: any = {};
      if (statusFilter !== "ALL") filters.status = statusFilter;
      if (search) filters.search = search;
      const data = await getAllChatSessions(filters);
      setSessions(data);
      
      // Update selected session if it exists
      if (selectedSession) {
        const updated = data.find((s) => s.id === selectedSession.id);
        if (updated) setSelectedSession(updated);
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const { count } = await getAgentUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  };

  const loadSessionMessages = async () => {
    if (!selectedSession?.id) return;
    try {
      const session = await getSession(selectedSession.id);
      setMessages(session.messages || []);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const setupWebSocket = () => {
    if (!selectedSession?.id) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit("join-room", { room: `chat:${selectedSession.id}` });

    const handleMessage = (data: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
      loadUnreadCount();
    };

    socket.on("chat:message", handleMessage);

    return () => {
      socket.off("chat:message", handleMessage);
      socket.emit("leave-room", { room: `chat:${selectedSession.id}` });
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedSession?.id || sending) return;

    const messageText = inputMessage.trim();
    setInputMessage("");
    setSending(true);

    try {
      // Auto-assign if not assigned
      if (!selectedSession.assignedToId) {
        await assignSession(selectedSession.id);
      }

      const agentMessage = await sendAgentMessage(selectedSession.id, messageText);
      setMessages((prev) => [...prev, agentMessage]);
      loadSessions(); // Refresh to update session status
    } catch (error) {
      console.error("Failed to send message:", error);
      setInputMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleSelectSession = async (session: ChatSession) => {
    setSelectedSession(session);
    if (session.status !== ChatSessionStatus.ESCALATED && !session.assignedToId) {
      try {
        await assignSession(session.id);
        loadSessions();
      } catch (error) {
        console.error("Failed to assign session:", error);
      }
    }
  };

  const getStatusColor = (status: ChatSessionStatus) => {
    switch (status) {
      case ChatSessionStatus.ACTIVE:
        return "bg-green-100 text-green-700";
      case ChatSessionStatus.ESCALATED:
        return "bg-blue-100 text-blue-700";
      case ChatSessionStatus.RESOLVED:
        return "bg-slate-100 text-slate-700";
      case ChatSessionStatus.CLOSED:
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusIcon = (status: ChatSessionStatus) => {
    switch (status) {
      case ChatSessionStatus.ACTIVE:
        return <Clock className="size-3" />;
      case ChatSessionStatus.ESCALATED:
        return <UserCheck className="size-3" />;
      case ChatSessionStatus.RESOLVED:
        return <CheckCircle2 className="size-3" />;
      case ChatSessionStatus.CLOSED:
        return <XCircle className="size-3" />;
      default:
        return null;
    }
  };

  const getUnreadCountForSession = (session: ChatSession) => {
    if (!session.messages) return 0;
    return session.messages.filter(
      (m) => m.senderType === MessageSenderType.USER && !m.isRead
    ).length;
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4 rounded-xl border border-slate-200 bg-white">
      {/* Sessions List */}
      <div className="w-80 border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Chat Sessions</h2>
            {unreadCount > 0 && (
              <span className="flex size-6 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
          <div className="flex gap-2">
            {(["ALL", ChatSessionStatus.ACTIVE, ChatSessionStatus.ESCALATED, ChatSessionStatus.RESOLVED, ChatSessionStatus.CLOSED] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  statusFilter === status
                    ? "bg-green-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {status === "ALL" ? "All" : status.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-slate-400" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No chat sessions found
            </div>
          ) : (
            sessions.map((session) => {
              const unread = getUnreadCountForSession(session);
              const isSelected = selectedSession?.id === session.id;
              return (
                <button
                  key={session.id}
                  onClick={() => handleSelectSession(session)}
                  className={`w-full border-b border-slate-100 p-4 text-left transition hover:bg-slate-50 ${
                    isSelected ? "bg-green-50 border-l-4 border-l-green-600" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {session.user?.name || session.guestName || "Guest User"}
                        </p>
                        {unread > 0 && (
                          <span className="flex size-5 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white flex-shrink-0">
                            {unread > 9 ? "9+" : unread}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {session.user?.email || session.guestEmail || "No email"}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(
                            session.status
                          )}`}
                        >
                          {getStatusIcon(session.status)}
                          {session.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 flex-shrink-0">
                      {new Date(session.updatedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedSession ? (
          <>
            <div className="border-b border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {selectedSession.user?.name || selectedSession.guestName || "Guest User"}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {selectedSession.user?.email || selectedSession.guestEmail || "No email"}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                    selectedSession.status
                  )}`}
                >
                  {getStatusIcon(selectedSession.status)}
                  {selectedSession.status.replace("_", " ")}
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${
                    message.senderType === MessageSenderType.AGENT
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {message.senderType !== MessageSenderType.AGENT && (
                    <div className="flex size-8 items-center justify-center rounded-full bg-slate-200 text-slate-600 flex-shrink-0">
                      {message.senderType === MessageSenderType.USER ? (
                        <User className="size-4" />
                      ) : (
                        <Bot className="size-4" />
                      )}
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.senderType === MessageSenderType.AGENT
                        ? "bg-green-600 text-white"
                        : "bg-white text-slate-900 border border-slate-200"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                  </div>
                  {message.senderType === MessageSenderType.AGENT && (
                    <div className="flex size-8 items-center justify-center rounded-full bg-green-600 text-white flex-shrink-0">
                      <UserCheck className="size-4" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t border-slate-200 p-4 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || sending}
                  className="flex size-10 items-center justify-center rounded-xl bg-green-600 text-white transition hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="size-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Select a chat session to start</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

