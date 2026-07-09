import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import type { Variants } from 'motion/react'
import { Trophy, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface Particle {
  id: number
  left: string
  delay: number
  duration: number
  size: number
}

interface CountryFlag {
  code: string
  name: string
  x: string
  y: string
}

const COUNTRIES: CountryFlag[] = [
  { code: 'ar', name: 'Argentina', x: '10%', y: '25%' },
  { code: 'br', name: 'Brazil', x: '80%', y: '20%' },
  { code: 'fr', name: 'France', x: '15%', y: '60%' },
  { code: 'de', name: 'Germany', x: '85%', y: '55%' },
  { code: 'es', name: 'Spain', x: '5%', y: '45%' },
  { code: 'pt', name: 'Portugal', x: '75%', y: '70%' },
  { code: 'nl', name: 'Netherlands', x: '90%', y: '35%' },
  { code: 'it', name: 'Italy', x: '20%', y: '75%' },
]

const PARTICLES: Particle[] = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  delay: Math.random() * 5,
  duration: 3 + Math.random() * 4,
  size: 2 + Math.random() * 3,
}))

function getCountdown(): Countdown {
  const target = new Date('2026-07-19T15:00:00')
  const now = new Date()
  const diff = Math.max(0, target.getTime() - now.getTime())
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 80, damping: 20 },
  },
}

export function Hero() {
  const [countdown, setCountdown] = useState<Countdown>(getCountdown)

  useEffect(() => {
    const timer = setInterval(() => setCountdown(getCountdown), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-r from-[#4f20ad] via-[#1a1744] to-black">
      {/* Stadium floodlights */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-[15%] h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute -top-40 right-[15%] h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute -top-60 left-[35%] h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      {/* Floor grid */}
      <div className="absolute bottom-0 left-0 right-0 h-[35vh]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: [
              'repeating-linear-gradient(90deg, transparent 0, transparent 50px, rgba(255,255,255,0.03) 50px, rgba(255,255,255,0.03) 51px)',
              'repeating-linear-gradient(0deg, transparent 0, transparent 30px, rgba(255,255,255,0.02) 30px, rgba(255,255,255,0.02) 31px)',
            ].join(', '),
          }}
        />
      </div>

      {/* Particles */}
      {PARTICLES.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/30"
          style={{ left: p.left, bottom: '-5%', width: p.size, height: p.size }}
          animate={{ y: [0, -1200], opacity: [0, 0.8, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Floating soccer ball */}
      <motion.div
        className="absolute right-[12%] top-[22%] z-10 hidden md:block"
        animate={{ y: [0, -25, 0], rotate: [0, 360] }}
        transition={{
          y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
        }}
      >
        <span className="text-8xl">⚽</span>
      </motion.div>

      {/* Trophy */}
      <motion.div
        className="absolute left-[12%] top-[35%] z-10 hidden md:block"
        animate={{ rotate: [-5, 5, -5], y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Trophy className="h-20 w-20 text-yellow-400 drop-shadow-lg" />
      </motion.div>

      {/* Country flags */}
      {COUNTRIES.map((country, i) => (
        <motion.img
          key={country.code}
          src={`https://flagcdn.com/w40/${country.code}.png`}
          alt={country.name}
          className="absolute z-10 hidden h-10 w-10 rounded-full object-cover shadow-lg ring-2 ring-white/20 md:block"
          style={{ left: country.x, top: country.y }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            y: [0, -5, 0],
          }}
          transition={{
            scale: { delay: i * 0.1 + 0.5, type: 'spring', stiffness: 200 },
            y: { delay: i * 0.1 + 0.5, duration: 3 + i * 0.2, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-20 flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Countdown */}
          <motion.div variants={itemVariants} className="mb-8 flex gap-6 md:gap-8">
            {([
              { label: 'Días', value: countdown.days },
              { label: 'Horas', value: countdown.hours },
              { label: 'Minutos', value: countdown.minutes },
              { label: 'Segundos', value: countdown.seconds },
            ] as const).map(item => (
              <div key={item.label} className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:p-6 w-20 sm:w-24 md:w-32 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                <span className="text-3xl sm:text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-md">
                  {item.value.toString().padStart(2, '0')}
                </span>
                <span className="mt-2 text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 drop-shadow-sm">
                  {item.label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="mb-4 bg-gradient-to-r from-emerald-400 via-yellow-400 to-emerald-400 bg-clip-text text-5xl font-black tracking-tighter text-transparent md:text-8xl"
          >
            MUNDIAL
            <br />
            2026
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mb-10 text-lg font-light tracking-wide text-white/70 md:text-2xl"
          >
            Predice. Compite. Gana.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link to="/login" className="relative group rounded-full p-[2px] bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-full blur opacity-40 group-hover:opacity-75 transition-opacity" />
              <div className="relative rounded-full bg-worldcup-900 px-8 py-3 text-sm font-semibold text-emerald-400 group-hover:text-white transition-colors group-hover:bg-transparent">
                Iniciar Sesión
              </div>
            </Link>
            <Link to="/login" state={{ tab: 'register' }} className="relative group rounded-full p-[2px] bg-gradient-to-r from-white/20 via-white/30 to-white/20 transition-all hover:scale-105 active:scale-95">
              <div className="absolute inset-0 bg-white/20 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative rounded-full bg-worldcup-900/50 backdrop-blur-md px-8 py-3 text-sm font-semibold text-white transition-colors group-hover:bg-white/10 border border-white/10 group-hover:border-white/30">
                Registrarse
              </div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="h-6 w-6 text-white/30" />
        </motion.div>
      </div>
    </section>
  )
}
