"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, CheckCircle2, Circle, DollarSign, Calendar, MessageSquare, AlertCircle, Sparkles, Clock, Settings } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  Notification,
  NotificationType,
} from "@/lib/notifications-api";
import { useNotifications } from "@/hooks/use-notifications";

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case NotificationType.PAYMENT_SUCCESSFUL:
    case NotificationType.TICKET_DELIVERED:
      return CheckCircle2;
    case NotificationType.PAYMENT_FAILED:
    case NotificationType.EVENT_CANCELLED:
      return AlertCircle;
    case NotificationType.EVENT_DATE_CHANGE:
    case NotificationType.EVENT_VENUE_CHANGE:
    case NotificationType.EVENT_TIME_CHANGE:
      return Calendar;
    case NotificationType.ORGANIZER_MESSAGE:
    case NotificationType.ORGANIZER_ANNOUNCEMENT:
      return MessageSquare;
    case NotificationType.EARLY_BIRD_TICKETS:
    case NotificationType.DISCOUNT_AVAILABLE:
    case NotificationType.NEW_EVENTS_SUGGESTED:
    case NotificationType.TRENDING_EVENTS:
      return Sparkles;
    default:
      return Bell;
  }
}

function getNotificationColor(type: NotificationType) {
  if (
    [
      NotificationType.PAYMENT_SUCCESSFUL,
      NotificationType.TICKET_DELIVERED,
      NotificationType.REFUND_PROCESSED,
    ].includes(type)
  ) {
    return "text-green-600";
  }
  if (
    [
      NotificationType.PAYMENT_FAILED,
      NotificationType.EVENT_CANCELLED,
      NotificationType.ACCOUNT_CHANGED,
    ].includes(type)
  ) {
    return "text-red-600";
  }
  if (
    [
      NotificationType.EARLY_BIRD_TICKETS,
      NotificationType.DISCOUNT_AVAILABLE,
    ].includes(type)
  ) {
    return "text-green-600";
  }
  return "text-slate-600";
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

export function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const loadNotifications = async (pageNum: number = 1, append: boolean = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await getNotifications({ page: pageNum, limit: 10 });
      // API function ensures response is always in correct format
      const notifications = response.data || [];
      const total = response.total || 0;
      
      if (append) {
        setNotifications((prev) => [...prev, ...notifications]);
      } else {
        setNotifications(notifications);
      }
      setHasMore(notifications.length === 10 && total > pageNum * 10);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      // Set empty array on error
      if (!append) {
        setNotifications([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  };

  // Use notifications hook for WebSocket integration
  useNotifications(
    (notification) => {
      // Add new notification to the top of the list
      setNotifications((prev) => [notification, ...prev]);
      // Increment unread count
      setUnreadCount((prev) => prev + 1);
    },
    (count) => {
      setUnreadCount(count);
    },
  );

  useEffect(() => {
    if (isAuthenticated) {
      loadUnreadCount();
      if (isOpen) {
        loadNotifications(1, false);
      }
    }
  }, [isAuthenticated, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      const deleted = notifications.find((n) => n.id === notificationId);
      if (deleted && !deleted.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadNotifications(nextPage, true);
  };

  if (!isAuthenticated) {
    return null;
  }

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center rounded-xl border border-slate-200 bg-white/70 p-2.5 text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
        aria-label="Notifications"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex min-w-[18px] items-center justify-center rounded-full bg-green-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-40 sm:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="fixed sm:absolute right-4 sm:right-0 sm:mt-3 w-[calc(100vw-2rem)] sm:w-96 max-w-[384px] max-h-[calc(100vh-8rem)] sm:max-h-[600px] rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/70 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
            style={{
              top: `${dropdownPosition.top}px`,
            }}
          >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm sm:text-base font-semibold text-slate-900">Notifications</h3>
            <div className="flex items-center gap-1 sm:gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-[10px] sm:text-xs font-medium text-slate-600 hover:text-slate-900 transition px-1 sm:px-0"
                >
                  <span className="hidden sm:inline">Mark all read</span>
                  <span className="sm:hidden">Mark all</span>
                </button>
              )}
              <Link
                href="/notifications/preferences"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-600 hover:text-slate-900 transition rounded-lg hover:bg-slate-50"
                aria-label="Notification settings"
              >
                <Settings className="size-4" />
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-600 hover:text-slate-900 transition rounded-lg hover:bg-slate-50"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="size-5 sm:size-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 text-center">
                <Bell className="size-10 sm:size-12 text-slate-300 mb-2 sm:mb-3" />
                <p className="text-xs sm:text-sm font-semibold text-slate-900 mb-1">No notifications</p>
                <p className="text-[10px] sm:text-xs text-slate-600">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {/* Unread notifications */}
                {unreadNotifications.length > 0 && (
                  <div>
                    {unreadNotifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.type);
                      const colorClass = getNotificationColor(notification.type);
                      return (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          Icon={Icon}
                          colorClass={colorClass}
                          onMarkAsRead={() => handleMarkAsRead(notification.id)}
                          onDelete={() => handleDelete(notification.id)}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Read notifications */}
                {readNotifications.length > 0 && (
                  <div>
                    {readNotifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.type);
                      const colorClass = getNotificationColor(notification.type);
                      return (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          Icon={Icon}
                          colorClass={colorClass}
                          onMarkAsRead={() => handleMarkAsRead(notification.id)}
                          onDelete={() => handleDelete(notification.id)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Load More */}
            {hasMore && !loading && (
              <div className="border-t border-slate-100 p-2 sm:p-3">
                <button
                  onClick={handleLoadMore}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Load more
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 p-2 sm:p-3">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="block w-full rounded-lg bg-slate-50 px-2 sm:px-3 py-1.5 sm:py-2 text-center text-[10px] sm:text-xs font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              View all notifications
            </Link>
          </div>
        </div>
        </>
      )}
    </div>
  );
}

function NotificationItem({
  notification,
  Icon,
  colorClass,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  Icon: React.ElementType;
  colorClass: string;
  onMarkAsRead: () => void;
  onDelete: () => void;
}) {
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead();
    }
    // Navigate to link if available
    if (notification.metadata?.link) {
      window.location.href = notification.metadata.link;
    }
  };

  return (
    <div
      className={`group relative px-3 sm:px-4 py-2.5 sm:py-3 transition hover:bg-slate-50 cursor-pointer ${
        !notification.isRead ? "bg-green-50/50" : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <div className={`flex-shrink-0 mt-0.5 ${colorClass}`}>
          <Icon className="size-4 sm:size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-xs sm:text-sm font-semibold ${!notification.isRead ? "text-slate-900" : "text-slate-700"}`}>
              {notification.title}
            </p>
            {!notification.isRead && (
              <div className="flex-shrink-0 size-1.5 sm:size-2 rounded-full bg-green-600" />
            )}
          </div>
          <p className="mt-0.5 text-[10px] sm:text-xs text-slate-600 line-clamp-2">{notification.message}</p>
          <div className="mt-1.5 sm:mt-2 flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] text-slate-500 flex items-center gap-1">
              <Clock className="size-2.5 sm:size-3" />
              {formatTimeAgo(notification.createdAt)}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition text-slate-400 hover:text-red-600 p-0.5 sm:p-1"
              aria-label="Delete notification"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

