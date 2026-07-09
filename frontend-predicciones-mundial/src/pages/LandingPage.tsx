import { motion } from 'motion/react'
import { Hero } from '@/features/landing/Hero'
import { TournamentBracket } from '@/features/landing/TournamentBracket'
import { NextMatches } from '@/features/landing/NextMatches'
import { RankingPreview } from '@/features/landing/RankingPreview'
import { Footer } from '@/features/landing/Footer'

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
}

export function LandingPage() {
  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
    >
      <Hero />
      <TournamentBracket />
      <NextMatches />
      <RankingPreview />
      <Footer />
    </motion.div>
  )
}
