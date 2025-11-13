import { apiClient } from './client';

export interface Notification {
  id: string;
  userId: string | null;
  type: string;
  title: string;
  content: string;
  link: string | null;
  priority: number;
  createdAt: string;
  isRead: boolean;
  readAt: string | null;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    unreadCount: number;
  };
}

export const notificationsApi = {
  // Get notifications for current user
  async getNotifications(page = 1, limit = 20): Promise<NotificationsResponse> {
    const response = await apiClient.get('/notifications', {
      params: { page, limit },
    });
    return response.data;
  },

  // Get unread count
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<UnreadCountResponse>('/notifications/unread-count');
    return response.data.data.unreadCount;
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.post(`/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    await apiClient.post('/notifications/read-all');
  },
};
