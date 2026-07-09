import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Target, RefreshCw, Trophy } from 'lucide-react'
import { useMyPredictions, useTeams, useCreatePrediction, useUpdatePrediction, useUpdatePredictedWinner } from '@/hooks/useQueries'
import type { Prediction } from '@/types'
import { PredictionCard } from './PredictionCard'
import { GlowCard } from '@/components/ui/spotlight-card'
import { PredictionForm } from './PredictionForm'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { Skeleton } from '@/components/ui/skeleton'
import { staggerContainer, staggerItem } from '@/utils/animation'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

export function PredictionsPage() {
  const { addToast } = useToast()
  const { user } = useAuth()
  const { data: predictions = [], isLoading: loading, error: predictionsError, refetch: fetchPredictions } = useMyPredictions()
  const { data: teams = [] } = useTeams()
  const createPredictionMutation = useCreatePrediction()
  const updatePredictionMutation = useUpdatePrediction()
  const updatePredictedWinnerMutation = useUpdatePredictedWinner()
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'finished'>('all')
  const [editingPrediction, setEditingPrediction] = useState<Prediction | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showWinnerModal, setShowWinnerModal] = useState(false)
  const [selectedWinnerId, setSelectedWinnerId] = useState<string>('')

  const filtered = predictions.filter(p => {
    if (filter === 'all') return true
    if (filter === 'upcoming') return p.match?.status === 'SCHEDULED'
    return p.match?.status === 'FINISHED'
  })

  async function handleCreate(matchId: string, homeScore: number, awayScore: number, confidence?: number, comment?: string) {
    await createPredictionMutation.mutateAsync({ matchId, homeScore, awayScore, confidence, comment })
    setShowCreateForm(false)
    addToast('success', 'Prediction created!')
  }

  async function handleUpdate(_matchId: string, homeScore: number, awayScore: number, confidence?: number, comment?: string): Promise<void> {
    void _matchId;
    if (!editingPrediction) return
    await updatePredictionMutation.mutateAsync({ id: editingPrediction.id, homeScore, awayScore, confidence, comment })
    setEditingPrediction(null)
    addToast('success', 'Prediction updated!')
  }

  async function handleWinnerSave() {
    if (!selectedWinnerId) { addToast('error', 'Por favor selecciona un equipo'); return }
    try {
      await updatePredictedWinnerMutation.mutateAsync(selectedWinnerId)
      setShowWinnerModal(false)
      addToast('success', '¡Ganador del torneo guardado!')
    } catch {
      addToast('error', 'Error al guardar')
    }
  }

  if (predictionsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-500">Failed to load predictions</p>
        <Button variant="outline" onClick={() => window.location.reload()} iconLeft={<RefreshCw className="w-4 h-4" />}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Mis Predicciones</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Sigue tu progreso y registra nuevos pronósticos</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="bg-worldcup-50 dark:bg-worldcup-900/20 px-4 py-2 rounded-xl flex flex-col justify-center border border-worldcup-100 dark:border-worldcup-900/50">
            <span className="text-xs font-semibold text-worldcup-600 dark:text-worldcup-400 uppercase tracking-wider">Racha Actual</span>
            <span className="text-lg font-bold text-worldcup-700 dark:text-worldcup-300 flex items-center gap-1">
              <span className="text-xl">🔥</span> {user?.currentStreak || 0} aciertos
            </span>
          </div>
          <Button onClick={() => setShowCreateForm(true)} iconLeft={<Target className="w-4 h-4" />}>Nueva Predicción</Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30 flex items-start gap-3">
        <span className="text-xl">💡</span>
        <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
          <strong>Tip de Gamificación:</strong> Cada 3 aciertos consecutivos de ganador o exacto suman <strong>2 puntos extra</strong> a tu clasificación. ¡Mantén la racha!
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <GlowCard customSize={true} className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-worldcup-50 dark:bg-worldcup-900/30 flex items-center justify-center text-worldcup-600 dark:text-worldcup-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Ganador del Torneo</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.predictedWinner ? 'Tu elección para llevarse la copa' : '¡Acierta al campeón y gana bonus extra!'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            {user?.predictedWinner ? (
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-800 px-4 py-2 rounded-xl">
                <img src={user.predictedWinner.flagUrl} alt={user.predictedWinner.name} className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-zinc-700 shadow-sm" />
                <span className="font-semibold text-gray-900 dark:text-white">{user.predictedWinner.name}</span>
              </div>
            ) : null}
            
            <Button onClick={() => { setSelectedWinnerId(user?.predictedWinnerId || ''); setShowWinnerModal(true) }} variant={user?.predictedWinner ? 'outline' : 'default'} className={user?.predictedWinner ? '' : 'animate-pulse'}>
              {user?.predictedWinner ? 'Cambiar Elección' : 'Elegir Ganador'}
            </Button>
          </div>
        </GlowCard>
      </motion.div>

      <div className="flex gap-2">
        {(['all', 'upcoming', 'finished'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-all', filter === f ? 'bg-worldcup-500 text-white shadow-md' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700')}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4">{[1, 2, 3].map(i => <Skeleton key={i} variant="card" className="h-40" />)}</div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
          <Target className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No predictions yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Start predicting match results!</p>
          <Button onClick={() => setShowCreateForm(true)}>Make your first prediction</Button>
        </motion.div>
      ) : (
        <motion.div className="grid gap-4" variants={staggerContainer} initial="hidden" animate="visible">
          <AnimatePresence mode="popLayout">
            {filtered.map(p => (
              <motion.div key={p.id} variants={staggerItem} layout>
                <PredictionCard prediction={p} onEdit={p.match?.status === 'SCHEDULED' ? setEditingPrediction : undefined} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <Modal open={showCreateForm} onClose={() => setShowCreateForm(false)} title="New Prediction">
        <PredictionForm onSubmit={handleCreate} onCancel={() => setShowCreateForm(false)} />
      </Modal>

      <Modal open={!!editingPrediction} onClose={() => setEditingPrediction(null)} title="Edit Prediction">
        {editingPrediction && <PredictionForm prediction={editingPrediction} onSubmit={handleUpdate} onCancel={() => setEditingPrediction(null)} />}
      </Modal>

      <Modal open={showWinnerModal} onClose={() => setShowWinnerModal(false)} title="Elegir Ganador del Mundial" size="md">
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Selecciona al equipo que crees que ganará la Copa del Mundo 2026.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto p-1">
            {teams.map(team => (
              <button
                key={team.id}
                onClick={() => setSelectedWinnerId(team.id)}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all',
                  selectedWinnerId === team.id
                    ? 'border-worldcup-500 bg-worldcup-50 dark:bg-worldcup-500/10 shadow-sm'
                    : 'border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-700'
                )}
              >
                <img src={team.flagUrl} alt={team.name} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                <span className="text-xs font-semibold text-center text-gray-900 dark:text-white leading-tight">{team.name}</span>
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <Button variant="outline" onClick={() => setShowWinnerModal(false)}>Cancelar</Button>
            <Button onClick={handleWinnerSave}>Guardar Elección</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
