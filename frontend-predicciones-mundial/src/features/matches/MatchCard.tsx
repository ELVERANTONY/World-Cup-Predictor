import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { Match } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GlowCard } from '@/components/ui/spotlight-card'
import { Modal } from '@/components/ui/modal'
import { getMatchInsights } from '@/services/match.service'
import { Sparkles, Loader2 } from 'lucide-react'

interface MatchCardProps {
  match: Match
}

const statusConfig: Record<string, { variant: 'info' | 'warning' | 'default' | 'success' | 'danger'; label: string }> = {
  SCHEDULED: { variant: 'info', label: 'Programado' },
  LIVE: { variant: 'warning', label: 'En Vivo' },
  FINISHED: { variant: 'default', label: 'Finalizado' },
  POSTPONED: { variant: 'warning', label: 'Aplazado' },
  CANCELLED: { variant: 'danger', label: 'Cancelado' },
}

function translateStage(stage?: string | null): string {
  if (!stage) return ''
  const stageMap: Record<string, string> = {
    // Fase de grupos
    'Group A': 'Grupo A', 'Group B': 'Grupo B', 'Group C': 'Grupo C',
    'Group D': 'Grupo D', 'Group E': 'Grupo E', 'Group F': 'Grupo F',
    'Group G': 'Grupo G', 'Group H': 'Grupo H', 'Group I': 'Grupo I',
    'Group J': 'Grupo J', 'Group K': 'Grupo K', 'Group L': 'Grupo L',
    // Fases eliminatorias
    'Round of 32': 'Ronda de 32',
    'Round of 16': 'Octavos de Final',
    'Quarter-final': 'Cuartos de Final',
    'Quarter-finals': 'Cuartos de Final',
    'Semi-final': 'Semifinal',
    'Semi-finals': 'Semifinal',
    '3rd Place': 'Tercer Puesto',
    '3rd place play-off': 'Tercer Puesto',
    'Final': 'Final',
    'Round 1': 'Primera Ronda',
    'Round 2': 'Segunda Ronda',
    'Round 3': 'Tercera Ronda',
  }
  return stageMap[stage] ?? stage
}

export function MatchCard({ match }: MatchCardProps) {
  const navigate = useNavigate()
  const status = statusConfig[match.status] || { variant: 'default' as const, label: match.status }
  const [showInsights, setShowInsights] = useState(false)
  const [insights, setInsights] = useState<string | null>(null)
  const [loadingInsights, setLoadingInsights] = useState(false)

  const handleInsightsClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowInsights(true)
    if (!insights) {
      setLoadingInsights(true)
      const data = await getMatchInsights(match.id)
      setInsights(data)
      setLoadingInsights(false)
    }
  }

  const renderFlag = (flagUrl?: string, alt?: string) => {
    if (!flagUrl) return <span className="text-3xl">🏳</span>;
    // Fix broken w80/w80 URLs from old seeds
    const cleanUrl = flagUrl.replace('w80/w80/', 'w80/');
    return (
      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-zinc-700 bg-gray-50 flex-shrink-0 flex items-center justify-center">
        <img src={cleanUrl} alt={alt || 'flag'} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <>
    <div onClick={() => navigate(`/matches/${match.id}`)} className="cursor-pointer h-full">
      <GlowCard customSize={true} className="p-5 flex flex-col h-full bg-white dark:bg-zinc-900 border border-gray-300/80 dark:border-zinc-700/60 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl">
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="flex-1 flex flex-col"
      >
      <div className="flex items-center justify-between mb-4">
        <Badge variant={status.variant} live={match.status === 'LIVE'}>
          {match.status === 'LIVE' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-1" />}
          {status.label}
        </Badge>
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{translateStage(match.stage)}</span>
      </div>

      <div className="flex items-center justify-between gap-4 mb-5 relative">
        <div className="flex flex-col items-center flex-1 min-w-0">
          {renderFlag(match.homeTeam?.flagUrl, match.homeTeam?.name)}
          <p className="font-bold text-gray-900 dark:text-white truncate w-full text-center mt-2 text-sm">{match.homeTeam?.name || 'TBD'}</p>
        </div>

        <div className="flex flex-col items-center flex-shrink-0 px-2">
          {match.status === 'FINISHED' && match.homeScore !== null ? (
            <div className="text-center bg-gray-100 dark:bg-zinc-800/50 px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700/50">
              <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{match.homeScore} - {match.awayScore}</p>
              <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest mt-0.5">Finalizado</p>
            </div>
          ) : (
            <div className="text-center bg-worldcup-50 dark:bg-worldcup-500/10 px-4 py-2 rounded-xl border border-worldcup-100 dark:border-worldcup-500/20">
              <p className="text-lg font-black text-worldcup-600 dark:text-worldcup-400">VS</p>
              <p className="text-[10px] font-bold text-worldcup-500/70 uppercase tracking-widest mt-0.5">{match.status === 'LIVE' ? 'En vivo' : 'Por jugar'}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center flex-1 min-w-0">
          {renderFlag(match.awayTeam?.flagUrl, match.awayTeam?.name)}
          <p className="font-bold text-gray-900 dark:text-white truncate w-full text-center mt-2 text-sm">{match.awayTeam?.name || 'TBD'}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800/50">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(match.date).toLocaleDateString()}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{match.stadium?.name || match.stadiumId || 'TBD'}</span>
        </div>
        <div className="flex items-center gap-2">
          {match.status === 'SCHEDULED' && (
            <Button variant="primary" size="sm" onClick={e => { e.stopPropagation(); navigate(`/matches/${match.id}`) }} iconRight={<ChevronRight className="w-3 h-3" />}>Predecir</Button>
          )}
        </div>
      </div>
      </motion.div>
      </GlowCard>
    </div>

      <Modal open={showInsights} onClose={() => setShowInsights(false)} title="Análisis de IA" size="md">
        <div className="flex flex-col gap-4 p-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-worldcup-400 to-worldcup-600 flex items-center justify-center text-white shadow-lg shadow-worldcup-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Gemini 2.5 Flash</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Generando insights del partido...</p>
            </div>
          </div>
          <div className="bg-worldcup-50/50 dark:bg-worldcup-900/10 border border-worldcup-100 dark:border-worldcup-900/30 rounded-xl p-4 min-h-[100px] flex items-center justify-center">
            {loadingInsights ? (
              <div className="flex flex-col items-center gap-2 text-worldcup-500">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-sm font-medium animate-pulse">Analizando estadísticas...</span>
              </div>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                {insights}
              </p>
            )}
          </div>
          <div className="flex justify-end mt-2">
            <Button onClick={() => setShowInsights(false)}>Cerrar</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
