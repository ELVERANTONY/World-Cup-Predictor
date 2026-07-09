import { useState } from 'react'
import { motion } from 'motion/react'
import { Send, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Prediction, Match } from '@/types'
import { useMatches } from '@/hooks/useQueries'
import { useToast } from '@/components/ui/toast'

interface PredictionFormProps {
  match?: Match
  prediction?: Prediction
  onSubmit: (matchId: string, homeScore: number, awayScore: number, confidence?: number, comment?: string) => Promise<void>
  onCancel?: () => void
}

export function PredictionForm({ match: initialMatch, prediction, onSubmit, onCancel }: PredictionFormProps) {
  const { addToast } = useToast()
  const { data: matches = [] } = useMatches()
  const [matchId, setMatchId] = useState(prediction?.matchId || initialMatch?.id || '')
  const [homeScore, setHomeScore] = useState(prediction?.homeScore?.toString() || '')
  const [awayScore, setAwayScore] = useState(prediction?.awayScore?.toString() || '')
  const [confidence, setConfidence] = useState(prediction?.confidence || 50)
  const [comment, setComment] = useState(prediction?.comment || '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const selectedMatch = matches.find(m => m.id === matchId)
  const isLocked = selectedMatch && (new Date(selectedMatch.date).getTime() - Date.now() < 7200000)



  function validate() {
    const errs: Record<string, string> = {}
    if (!matchId) errs.matchId = 'Selecciona un partido'
    const hs = parseInt(homeScore)
    const as = parseInt(awayScore)
    if (isNaN(hs) || hs < 0 || hs > 20) errs.homeScore = 'Debe ser entre 0-20'
    if (isNaN(as) || as < 0 || as > 20) errs.awayScore = 'Debe ser entre 0-20'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await onSubmit(matchId, parseInt(homeScore), parseInt(awayScore), confidence, comment || undefined)
      addToast('success', prediction ? '¡Predicción actualizada!' : '¡Predicción creada!')
      if (!prediction) {
        setHomeScore('')
        setAwayScore('')
        setConfidence(50)
        setComment('')
      }
    } catch {
      addToast('error', 'Error al guardar la predicción')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {!initialMatch && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Seleccionar Partido</label>
          <select
            value={matchId}
            onChange={e => setMatchId(e.target.value)}
            className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-worldcup-500"
          >
            <option value="">Elige un partido...</option>
            {matches.filter(m => m.status === 'SCHEDULED').map(m => (
              <option key={m.id} value={m.id}>
                {m.homeTeam?.name || 'Por definir'} vs {m.awayTeam?.name || 'Por definir'} ({m.stage})
              </option>
            ))}
          </select>
          {errors.matchId && <p className="text-xs text-red-500 mt-1">{errors.matchId}</p>}
        </div>
      )}

      {isLocked && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Este partido comienza en menos de 2 horas. ¡Las predicciones se bloquearán pronto!</span>
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
            {selectedMatch?.homeTeam?.flagUrl ? <img src={selectedMatch.homeTeam.flagUrl.replace('w80/w80/', 'w80/')} alt="home" className="w-5 h-3 object-cover rounded-sm" /> : ''} Goles Local
          </label>
          <Input type="number" min={0} max={20} value={homeScore} onChange={e => setHomeScore(e.target.value)} error={errors.homeScore} placeholder="0-20" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
            {selectedMatch?.awayTeam?.flagUrl ? <img src={selectedMatch.awayTeam.flagUrl.replace('w80/w80/', 'w80/')} alt="away" className="w-5 h-3 object-cover rounded-sm" /> : ''} Goles Visita
          </label>
          <Input type="number" min={0} max={20} value={awayScore} onChange={e => setAwayScore(e.target.value)} error={errors.awayScore} placeholder="0-20" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confianza: {confidence}%</label>
        <input type="range" min={1} max={100} value={confidence} onChange={e => setConfidence(parseInt(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-zinc-700 accent-worldcup-500" />
        <div className="flex justify-between text-xs text-gray-400 mt-1"><span>Inseguro</span><span>Muy seguro</span></div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Comentario (opcional)</label>
        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2} placeholder="¿Por qué elegiste este marcador?" className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-worldcup-500 resize-none" />
      </div>

      <div className="flex gap-3">
        <Button type="submit" loading={submitting} iconLeft={<Send className="w-4 h-4" />}>{prediction ? 'Actualizar Predicción' : 'Enviar Predicción'}</Button>
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>}
      </div>
    </motion.form>
  )
}
