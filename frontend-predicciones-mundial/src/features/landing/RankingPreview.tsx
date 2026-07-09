import { motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { useGlobalRanking } from '@/hooks/useQueries'

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
  const { data, isLoading } = useGlobalRanking()
  const users = data?.users?.slice(0, 10) || []
  const maxPoints = Math.max(...users.map(u => u.totalPoints || 0), 1)

  if (isLoading) {
    return (
      <section className="bg-worldcup-900 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-white/50 animate-pulse">Cargando clasificación...</p>
        </div>
      </section>
    )
  }

  if (users.length === 0) return null

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
              Top Predictores
            </h2>
            <p className="mt-2 text-white/50">
              Los mejores pronosticadores del Mundial 2026
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="space-y-3"
        >
          {users.map((u, i) => (
            <motion.div
              key={u.id}
              variants={rowVariants}
              className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  i < 3
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-white/10 text-white/60'
                }`}
              >
                {u.rank || i + 1}
              </span>

              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                {u.avatarUrl ? (
                  <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  u.name?.charAt(0)?.toUpperCase() || '?'
                )}
              </div>

              <span className="flex-1 font-semibold text-white truncate">
                {u.name || 'Anónimo'}
              </span>

              <div className="flex items-center gap-3">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10 md:w-32">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                    initial={{ width: 0 }}
                    whileInView={{
                      width: `${(u.totalPoints / maxPoints) * 100}%`,
                    }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 1,
                      delay: i * 0.1,
                      ease: 'easeOut',
                    }}
                  />
                </div>
                <span className="w-8 text-right text-sm font-bold text-white">
                  {u.totalPoints}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
