import { useState, useEffect, useMemo } from 'react'
import { motion } from 'motion/react'
import { Search, Target } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useMatches } from '@/hooks/useQueries'
import { getMatchPredictions } from '@/services/prediction.service'
import type { Prediction } from '@/types'
import { staggerContainer, staggerItem } from '@/utils/animation'

export function PredictionsPage() {
  const { data: matches = [], isLoading: matchesLoading, error } = useMatches()
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    if (matchesLoading) return
    async function load() {
      setLoading(true)
      const allPredictions: Prediction[] = []
      for (const match of matches) {
        try {
          const p = await getMatchPredictions(match.id)
          allPredictions.push(...p)
        } catch {
          // skip matches without predictions
        }
      }
      setPredictions(allPredictions)
      setLoading(false)
    }
    load()
  }, [matches, matchesLoading])

  const stats = useMemo(() => {
    const total = predictions.length
    const correct = predictions.filter(p => p.points != null && p.points > 0).length
    const pending = predictions.filter(p => p.points == null).length
    const incorrect = total - correct - pending
    return { total, correct, incorrect, pending, accuracy: total > 0 ? Math.round((correct / total) * 100) : 0 }
  }, [predictions])

  const filteredPredictions = useMemo(() => {
    const q = search.toLowerCase()
    return predictions.filter(p => {
      const userName = p.user?.name?.toLowerCase() || ''
      const matchInfo = `${p.match?.homeTeam?.name} vs ${p.match?.awayTeam?.name}`.toLowerCase()
      const matchesSearch = userName.includes(q) || matchInfo.includes(q)
      const matchesStatus = !statusFilter ||
        (statusFilter === 'correct' && p.points != null && p.points > 0) ||
        (statusFilter === 'incorrect' && p.points != null && p.points === 0) ||
        (statusFilter === 'pending' && p.points == null)
      return matchesSearch && matchesStatus
    })
  }, [predictions, search, statusFilter])

  function getPredictionStatus(p: Prediction): 'correct' | 'incorrect' | 'pending' {
    if (p.points == null) return 'pending'
    if (p.points > 0) return 'correct'
    return 'incorrect'
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-red-500 dark:text-red-400 font-medium">Failed to load predictions</p>
      </div>
    )
  }

  return (
    <motion.div className="max-w-7xl mx-auto space-y-6" initial="hidden" animate="visible" variants={staggerContainer}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Predictions</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">View all user predictions</p>
      </div>

      <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4" variants={staggerContainer}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton variant="rectangular" height={60} /></CardContent></Card>
          ))
        ) : (
          <>
            {[
              { label: 'Total Predictions', value: stats.total, color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10' },
              { label: 'Correct', value: stats.correct, color: 'text-green-600 bg-green-50 dark:bg-green-500/10' },
              { label: 'Incorrect', value: stats.incorrect, color: 'text-red-600 bg-red-50 dark:bg-red-500/10' },
              { label: 'Accuracy', value: `${stats.accuracy}%`, color: 'text-purple-600 bg-purple-50 dark:bg-purple-500/10' },
            ].map((stat) => (
              <motion.div key={stat.label} variants={staggerItem}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                    </div>
                    <p className={`text-2xl font-bold mt-1 ${stat.color.split(' ')[0]}`}>{stat.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </>
        )}
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by user or match..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            iconLeft={<Search className="w-4 h-4" />}
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-40 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)]">
          <option value="">All Status</option>
          <option value="correct">Correct</option>
          <option value="incorrect">Incorrect</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton variant="rectangular" height={56} /></CardContent></Card>
          ))}
        </div>
      ) : filteredPredictions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No predictions found</p>
        </div>
      ) : (
        <motion.div className="space-y-2" variants={staggerContainer}>
          {filteredPredictions.map((prediction) => {
            const pStatus = getPredictionStatus(prediction)
            return (
              <motion.div key={prediction.id} variants={staggerItem}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{prediction.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{prediction.user?.email}</p>
                        </div>
                        <div className="hidden sm:block text-sm text-gray-600 dark:text-gray-400">
                          {prediction.match?.homeTeam?.name} vs {prediction.match?.awayTeam?.name}
                        </div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {prediction.homeScore} - {prediction.awayScore}
                        </div>
                      </div>
                      <Badge variant={
                        pStatus === 'correct' ? 'success' :
                        pStatus === 'incorrect' ? 'danger' : 'warning'
                      }>
                        {pStatus}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </motion.div>
  )
}
