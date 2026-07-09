import api from './api';
import type { Match, ApiResponse } from '@/types';

export interface MatchFilters {
  stage?: string;
  status?: string;
  teamId?: string;
  stadiumId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function getMatches(filters?: MatchFilters): Promise<Match[]> {
  const response = await api.get<ApiResponse<Match[]>>('/matches', { params: filters });
  return response.data.data;
}

export async function getMatch(id: string): Promise<Match> {
  const response = await api.get<ApiResponse<Match>>(`/matches/${id}`);
  return response.data.data;
}

export async function getMatchInsights(id: string): Promise<string> {
  try {
    const response = await api.get<ApiResponse<{ insights: string }>>(`/matches/${id}/insights`);
    return response.data.data.insights;
  } catch (error) {
    return "Insights no disponibles en este momento.";
  }
}

export async function createMatch(data: Omit<Match, 'id'>): Promise<Match> {
  const response = await api.post<ApiResponse<Match>>('/matches', data);
  return response.data.data;
}

export async function updateMatch(id: string, data: Partial<Match>): Promise<Match> {
  const response = await api.put<ApiResponse<Match>>(`/matches/${id}`, data);
  return response.data.data;
}

export async function updateMatchResult(id: string, homeScore: number, awayScore: number): Promise<Match> {
  const response = await api.patch<ApiResponse<Match>>(`/matches/${id}/result`, { homeScore, awayScore });
  return response.data.data;
}

export async function deleteMatch(id: string): Promise<void> {
  await api.delete(`/matches/${id}`);
}
