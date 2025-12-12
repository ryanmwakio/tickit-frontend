"use client";

import { useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getSocket, disconnectSocket } from "@/lib/websocket";
import { Notification } from "@/lib/notifications-api";

export function useNotifications(
  onNewNotification?: (notification: Notification) => void,
  onUnreadCountChange?: (count: number) => void,
) {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return;
    }

    const socket = getSocket();
    if (!socket) {
      return;
    }

    // Listen for new notifications
    const handleNewNotification = (data: Notification) => {
      if (onNewNotification) {
        onNewNotification(data);
      }
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      if (socket) {
        socket.off('notification:new', handleNewNotification);
      }
    };
  }, [isAuthenticated, onNewNotification]);

  const refreshUnreadCount = useCallback(async () => {
    if (onUnreadCountChange && isAuthenticated) {
      try {
        const { getUnreadCount } = await import('@/lib/notifications-api');
        const count = await getUnreadCount();
        onUnreadCountChange(count);
      } catch (error) {
        console.error('Failed to refresh unread count:', error);
      }
    }
  }, [isAuthenticated, onUnreadCountChange]);

  return { refreshUnreadCount };
}

