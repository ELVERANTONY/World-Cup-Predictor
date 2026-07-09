import { Navigate, type RouteObject } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { LandingPage } from '@/pages/LandingPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { MatchesPage } from '@/features/matches/MatchesPage'
import { MatchDetailPage } from '@/features/matches/MatchDetailPage'
import { PredictionsPage } from '@/features/predictions/PredictionsPage'
import { RankingsPage } from '@/features/rankings/RankingsPage'
import { RoomsPage } from '@/features/rooms/RoomsPage'
import { RoomDetailPage } from '@/features/rooms/RoomDetailPage'
import { ProfilePage } from '@/features/profile/ProfilePage'
import { StatisticsPage } from '@/features/statistics/StatisticsPage'
import { GroupsPage } from '@/features/matches/GroupsPage'
import { KnockoutsPage } from '@/features/matches/KnockoutsPage'
import { AdminDashboard } from '@/features/admin/AdminDashboard'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { useAuth } from '@/hooks/useAuth'
import type { ReactNode } from 'react'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-worldcup-500 border-t-transparent rounded-full" /></div>
  }
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}

export function useRoutesConfig(): RouteObject[] {
  return [
    {
      path: '/',
      element: <LandingPage />,
    },
    {
      path: '/login',
      element: <PublicOnlyRoute><LoginPage /></PublicOnlyRoute>,
    },
    {
      element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
      children: [
        { path: 'dashboard', element: <DashboardPage /> },
        { path: 'matches', element: <MatchesPage /> },
        { path: 'matches/:id', element: <MatchDetailPage /> },
        { path: 'groups', element: <GroupsPage /> },
        { path: 'knockouts', element: <KnockoutsPage /> },
        { path: 'predictions', element: <PredictionsPage /> },
        { path: 'rankings', element: <RankingsPage /> },
        { path: 'rooms', element: <RoomsPage /> },
        { path: 'rooms/:id', element: <RoomDetailPage /> },
        { path: 'profile', element: <ProfilePage /> },
        { path: 'statistics', element: <StatisticsPage /> },
        {
          path: 'settings',
          element: <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Coming soon</p>
          </div>,
        },
        { path: 'admin/dashboard', element: <AdminDashboard /> },
        { path: 'admin/matches', element: <div className="p-8">Manage Matches (Coming Soon)</div> },
        { path: 'admin/teams', element: <div className="p-8">Manage Teams (Coming Soon)</div> },
        { path: 'admin/users', element: <div className="p-8">Manage Users (Coming Soon)</div> },
      ],
    },
    {
      path: '*',
      element: <NotFoundPage />,
    },
  ]
}
