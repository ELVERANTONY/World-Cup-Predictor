import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  Target,
  Activity,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
} from 'lucide-react'
import worldCupImage from '@/assets/World Cup.png'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useAdminGuard } from '@/hooks/useAdminGuard'
import { Navigate } from 'react-router-dom'

const adminNavItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/teams', icon: Users, label: 'Teams' },
  { to: '/admin/stadiums', icon: Building2, label: 'Stadiums' },
  { to: '/admin/matches', icon: Calendar, label: 'Matches' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/predictions', icon: Target, label: 'Predictions' },
  { to: '/admin/activity', icon: Activity, label: 'Activity Logs' },
]

export function AdminLayout() {
  const { isAdmin } = useAdminGuard()
  const { user, logout } = useAuth()
  const location = useLocation()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  const sidebarContent = (
    <div className={cn(
      'flex flex-col h-full bg-white dark:bg-surface-dark border-r border-gray-200 dark:border-zinc-800 transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className={cn(
        'flex items-center h-16 border-b border-gray-200 dark:border-zinc-800 px-4',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <img src={worldCupImage} alt="WC 2026 Admin" className="w-8 h-8 object-contain flex-shrink-0 drop-shadow-md" />
            <span className="font-bold text-lg text-gray-900 dark:text-white truncate">
              WC <span className="text-worldcup-500">2026</span> Admin
            </span>
          </Link>
        )}
        {isDesktop && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
        {!isDesktop && (
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {adminNavItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to)
          const Icon = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={!isDesktop ? () => setMobileOpen(false) : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group',
                collapsed && 'justify-center px-2',
                isActive
                  ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-gray-200'
              )}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0')} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="admin-sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-red-500 rounded-r-full"
                />
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      <div className={cn(
        'border-t border-gray-200 dark:border-zinc-800 p-3',
        collapsed ? 'flex justify-center' : ''
      )}>
        <Link
          to="/dashboard"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors',
            collapsed && 'justify-center px-2'
          )}
        >
          <LayoutDashboard className="w-5 h-5" />
          {!collapsed && <span>Panel de Usuario</span>}
        </Link>
      </div>

      <div className={cn(
        'border-t border-gray-200 dark:border-zinc-800 p-3',
        collapsed ? 'flex justify-center' : ''
      )}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-medium">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0 overflow-hidden">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-surface-dark overflow-hidden">
      {isDesktop ? (
        <aside className="hidden lg:block flex-shrink-0">
          {sidebarContent}
        </aside>
      ) : (
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                className="fixed inset-y-0 left-0 z-50 lg:hidden shadow-2xl"
              >
                {sidebarContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      )}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="sticky top-0 z-40">
          <div className="border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Panel Admin</span>
              </div>
              <div className="flex-1" />
              <Link
                to="/dashboard"
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                Volver al Inicio
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
