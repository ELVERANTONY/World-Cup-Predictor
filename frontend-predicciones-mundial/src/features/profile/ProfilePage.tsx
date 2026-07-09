import { useState } from 'react'
import { motion } from 'motion/react'
import { Edit3, Trophy, Target, TrendingUp, Medal, Flame, Award, RefreshCw } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUserStats, useTeams } from '@/hooks/useQueries'
import { EditProfileModal } from './EditProfileModal'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/utils/animation'

export function ProfilePage() {
  const { user } = useAuth()
  const { data: stats, isLoading: loading, error } = useUserStats(user?.id)
  const { data: teams = [] } = useTeams()
  const [showEdit, setShowEdit] = useState(false)

  const favoriteTeam = teams.find(t => t.id === user?.favoriteTeamId)
  const level = stats?.level || 1
  const xpInLevel = stats?.xp || 0
  const xpMax = level * 500
  const xpProgress = (xpInLevel / xpMax) * 100

  async function handleSave(_data: { name: string; avatarUrl?: string; favoriteTeamId?: string }) {
    await new Promise(r => setTimeout(r, 500))
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-500">Error al cargar el perfil</p>
        <Button variant="outline" onClick={() => window.location.reload()} iconLeft={<RefreshCw className="w-4 h-4" />}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 p-6 sm:p-8">
        {loading ? (
          <div className="flex items-center gap-6"><Skeleton variant="circular" className="w-20 h-20" /><div className="space-y-2 flex-1"><Skeleton variant="rectangular" className="h-6 w-48" /><Skeleton variant="rectangular" className="h-4 w-32" /></div></div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-worldcup-500 flex items-center justify-center text-3xl font-bold text-white flex-shrink-0 overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name || 'User'}</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                  {favoriteTeam && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2 justify-center sm:justify-start">Equipo Favorito: {favoriteTeam.flagUrl ? <img src={favoriteTeam.flagUrl.replace('w80/w80/', 'w80/')} alt="flag" className="w-5 h-3 object-cover rounded-sm" /> : ''} {favoriteTeam.name}</p>}
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowEdit(true)} iconLeft={<Edit3 className="w-4 h-4" />}>Editar</Button>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-worldcup-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nivel {level}</span>
                  <span className="text-xs text-gray-400">{xpInLevel}/{xpMax} XP</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-zinc-700 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full rounded-full bg-gradient-to-r from-worldcup-500 to-secondary-500" />
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {stats && (
        <motion.div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" variants={staggerContainer} initial="hidden" animate="visible">
          {[
            { icon: Target, value: stats.predictionsCount, label: 'Predicciones', color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10' },
            { icon: TrendingUp, value: `${stats.accuracyRate}%`, label: 'Precisión', color: 'text-green-500 bg-green-50 dark:bg-green-500/10' },
            { icon: Trophy, value: stats.totalPoints.toLocaleString(), label: 'Puntos', color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' },
            { icon: Medal, value: `#${stats.rank}`, label: 'Rango', color: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10' },
            { icon: Flame, value: `${stats.currentStreak}`, label: 'Racha', color: 'text-red-500 bg-red-50 dark:bg-red-500/10' },
          ].map(stat => (
            <motion.div key={stat.label} variants={staggerItem} className="rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 p-4 text-center">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2', stat.color)}><stat.icon className="w-5 h-5" /></div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      <EditProfileModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        initialData={{ name: user?.name || '', avatarUrl: user?.avatarUrl, favoriteTeamId: user?.favoriteTeamId }}
        onSave={handleSave}
      />
    </div>
  )
}
