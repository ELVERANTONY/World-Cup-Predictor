import { motion } from 'motion/react'
import type { Variants } from 'motion/react'

interface Team {
  rank: number
  team: string
  flag: string
  wins: number
  losses: number
  points: number
}

const RANKINGS: Team[] = [
  { rank: 1, team: 'Argentina', flag: 'ar', wins: 5, losses: 1, points: 92 },
  { rank: 2, team: 'France', flag: 'fr', wins: 4, losses: 2, points: 88 },
  { rank: 3, team: 'Brazil', flag: 'br', wins: 4, losses: 1, points: 85 },
  { rank: 4, team: 'England', flag: 'gb', wins: 3, losses: 2, points: 82 },
  { rank: 5, team: 'Germany', flag: 'de', wins: 3, losses: 2, points: 79 },
  { rank: 6, team: 'Netherlands', flag: 'nl', wins: 3, losses: 3, points: 76 },
  { rank: 7, team: 'Spain', flag: 'es', wins: 2, losses: 2, points: 73 },
  { rank: 8, team: 'Portugal', flag: 'pt', wins: 2, losses: 3, points: 70 },
  { rank: 9, team: 'Italy', flag: 'it', wins: 2, losses: 3, points: 67 },
  { rank: 10, team: 'Uruguay', flag: 'uy', wins: 1, losses: 4, points: 64 },
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.3 },
  },
}

const rowVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 100, damping: 20 },
  },
}

export function RankingPreview() {
  const maxPoints = Math.max(...RANKINGS.map(t => t.points))

  return (
    <section className="bg-worldcup-900 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex items-end justify-between"
        >
          <div>
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              World Ranking
            </h2>
            <p className="mt-2 text-white/50">
              Top 10 teams by performance score
            </p>
          </div>
          <button className="hidden rounded-full border border-emerald-500/30 px-6 py-2 text-sm font-medium text-emerald-400 transition-all hover:bg-emerald-500/10 md:inline-flex">
            View Full Ranking
          </button>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="space-y-3"
        >
          {RANKINGS.map(team => (
            <motion.div
              key={team.rank}
              variants={rowVariants}
              className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  team.rank <= 3
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-white/10 text-white/60'
                }`}
              >
                {team.rank}
              </span>

              <img
                src={`https://flagcdn.com/w20/${team.flag}.png`}
                alt={team.team}
                className="h-8 w-8 rounded-full object-cover"
              />

              <span className="flex-1 font-semibold text-white">
                {team.team}
              </span>

              <div className="hidden items-center gap-4 text-sm text-white/60 md:flex">
                <span>W: {team.wins}</span>
                <span>L: {team.losses}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10 md:w-32">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                    initial={{ width: 0 }}
                    whileInView={{
                      width: `${(team.points / maxPoints) * 100}%`,
                    }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 1,
                      delay: team.rank * 0.1,
                      ease: 'easeOut',
                    }}
                  />
                </div>
                <span className="w-8 text-right text-sm font-bold text-white">
                  {team.points}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center md:hidden"
        >
          <button className="rounded-full border border-emerald-500/30 px-6 py-2 text-sm font-medium text-emerald-400 transition-all hover:bg-emerald-500/10">
            View Full Ranking
          </button>
        </motion.div>
      </div>
    </section>
  )
}
