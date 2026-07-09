import { useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { useMatches } from '@/hooks/useQueries'
import type { Match } from '@/types'
import { GlowCard } from '@/components/ui/spotlight-card'
import { cn } from '@/lib/utils'
import worldCupImage from '@/assets/World Cup.png'
import confetti from 'canvas-confetti'

export function TournamentBracket() {
  const { data: allMatches = [], isLoading: loading } = useMatches()
  const confettiRunning = useRef(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cupRef = useRef<HTMLImageElement>(null)
  const confettiInstance = useRef<any>(null)

  const matches = allMatches.filter((m: Match) =>
    ['Round of 16', 'Quarter-final', 'Semi-final', 'Final'].includes(m.stage)
  )

  if (loading) {
    return (
      <section className="py-24 bg-gray-50 dark:bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 animate-pulse">Cargando llaves del torneo...</p>
        </div>
      </section>
    )
  }

  const ro16 = matches.filter(m => m.stage === 'Round of 16').slice(0, 8)
  const quarters = matches.filter(m => m.stage === 'Quarter-final').slice(0, 4)
  const semis = matches.filter(m => m.stage === 'Semi-final').slice(0, 2)
  const final = matches.filter(m => m.stage === 'Final').slice(0, 1)

  const renderMatch = (match: Match | undefined, index: number, stageMultiplier: number = 1) => {
    if (!match || !match.homeTeam) {
      return (
        <div key={`empty-${index}-${stageMultiplier}`} className="h-[68px] w-36 md:w-40 rounded-xl border border-dashed border-gray-300 dark:border-zinc-700 flex flex-col justify-center items-center bg-gray-50/30 dark:bg-zinc-900/30 shadow-sm relative z-10 opacity-70">
          <span className="text-[10px] md:text-xs text-gray-500 font-semibold tracking-wider uppercase">Por definir</span>
        </div>
      )
    }

    const homeTeam = match.homeTeam
    const awayTeam = match.awayTeam

    const homeScore = match.homeScore ?? null
    const awayScore = match.awayScore ?? null
    
    return (
      <GlowCard key={match?.id || `mock-${index}-${stageMultiplier}`} customSize={true} className="w-36 md:w-40 h-[68px] p-2 rounded-xl flex flex-col justify-center gap-1 bg-white dark:bg-zinc-800/80 border-gray-200/50 dark:border-zinc-700/50 shadow-sm hover:shadow-md transition-shadow relative z-10">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 truncate">
            {homeTeam?.flagUrl ? (
              <img src={homeTeam.flagUrl} alt="" className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full object-cover" />
            ) : <span className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-gray-200 dark:bg-zinc-700" />}
            <span className={cn('text-[10px] md:text-xs font-bold truncate', homeScore !== null && homeScore > (awayScore ?? -1) ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400')}>
              {homeTeam?.shortName || homeTeam?.name?.slice(0, 3).toUpperCase() || 'TBD'}
            </span>
          </div>
          <span className="text-[10px] md:text-xs font-bold text-gray-900 dark:text-white">{homeScore ?? '-'}</span>
        </div>
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 truncate">
            {awayTeam?.flagUrl ? (
              <img src={awayTeam.flagUrl} alt="" className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full object-cover" />
            ) : <span className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-gray-200 dark:bg-zinc-700" />}
            <span className={cn('text-[10px] md:text-xs font-bold truncate', awayScore !== null && awayScore > (homeScore ?? -1) ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400')}>
              {awayTeam?.shortName || awayTeam?.name?.slice(0, 3).toUpperCase() || 'TBD'}
            </span>
          </div>
          <span className="text-[10px] md:text-xs font-bold text-gray-900 dark:text-white">{awayScore ?? '-'}</span>
        </div>
      </GlowCard>
    )
  }

  const triggerConfetti = () => {
    if (confettiRunning.current || !canvasRef.current || !cupRef.current) return;
    confettiRunning.current = true;

    if (!confettiInstance.current) {
      confettiInstance.current = confetti.create(canvasRef.current, {
        resize: true,
      });
    }
    
    const rect = cupRef.current.getBoundingClientRect();
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    // Relative position to the canvas
    const x = (rect.left - canvasRect.left + rect.width / 2) / canvasRect.width;
    const y = (rect.top - canvasRect.top + rect.height / 2) / canvasRect.height;

    const duration = 2500;
    const end = Date.now() + duration;

    const frame = () => {
      confettiInstance.current({
        particleCount: 5,
        angle: 90,
        spread: 80,
        origin: { x, y },
        colors: ['#EAB308', '#FDE047', '#FFFFFF', '#D97706'],
        startVelocity: 30,
        gravity: 0.8,
        ticks: 300,
        zIndex: 50,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      } else {
        confettiRunning.current = false;
      }
    };
    
    frame();
  };

  return (
    <section className="py-16 md:py-24 bg-black relative overflow-hidden border-t border-white/5">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-[60]" />
      <div className="w-full max-w-[1920px] mx-auto px-2 md:px-6 lg:px-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black flex items-center justify-center gap-3 md:gap-4">
            <span className="text-4xl md:text-5xl drop-shadow-sm">🏆</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 drop-shadow-sm">Camino a la Gloria</span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Sigue el avance de las selecciones en la fase de eliminación directa.
          </p>
        </motion.div>

        <div className="overflow-x-auto pb-8 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="w-max mx-auto flex gap-2 sm:gap-4 md:gap-6 lg:gap-8 relative items-center px-2 pt-16">
            {/* Round of 16 - Left */}
            <div className="flex flex-col justify-between h-[480px] py-4">
              {[0, 1, 4, 5].map(i => renderMatch(ro16[i], i, 1))}
            </div>

            {/* Quarters - Left */}
            <div className="flex flex-col justify-around h-[480px] py-8">
              {[0, 1].map(i => renderMatch(quarters[i], i, 2))}
            </div>

            {/* Semis - Left */}
            <div className="flex flex-col justify-center h-[480px]">
              {renderMatch(semis[0], 0, 4)}
            </div>

            {/* Final */}
            <div className="flex flex-col justify-center items-center h-[480px] px-2 md:px-4">
              <div className="relative transform scale-110 md:scale-125 z-20">
                <div className="absolute bottom-[110%] left-1/2 -translate-x-1/2 mb-2 flex flex-col items-center z-50">
                  <img 
                    ref={cupRef}
                    src={worldCupImage} 
                    alt="World Cup" 
                    onMouseEnter={triggerConfetti}
                    className="h-24 md:h-32 w-auto object-contain drop-shadow-[0_0_20px_rgba(234,179,8,0.6)] mb-2 cursor-pointer hover:scale-110 transition-transform duration-300 pointer-events-auto" 
                  />
                  <span className="text-[10px] md:text-xs font-black uppercase text-yellow-500 tracking-widest drop-shadow-md whitespace-nowrap">Gran Final</span>
                </div>
                {renderMatch(final[0], 0, 8)}
              </div>
            </div>

            {/* Semis - Right */}
            <div className="flex flex-col justify-center h-[480px]">
              {renderMatch(semis[1], 1, 4)}
            </div>

            {/* Quarters - Right */}
            <div className="flex flex-col justify-around h-[480px] py-8">
              {[2, 3].map(i => renderMatch(quarters[i], i, 2))}
            </div>

            {/* Round of 16 - Right */}
            <div className="flex flex-col justify-between h-[480px] py-4">
              {[2, 3, 6, 7].map(i => renderMatch(ro16[i], i, 1))}
            </div>
            
            {/* Connectors Background (Decorative) */}
            <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-40" style={{
              backgroundImage: 'radial-gradient(circle at center, var(--color-primary) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }} />
          </div>
        </div>
      </div>
    </section>
  )
}
