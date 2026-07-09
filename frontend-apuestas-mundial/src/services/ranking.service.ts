import api from './api';
import type { User, RoomMember, ApiResponse } from '@/types';

export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
}

export async function getGlobalRanking(page?: number, limit?: number): Promise<PaginatedUsers> {
  const response = await api.get<ApiResponse<PaginatedUsers>>('/rankings/global', { params: { page, limit } });
  return response.data.data;
}

export async function getRoomRanking(roomId: string): Promise<RoomMember[]> {
  const response = await api.get<ApiResponse<RoomMember[]>>(`/rankings/room/${roomId}`);
  return response.data.data;
}

export async function getWeeklyRanking(): Promise<{ users: User[] }> {
  const response = await api.get<ApiResponse<{ users: User[] }>>('/rankings/weekly');
  return response.data.data;
}

export async function getMonthlyRanking(): Promise<{ users: User[] }> {
  const response = await api.get<ApiResponse<{ users: User[] }>>('/rankings/monthly');
  return response.data.data;
}

export async function getHistoricalRanking(): Promise<{ users: User[] }> {
  const response = await api.get<ApiResponse<{ users: User[] }>>('/rankings/historical');
  return response.data.data;
}
