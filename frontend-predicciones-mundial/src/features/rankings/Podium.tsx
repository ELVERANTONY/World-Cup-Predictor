import { motion } from 'motion/react'
import { Crown, Medal } from 'lucide-react'
import type { User } from '@/types'
import { staggerItem } from '@/utils/animation'
import { cn } from '@/lib/utils'

interface PodiumEntry {
  userId: string
  user: User
  points: number
  accuracy: number
  rank: number
}

interface PodiumProps {
  entries: PodiumEntry[]
}

const podiumColors = [
  { bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-400', icon: 'text-amber-500', place: '1st', height: 'h-36' },
  { bg: 'bg-gray-50 dark:bg-gray-500/10', border: 'border-gray-400', icon: 'text-gray-400', place: '2nd', height: 'h-28' },
  { bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-400', icon: 'text-orange-500', place: '3rd', height: 'h-24' },
]

export function Podium({ entries }: PodiumProps) {
  const top3 = entries.slice(0, 3)

  return (
    <div className="flex items-end justify-center gap-4 pb-8">
      {top3.map((entry, i) => {
        const colors = i === 0 ? podiumColors[0] : i === 1 ? podiumColors[1] : podiumColors[2]
        const isFirst = i === 0

        return (
          <motion.div key={entry.userId} variants={staggerItem} className="flex flex-col items-center">
            {isFirst && <Crown className="w-8 h-8 text-amber-500 mb-1" />}
            <div className={cn('w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2 border-2', colors.border, colors.bg)}>
              {entry.user.avatarUrl ? (
                <img src={entry.user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-lg font-bold">{entry.user.name?.charAt(0) || '?'}</span>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white text-center truncate max-w-[100px]">{entry.user.name || 'Unknown'}</p>
            <p className="text-xs text-gray-400 mb-2">{entry.points.toLocaleString()} pts</p>
            <div className={cn('w-20 rounded-t-xl flex items-center justify-center font-bold text-white', colors.height, isFirst ? 'bg-amber-500' : i === 1 ? 'bg-gray-400' : 'bg-orange-400')}>
              <div className="text-center">
                <Medal className="w-5 h-5 mx-auto mb-0.5" />
                <span className="text-sm">{colors.place}</span>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
