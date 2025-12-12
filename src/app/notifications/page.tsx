"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, CheckCircle2, Calendar, MessageSquare, AlertCircle, Sparkles, Clock, Settings, Trash2, Filter } from "lucide-react";
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
import { getSocket } from "@/lib/websocket";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | NotificationType>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      loadUnreadCount();

      // Setup WebSocket for real-time notifications
      const socket = getSocket();
      if (socket) {
        socket.on('notification:new', (data: Notification) => {
          setNotifications((prev) => [data, ...prev]);
          setUnreadCount((prev) => prev + 1);
        });
      }
    }
  }, [isAuthenticated, filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const queryParams: any = { page, limit: 20 };
      if (filter === "unread") {
        queryParams.isRead = false;
      } else if (filter !== "all") {
        queryParams.type = filter;
      }
      const response = await getNotifications(queryParams);
      if (page === 1) {
        setNotifications(response.data);
      } else {
        setNotifications((prev) => [...prev, ...response.data]);
      }
      setHasMore(response.data.length === 20 && response.total > page * 20);
    } catch (error) {
      console.error("Failed to load notifications:", error);
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
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    if (page > 1) {
      loadNotifications();
    }
  }, [page]);

  useEffect(() => {
    setPage(1);
    loadNotifications();
  }, [filter]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900 mb-2">Please sign in</p>
          <Link href="/auth/login" className="text-sm text-green-600 hover:underline">
            Sign in to view notifications
          </Link>
        </div>
      </div>
    );
  }

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition mb-4"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50">
                <Bell className="size-6 text-slate-900" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">Notifications</h1>
                <p className="text-sm text-slate-600 mt-1">
                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  onClick={handleMarkAllAsRead}
                  variant="outline"
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
              <Link
                href="/notifications/preferences"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Settings className="size-4" />
                Preferences
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="size-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Notifications</SelectItem>
              <SelectItem value="unread">Unread Only</SelectItem>
              <SelectItem value={NotificationType.PAYMENT_SUCCESSFUL}>Payments</SelectItem>
              <SelectItem value={NotificationType.EVENT_DATE_CHANGE}>Events</SelectItem>
              <SelectItem value={NotificationType.ORGANIZER_MESSAGE}>Messages</SelectItem>
              <SelectItem value={NotificationType.NEW_EVENTS_SUGGESTED}>Promotions</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notifications List */}
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="size-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80 p-12 text-center">
            <Bell className="mx-auto size-16 text-slate-300 mb-4" />
            <p className="text-lg font-semibold text-slate-900 mb-2">No notifications</p>
            <p className="text-sm text-slate-600">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Unread Section */}
            {unreadNotifications.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-900 mb-3 px-2">Unread</h2>
                <div className="space-y-2">
                  {unreadNotifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    const colorClass = getNotificationColor(notification.type);
                    return (
                      <NotificationCard
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
              </div>
            )}

            {/* Read Section */}
            {readNotifications.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-500 mb-3 px-2">Read</h2>
                <div className="space-y-2">
                  {readNotifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    const colorClass = getNotificationColor(notification.type);
                    return (
                      <NotificationCard
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
              </div>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="pt-4">
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Load more"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationCard({
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
    if (notification.metadata?.link) {
      window.location.href = notification.metadata.link;
    }
  };

  return (
    <div
      className={`group relative rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md cursor-pointer ${
        !notification.isRead ? "border-green-200 bg-green-50/30" : "border-slate-100"
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 mt-0.5 ${colorClass}`}>
          <Icon className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-semibold ${!notification.isRead ? "text-slate-900" : "text-slate-700"}`}>
              {notification.title}
            </p>
            {!notification.isRead && (
              <div className="flex-shrink-0 size-2 rounded-full bg-green-600" />
            )}
          </div>
          <p className="mt-1 text-xs text-slate-600">{notification.message}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <Clock className="size-3" />
              {formatTimeAgo(notification.createdAt)}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="opacity-0 group-hover:opacity-100 transition text-slate-400 hover:text-red-600 p-1"
              aria-label="Delete notification"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

