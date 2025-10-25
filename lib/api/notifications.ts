import { apiClient } from './client';
import { Notification, PaginatedResponse } from '@/types';

export const notificationsService = {
  // Get all notifications
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    type?: string;
    isRead?: boolean;
  }): Promise<PaginatedResponse<Notification>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<PaginatedResponse<Notification>>(`/notifications${query}`);
  },

  // Get unread notifications count
  async getUnreadCount(): Promise<{ count: number }> {
    return apiClient.get<{ count: number }>('/notifications/unread-count');
  },

  // Mark notification as read
  async markAsRead(id: string): Promise<Notification> {
    return apiClient.patch<Notification>(`/notifications/${id}/read`);
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/notifications/mark-all-read');
  },

  // Delete notification
  async deleteNotification(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/notifications/${id}`);
  },

  // Get notification preferences
  async getPreferences(): Promise<{
    orderUpdates: boolean;
    paymentAlerts: boolean;
    inventoryAlerts: boolean;
    marketingEmails: boolean;
    pushNotifications: boolean;
  }> {
    return apiClient.get('/notifications/preferences');
  },

  // Update notification preferences
  async updatePreferences(preferences: {
    orderUpdates?: boolean;
    paymentAlerts?: boolean;
    inventoryAlerts?: boolean;
    marketingEmails?: boolean;
    pushNotifications?: boolean;
  }): Promise<{ message: string }> {
    return apiClient.put('/notifications/preferences', preferences);
  },

  // Subscribe to push notifications
  async subscribeToPush(subscription: PushSubscription): Promise<{ message: string }> {
    return apiClient.post('/notifications/subscribe-push', {
      subscription: subscription.toJSON(),
    });
  },

  // Send test notification
  async sendTestNotification(type: Notification['type']): Promise<{ message: string }> {
    return apiClient.post('/notifications/test', { type });
  },
};