import { useState, useEffect, useMemo } from 'react'
import { motion } from 'motion/react'
import { Search, ChevronLeft, ChevronRight, Shield, User as UserIcon, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { useUsers, useUpdateUserRole, useToggleUserActive } from '@/hooks/useQueries'
import type { User } from '@/types'
import { staggerContainer, staggerItem } from '@/utils/animation'

const ITEMS_PER_PAGE = 10

export function UsersPage() {
  const { data: usersData, isLoading: loading, error } = useUsers()
  const updateUserRoleMutation = useUpdateUserRole()
  const toggleUserActiveMutation = useToggleUserActive()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const { addToast } = useToast()

  const users = usersData?.users || []

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase()
    return users.filter(u =>
      (u.name?.toLowerCase() || '').includes(q) || u.email.toLowerCase().includes(q)
    )
  }, [users, search])

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  const paginatedUsers = filteredUsers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  useEffect(() => {
    setPage(1)
  }, [search])

  async function toggleRole(user: User) {
    try {
      const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
      await updateUserRoleMutation.mutateAsync({ id: user.id, role: newRole })
      addToast('success', `${user.name} is now ${newRole}`)
    } catch {
      addToast('error', 'Failed to update role')
    }
  }

  async function toggleActive(user: User) {
    try {
      await toggleUserActiveMutation.mutateAsync(user.id)
      addToast('success', `${user.name} ${user.emailVerified ? 'deactivated' : 'activated'}`)
    } catch {
      addToast('error', 'Failed to toggle user status')
    }
  }

  function viewDetails(user: User) {
    setSelectedUser(user)
    setDetailModalOpen(true)
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-red-500 dark:text-red-400 font-medium">Failed to load users</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <motion.div className="max-w-7xl mx-auto space-y-6" initial="hidden" animate="visible" variants={staggerContainer}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage platform users</p>
      </div>

      <div className="flex-1 max-w-md">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          iconLeft={<Search className="w-4 h-4" />}
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton variant="rectangular" height={48} /></CardContent></Card>
          ))}
        </div>
      ) : paginatedUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <UserIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No users found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            {search ? 'Try adjusting your search' : 'No users registered yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <motion.div className="space-y-2" variants={staggerContainer}>
            {paginatedUsers.map((user) => (
              <motion.div key={user.id} variants={staggerItem}>
                <Card className="group">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={user.name || 'U'} size="md" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white truncate">{user.name || 'Unknown'}</span>
                            {user.role === 'ADMIN' && <Shield className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={user.role === 'ADMIN' ? 'danger' : 'default'}>
                          {user.role}
                        </Badge>
                        <Badge variant={user.emailVerified ? 'success' : 'default'} dot>
                          {user.emailVerified ? 'Active' : 'Inactive'}
                        </Badge>
                        <div className="flex gap-1">
                          <button onClick={() => toggleRole(user)}
                            className="px-2 py-1 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                            {user.role === 'ADMIN' ? 'Demote' : 'Promote'}
                          </button>
                          <button onClick={() => toggleActive(user)}
                            className="px-2 py-1 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                            {user.emailVerified ? 'Deactivate' : 'Activate'}
                          </button>
                          <button onClick={() => viewDetails(user)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                  iconLeft={<ChevronLeft className="w-4 h-4" />}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                  iconRight={<ChevronRight className="w-4 h-4" />}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <Modal open={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="User Details" size="md">
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar name={selectedUser.name || 'U'} size="xl" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedUser.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant={selectedUser.role === 'ADMIN' ? 'danger' : 'default'}>{selectedUser.role}</Badge>
                  <Badge variant={selectedUser.emailVerified ? 'success' : 'default'} dot>
                    {selectedUser.emailVerified ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedUser.predictionsCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Predictions</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedUser._count?.rooms ?? 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Rooms</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedUser.accuracyRate}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Accuracy</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Joined {new Date(selectedUser.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}
