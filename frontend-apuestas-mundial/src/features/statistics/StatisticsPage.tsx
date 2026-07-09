import { useState } from 'react'
import { motion } from 'motion/react'
import { BarChart3, TrendingUp, Users, Target, Globe, RefreshCw } from 'lucide-react'
import { useUserStats, useGlobalStats } from '@/hooks/useQueries'
import { useAuth } from '@/hooks/useAuth'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { staggerContainer, staggerItem } from '@/utils/animation'

export function StatisticsPage() {
  const { user } = useAuth()
  const { data: userStats, isLoading: loading, error: statsError } = useUserStats(user?.id)
  const { data: globalStats } = useGlobalStats()
  const [pointsBreakdown] = useState<{ label: string; points: number }[]>([
    { label: 'Exact Score', points: userStats?.totalPoints || 0 },
    { label: 'Correct Result', points: Math.floor((userStats?.totalPoints || 0) * 0.4) },
    { label: 'Incorrect', points: 0 },
  ])
  const [predictionsOverTime] = useState<{ date: string; count: number }[]>([
    { date: 'Mon', count: 12 },
    { date: 'Tue', count: 8 },
    { date: 'Wed', count: 15 },
    { date: 'Thu', count: 10 },
    { date: 'Fri', count: 20 },
    { date: 'Sat', count: 5 },
    { date: 'Sun', count: 18 },
  ])

  if (statsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-500">Failed to load statistics</p>
        <Button variant="outline" onClick={() => window.location.reload()} iconLeft={<RefreshCw className="w-4 h-4" />}>Retry</Button>
      </div>
    )
  }

  const maxBreakdownPoints = Math.max(...pointsBreakdown.map(p => p.points), 1)
  const maxOverTime = Math.max(...predictionsOverTime.map(p => p.count), 1)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Statistics</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Your performance and global stats</p>
      </motion.div>

      {loading ? (
        <div className="grid gap-6">
          <Skeleton variant="card" className="h-48" />
          <Skeleton variant="card" className="h-48" />
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <motion.div variants={staggerItem} className="rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-worldcup-500" />
              Accuracy
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl font-bold text-worldcup-500">{userStats?.accuracyRate || 0}%</span>
              <div className="flex-1 h-4 rounded-full bg-gray-200 dark:bg-zinc-700 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${userStats?.accuracyRate || 0}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-worldcup-500 to-secondary-500"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {userStats?.predictionsCount} total predictions made
            </p>
          </motion.div>

          <motion.div variants={staggerItem} className="rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-worldcup-500" />
              Points Breakdown
            </h2>
            <div className="space-y-3">
              {pointsBreakdown.map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{item.points} pts</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-gray-200 dark:bg-zinc-700 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.points / maxBreakdownPoints) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full rounded-full bg-worldcup-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className="rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-worldcup-500" />
              Predictions Over Time
            </h2>
            <div className="flex items-end gap-3 h-32">
              {predictionsOverTime.map(item => (
                <div key={item.date} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(item.count / maxOverTime) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="w-full rounded-t-lg bg-worldcup-500"
                    style={{ minHeight: 4 }}
                  />
                  <span className="text-[10px] text-gray-400">{item.date}</span>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{item.count}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className="rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-worldcup-500" />
              Global Statistics
            </h2>
            <div className="space-y-4">
              {[
                { icon: Users, label: 'Total Users', value: globalStats?.totalUsers?.toLocaleString() || '-' },
                { icon: Target, label: 'Total Predictions', value: globalStats?.totalPredictions?.toLocaleString() || '-' },
                { icon: TrendingUp, label: 'Total Matches', value: globalStats?.totalMatches?.toLocaleString() || '-' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-worldcup-50 dark:bg-worldcup-500/10 text-worldcup-500">
                    <s.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
