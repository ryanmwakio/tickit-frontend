"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send, Minimize2, Bot, User as UserIcon, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  createOrGetSession,
  sendMessage,
  getSession,
  markMessagesAsRead,
  closeSession,
  ChatSession,
  ChatMessage,
  MessageSenderType,
  CreateMessageDto,
} from "@/lib/chat-api";
import { getSocket } from "@/lib/websocket";

export function ChatWidget() {
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Position classes: always on the right, to the left of scroll-to-top button
  // Scroll-to-top is at bottom-6 right-6 (mobile) and bottom-8 right-8 (desktop)
  // Both buttons are size-12 (48px), position chat at right-32 to leave proper spacing (~24px gap)
  const positionClasses = "bottom-6 right-24 lg:bottom-8 lg:right-24";

  // Initialize session
  useEffect(() => {
    if (isOpen && !session) {
      initializeSession();
    }
  }, [isOpen]);

  // Load session messages only once when session is set
  useEffect(() => {
    if (session?.id && messages.length === 0) {
      loadMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id]);

  // Setup WebSocket connection
  useEffect(() => {
    if (session?.id) {
      const cleanup = setupWebSocket();
      return cleanup;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when opened
  useEffect(() => {
    if (isOpen && session?.id) {
      markMessagesAsRead(session.id).catch(console.error);
    }
  }, [isOpen, session?.id, messages]);

  const initializeSession = async () => {
    try {
      setLoading(true);
      const metadata = {
        pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      };
      const newSession = await createOrGetSession({
        guestName: !isAuthenticated ? 'Guest' : undefined,
        metadata,
      });
      setSession(newSession);
      if (newSession.messages) {
        setMessages(newSession.messages);
      }
    } catch (error) {
      console.error("Failed to initialize chat session:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (skipIfSame = true) => {
    if (!session?.id) return;
    try {
      const loadedSession = await getSession(session.id);
      const newMessages = loadedSession.messages || [];
      
      // Only update if we have new messages or different count to avoid unnecessary re-renders
      setMessages((prev) => {
        if (skipIfSame) {
          // If counts match and all IDs match, don't update (prevents blinking)
          if (prev.length === newMessages.length && 
              prev.every((msg, idx) => msg.id === newMessages[idx]?.id)) {
            return prev;
          }
        }
        
        // Merge new messages with existing ones to avoid losing optimistic updates
        const merged = [...prev];
        for (const newMsg of newMessages) {
          if (!merged.some((m) => m.id === newMsg.id)) {
            merged.push(newMsg);
          }
        }
        // Sort by createdAt to maintain order
        return merged.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const setupWebSocket = () => {
    if (!session?.id) return;
    const socket = getSocket();
    if (!socket) {
      // WebSocket not available (e.g., guest user), use polling instead
      const pollInterval = setInterval(() => {
        // Only poll if we don't have recent messages to avoid blinking
        loadMessages(true); // Skip if same to prevent blinking
      }, 3000); // Poll every 3 seconds
      return () => clearInterval(pollInterval);
    }

    // Join chat room
    socket.emit('join-room', { room: `chat:${session.id}` });

    const handleMessage = (data: ChatMessage) => {
      setMessages((prev) => {
        // Avoid duplicates by checking ID
        if (prev.some((m) => m.id === data.id)) {
          return prev;
        }
        // Add new message
        return [...prev, data];
      });
    };

    socket.on('chat:message', handleMessage);

    return () => {
      socket.off('chat:message', handleMessage);
      socket.emit('leave-room', { room: `chat:${session.id}` });
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !session?.id || sending) return;

    const messageText = inputMessage.trim();
    setInputMessage("");
    setSending(true);

    try {
      const dto: CreateMessageDto = {
        message: messageText,
        metadata: {
          pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        },
      };

      const response = await sendMessage(session.id, dto);
      
      // Add user message immediately (optimistic update)
      setMessages((prev) => {
        // Check if message already exists (from WebSocket)
        if (prev.some((m) => m.id === response.userMessage.id)) {
          return prev;
        }
        return [...prev, response.userMessage];
      });
      
      // Add bot message if available (it might come via WebSocket, so check for duplicates)
      if (response.botMessage) {
        setMessages((prev) => {
          // Check if bot message already exists (from WebSocket)
          if (prev.some((m) => m.id === response.botMessage!.id)) {
            return prev;
          }
          return [...prev, response.botMessage!];
        });
      } else {
        // If no bot message in response, wait a bit for WebSocket or reload
        // Bot response might come via WebSocket or need to be fetched
        setTimeout(() => {
          loadMessages(false); // Force reload to get bot response
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setInputMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleQuickReply = (reply: string) => {
    setInputMessage(reply);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleClose = async () => {
    if (session?.id) {
      try {
        await closeSession(session.id);
      } catch (error) {
        console.error("Failed to close session:", error);
      }
    }
    setIsOpen(false);
    setIsMinimized(false);
    setSession(null);
    setMessages([]);
  };

  if (!isOpen && !isMinimized) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed ${positionClasses} z-50 flex size-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg shadow-slate-900/30 transition hover:bg-slate-800 hover:scale-110 active:scale-95`}
        aria-label="Open chat"
      >
        <MessageCircle className="size-5" strokeWidth={2.5} />
      </button>
    );
  }

  return (
    <div
      className={`fixed ${positionClasses} z-50 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 transition-all ${
        isMinimized ? "h-16 w-80" : "h-[600px] w-96 max-w-[calc(100vw-3rem)]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Bot className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">TixHub Assistant</h3>
            <p className="text-xs text-slate-500">We&apos;re here to help</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 text-slate-500 hover:text-slate-900 transition rounded-lg hover:bg-slate-50"
            aria-label={isMinimized ? "Expand" : "Minimize"}
          >
            <Minimize2 className="size-4" />
          </button>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 transition rounded-lg hover:bg-slate-50"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-slate-400" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-500">
                Start a conversation...
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${
                    message.senderType === MessageSenderType.USER ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.senderType !== MessageSenderType.USER && (
                    <div className="flex size-8 items-center justify-center rounded-full bg-slate-900 text-white flex-shrink-0">
                      <Bot className="size-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.senderType === MessageSenderType.USER
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-900 border border-slate-200"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                    {message.metadata?.quickReplies && message.metadata.quickReplies.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.metadata.quickReplies.map((reply, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuickReply(reply)}
                            className="block w-full text-left text-xs px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {message.senderType === MessageSenderType.USER && (
                    <div className="flex size-8 items-center justify-center rounded-full bg-slate-200 text-slate-600 flex-shrink-0">
                      <UserIcon className="size-4" />
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 bg-white p-4 rounded-b-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                disabled={sending || !session}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || sending || !session}
                className="flex size-10 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
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
      )}
    </div>
  );
}

