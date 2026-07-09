import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, Calendar, MapPin, Users, Sparkles, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react'
import { useMatch, useMatchInsights, useMatchPredictions, useCreatePrediction } from '@/hooks/useQueries'
import { PredictionCard } from '@/features/predictions/PredictionCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/hooks/useAuth'

const statusConfig: Record<string, { variant: 'info' | 'warning' | 'default' | 'success' | 'danger'; label: string }> = {
  SCHEDULED: { variant: 'info', label: 'Programado' },
  LIVE: { variant: 'warning', label: 'En Vivo' },
  FINISHED: { variant: 'default', label: 'Finalizado' },
  POSTPONED: { variant: 'warning', label: 'Pospuesto' },
  CANCELLED: { variant: 'danger', label: 'Cancelado' },
}

export function MatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { user } = useAuth()
  const { data: match, isLoading: loading, error: matchError } = useMatch(id || '')
  const { data: predictions = [], refetch: refetchPredictions } = useMatchPredictions(id || '')
  const { data: insights = '' } = useMatchInsights(id || '')
  const createPredictionMutation = useCreatePrediction()
  
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handlePrediction(e: React.FormEvent) {
    e.preventDefault()
    if (!homeScore || !awayScore) {
      addToast('error', 'Ingresa ambos resultados')
      return
    }
    setSubmitting(true)
    try {
      await createPredictionMutation.mutateAsync({ matchId: id!, homeScore: parseInt(homeScore), awayScore: parseInt(awayScore), confidence: 50, comment: '' })
      addToast('success', '¡Predicción guardada exitosamente!')
      refetchPredictions()
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Error al guardar predicción')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="max-w-5xl mx-auto space-y-6"><Skeleton variant="rectangular" className="h-8 w-32" /><Skeleton variant="card" className="h-64" /></div>
  }

  if (matchError || !match) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-500">{'No se pudo cargar el partido'}</p>
        <Button variant="outline" onClick={() => navigate('/matches')} iconLeft={<ArrowLeft className="w-4 h-4" />}>Volver a partidos</Button>
      </div>
    )
  }

  const isUpcoming = match.status === 'SCHEDULED'
  const matchDate = new Date(match.date)
  const isLocked = matchDate.getTime() - Date.now() < 7200000 // 2 hours
  const canPredict = isUpcoming && !isLocked
  const status = statusConfig[match.status] || { variant: 'default' as const, label: match.status }

  const myPrediction = predictions.find(p => p.userId === user?.id)

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <button onClick={() => navigate('/matches')} className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-worldcup-500 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      {/* Hero Match Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-worldcup-500/10 via-transparent to-worldcup-900/5 pointer-events-none" />
        
        <div className="relative p-8 sm:p-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            {/* Home Team */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center shadow-lg border-4 border-white dark:border-zinc-700 overflow-hidden">
                {match.homeTeam?.flagUrl ? <img src={match.homeTeam.flagUrl.replace('w80/w80/', 'w80/')} alt="home" className="w-full h-full object-cover" /> : <span className="text-5xl">🏳</span>}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">{match.homeTeam?.name || 'TBD'}</h2>
            </div>

            {/* Score/Status */}
            <div className="flex flex-col items-center justify-center flex-1">
              <Badge variant={status.variant} live={match.status === 'LIVE'} className="mb-4 text-sm px-3 py-1 shadow-sm">{status.label}</Badge>
              
              {match.status === 'FINISHED' && match.homeScore !== null ? (
                <div className="text-center">
                  <p className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter">{match.homeScore} - {match.awayScore}</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-4xl font-black text-gray-300 dark:text-zinc-700 tracking-widest">VS</p>
                </div>
              )}
              
              <div className="mt-4 flex flex-col items-center text-sm text-gray-500 dark:text-gray-400 gap-1 font-medium">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{matchDate.toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{match.stadium?.name || 'TBD'}</span>
              </div>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center shadow-lg border-4 border-white dark:border-zinc-700 overflow-hidden">
                {match.awayTeam?.flagUrl ? <img src={match.awayTeam.flagUrl.replace('w80/w80/', 'w80/')} alt="away" className="w-full h-full object-cover" /> : <span className="text-5xl">🏳</span>}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">{match.awayTeam?.name || 'TBD'}</h2>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Insights & Prediction Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: AI & Predictions */}
        <div className="lg:col-span-2 space-y-6">
          {insights && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/50">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl shadow-sm text-indigo-500">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-1">Análisis IA Gemini</h3>
                  <p className="text-sm text-indigo-800/80 dark:text-indigo-200/70 leading-relaxed">{insights}</p>
                </div>
              </div>
            </motion.div>
          )}

          {canPredict ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ingresa tu Predicción</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Elige el marcador final. Esto contará para tu ranking global y todas tus salas.</p>
              
              {myPrediction ? (
                <div className="p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-800 dark:text-green-400 font-medium">Predicción registrada</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-300 mt-1">{myPrediction.homeScore} - {myPrediction.awayScore}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
              ) : (
                <form onSubmit={handlePrediction} className="space-y-6">
                  <div className="flex items-center justify-center gap-6">
                    <div className="flex flex-col items-center gap-2">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{match.homeTeam?.shortName}</span>
                      <input type="number" min="0" max="20" required value={homeScore} onChange={e => setHomeScore(e.target.value)} className="w-20 h-20 text-center text-4xl font-bold rounded-2xl border-2 border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 focus:border-worldcup-500 focus:ring-4 focus:ring-worldcup-500/20 transition-all outline-none" placeholder="0" />
                    </div>
                    <span className="text-2xl font-bold text-gray-300 dark:text-zinc-600">-</span>
                    <div className="flex flex-col items-center gap-2">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{match.awayTeam?.shortName}</span>
                      <input type="number" min="0" max="20" required value={awayScore} onChange={e => setAwayScore(e.target.value)} className="w-20 h-20 text-center text-4xl font-bold rounded-2xl border-2 border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 focus:border-worldcup-500 focus:ring-4 focus:ring-worldcup-500/20 transition-all outline-none" placeholder="0" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" size="lg" loading={submitting}>Guardar Predicción</Button>
                </form>
              )}
            </motion.div>
          ) : (
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center gap-3">
              <ShieldAlert className="w-10 h-10 text-gray-400" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Predicciones Cerradas</p>
                <p className="text-sm text-gray-500 mt-1">Este partido ya no acepta nuevas predicciones.</p>
              </div>
            </div>
          )}

          {predictions.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-400" /> Predicciones de otros jugadores
              </h3>
              <div className="grid gap-3">
                {predictions.filter(p => p.userId !== user?.id).map(p => <PredictionCard key={p.id} prediction={p} />)}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Rules */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 p-6 rounded-2xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-worldcup-500" /> Reglas de puntuación
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Puntos que puedes sumar según la precisión de tu pronóstico. (No acumulables entre exacto/ganador/diferencia).</p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Resultado exacto</p>
                    <p className="text-[11px] text-gray-500">Aciertas el marcador exacto</p>
                  </div>
                  <span className="font-bold text-worldcup-600 dark:text-worldcup-400">5 pts</span>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Ganador o empate</p>
                    <p className="text-[11px] text-gray-500">Aciertas quién gana o si hay empate</p>
                  </div>
                  <span className="font-bold text-worldcup-600 dark:text-worldcup-400">3 pts</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Diferencia de goles</p>
                    <p className="text-[11px] text-gray-500">Aciertas el ganador y margen de goles</p>
                  </div>
                  <span className="font-bold text-worldcup-600 dark:text-worldcup-400">2 pts</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-zinc-800">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Bonificaciones</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center justify-between">
                  <span>Racha de 3 aciertos</span>
                  <span className="text-green-500 font-semibold">+2 pts</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Anticipación {'>'} 24h</span>
                  <span className="text-green-500 font-semibold">+1 pt</span>
                </li>
              </ul>
              <p className="text-[10px] text-gray-400 mt-4 leading-relaxed">Las predicciones realizadas en los últimos 10 minutos previos al partido están bloqueadas. Planifica con anticipación.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
