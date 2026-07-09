import { useMemo } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { useMatches } from '@/hooks/useQueries'
import { GlowCard } from '@/components/ui/spotlight-card'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

export function KnockoutsPage() {
  const navigate = useNavigate()
  const { data: allMatches = [], isLoading: loading } = useMatches()

  const matches = useMemo(() => {
    return allMatches.filter(m => 
      m.stage === 'Round of 32' || 
      m.stage === 'Round of 16' || 
      m.stage === 'Quarter-final' || 
      m.stage === 'Semi-final' || 
      m.stage === 'Third place' || 
      m.stage === 'Final'
    )
  }, [allMatches])

  if (loading) {
    return <div className="p-8">Loading knockouts...</div>
  }

  const renderStage = (stageName: string, title: string) => {
    const stageMatches = matches.filter(m => m.stage === stageName)
    if (stageMatches.length === 0) return null

    return (
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 dark:border-zinc-800 pb-2">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {stageMatches.map(m => (
            <div key={m.id} onClick={() => navigate(`/matches/${m.id}`)} className="cursor-pointer">
              <GlowCard customSize={true} className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all bg-white dark:bg-surface-dark">
                <div className="text-xs text-gray-500 mb-3 flex items-center justify-between">
                  <span>{new Date(m.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${m.status === 'LIVE' ? 'bg-red-100 text-red-600' : m.status === 'FINISHED' ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-blue-600'}`}>
                    {m.status === 'FINISHED' ? 'Finalizado' : m.status === 'LIVE' ? 'En Vivo' : 'Programado'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {m.homeTeam?.flagUrl && <img src={m.homeTeam.flagUrl.replace('w80/w80/', 'w80/')} alt={m.homeTeam.name} className="w-5 h-5 rounded-full object-cover" />}
                      <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate w-32">{m.homeTeam?.name || 'TBD'}</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{m.homeScore ?? '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {m.awayTeam?.flagUrl && <img src={m.awayTeam.flagUrl.replace('w80/w80/', 'w80/')} alt={m.awayTeam.name} className="w-5 h-5 rounded-full object-cover" />}
                      <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate w-32">{m.awayTeam?.name || 'TBD'}</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{m.awayScore ?? '-'}</span>
                  </div>
                </div>
                {m.status === 'SCHEDULED' && (
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800/50 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); navigate(`/matches/${m.id}`) }} iconRight={<ChevronRight className="w-3 h-3" />} className="text-worldcup-600 hover:text-worldcup-700 hover:bg-worldcup-50 dark:hover:bg-worldcup-900/30">
                      Predecir
                    </Button>
                  </div>
                )}
              </GlowCard>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Fase eliminatoria</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Sigue el camino hacia la final del Mundial con datos oficiales.</p>
      </motion.div>

      <div className="mt-8">
        {renderStage('Round of 32', 'Dieciseisavos')}
        {renderStage('Round of 16', 'Octavos')}
        {renderStage('Quarter-final', 'Cuartos')}
        {renderStage('Semi-final', 'Semifinales')}
        {renderStage('Third place', 'Tercer Puesto')}
        {renderStage('Final', 'Final')}
        {matches.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            Los partidos de fase eliminatoria aún no están definidos.
          </div>
        )}
      </div>
    </div>
  )
}
