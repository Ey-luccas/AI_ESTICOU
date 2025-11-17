import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

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

const initialNotifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Nova variação criada',
    description: 'Fitness Studio Pro gerou 2 novas variações.',
    timeLabel: 'Há 5 min',
    category: 'variation',
    read: false,
  },
  {
    id: 'n2',
    title: 'Cliente ativado',
    description: 'Restaurante Sabor & Arte está ativo desde hoje.',
    timeLabel: 'Há 1 hora',
    category: 'client',
    read: false,
  },
  {
    id: 'n3',
    title: 'Designer conectou',
    description: 'Ana Designer acessou o painel.',
    timeLabel: 'Ontem',
    category: 'system',
    read: true,
  },
];

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `notification-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

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
  }, []);

  const toggleNotificationRead = useCallback((id: string) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id ? { ...notification, read: !notification.read } : notification,
      ),
    );
  }, []);

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

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
