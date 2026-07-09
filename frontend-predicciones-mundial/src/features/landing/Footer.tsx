import { motion } from 'motion/react'

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-black">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2"
          >
            <span className="text-2xl drop-shadow-sm">⚽</span>
            <span className="text-xl font-bold text-white">
              World Cup{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">Predictor</span>
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm text-white/40 font-medium"
          >
            &copy; {new Date().getFullYear()} World Cup Predictor. Todos los
            derechos reservados.
          </motion.div>
        </div>
      </div>
    </footer>
  )
}
