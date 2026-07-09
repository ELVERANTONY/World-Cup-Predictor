import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMatches, getMatch, getMatchInsights, createMatch, updateMatch, updateMatchResult, deleteMatch, type MatchFilters } from '@/services/match.service';
import { getTeams, createTeam, updateTeam, deleteTeam } from '@/services/team.service';
import { getStadiums, createStadium, updateStadium, deleteStadium } from '@/services/stadium.service';
import { getMyPredictions, getMatchPredictions, createPrediction, updatePrediction } from '@/services/prediction.service';
import { getGlobalRanking, getRoomRanking, getWeeklyRanking, getMonthlyRanking, getHistoricalRanking } from '@/services/ranking.service';
import { getRooms, getMyRooms, getRoom, createRoom, joinRoom, leaveRoom, kickMember } from '@/services/room.service';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '@/services/notification.service';
import { getUserStats, getGlobalStats, getGroupStats } from '@/services/statistics.service';
import { getUsers, updateUserRole, toggleUserActive, updatePredictedWinner } from '@/services/user.service';
import { getDashboardStats, syncWorldCupData } from '@/services/admin.service';

export function useMatches(filters?: MatchFilters, options?: Partial<{ enabled: boolean }>) {
  return useQuery({
    queryKey: ['matches', filters],
    queryFn: () => getMatches(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useMatch(id: string, options?: Partial<{ enabled: boolean }>) {
  return useQuery({
    queryKey: ['match', id],
    queryFn: () => getMatch(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
    ...options,
  });
}

export function useMatchInsights(id: string, options?: Partial<{ enabled: boolean }>) {
  return useQuery({
    queryKey: ['matchInsights', id],
    queryFn: () => getMatchInsights(id),
    staleTime: 30 * 60 * 1000,
    enabled: !!id,
    ...options,
  });
}

export function useTeams(options?: Partial<{ enabled: boolean }>) {
  return useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
    staleTime: 30 * 60 * 1000,
    ...options,
  });
}

export function useStadiums(options?: Partial<{ enabled: boolean }>) {
  return useQuery({
    queryKey: ['stadiums'],
    queryFn: getStadiums,
    staleTime: 30 * 60 * 1000,
    ...options,
  });
}

export function useGlobalRanking(page?: number, limit?: number, options?: Partial<{ enabled: boolean }>) {
  return useQuery({
    queryKey: ['ranking', 'global', page, limit],
    queryFn: () => getGlobalRanking(page, limit),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useRoomRanking(roomId: string, options?: Partial<{ enabled: boolean }>) {
  return useQuery({
    queryKey: ['ranking', 'room', roomId],
    queryFn: () => getRoomRanking(roomId),
    staleTime: 5 * 60 * 1000,
    enabled: !!roomId,
    ...options,
  });
}

export function useWeeklyRanking(options?: Partial<{ enabled: boolean }>) {
  return useQuery({
    queryKey: ['ranking', 'weekly'],
    queryFn: getWeeklyRanking,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useMonthlyRanking(options?: Partial<{ enabled: boolean }>) {
  return useQuery({
    queryKey: ['ranking', 'monthly'],
    queryFn: getMonthlyRanking,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useHistoricalRanking(options?: Partial<{ enabled: boolean }>) {
  return useQuery({
    queryKey: ['ranking', 'historical'],
    queryFn: getHistoricalRanking,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useMyPredictions(options?: Partial<{ enabled: boolean }>) {
  return useQuery({
    queryKey: ['predictions', 'my'],
    queryFn: getMyPredictions,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useMatchPredictions(matchId: string, options?: Partial<{ enabled: boolean }>) {
  return useQuery({
    queryKey: ['predictions', 'match', matchId],
    queryFn: () => getMatchPredictions(matchId),
    staleTime: 2 * 60 * 1000,
    enabled: !!matchId,
    ...options,
  });
}

export function useRooms(options?: Partial<{ enabled: boolean }>) {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useMyRooms(options?: Partial<{ enabled: boolean }>) {
  return useQuery({
    queryKey: ['rooms', 'my'],
    queryFn: getMyRooms,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useRoom(id: string, options?: Partial<{ enabled: boolean }>) {
  return useQuery({
    queryKey: ['room', id],
    queryFn: () => getRoom(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
    ...options,
  });
}

export function useNotifications(options?: Partial<{ enabled: boolean }>) {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    staleTime: 1 * 60 * 1000,
    ...options,
  });
}

export function useUnreadCount(options?: Partial<{ enabled: boolean }>) {
  return useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: getUnreadCount,
    staleTime: 1 * 60 * 1000,
    ...options,
  });
}

export function useUserStats(userId?: string, options?: Partial<{ enabled: boolean }>) {
  return useQuery({
    queryKey: ['stats', 'user', userId],
    queryFn: () => getUserStats(userId),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useGlobalStats(options?: Partial<{ enabled: boolean }>) {
  return useQuery({
    queryKey: ['stats', 'global'],
    queryFn: getGlobalStats,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useGroupStats(options?: Partial<{ enabled: boolean }>) {
  return useQuery({
    queryKey: ['stats', 'groups'],
    queryFn: getGroupStats,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useUsers(page?: number, limit?: number, search?: string, options?: Partial<{ enabled: boolean }>) {
  return useQuery({
    queryKey: ['users', page, limit, search],
    queryFn: () => getUsers(page, limit, search),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useDashboardStats(options?: Partial<{ enabled: boolean }>) {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: getDashboardStats,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useCreateMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createMatch>[0]) => createMatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

export function useUpdateMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateMatch>[1] }) => updateMatch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['match'] });
    },
  });
}

export function useUpdateMatchResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, homeScore, awayScore }: { id: string; homeScore: number; awayScore: number }) => updateMatchResult(id, homeScore, awayScore),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['match'] });
    },
  });
}

export function useDeleteMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createTeam>[0]) => createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateTeam>[1] }) => updateTeam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useCreateStadium() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createStadium>[0]) => createStadium(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stadiums'] });
    },
  });
}

export function useUpdateStadium() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateStadium>[1] }) => updateStadium(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stadiums'] });
    },
  });
}

export function useDeleteStadium() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStadium(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stadiums'] });
    },
  });
}

export function useCreatePrediction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ matchId, homeScore, awayScore, confidence, comment }: {
      matchId: string;
      homeScore: number;
      awayScore: number;
      confidence?: number;
      comment?: string;
    }) => createPrediction(matchId, homeScore, awayScore, confidence, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
    },
  });
}

export function useUpdatePrediction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, homeScore, awayScore, confidence, comment }: {
    id: string;
    homeScore: number;
    awayScore: number;
    confidence?: number;
    comment?: string;
  }) => updatePrediction(id, homeScore, awayScore, confidence, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
    },
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createRoom>[0]) => createRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useJoinRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code, password }: { code: string; password?: string }) => joinRoom(code, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['room'] });
    },
  });
}

export function useLeaveRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) => leaveRoom(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['room'] });
    },
  });
}

export function useKickMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, userId }: { roomId: string; userId: string }) => kickMember(roomId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room'] });
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useSyncWorldCup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => syncWorldCupData(),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'USER' | 'ADMIN' }) => updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useToggleUserActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleUserActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdatePredictedWinner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) => updatePredictedWinner(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
