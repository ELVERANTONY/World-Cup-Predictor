import api from './api';
import type { User, ApiResponse } from '@/types';

export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
}

export async function getUsers(page?: number, limit?: number, search?: string): Promise<PaginatedUsers> {
  const response = await api.get<ApiResponse<PaginatedUsers>>('/users', { params: { page, limit, search } });
  return response.data.data;
}

export async function getUser(id: string): Promise<User> {
  const response = await api.get<ApiResponse<User>>(`/users/${id}`);
  return response.data.data;
}

export async function updateUserRole(id: string, role: 'USER' | 'ADMIN'): Promise<User> {
  const response = await api.patch<ApiResponse<User>>(`/users/${id}/role`, { role });
  return response.data.data;
}

export async function toggleUserActive(id: string): Promise<User> {
  const response = await api.patch<ApiResponse<User>>(`/users/${id}/toggle-active`);
  return response.data.data;
}

export async function updatePredictedWinner(teamId: string): Promise<User> {
  const response = await api.put<ApiResponse<User>>('/users/me/winner', { teamId });
  return response.data.data;
}
