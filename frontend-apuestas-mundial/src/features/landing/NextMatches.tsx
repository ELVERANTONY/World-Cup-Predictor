import { useMemo } from 'react'
import { motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { MapPin, Clock } from 'lucide-react'
import { useMatches } from '@/hooks/useQueries'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
}

export function NextMatches() {
  const { data: allMatches = [] } = useMatches()
  const matches = useMemo(() => {
    return allMatches.filter(m => m.status === 'SCHEDULED' || m.status === 'LIVE').slice(0, 6)
  }, [allMatches])

  if (matches.length === 0) return null

  return (
    <section className="relative overflow-hidden bg-black py-20 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500 drop-shadow-sm pb-1">
            Próximos Partidos
          </h2>
          <p className="mt-2 text-white/50">
            Fase Final y Eliminatorias Destacadas
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="flex gap-6 overflow-x-auto pb-4"
          style={{ scrollbarWidth: 'none' }}
        >
          {matches.map(match => (
            <motion.div
              key={match.id}
              variants={cardVariants}
              className="flex min-w-[280px] shrink-0 flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-shadow hover:shadow-xl hover:shadow-white/5"
            >
              <div className="text-xs font-bold text-worldcup-400 mb-3 uppercase tracking-wider">{match.stage}</div>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 w-[40%]">
                  {match.homeTeam?.flagUrl ? (
                    <img
                      src={match.homeTeam.flagUrl.replace('w80/w80/', 'w80/')}
                      alt={match.homeTeam?.name}
                      className="h-6 w-8 rounded-sm object-cover"
                    />
                  ) : <span>🏳</span>}
                  <span className="text-sm font-semibold text-white truncate">
                    {match.homeTeam?.name || 'TBD'}
                  </span>
                </div>
                <span className="text-xs font-bold text-yellow-400 shrink-0">VS</span>
                <div className="flex items-center gap-2 w-[40%] justify-end">
                  <span className="text-sm font-semibold text-white truncate text-right">
                    {match.awayTeam?.name || 'TBD'}
                  </span>
                  {match.awayTeam?.flagUrl ? (
                    <img
                      src={match.awayTeam.flagUrl.replace('w80/w80/', 'w80/')}
                      alt={match.awayTeam?.name}
                      className="h-6 w-8 rounded-sm object-cover"
                    />
                  ) : <span>🏳</span>}
                </div>
              </div>

              <div className="mt-auto space-y-2 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {new Date(match.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{match.stadium?.name || 'Por definir'}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
