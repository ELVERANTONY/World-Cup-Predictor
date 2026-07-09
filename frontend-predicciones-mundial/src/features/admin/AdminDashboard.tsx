import { motion } from 'motion/react'
import {
  Users,
  Calendar,
  Target,
  Home,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { fadeIn, staggerContainer, staggerItem } from '@/utils/animation'
import { useToast } from '@/components/ui/toast'
import { useDashboardStats, useSyncWorldCup } from '@/hooks/useQueries'



function StatCard({ icon, label, value, trend, loading }: {
  icon: React.ReactNode
  label: string
  value: string
  trend?: { value: number; positive: boolean }
  loading?: boolean
}) {
  if (loading) {
    return (
      <Card className="p-5">
        <Skeleton variant="rectangular" width="100%" height={80} />
      </Card>
    )
  }

  return (
    <motion.div variants={staggerItem}>
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
            {icon}
          </div>
          {trend && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              trend.positive
                ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-500/10'
                : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10'
            )}>
              {trend.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
        </div>
      </Card>
    </motion.div>
  )
}

function ChartBar({ value, max, label, height }: { value: number; max: number; label: string; height: number }) {
  const barHeight = max > 0 ? (value / max) * height : 0

  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{value}</span>
      <div className="w-full flex justify-center" style={{ height }}>
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: barHeight }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-8 rounded-lg bg-gradient-to-t from-red-500 to-red-400 dark:from-red-600 dark:to-red-500"
        />
      </div>
      <span className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[60px] text-center">{label}</span>
    </div>
  )
}

function ActivityItem({ activity, index }: {
  activity: { id: string; type: string; message: string; timestamp: string }
  index: number
}) {
  const typeColors: Record<string, string> = {
    user: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10',
    match: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10',
    prediction: 'text-green-500 bg-green-50 dark:bg-green-500/10',
    system: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10',
  }

  const typeIcons: Record<string, React.ReactNode> = {
    user: <Users className="w-4 h-4" />,
    match: <Calendar className="w-4 h-4" />,
    prediction: <Target className="w-4 h-4" />,
    system: <Activity className="w-4 h-4" />,
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
    >
      <div className={cn('p-2 rounded-lg flex-shrink-0', typeColors[activity.type] || typeColors.system)}>
        {typeIcons[activity.type] || typeIcons.system}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 dark:text-gray-300">{activity.message}</p>
        <p className="text-xs text-gray-400 mt-0.5">{activity.timestamp}</p>
      </div>
    </motion.div>
  )
}

export function AdminDashboard() {
  const { data: dashData, isLoading: loading, error } = useDashboardStats()
  const syncMutation = useSyncWorldCup()
  const { addToast } = useToast()

  const stats = dashData ? {
    totalUsers: dashData.totalUsers,
    totalMatches: dashData.totalMatches,
    totalPredictions: dashData.totalPredictions,
    activeRooms: dashData.totalRooms,
    predictionsPerDay: [] as { date: string; count: number }[],
    recentActivity: [] as { id: string; type: string; message: string; timestamp: string }[],
  } : null

  const handleSync = async () => {
    try {
      const result = await syncMutation.mutateAsync()
      addToast('success', `Sync completed! ${result.matches} matches, ${result.scoresCalculated} scores calculated`)
    } catch (err: unknown) {
      addToast('error', err instanceof Error ? err.message : 'Failed to sync World Cup data')
    }
  }

  const quickActions = [
    { label: 'Create Match', icon: Calendar, to: '/admin/matches', color: 'bg-orange-500' },
    { label: 'Add Team', icon: Users, to: '/admin/teams', color: 'bg-blue-500' },
    { label: 'Add Stadium', icon: Home, to: '/admin/stadiums', color: 'bg-green-500' },
    { label: 'View Users', icon: Users, to: '/admin/users', color: 'bg-purple-500' },
  ]

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-red-500 dark:text-red-400 font-medium">Failed to load dashboard statistics</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  const defaultStats = {
    totalUsers: 0,
    totalMatches: 0,
    totalPredictions: 0,
    activeRooms: 0,
    predictionsPerDay: [],
    recentActivity: [],
  }

  const displayStats = stats || defaultStats
  const maxChartValue = Math.max(...displayStats.predictionsPerDay.map(d => d.count), 1)

  return (
    <motion.div
      className="max-w-7xl mx-auto space-y-8"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <motion.div variants={fadeIn}>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Overview of World Cup 2026 prediction platform
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Total Users"
          value={loading ? '-' : displayStats.totalUsers.toLocaleString()}
          trend={{ value: 12, positive: true }}
          loading={loading}
        />
        <StatCard
          icon={<Calendar className="w-5 h-5" />}
          label="Total Matches"
          value={loading ? '-' : displayStats.totalMatches.toLocaleString()}
          trend={{ value: 8, positive: true }}
          loading={loading}
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Total Predictions"
          value={loading ? '-' : displayStats.totalPredictions.toLocaleString()}
          trend={{ value: 15, positive: true }}
          loading={loading}
        />
        <StatCard
          icon={<Home className="w-5 h-5" />}
          label="Active Rooms"
          value={loading ? '-' : displayStats.activeRooms.toLocaleString()}
          trend={{ value: 3, positive: false }}
          loading={loading}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Predictions Per Day</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last 7 days</p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton variant="rectangular" height={200} />
              ) : displayStats.predictionsPerDay.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm">
                  No data available yet
                </div>
              ) : (
                <div className="flex items-end justify-between gap-2 h-48 pt-4">
                  {displayStats.predictionsPerDay.map((day) => (
                    <ChartBar
                      key={day.date}
                      value={day.count}
                      max={maxChartValue}
                      label={new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                      height={160}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} variant="rectangular" height={48} />
                  ))}
                </div>
              ) : displayStats.recentActivity.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-500 text-sm">
                  No recent activity
                </div>
              ) : (
                <div className="space-y-2">
                  {displayStats.recentActivity.map((activity, index) => (
                    <ActivityItem key={activity.id} activity={activity} index={index} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className="group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 hover:shadow-lg transition-all"
                >
                  <div className={`p-2.5 rounded-xl text-white ${action.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                </Link>
              )
            })}
          </div>

          <motion.button
            onClick={handleSync}
            disabled={syncMutation.isPending}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-emerald-600 dark:text-emerald-400 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              {syncMutation.isPending ? 'Syncing...' : '🔄 Sync World Cup 2026'}
            </span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-gradient-to-br from-red-600 to-red-800 p-5 text-white"
          >
            <h4 className="font-semibold mb-1">System Status</h4>
            <p className="text-sm opacity-90">All systems operational</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs opacity-75">Active</span>
            </div>
            <Link
              to="/admin/activity"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-white/90 hover:text-white transition-colors"
            >
              View activity logs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
