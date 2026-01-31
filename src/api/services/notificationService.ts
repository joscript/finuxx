import { apiClient } from '../client';
import { ENDPOINTS } from '../config';
import { Notification } from '../types';

class NotificationService {
  /**
   * Get all notifications
   */
  async getAll(): Promise<{ success: boolean; data?: { notifications: Notification[] }; message?: string }> {
    return apiClient.get<{ notifications: Notification[] }>(ENDPOINTS.NOTIFICATIONS);
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<{ success: boolean; data?: { unreadCount: number }; message?: string }> {
    return apiClient.get<{ unreadCount: number }>(ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT);
  }

  /**
   * Get single notification by ID
   */
  async getById(id: number): Promise<{ success: boolean; data?: { notification: Notification }; message?: string }> {
    return apiClient.get<{ notification: Notification }>(`${ENDPOINTS.NOTIFICATIONS}/${id}`);
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: number): Promise<{ success: boolean; data?: { notification: Notification }; message?: string }> {
    return apiClient.put<{ notification: Notification }>(`${ENDPOINTS.NOTIFICATIONS}/${id}/read`);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ success: boolean; data?: { updatedCount: number }; message?: string }> {
    return apiClient.put<{ updatedCount: number }>(ENDPOINTS.NOTIFICATIONS_READ_ALL);
  }

  /**
   * Delete a notification
   */
  async delete(id: number): Promise<{ success: boolean; message?: string }> {
    return apiClient.delete(`${ENDPOINTS.NOTIFICATIONS}/${id}`);
  }
}

export const notificationService = new NotificationService();
