import { motion } from 'motion/react'
import { Target } from 'lucide-react'
import type { User } from '@/types'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { staggerItem } from '@/utils/animation'

interface RankingEntry {
  userId: string
  user: User
  points: number
  accuracy: number
  rank: number
}

interface RankingTableProps {
  entries: RankingEntry[]
  showAccuracy?: boolean
}

export function RankingTable({ entries, showAccuracy = true }: RankingTableProps) {
  const { user } = useAuth()

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-zinc-800 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <th className="px-4 py-3 w-16 text-center">Pos.</th>
            <th className="px-4 py-3">Participante</th>
            {showAccuracy && <th className="px-4 py-3 text-center hidden sm:table-cell">Efectividad</th>}
            <th className="px-4 py-3 text-center">Pred.</th>
            <th className="px-4 py-3 text-right">Puntos</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/50">
          {entries.map((entry) => {
            const isMe = entry.userId === user?.id
            const rankColors = entry.rank === 1 ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' :
              entry.rank === 2 ? 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400' :
              entry.rank === 3 ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' :
              'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-400'

            return (
              <motion.tr key={entry.userId} variants={staggerItem} className={cn('transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/50', isMe && 'bg-worldcup-50 dark:bg-worldcup-500/10 font-semibold')}>
                <td className="px-4 py-3 text-center">
                  <span className={cn('inline-flex w-8 h-8 rounded-full items-center justify-center text-sm font-bold', rankColors)}>{entry.rank}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden">
                      {entry.user.avatarUrl ? (
                        <img src={entry.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : entry.user.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm truncate', isMe ? 'text-worldcup-700 dark:text-worldcup-400 font-bold' : 'text-gray-900 dark:text-white font-medium')}>{entry.user.name}{isMe && <span className="ml-1 text-xs opacity-70">(tú)</span>}</p>
                      <p className="text-xs text-gray-400 truncate">{entry.user.email}</p>
                    </div>
                  </div>
                </td>
                {showAccuracy && (
                  <td className="px-4 py-3 text-center text-sm text-gray-500 hidden sm:table-cell">
                    <div className="flex items-center justify-center gap-1">
                      <Target className="w-3.5 h-3.5" /> {entry.accuracy.toFixed(1)}%
                    </div>
                  </td>
                )}
                <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                  {entry.user.predictionsCount || 0}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={cn('text-sm font-bold', isMe ? 'text-worldcup-700 dark:text-worldcup-400' : 'text-gray-900 dark:text-white')}>{entry.points.toLocaleString()}</span>
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
