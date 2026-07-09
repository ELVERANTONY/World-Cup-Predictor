import api from './api';
import type { ApiResponse } from '@/types';

export interface AdminStats {
  totalUsers: number;
  totalMatches: number;
  totalPredictions: number;
  totalRooms: number;
  activeUsers: number;
  recentRegistrations: number;
  topPredictors: { id: string; name: string; points: number }[];
}

export async function getDashboardStats(): Promise<AdminStats> {
  const response = await api.get<ApiResponse<AdminStats>>('/admin/dashboard');
  return response.data.data;
}

export interface SyncResult {
  message: string;
  teams: number;
  stadiums: number;
  matches: number;
  updated: number;
  scoresCalculated: number;
}

export async function syncWorldCupData(): Promise<SyncResult> {
  const response = await api.post<ApiResponse<SyncResult>>('/admin/sync');
  return response.data.data;
}
