import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard, Calendar, Trophy, Users, Target, ChevronLeft, ChevronRight, X, LogOut, User,
} from 'lucide-react'
import worldCupImage from '@/assets/World Cup.png'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useMediaQuery } from '@/hooks/useMediaQuery'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { to: '/matches', icon: Calendar, label: 'Partidos' },
  { to: '/groups', icon: Users, label: 'Grupos' },
  { to: '/knockouts', icon: Target, label: 'Eliminatorias' },
  { to: '/rooms', icon: Users, label: 'Salas' },
  { to: '/predictions', icon: Target, label: 'Predicciones' },
  { to: '/rankings', icon: Trophy, label: 'Clasificación' },
  { to: '/profile', icon: User, label: 'Perfil' },
]

const adminItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Panel' },
  { to: '/admin/matches', icon: Calendar, label: 'Partidos' },
  { to: '/admin/teams', icon: Users, label: 'Equipos' },
  { to: '/admin/users', icon: User, label: 'Usuarios' },
]

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const sidebarContent = (
    <div className={cn('flex flex-col h-full bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border-r border-gray-200/50 dark:border-zinc-700/50 transition-all duration-300 shadow-xl shadow-worldcup-900/5', collapsed ? 'w-20' : 'w-72')}>
      <div className={cn('flex items-center h-20 border-b border-gray-200/50 dark:border-zinc-800/50 px-6', collapsed ? 'justify-center px-0' : 'justify-between')}>
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="relative">
              <div className="absolute inset-0 bg-worldcup-500 blur-md opacity-30 rounded-full animate-pulse" />
              <img src={worldCupImage} alt="WC 2026" className="w-9 h-9 object-contain flex-shrink-0 relative z-10 drop-shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
            </div>
            <span className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 tracking-tight truncate">WC <span className="text-worldcup-500">2026</span></span>
          </Link>
        )}
        {isDesktop ? (
          <button onClick={onToggle} className="p-2 rounded-xl text-gray-400 hover:text-worldcup-600 dark:hover:text-worldcup-400 hover:bg-worldcup-50 dark:hover:bg-worldcup-500/10 transition-all active:scale-95">
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        ) : (
          <button onClick={onMobileClose} className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all active:scale-95">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to)
          const Icon = item.icon
          return (
            <Link key={item.to} to={item.to} onClick={!isDesktop ? onMobileClose : undefined}
              className={cn('flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative group overflow-hidden', collapsed && 'justify-center px-2',
                isActive ? 'text-worldcup-700 dark:text-worldcup-300 shadow-[0_2px_10px_rgba(14,165,233,0.15)] bg-gradient-to-r from-worldcup-100 to-white dark:from-worldcup-900/40 dark:to-zinc-800/40' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-zinc-800/80 hover:text-gray-900 dark:hover:text-gray-100'
              )}>
              {isActive && <div className="absolute inset-0 bg-worldcup-500/5 dark:bg-worldcup-400/5" />}
              <Icon className={cn('w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110', isActive && 'text-worldcup-600 dark:text-worldcup-400')} />
              <AnimatePresence>
                {!collapsed && <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="truncate relative z-10">{item.label}</motion.span>}
              </AnimatePresence>
              {isActive && <motion.div layoutId="sidebar-active" className="absolute left-0 top-0 bottom-0 w-1 bg-worldcup-500 rounded-r-full shadow-[0_0_10px_rgba(14,165,233,0.8)]" />}
              {collapsed && (
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900/90 backdrop-blur-sm dark:bg-gray-100/90 text-white dark:text-gray-900 text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl">
                  {item.label}
                </div>
              )}
            </Link>
          )
        })}

        {user?.role === 'ADMIN' && (
          <>
            {!collapsed && <div className="mt-6 mb-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</div>}
            {collapsed && <div className="mt-6 mb-2 border-t border-gray-200 dark:border-zinc-800" />}
            {adminItems.map((item) => {
              const isActive = location.pathname.startsWith(item.to)
              const Icon = item.icon
              return (
                <Link key={item.to} to={item.to} onClick={!isDesktop ? onMobileClose : undefined}
                  className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group', collapsed && 'justify-center px-2',
                    isActive ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-gray-200'
                  )}>
                  <Icon className={cn('w-5 h-5 flex-shrink-0')} />
                  <AnimatePresence>
                    {!collapsed && <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="truncate">{item.label}</motion.span>}
                  </AnimatePresence>
                  {isActive && <motion.div layoutId="sidebar-active-admin" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-red-500 rounded-r-full" />}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      <div className={cn('p-4 m-3 rounded-2xl bg-gray-50/80 dark:bg-zinc-800/80 border border-gray-200/50 dark:border-zinc-700/50 backdrop-blur-sm', collapsed ? 'flex justify-center p-2' : '')}>
        {collapsed ? (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-worldcup-500 to-worldcup-700 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-worldcup-500/20">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-worldcup-500 to-worldcup-700 p-0.5 flex items-center justify-center text-white text-sm font-medium flex-shrink-0 shadow-lg shadow-worldcup-500/20">
              <div className="w-full h-full rounded-[10px] overflow-hidden bg-zinc-900">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : <span className="flex items-center justify-center w-full h-full text-lg font-bold">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{user?.email || ''}</p>
            </div>
            <button onClick={logout} className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-zinc-900 shadow-sm transition-all active:scale-95 border border-transparent hover:border-red-100 dark:hover:border-red-900/30">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {isDesktop ? (
        <aside className="hidden lg:block flex-shrink-0">{sidebarContent}</aside>
      ) : (
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onMobileClose} />
              <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 250 }} className="fixed inset-y-0 left-0 z-50 lg:hidden shadow-2xl">
                {sidebarContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      )}
    </>
  )
}
