import { motion } from 'motion/react'
import { Trophy, Target, Users, Calendar, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Prediction } from '@/types'

interface Activity {
  id: string
  type: 'prediction' | 'match' | 'rank' | 'room'
  message: string
  timestamp: string
}

const iconMap: Record<Activity['type'], LucideIcon> = {
  prediction: Target,
  match: Calendar,
  rank: Trophy,
  room: Users,
}

const colorMap: Record<Activity['type'], string> = {
  prediction: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10',
  match: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10',
  rank: 'text-green-500 bg-green-50 dark:bg-green-500/10',
  room: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10',
}

function buildActivities(predictions: Prediction[]): Activity[] {
  const activities: Activity[] = predictions.map(p => ({
    id: p.id,
    type: 'prediction' as const,
    message: `Pronosticaste ${p.match?.homeTeam?.name || '?'} vs ${p.match?.awayTeam?.name || '?'} ${p.homeScore}-${p.awayScore}`,
    timestamp: new Date(p.createdAt).toLocaleDateString(),
  }))

  activities.push(
    { id: 'rank-1', type: 'rank', message: 'Revisa la clasificación global', timestamp: 'Recientemente' },
  )

  return activities.sort((a, b) => {
    if (a.timestamp === 'Recientemente') return -1
    if (b.timestamp === 'Recientemente') return 1
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })
}

interface ActivityFeedProps {
  predictions?: Prediction[]
}

export function ActivityFeed({ predictions = [] }: ActivityFeedProps) {
  const activities = buildActivities(predictions)

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Actividad Reciente</h3>
      <div className="space-y-2">
        {activities.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No hay actividad reciente</p>
        ) : (
          activities.slice(0, 5).map((activity, index) => {
            const Icon = iconMap[activity.type]
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className={cn('p-2 rounded-lg flex-shrink-0', colorMap[activity.type])}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{activity.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{activity.timestamp}</p>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
