import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { RefreshCw, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMatches, useTeams } from '@/hooks/useQueries'
import { MatchCard } from './MatchCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { staggerContainer, staggerItem } from '@/utils/animation'
import { cn } from '@/lib/utils'

const STAGES = ['Todas las Fases', 'Fase de grupos', 'Octavos de final', 'Cuartos de final', 'Semifinal', 'Final']
const STATUSES = ['Todos', 'SCHEDULED', 'LIVE', 'FINISHED']

export function MatchesPage() {
  const { data: matches = [], isLoading: matchesLoading, error: matchesError } = useMatches()
  const { data: teams = [], isLoading: teamsLoading } = useTeams()
  const [stageFilter, setStageFilter] = useState('Todas las Fases')
  const [teamFilter, setTeamFilter] = useState('All Teams')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [currentPage, setCurrentPage] = useState(1)
  const MATCHES_PER_PAGE = 12

  const loading = matchesLoading || teamsLoading

  const filtered = matches.filter(m => {
    if (stageFilter !== 'Todas las Fases' && m.stage !== stageFilter) return false
    if (teamFilter !== 'All Teams' && m.homeTeamId !== teamFilter && m.awayTeamId !== teamFilter) return false
    if (statusFilter !== 'Todos' && m.status !== statusFilter) return false
    return true
  }).sort((a, b) => {
    const p = { LIVE: 1, SCHEDULED: 2, FINISHED: 3, POSTPONED: 4, CANCELLED: 5 }
    const aP = p[a.status as keyof typeof p] || 9
    const bP = p[b.status as keyof typeof p] || 9
    if (aP !== bP) return aP - bP
    const tA = new Date(a.date).getTime()
    const tB = new Date(b.date).getTime()
    if (a.status === 'SCHEDULED' || a.status === 'LIVE') return tA - tB
    return tB - tA
  })

  const totalPages = Math.ceil(filtered.length / MATCHES_PER_PAGE)
  const paginatedMatches = filtered.slice((currentPage - 1) * MATCHES_PER_PAGE, currentPage * MATCHES_PER_PAGE)

  useEffect(() => {
    setCurrentPage(1)
  }, [stageFilter, teamFilter, statusFilter])

  if (matchesError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-500">Failed to load matches</p>
        <Button variant="outline" onClick={() => window.location.reload()} iconLeft={<RefreshCw className="w-4 h-4" />}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Partidos</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Navega por todos los partidos del Mundial 2026</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} className="px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-worldcup-500 appearance-none min-w-[140px]">
            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select value={teamFilter} onChange={e => setTeamFilter(e.target.value)} className="px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-worldcup-500 appearance-none min-w-[140px]">
            <option value="All Teams">Todos los Equipos</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div className="flex gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cn('px-4 py-1.5 rounded-lg text-sm font-semibold transition-all', statusFilter === s ? 'bg-white dark:bg-zinc-700 text-worldcup-600 dark:text-worldcup-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200')}>
              {s === 'Todos' ? 'Todos' : s === 'SCHEDULED' ? 'Por jugar' : s === 'LIVE' ? 'En vivo' : 'Terminado'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} variant="card" className="h-48" />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
          <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No se encontraron partidos</h3>
          <p className="text-gray-500 dark:text-gray-400">Intenta ajustar tus filtros</p>
        </motion.div>
      ) : (
        <>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={staggerContainer} initial="hidden" animate="visible">
            {paginatedMatches.map(m => (
              <motion.div key={m.id} variants={staggerItem}>
                <MatchCard match={m} />
              </motion.div>
            ))}
          </motion.div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="w-4 h-4" /> Anterior
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Simple pagination logic for demo purposes (showing up to 5 pages)
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 2 + i;
                    if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                  }
                  return (
                    <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={cn('w-8 h-8 rounded-lg text-sm font-medium transition-colors', currentPage === pageNum ? 'bg-worldcup-500 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800')}>
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                Siguiente <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
