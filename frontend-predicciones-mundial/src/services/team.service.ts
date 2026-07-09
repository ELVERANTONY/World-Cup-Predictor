import api from './api';
import type { Team, ApiResponse } from '@/types';

export async function getTeams(): Promise<Team[]> {
  const response = await api.get<ApiResponse<Team[]>>('/teams');
  return response.data.data;
}

export async function getTeam(id: string): Promise<Team> {
  const response = await api.get<ApiResponse<Team>>(`/teams/${id}`);
  return response.data.data;
}

export async function createTeam(data: Omit<Team, 'id'>): Promise<Team> {
  const response = await api.post<ApiResponse<Team>>('/teams', data);
  return response.data.data;
}

export async function updateTeam(id: string, data: Partial<Team>): Promise<Team> {
  const response = await api.put<ApiResponse<Team>>(`/teams/${id}`, data);
  return response.data.data;
}

export async function deleteTeam(id: string): Promise<void> {
  await api.delete(`/teams/${id}`);
}
