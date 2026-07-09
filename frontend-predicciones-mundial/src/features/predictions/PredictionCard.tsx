import { motion } from 'motion/react'
import { Clock } from 'lucide-react'
import type { Prediction } from '@/types'
import { Badge } from '@/components/ui/badge'
import { GlowCard } from '@/components/ui/spotlight-card'

interface PredictionCardProps {
  prediction: Prediction
}

const statusBadge: Record<string, { variant: 'success' | 'warning' | 'info' | 'default' | 'danger'; label: string }> = {
  SCHEDULED: { variant: 'info', label: 'Programado' },
  LIVE: { variant: 'warning', label: 'En Vivo' },
  FINISHED: { variant: 'default', label: 'Finalizado' },
  POSTPONED: { variant: 'warning', label: 'Aplazado' },
  CANCELLED: { variant: 'danger', label: 'Cancelado' },
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  const { match } = prediction
  const isFinished = match?.status === 'FINISHED'

  const isCorrect = isFinished && match.homeScore === prediction.homeScore && match.awayScore === prediction.awayScore
  const isPartial = isFinished && !isCorrect && (
    (match.homeScore !== null && match.awayScore !== null) &&
    ((match.homeScore > match.awayScore && prediction.homeScore > prediction.awayScore) ||
     (match.homeScore < match.awayScore && prediction.homeScore < prediction.awayScore) ||
     (match.homeScore === match.awayScore && prediction.homeScore === prediction.awayScore))
  )

  const badge = match ? statusBadge[match.status] || { variant: 'default' as const, label: match.status } : { variant: 'default' as const, label: 'Unknown' }

  const stageMap: Record<string, string> = {
    'Group stage': 'Fase de Grupos',
    'Round of 16': 'Octavos de Final',
    'Quarter-final': 'Cuartos de Final',
    'Semi-final': 'Semifinal',
    'Final': 'Gran Final',
    'Third place': 'Tercer Puesto'
  }
  const translatedStage = match?.stage ? (stageMap[match.stage] || match.stage) : '';

  return (
    <div className={`h-full pointer-events-none`}>
      <GlowCard customSize={true} className="p-5 flex flex-col h-full bg-white dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-700/60 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl">
        <motion.div
          layout
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
        >
          <div className="flex items-center justify-between mb-3">
            <Badge variant={badge.variant}>
              {match?.status === 'LIVE' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-1" />}
              {badge.label}
            </Badge>

            {isFinished && (
              <span className={cn(
                'text-xs font-semibold px-2 py-0.5 rounded-full',
                isCorrect && 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
                isPartial && 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
                !isCorrect && !isPartial && 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
              )}>
                {isCorrect ? '+5 pts' : isPartial ? '+2 pts' : '+0 pts'}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-3xl">
                {match?.homeTeam?.flagUrl ? <img src={match.homeTeam.flagUrl.replace('w80/w80/', 'w80/')} alt="home flag" className="w-8 h-5 object-cover rounded-sm" /> : '🏳'}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">{match?.homeTeam?.name || 'TBD'}</p>
                <p className="text-xs text-gray-500">{match?.homeTeam?.shortName || ''}</p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-center">
                <div className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                  <span className={cn(isFinished && prediction.homeScore === match.homeScore ? 'text-emerald-500' : '')}>{prediction.homeScore}</span>
                  <span className="text-gray-400">-</span>
                  <span className={cn(isFinished && prediction.awayScore === match.awayScore ? 'text-emerald-500' : '')}>{prediction.awayScore}</span>
                </div>
                <p className="text-xs text-gray-400">{isFinished ? 'Predicho' : 'Tu elección'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
              <div className="min-w-0 text-right">
                <p className="font-semibold text-gray-900 dark:text-white truncate">{match?.awayTeam?.name || 'TBD'}</p>
                <p className="text-xs text-gray-500">{match?.awayTeam?.shortName || ''}</p>
              </div>
              <span className="text-3xl">
                {match?.awayTeam?.flagUrl ? <img src={match.awayTeam.flagUrl.replace('w80/w80/', 'w80/')} alt="away flag" className="w-8 h-5 object-cover rounded-sm" /> : '🏳'}
              </span>
            </div>
          </div>

          {isFinished && match?.homeScore !== null && match?.homeScore !== undefined && (
            <div className="flex items-center justify-center gap-2 mb-3 text-sm">
              <span className="text-gray-500">Real:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{match.homeScore} - {match.awayScore}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{match ? new Date(match.date).toLocaleDateString() : ''}</span>
            </div>
            <span>{translatedStage}</span>
          </div>
        </motion.div>
      </GlowCard>
    </div>
  )
}
