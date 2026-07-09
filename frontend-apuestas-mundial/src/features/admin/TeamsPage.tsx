import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { Search, Plus, Pencil, Trash2, Flag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { useTeams, useCreateTeam, useUpdateTeam, useDeleteTeam } from '@/hooks/useQueries'
import type { Team } from '@/types'
import { staggerContainer, staggerItem } from '@/utils/animation'

interface TeamForm {
  name: string
  shortName: string
  flagUrl: string
  group: string
  rank: number
}

const emptyForm: TeamForm = { name: '', shortName: '', flagUrl: '', group: '', rank: 0 }

const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

export function TeamsPage() {
  const { data: teams = [], isLoading: loading, error } = useTeams()
  const createTeamMutation = useCreateTeam()
  const updateTeamMutation = useUpdateTeam()
  const deleteTeamMutation = useDeleteTeam()
  const [search, setSearch] = useState('')
  const [groupFilter, setGroupFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null)
  const [form, setForm] = useState<TeamForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      const matchesSearch = team.name.toLowerCase().includes(search.toLowerCase()) ||
        team.shortName.toLowerCase().includes(search.toLowerCase())
      const matchesGroup = !groupFilter || team.group === groupFilter
      return matchesSearch && matchesGroup
    })
  }, [teams, search, groupFilter])

  function openAddModal() {
    setEditingTeam(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEditModal(team: Team) {
    setEditingTeam(team)
    setForm({
      name: team.name,
      shortName: team.shortName,
      flagUrl: team.flagUrl || '',
      group: team.group || '',
      rank: team.rank || 0,
    })
    setModalOpen(true)
  }

  function openDeleteModal(team: Team) {
    setDeletingTeam(team)
    setDeleteModalOpen(true)
  }

  async function handleSave() {
    try {
      setSaving(true)
      if (editingTeam) {
        await updateTeamMutation.mutateAsync({ id: editingTeam.id, data: form })
        addToast('success', 'Team updated successfully')
      } else {
        await createTeamMutation.mutateAsync(form as unknown as Team)
        addToast('success', 'Team created successfully')
      }
      setModalOpen(false)
    } catch {
      addToast('error', `Failed to ${editingTeam ? 'update' : 'create'} team`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingTeam) return
    try {
      setSaving(true)
      await deleteTeamMutation.mutateAsync(deletingTeam.id)
      addToast('success', 'Team deleted successfully')
      setDeleteModalOpen(false)
      setDeletingTeam(null)
    } catch {
      addToast('error', 'Failed to delete team')
    } finally {
      setSaving(false)
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-red-500 dark:text-red-400 font-medium">Failed to load teams</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <motion.div className="max-w-7xl mx-auto space-y-6" initial="hidden" animate="visible" variants={staggerContainer}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Teams</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage World Cup 2026 teams</p>
        </div>
        <Button onClick={openAddModal} iconLeft={<Plus className="w-4 h-4" />}>
          Add Team
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            iconLeft={<Search className="w-4 h-4" />}
          />
        </div>
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="w-full sm:w-40 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)]"
        >
          <option value="">All Groups</option>
          {groups.map(g => <option key={g} value={g}>Group {g}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}><CardContent className="p-5"><Skeleton variant="rectangular" height={120} /></CardContent></Card>
          ))}
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Flag className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No teams found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            {search || groupFilter ? 'Try adjusting your filters' : 'Add your first team'}
          </p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          variants={staggerContainer}
        >
          {filteredTeams.map((team) => (
            <motion.div key={team.id} variants={staggerItem}>
              <Card className="group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {team.flagUrl ? (
                        <img src={team.flagUrl} alt={team.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-700 flex items-center justify-center text-lg">
                          {team.shortName?.charAt(0) || '?'}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{team.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{team.shortName}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(team)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(team)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {team.group && <Badge variant="info">Group {team.group}</Badge>}
                    {team.rank != null && <Badge variant="default">Rank #{team.rank}</Badge>}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingTeam ? 'Edit Team' : 'Add Team'} size="md">
        <div className="space-y-4">
          <Input label="Team Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Short Name" value={form.shortName} onChange={(e) => setForm({ ...form, shortName: e.target.value })} />
          <Input label="Flag URL" value={form.flagUrl} onChange={(e) => setForm({ ...form, flagUrl: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Group</label>
              <select
                value={form.group}
                onChange={(e) => setForm({ ...form, group: e.target.value })}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)]"
              >
                <option value="">No group</option>
                {groups.map(g => <option key={g} value={g}>Group {g}</option>)}
              </select>
            </div>
            <Input label="Rank" type="number" value={form.rank.toString()} onChange={(e) => setForm({ ...form, rank: parseInt(e.target.value) || 0 })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editingTeam ? 'Save Changes' : 'Create Team'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Team" size="sm">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{deletingTeam?.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={saving}>Delete</Button>
        </div>
      </Modal>
    </motion.div>
  )
}
