import { motion, AnimatePresence } from 'motion/react'
import { Bell, CheckCheck, X, Target, Calendar, Trophy, Users, Info } from 'lucide-react'
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useQueries'
import type { Notification } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/utils/animation'
import { useNavigate } from 'react-router-dom'

interface NotificationsPanelProps {
  open: boolean
  onClose: () => void
  unreadCount: number
  onCountChange: (count: number) => void
}

const typeIcons: Record<string, typeof Bell> = {
  prediction: Target,
  match: Calendar,
  rank: Trophy,
  room: Users,
  system: Info,
}

const typeColors: Record<string, string> = {
  prediction: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10',
  match: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10',
  rank: 'text-green-500 bg-green-50 dark:bg-green-500/10',
  room: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10',
  system: 'text-gray-500 bg-gray-50 dark:bg-gray-500/10',
}

export function NotificationsPanel({ open, onClose, unreadCount, onCountChange }: NotificationsPanelProps) {
  const navigate = useNavigate()
  const { data: notifications = [], isLoading: loading } = useNotifications({ enabled: open })
  const markAsReadMutation = useMarkAsRead()
  const markAllAsReadMutation = useMarkAllAsRead()

  async function handleMarkAllRead() {
    await markAllAsReadMutation.mutateAsync()
    onCountChange(0)
  }

  function getNotificationLink(n: Notification): string {
    if (n.metadata?.matchId) return `/matches/${n.metadata.matchId}`
    if (n.metadata?.roomId) return `/rooms/${n.metadata.roomId}`
    switch (n.type) {
      case 'prediction': return '/predictions'
      case 'match': return n.metadata?.matchId ? `/matches/${n.metadata.matchId}` : '/matches'
      case 'rank': return '/rankings'
      case 'room': return n.metadata?.roomId ? `/rooms/${n.metadata.roomId}` : '/rooms'
      default: return '/dashboard'
    }
  }

  async function handleClick(n: Notification) {
    if (!n.read) {
      await markAsReadMutation.mutateAsync(n.id)
      onCountChange(Math.max(0, unreadCount - 1))
    }
    onClose()
    const link = getNotificationLink(n)
    if (link) navigate(link)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, x: 320 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white dark:bg-zinc-800 border-l border-gray-200 dark:border-zinc-700 shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
                {unreadCount > 0 && <span className="px-2 py-0.5 text-xs font-medium bg-worldcup-500 text-white rounded-full">{unreadCount}</span>}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors" title="Mark all as read">
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto h-[calc(100%-65px)]">
              {loading ? (
                <div className="p-4 space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" className="h-20" />)}</div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                  <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet</p>
                </div>
              ) : (
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="p-2">
                  {notifications.map(n => {
                    const Icon = typeIcons[n.type] || Info
                    return (
                      <motion.button
                        key={n.id}
                        variants={staggerItem}
                        onClick={() => handleClick(n)}
                        className={cn('w-full text-left flex items-start gap-3 p-3 rounded-xl transition-colors', !n.read ? 'bg-worldcup-50 dark:bg-worldcup-500/10' : 'hover:bg-gray-50 dark:hover:bg-zinc-700/50')}
                      >
                        <div className={cn('p-2 rounded-lg flex-shrink-0', typeColors[n.type] || typeColors.system)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-sm', !n.read ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400')}>{n.title}: {n.message}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{new Date(n.createdAt).toLocaleDateString()}</p>
                        </div>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-worldcup-500 flex-shrink-0 mt-2" />}
                      </motion.button>
                    )
                  })}
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
