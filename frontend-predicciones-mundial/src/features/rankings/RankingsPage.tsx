import { useState } from 'react'
import { motion } from 'motion/react'
import { Trophy, RefreshCw } from 'lucide-react'
import { useGlobalRanking, useWeeklyRanking, useMonthlyRanking, useHistoricalRanking } from '@/hooks/useQueries'
import type { User } from '@/types'
import { Podium } from './Podium'
import { RankingTable } from './RankingTable'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { staggerContainer } from '@/utils/animation'
import { cn } from '@/lib/utils'

interface RankingEntry {
  userId: string
  user: User
  points: number
  accuracy: number
  rank: number
}

const TABS = [
  { key: 'global', label: 'Global' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'historical', label: 'Historical' },
] as const

type TabKey = typeof TABS[number]['key']

function transformUsers(users: User[]): RankingEntry[] {
  return users.map((u, i) => ({
    userId: u.id,
    user: u,
    points: u.totalPoints || 0,
    accuracy: u.accuracyRate || 0,
    rank: u.rank || i + 1,
  }))
}

function useTabData(tab: TabKey) {
  const global = useGlobalRanking()
  const weekly = useWeeklyRanking()
  const monthly = useMonthlyRanking()
  const historical = useHistoricalRanking()

  switch (tab) {
    case 'global': return { data: global.data?.users ? transformUsers(global.data.users) : [], isLoading: global.isLoading, error: global.error }
    case 'weekly': return { data: weekly.data?.users ? transformUsers(weekly.data.users) : [], isLoading: weekly.isLoading, error: weekly.error }
    case 'monthly': return { data: monthly.data?.users ? transformUsers(monthly.data.users) : [], isLoading: monthly.isLoading, error: monthly.error }
    case 'historical': return { data: historical.data?.users ? transformUsers(historical.data.users) : [], isLoading: historical.isLoading, error: historical.error }
  }
}

export function RankingsPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<TabKey>('global')
  const [searchTerm, setSearchTerm] = useState('')

  const { data: entries = [], isLoading: loading, error } = useTabData(tab)

  const filteredEntries = entries.filter(e => e.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || e.user.email.toLowerCase().includes(searchTerm.toLowerCase()))

  const top3 = entries.slice(0, 3)
  const rest = filteredEntries.filter(e => e.rank > 3)

  function scrollToMyPosition() {
    setSearchTerm(user?.name || '')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Clasificación Global</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Descubre quién lidera la tabla de predicciones</p>
        </div>
        {user && (
          <Button variant="outline" onClick={scrollToMyPosition} className="bg-worldcup-50 dark:bg-worldcup-900/10 border-worldcup-200 dark:border-worldcup-800 text-worldcup-700 dark:text-worldcup-400 hover:bg-worldcup-100">
            Ver mi posición
          </Button>
        )}
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2 flex-wrap">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-all', tab === t.key ? 'bg-worldcup-500 text-white shadow-md' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700')}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-64">
          <Input placeholder="Buscar participante..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-white dark:bg-surface-dark" />
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <p className="text-red-500">Failed to load rankings</p>
          <Button variant="outline" onClick={() => window.location.reload()} iconLeft={<RefreshCw className="w-4 h-4" />}>Retry</Button>
        </div>
      ) : loading ? (
        <div className="space-y-4">
          <div className="flex justify-center gap-4">{[1, 2, 3].map(i => <Skeleton key={i} variant="card" className="w-32 h-48" />)}</div>
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} variant="rectangular" className="h-16" />)}
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
          {top3.length > 0 && <Podium entries={top3} />}

          {rest.length > 0 ? (
            <div className="rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 p-4">
              <RankingTable entries={rest} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Trophy className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No rankings available</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
