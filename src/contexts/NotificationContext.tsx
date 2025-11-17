import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export type NotificationCategory = 'client' | 'variation' | 'system' | 'art';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category?: NotificationCategory;
  timeLabel: string;
  read: boolean;
  link?: string;
  type?: string;
  createdAt: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (
    notification: Omit<
      NotificationItem,
      'id' | 'timeLabel' | 'read' | 'createdAt'
    > & {
      timeLabel?: string;
      read?: boolean;
      createdAt?: string;
    },
  ) => void;
  markAllAsRead: () => void;
  toggleNotificationRead: (id: string) => void;
  refreshNotifications: () => Promise<void>;
  socket: Socket | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

function formatTimeLabel(date: string | Date): string {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffInSeconds = Math.floor(
    (now.getTime() - notificationDate.getTime()) / 1000,
  );

  if (diffInSeconds < 60) {
    return 'Agora';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Há ${minutes} min`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Há ${hours} hora${hours > 1 ? 's' : ''}`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `Há ${days} dia${days > 1 ? 's' : ''}`;
  } else {
    return notificationDate.toLocaleDateString('pt-BR');
  }
}

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Conecta ao WebSocket quando usuário está autenticado
  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      // Limpa notificações quando usuário faz logout
      setNotifications([]);
      return;
    }

    const newSocket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('✅ Conectado ao WebSocket');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Desconectado do WebSocket');
    });

    // Escuta novas notificações
    newSocket.on('notification', (data: any) => {
      const notification: NotificationItem = {
        id: data.id,
        title: data.title,
        description: data.message,
        category: data.category || 'system',
        timeLabel: formatTimeLabel(data.createdAt),
        read: data.read || false,
        link: data.link,
        type: data.type,
        createdAt: data.createdAt,
      };

      setNotifications((prev) => [notification, ...prev]);

      // Mostra toast notification
      toast.success(data.title, {
        description: data.message,
        action: data.link
          ? {
              label: 'Ver',
              onClick: () => {
                window.location.href = data.link;
              },
            }
          : undefined,
      });
    });

    // Escuta quando notificação é marcada como lida
    newSocket.on('notification-read', ({ id }: { id: string }) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    });

    // Escuta quando todas são marcadas como lidas
    newSocket.on('all-notifications-read', () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user]);

  // Busca notificações do backend
  const refreshNotifications = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/notifications?limit=50`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result?.success) {
        const formattedNotifications: NotificationItem[] = (
          result.data.notifications || []
        ).map((n: any) => ({
          id: n._id || n.id,
          title: n.title,
          description: n.message,
          category: n.category || 'system',
          timeLabel: formatTimeLabel(n.createdAt),
          read: n.read || false,
          link: n.link,
          type: n.type,
          createdAt: n.createdAt,
        }));

        setNotifications(formattedNotifications);
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  }, [token]);

  // Busca notificações quando usuário faz login
  useEffect(() => {
    if (token && user) {
      refreshNotifications();
    }
  }, [token, user, refreshNotifications]);

  const addNotification = useCallback(
    (
      notification: Omit<
        NotificationItem,
        'id' | 'timeLabel' | 'read' | 'createdAt'
      > & {
        timeLabel?: string;
        read?: boolean;
        createdAt?: string;
      },
    ) => {
      const newNotification: NotificationItem = {
        ...notification,
        id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        timeLabel: notification.timeLabel || 'Agora',
        read: notification.read ?? false,
        createdAt: notification.createdAt || new Date().toISOString(),
      };

      setNotifications((prev) => [newNotification, ...prev]);
    },
    [],
  );

  const markAllAsRead = useCallback(async () => {
    if (!token) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      return;
    }

    try {
      if (socket) {
        socket.emit('mark-all-read');
      }

      const response = await fetch(`${API_URL}/notifications/read-all`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      // Atualiza localmente mesmo se falhar
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }, [token, socket]);

  const toggleNotificationRead = useCallback(
    async (id: string) => {
      // Atualiza localmente primeiro
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
      );

      if (!token) return;

      try {
        if (socket) {
          socket.emit('mark-notification-read', id);
        }

        const response = await fetch(`${API_URL}/notifications/${id}/read`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          // Reverte se falhar
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
          );
        }
      } catch (error) {
        console.error('Erro ao marcar como lida:', error);
        // Reverte se falhar
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
        );
      }
    },
    [token, socket],
  );

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAllAsRead,
        toggleNotificationRead,
        refreshNotifications,
        socket,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider',
    );
  }
  return context;
}
