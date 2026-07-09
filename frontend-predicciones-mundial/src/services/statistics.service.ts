import api from './api';
import type { ApiResponse } from '@/types';

export interface UserStats {
  totalPoints: number;
  accuracyRate: number;
  predictionsCount: number;
  rank: number;
  maxStreak: number;
  currentStreak: number;
  level: number;
  xp: number;
}

export interface GlobalStats {
  totalUsers: number;
  totalPredictions: number;
  totalMatches: number;
  totalRooms: number;
}

export interface MatchStats {
  homeWinPercentage: number;
  awayWinPercentage: number;
  drawPercentage: number;
  totalPredictions: number;
  averageHomeScore: number;
  averageAwayScore: number;
}

export interface GroupStats {
  group: string;
  teams: { name: string; points: number; played: number }[];
}

export async function getUserStats(userId?: string): Promise<UserStats> {
  const params = userId ? { userId } : undefined;
  const response = await api.get<ApiResponse<UserStats>>('/statistics/user', { params });
  return response.data.data;
}

export async function getGlobalStats(): Promise<GlobalStats> {
  const response = await api.get<ApiResponse<GlobalStats>>('/statistics/global');
  return response.data.data;
}

export async function getMatchStats(matchId: string): Promise<MatchStats> {
  const response = await api.get<ApiResponse<MatchStats>>(`/statistics/match/${matchId}`);
  return response.data.data;
}

export async function getGroupStats(): Promise<GroupStats[]> {
  const response = await api.get<ApiResponse<GroupStats[]>>('/statistics/groups');
  return response.data.data;
}
