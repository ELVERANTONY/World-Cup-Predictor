import api from './api';
import type { Prediction, ApiResponse } from '@/types';

export async function getMyPredictions(): Promise<Prediction[]> {
  const response = await api.get<ApiResponse<Prediction[]>>('/predictions/my');
  return response.data.data;
}

export async function getMatchPredictions(matchId: string): Promise<Prediction[]> {
  const response = await api.get<ApiResponse<Prediction[]>>(`/predictions/match/${matchId}`);
  return response.data.data;
}

export async function createPrediction(
  matchId: string,
  homeScore: number,
  awayScore: number,
  confidence?: number,
  comment?: string,
): Promise<Prediction> {
  const response = await api.post<ApiResponse<Prediction>>('/predictions', {
    matchId,
    homeScore,
    awayScore,
    confidence,
    comment,
  });
  return response.data.data;
}

export async function updatePrediction(
  id: string,
  homeScore: number,
  awayScore: number,
  confidence?: number,
  comment?: string,
): Promise<Prediction> {
  const response = await api.put<ApiResponse<Prediction>>(`/predictions/${id}`, {
    homeScore,
    awayScore,
    confidence,
    comment,
  });
  return response.data.data;
}
