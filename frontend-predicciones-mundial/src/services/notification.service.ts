import api from './api';
import type { Notification, ApiResponse } from '@/types';

export async function getNotifications(): Promise<Notification[]> {
  const response = await api.get<ApiResponse<Notification[]>>('/notifications');
  return response.data.data;
}

export async function getUnreadCount(): Promise<{ count: number }> {
  const response = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
  return response.data.data;
}

export async function markAsRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await api.patch('/notifications/read-all');
}
