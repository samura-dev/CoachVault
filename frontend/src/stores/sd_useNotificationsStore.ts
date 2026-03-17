import { create } from 'zustand';
import { sd_pb } from '../lib/sd_pocketbase';

export interface Sd_Notification {
  id: string;
  user: string;
  title: string;
  message?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  link?: string;
  created: string;
  updated: string;
}

interface Sd_NotificationsState {
  sd_notifications: Sd_Notification[];
  sd_unreadCount: number;
  sd_isLoading: boolean;
  sd_error: string | null;

  sd_fetchNotifications: () => Promise<void>;
  sd_markAsRead: (id: string) => Promise<void>;
  sd_markAllAsRead: () => Promise<void>;
  sd_deleteNotification: (id: string) => Promise<void>;
  sd_addNotification: (payload: Partial<Sd_Notification>) => Promise<void>;
  sd_subscribe: () => void;
  sd_unsubscribe: () => void;
}

export const sd_useNotificationsStore = create<Sd_NotificationsState>((set, get) => ({
  sd_notifications: [],
  sd_unreadCount: 0,
  sd_isLoading: false,
  sd_error: null,

  sd_fetchNotifications: async () => {
    set({ sd_isLoading: true, sd_error: null });
    try {
      const records = await sd_pb.collection('sd_notifications').getList<Sd_Notification>(1, 50, {
        sort: '-created',
      });
      const unreadCount = records.items.filter((n: Sd_Notification) => !n.is_read).length;
      set({ sd_notifications: records.items, sd_unreadCount: unreadCount, sd_isLoading: false });
    } catch (error: unknown) {
      console.error('Failed to fetch notifications:', error);
      if (error && typeof error === 'object') {
        const errObj = error as { response?: { data?: unknown }; message?: string };
        console.error('Response details:', errObj.response);
        console.error('Response data:', JSON.stringify(errObj.response?.data));
        set({ sd_error: errObj.message || 'Ошибка загрузки уведомлений', sd_isLoading: false });
      } else {
        set({ sd_error: 'Ошибка загрузки уведомлений', sd_isLoading: false });
      }
    }
  },

  sd_markAsRead: async (id: string) => {
    try {
      await sd_pb.collection('sd_notifications').update(id, { is_read: true });
      const { sd_notifications } = get();
      const updated = sd_notifications.map((n: Sd_Notification) => n.id === id ? { ...n, is_read: true } : n);
      set({
        sd_notifications: updated,
        sd_unreadCount: updated.filter((n: Sd_Notification) => !n.is_read).length
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  sd_markAllAsRead: async () => {
    try {
      const { sd_notifications } = get();
      const unread = sd_notifications.filter(n => !n.is_read);

      // Update all unread in parallel
      await Promise.all(
        unread.map(n => sd_pb.collection('sd_notifications').update(n.id, { is_read: true }))
      );

      const updated = sd_notifications.map(n => ({ ...n, is_read: true }));
      set({ sd_notifications: updated, sd_unreadCount: 0 });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  },

  sd_deleteNotification: async (id: string) => {
    try {
      await sd_pb.collection('sd_notifications').delete(id);
      const { sd_notifications } = get();
      const updated = sd_notifications.filter((n: Sd_Notification) => n.id !== id);
      set({
        sd_notifications: updated,
        sd_unreadCount: updated.filter((n: Sd_Notification) => !n.is_read).length
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  },

  sd_addNotification: async (payload: Partial<Sd_Notification>) => {
    try {
      if (!payload.user) {
        payload.user = sd_pb.authStore.model?.id;
      }
      if (!payload.user) return; // No logged in user

      if (!payload.type) payload.type = 'info';
      if (payload.is_read === undefined) payload.is_read = false;

      await sd_pb.collection('sd_notifications').create(payload);
      // The realtime subscription will pick this up, but we can also manually fetch
      // await get().sd_fetchNotifications();
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  },

  sd_subscribe: () => {
    const userId = sd_pb.authStore.model?.id;
    if (!userId) return;

    sd_pb.collection('sd_notifications').subscribe('*', () => {
      // Refetch all to keep sorting and pagination clean
      get().sd_fetchNotifications();
    });
  },

  sd_unsubscribe: () => {
    sd_pb.collection('sd_notifications').unsubscribe('*');
  }
}));
