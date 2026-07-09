import api from './api';
import type { Stadium, ApiResponse } from '@/types';

export async function getStadiums(): Promise<Stadium[]> {
  const response = await api.get<ApiResponse<Stadium[]>>('/stadiums');
  return response.data.data;
}

export async function getStadium(id: string): Promise<Stadium> {
  const response = await api.get<ApiResponse<Stadium>>(`/stadiums/${id}`);
  return response.data.data;
}

export async function createStadium(data: Omit<Stadium, 'id'>): Promise<Stadium> {
  const response = await api.post<ApiResponse<Stadium>>('/stadiums', data);
  return response.data.data;
}

export async function updateStadium(id: string, data: Partial<Stadium>): Promise<Stadium> {
  const response = await api.put<ApiResponse<Stadium>>(`/stadiums/${id}`, data);
  return response.data.data;
}

export async function deleteStadium(id: string): Promise<void> {
  await api.delete(`/stadiums/${id}`);
}
