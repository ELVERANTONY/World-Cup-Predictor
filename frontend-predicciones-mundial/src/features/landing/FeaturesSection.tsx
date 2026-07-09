import { motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { Zap, Users, BarChart3, Globe } from 'lucide-react'

interface Feature {
  icon: typeof Zap
  title: string
  description: string
}

const FEATURES: Feature[] = [
  {
    icon: Zap,
    title: 'Live Predictions',
    description:
      'Make real-time predictions as matches unfold. Update your picks based on live action.',
  },
  {
    icon: Users,
    title: 'Multiplayer Rooms',
    description:
      'Create private rooms with friends. Compete in custom leagues and win bragging rights.',
  },
  {
    icon: BarChart3,
    title: 'Real-time Stats',
    description:
      'Access detailed match statistics, team performance data, and predictive analytics.',
  },
  {
    icon: Globe,
    title: 'Global Leaderboard',
    description:
      'Climb the global rankings. Compete against predictors from over 10 countries.',
  },
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 80, damping: 15 },
  },
}

export function FeaturesSection() {
  return (
    <section className="bg-surface-dark py-20">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Why Choose{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-yellow-400 bg-clip-text text-transparent">
              World Cup Predictor
            </span>
          </h2>
          <p className="mt-2 text-white/50">
            Everything you need to predict like a pro
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {FEATURES.map(feature => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all hover:bg-white/10 hover:shadow-xl hover:shadow-emerald-500/5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                  <Icon className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/60">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
