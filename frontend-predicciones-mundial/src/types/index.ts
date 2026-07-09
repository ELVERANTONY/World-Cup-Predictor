export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: 'USER' | 'ADMIN';
  favoriteTeamId?: string | null;
  level: number;
  xp: number;
  totalPoints: number;
  accuracyRate: number;
  rank: number;
  maxStreak: number;
  currentStreak: number;
  predictionsCount: number;
  emailVerified: boolean;
  createdAt: string;
  favoriteTeam?: Team;
  predictedWinnerId?: string | null;
  predictedWinner?: Team;
  _count?: { predictions: number; rooms: number };
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  flagUrl: string;
  group: string | null;
  rank: number;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
}

export interface Stadium {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number;
  imageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  surface: string | null;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  stadiumId: string | null;
  date: string;
  stage: string;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';
  homeScore: number | null;
  awayScore: number | null;
  referee: string | null;
  extraTime: boolean;
  penalties: boolean;
  homeTeam?: Team;
  awayTeam?: Team;
  stadium?: Stadium;
}

export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  confidence?: number;
  comment?: string;
  points: number | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  match?: Match;
}

export interface Room {
  id: string;
  name: string;
  code: string;
  description: string | null;
  password: string | null;
  color?: string | null;
  createdById: string;
  createdBy?: User;
  isPublic: boolean;
  maxMembers: number;
  createdAt: string;
  _count?: { members: number };
}

export interface RoomMember {
  id: string;
  roomId: string;
  userId: string;
  points: number;
  rank: number;
  user?: User;
  room?: Room;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  metadata: any;
  createdAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string | null;
  criteria: string;
  progress?: number;
  unlockedAt?: string | null;
}

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  refreshToken: string;
  user: User;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}
