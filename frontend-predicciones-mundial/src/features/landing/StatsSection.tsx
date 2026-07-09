import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Users, Trophy, Flag, Globe } from 'lucide-react'

interface Stat {
  icon: typeof Users
  target: number
  suffix: string
  label: string
}

const STATS: Stat[] = [
  { icon: Users, target: 50, suffix: 'K+', label: 'Players' },
  { icon: Trophy, target: 64, suffix: '', label: 'Matches' },
  { icon: Flag, target: 32, suffix: '', label: 'Teams' },
  { icon: Globe, target: 10, suffix: '+', label: 'Countries' },
]

function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const fps = 60
          const duration = 2000
          const totalSteps = (duration / 1000) * fps
          const increment = target / totalSteps
          let current = 0

          timer = setInterval(() => {
            current += increment
            if (current >= target) {
              setCount(target)
              if (timer) clearInterval(timer)
            } else {
              setCount(Math.floor(current))
            }
          }, 1000 / fps)

          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
      if (timer) clearInterval(timer)
    }
  }, [target])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}

export function StatsSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-worldcup-900 to-surface-dark py-20">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            World Cup 2026 by the Numbers
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, type: 'spring', stiffness: 80 }}
                className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl"
              >
                <Icon className="mb-4 h-8 w-8 text-emerald-400" />
                <span className="text-4xl font-bold text-white md:text-5xl">
                  <CountUp target={stat.target} suffix={stat.suffix} />
                </span>
                <span className="mt-2 text-sm text-white/60">
                  {stat.label}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
