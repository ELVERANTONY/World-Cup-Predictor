import { useMemo } from 'react'
import { motion } from 'motion/react'
import { Trophy, Target, TrendingUp, Medal, ArrowRight, Users, Calendar, RefreshCw } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUserStats, useMatches, useMyPredictions } from '@/hooks/useQueries'
import { StatCard } from './StatCard'
import { ActivityFeed } from './ActivityFeed'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardPage() {
  const { user } = useAuth()
  const { data: stats, isLoading: loading, error: statsError } = useUserStats(user?.id)
  const { data: allMatches = [] } = useMatches()
  const { data: predictions = [] } = useMyPredictions()

  const nextMatches = useMemo(() => {
    return allMatches.filter(m => m.status === 'SCHEDULED' || m.status === 'LIVE').slice(0, 3)
  }, [allMatches])

  const statCards = stats ? [
    { icon: <Target className="w-5 h-5" />, value: (stats.predictionsCount || 0).toString(), label: 'Predicciones Totales', trend: { value: 0, positive: true } },
    { icon: <TrendingUp className="w-5 h-5" />, value: `${(stats.accuracyRate || 0).toFixed(1)}%`, label: 'Tasa de Acierto', trend: { value: 0, positive: true } },
    { icon: <Trophy className="w-5 h-5" />, value: (stats.totalPoints || 0).toLocaleString(), label: 'Puntos Obtenidos', trend: { value: 0, positive: true } },
    { icon: <Medal className="w-5 h-5" />, value: `#${stats.rank || 0}`, label: 'Ranking Global', trend: { value: 0, positive: (stats.rank || 0) <= 50 } },
  ] : []

  const quickActions = [
    { label: 'Ver Partidos', icon: Calendar, to: '/matches', color: 'bg-blue-500' },
    { label: 'Mis Predicciones', icon: Target, to: '/predictions', color: 'bg-green-500' },
    { label: 'Clasificación', icon: Trophy, to: '/rankings', color: 'bg-amber-500' },
    { label: 'Unirse a Sala', icon: Users, to: '/rooms', color: 'bg-purple-500' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Bienvenido de vuelta, {user?.name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Aquí está el resumen de tus predicciones para el Mundial 2026
        </p>
      </motion.div>

      {statsError ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <p className="text-red-500">{error}</p>
          <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 text-sm text-worldcup-500 hover:text-worldcup-600 transition-colors">
            <RefreshCw className="w-4 h-4" /> Reintentar
          </button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="card" className="h-32" />)}
        </div>
      ) : (
        <>
          {stats && (
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}>
              {statCards.map((stat, i) => (
                <motion.div key={i} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <StatCard {...stat} />
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ActivityFeed predictions={predictions} />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Acciones Rápidas</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Link key={action.to} to={action.to} className="group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 hover:shadow-lg transition-all">
                      <div className={`p-2.5 rounded-xl text-white ${action.color} group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                    </Link>
                  )
                })}
              </div>

              {nextMatches.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl bg-gradient-to-br from-worldcup-600 to-worldcup-800 p-5 text-white">
                  <h4 className="font-semibold mb-2">Próximo Partido</h4>
                  <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-2 flex-1">
                      {nextMatches[0].homeTeam?.flagUrl ? <img src={nextMatches[0].homeTeam.flagUrl.replace('w80/w80/', 'w80/')} alt="home" className="w-6 h-4 rounded-sm object-cover" /> : <span className="text-xl">🏳</span>}
                      <span className="font-semibold text-sm truncate">{nextMatches[0].homeTeam?.name || 'TBD'}</span>
                    </div>
                    <span className="text-xs font-bold text-white/70">VS</span>
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <span className="font-semibold text-sm truncate">{nextMatches[0].awayTeam?.name || 'TBD'}</span>
                      {nextMatches[0].awayTeam?.flagUrl ? <img src={nextMatches[0].awayTeam.flagUrl.replace('w80/w80/', 'w80/')} alt="away" className="w-6 h-4 rounded-sm object-cover" /> : <span className="text-xl">🏳</span>}
                    </div>
                  </div>
                  <p className="text-sm opacity-90 mt-3 text-center bg-black/20 py-1.5 rounded-lg">{new Date(nextMatches[0].date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  <Link to={`/matches/${nextMatches[0].id}`} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-white/90 hover:text-white transition-colors">
                    Ver detalles <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
