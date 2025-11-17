import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

export type NotificationCategory = 'client' | 'variation' | 'system';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category?: NotificationCategory;
  timeLabel: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timeLabel' | 'read'> & {
    timeLabel?: string;
    read?: boolean;
  }) => void;
  markAllAsRead: () => void;
  toggleNotificationRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `notification-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        setNotifications([]);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/notifications?userId=${user.id}`);
        const result = await response.json();

        if (result?.success && Array.isArray(result.data?.notifications)) {
          const serverNotifications: NotificationItem[] = result.data.notifications.map(
            (notification: any) => ({
              id: notification._id || notification.id,
              title: notification.title,
              description: notification.message ?? notification.description ?? '',
              category: mapNotificationType(notification.type),
              timeLabel: new Date(notification.createdAt).toLocaleString(),
              read: Boolean(notification.read),
            }),
          );

          setNotifications(serverNotifications);
        }
      } catch (error) {
        console.error('Erro ao carregar notificações', error);
      }
    };

    fetchNotifications();
  }, [user, token]);

  const syncMarkAllRead = useCallback(async () => {
    if (!user) return;
    try {
      await fetch(`${API_URL}/notifications/mark-all/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });
    } catch (error) {
      console.warn('Não foi possível sincronizar marcação de notificações', error);
    }
  }, [user]);

  const syncToggleRead = useCallback(
    async (id: string) => {
      try {
        await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PATCH' });
      } catch (error) {
        console.warn('Não foi possível sincronizar status da notificação', error);
      }
    },
    [],
  );

  const addNotification = useCallback(
    (notification: Omit<NotificationItem, 'id' | 'timeLabel' | 'read'> & { timeLabel?: string; read?: boolean }) => {
      setNotifications((previous) => [
        {
          ...notification,
          id: generateId(),
          timeLabel: notification.timeLabel || 'Agora',
          read: notification.read ?? false,
        },
        ...previous,
      ]);
    },
    [],
  );

  const markAllAsRead = useCallback(() => {
    setNotifications((previous) => previous.map((notification) => ({ ...notification, read: true })));
    syncMarkAllRead();
  }, [syncMarkAllRead]);

  const toggleNotificationRead = useCallback((id: string) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id ? { ...notification, read: !notification.read } : notification,
      ),
    );
    syncToggleRead(id);
  }, [syncToggleRead]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markAllAsRead, toggleNotificationRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

function mapNotificationType(type?: string): NotificationCategory | undefined {
  if (!type) return undefined;
  if (type === 'CLIENTE') return 'client';
  if (type === 'VARIACAO') return 'variation';
  return 'system';
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
