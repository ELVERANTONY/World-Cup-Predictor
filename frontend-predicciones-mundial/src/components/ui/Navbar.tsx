import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Menu, Bell, Moon, Sun, Trophy, LogOut, User, Settings, ChevronDown, BarChart3,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getUnreadCount } from '@/services/notification.service'
import { NotificationsPanel } from '@/features/notifications/NotificationsPanel'

interface NavbarProps {
  onMenuClick: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') return document.documentElement.classList.contains('dark')
    return false
  })
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', isDark)
  }, [isDark])

  useEffect(() => {
    getUnreadCount().then(r => setUnreadCount(r.count)).catch(() => {})
  }, [])

  return (
    <header className="sticky top-0 z-40">
      <div className="glass-strong border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800">
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/dashboard" className="flex items-center gap-2.5">
              <Trophy className="w-6 h-6 text-worldcup-500" />
              <span className="hidden sm:block font-bold text-lg text-gray-900 dark:text-white">World Cup <span className="text-worldcup-500">2026</span></span>
            </Link>


          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-surface-dark">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <NotificationsPanel
                open={showNotifications}
                onClose={() => setShowNotifications(false)}
                unreadCount={unreadCount}
                onCountChange={setUnreadCount}
              />
            </div>

            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                <div className="w-8 h-8 rounded-full bg-worldcup-500 flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">{user?.name || 'User'}</span>
                <ChevronDown className="hidden sm:block w-4 h-4 text-gray-400" />
              </button>
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-xl overflow-hidden"
                  >
                    <div className="p-3 border-b border-gray-100 dark:border-zinc-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <div className="p-1">
                      <button onClick={() => { navigate('/profile'); setShowUserMenu(false) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors">
                        <User className="w-4 h-4" /> Perfil
                      </button>
                      <button onClick={() => { navigate('/statistics'); setShowUserMenu(false) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors">
                        <BarChart3 className="w-4 h-4" /> Estadísticas
                      </button>
                      <button onClick={() => { navigate('/settings'); setShowUserMenu(false) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors">
                        <Settings className="w-4 h-4" /> Configuración
                      </button>
                    </div>
                    <div className="border-t border-gray-100 dark:border-zinc-700 p-1">
                      <button onClick={() => { logout(); setShowUserMenu(false) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <LogOut className="w-4 h-4" /> Cerrar sesión
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
