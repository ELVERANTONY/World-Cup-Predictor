import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

import type { User } from '@/types'

type AdminUser = User

export function useAdminGuard() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const adminUser = user as AdminUser | null
  const isAdmin = isAuthenticated && adminUser?.role === 'ADMIN'

  useEffect(() => {
    if (isAuthenticated && adminUser?.role !== 'ADMIN') {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, adminUser, navigate])

  return { isAdmin, user: adminUser }
}
