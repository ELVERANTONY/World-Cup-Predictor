import api from './api';
import type { Room, RoomMember, ApiResponse } from '@/types';

export interface CreateRoomData {
  name: string;
  description?: string;
  password?: string;
  isPublic?: boolean;
  maxMembers?: number;
  color?: string;
}

export async function getRooms(): Promise<Room[]> {
  const response = await api.get<ApiResponse<Room[]>>('/rooms');
  return response.data.data;
}

export async function getMyRooms(): Promise<Room[]> {
  const response = await api.get<ApiResponse<Room[]>>('/rooms/my');
  return response.data.data;
}

export async function getRoom(id: string): Promise<Room> {
  const response = await api.get<ApiResponse<Room>>(`/rooms/${id}`);
  return response.data.data;
}

export async function createRoom(data: CreateRoomData): Promise<Room> {
  const response = await api.post<ApiResponse<Room>>('/rooms', data);
  return response.data.data;
}

export async function joinRoom(code: string, password?: string): Promise<RoomMember> {
  const response = await api.post<ApiResponse<RoomMember>>('/rooms/join', { code, password });
  return response.data.data;
}

export async function leaveRoom(roomId: string): Promise<void> {
  await api.post(`/rooms/${roomId}/leave`);
}

export async function kickMember(roomId: string, userId: string): Promise<void> {
  await api.post(`/rooms/${roomId}/kick`, { userId });
}

export async function updateRoom(id: string, data: Partial<Room>): Promise<Room> {
  const response = await api.put<ApiResponse<Room>>(`/rooms/${id}`, data);
  return response.data.data;
}

export async function deleteRoom(id: string): Promise<void> {
  await api.delete(`/rooms/${id}`);
}

export async function generateQRCode(roomId: string): Promise<{ qrDataUrl: string }> {
  const response = await api.get<ApiResponse<{ qrDataUrl: string }>>(`/rooms/${roomId}/qrcode`);
  return response.data.data;
}
