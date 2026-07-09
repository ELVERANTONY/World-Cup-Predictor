import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { Search, Plus, Pencil, Calendar as CalendarIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { useMatches, useTeams, useStadiums, useCreateMatch, useUpdateMatch, useUpdateMatchResult } from '@/hooks/useQueries'
import type { Match as MatchType } from '@/types'
import { staggerContainer, staggerItem } from '@/utils/animation'

const stages = ['Group Stage', 'Round of 16', 'Quarter-finals', 'Semi-finals', 'Third Place', 'Final']

const statusConfig: Record<string, { label: string; variant: 'info' | 'success' | 'default' | 'warning' | 'danger' }> = {
  SCHEDULED: { label: 'Scheduled', variant: 'info' },
  LIVE: { label: 'Live', variant: 'success' },
  FINISHED: { label: 'Finished', variant: 'default' },
  POSTPONED: { label: 'Postponed', variant: 'warning' },
  CANCELLED: { label: 'Cancelled', variant: 'danger' },
}

export function MatchesPage() {
  const { data: matches = [], isLoading: loading, error } = useMatches()
  const { data: teams = [] } = useTeams()
  const { data: stadiums = [] } = useStadiums()
  const createMatchMutation = useCreateMatch()
  const updateMatchMutation = useUpdateMatch()
  const updateMatchResultMutation = useUpdateMatchResult()
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [resultModalOpen, setResultModalOpen] = useState(false)
  const [editingMatch, setEditingMatch] = useState<MatchType | null>(null)
  const [scoringMatch, setScoringMatch] = useState<MatchType | null>(null)
  const [form, setForm] = useState({ homeTeamId: '', awayTeamId: '', stadiumId: '', date: '', stage: '' })
  const [scoreForm, setScoreForm] = useState({ homeScore: 0, awayScore: 0, extraTime: false, penalties: false })
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  const filteredMatches = useMemo(() => {
    const q = search.toLowerCase()
    return matches.filter(m => {
      const matchesSearch = m.homeTeam?.name.toLowerCase().includes(q) || m.awayTeam?.name.toLowerCase().includes(q)
      const matchesStage = !stageFilter || m.stage === stageFilter
      const matchesStatus = !statusFilter || m.status === statusFilter
      return matchesSearch && matchesStage && matchesStatus
    })
  }, [matches, search, stageFilter, statusFilter])

  function openAddModal() {
    setEditingMatch(null)
    setForm({ homeTeamId: '', awayTeamId: '', stadiumId: '', date: '', stage: '' })
    setModalOpen(true)
  }

  function openEditModal(match: MatchType) {
    setEditingMatch(match)
    setForm({
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      stadiumId: match.stadiumId || '',
      date: match.date,
      stage: match.stage,
    })
    setModalOpen(true)
  }

  function openResultModal(match: MatchType) {
    setScoringMatch(match)
    setScoreForm({
      homeScore: match.homeScore ?? 0,
      awayScore: match.awayScore ?? 0,
      extraTime: false,
      penalties: false,
    })
    setResultModalOpen(true)
  }

  async function handleSave() {
    if (form.homeTeamId === form.awayTeamId) {
      addToast('error', 'Home and away teams must be different')
      return
    }
    try {
      setSaving(true)
      if (editingMatch) {
        await updateMatchMutation.mutateAsync({ id: editingMatch.id, data: form })
        addToast('success', 'Match updated successfully')
      } else {
        await createMatchMutation.mutateAsync(form as unknown as MatchType)
        addToast('success', 'Match created successfully')
      }
      setModalOpen(false)
    } catch {
      addToast('error', `Failed to ${editingMatch ? 'update' : 'create'} match`)
    } finally {
      setSaving(false)
    }
  }

  async function handleSetResult() {
    if (!scoringMatch) return
    try {
      setSaving(true)
      await updateMatchResultMutation.mutateAsync({ id: scoringMatch.id, homeScore: scoreForm.homeScore, awayScore: scoreForm.awayScore })
      addToast('success', 'Match result set successfully')
      setResultModalOpen(false)
      setScoringMatch(null)
    } catch {
      addToast('error', 'Failed to set match result')
    } finally {
      setSaving(false)
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-red-500 dark:text-red-400 font-medium">Failed to load matches</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <motion.div className="max-w-7xl mx-auto space-y-6" initial="hidden" animate="visible" variants={staggerContainer}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Matches</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage World Cup 2026 matches</p>
        </div>
        <Button onClick={openAddModal} iconLeft={<Plus className="w-4 h-4" />}>Add Match</Button>
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
        <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}
          className="w-full sm:w-44 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)]">
          <option value="">All Stages</option>
          {stages.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-40 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)]">
          <option value="">All Status</option>
          {Object.entries(statusConfig).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-5"><Skeleton variant="rectangular" height={64} /></CardContent></Card>
          ))}
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CalendarIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No matches found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            {search || stageFilter || statusFilter ? 'Try adjusting your filters' : 'Add your first match'}
          </p>
        </div>
      ) : (
        <motion.div className="space-y-3" variants={staggerContainer}>
          {filteredMatches.map(match => {
            const statusCfg = statusConfig[match.status] || statusConfig.SCHEDULED
            return (
              <motion.div key={match.id} variants={staggerItem}>
                <Card className="group">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-semibold text-gray-900 dark:text-white truncate">{match.homeTeam?.shortName}</span>
                          <span className="text-xs text-gray-400">vs</span>
                          <span className="font-semibold text-gray-900 dark:text-white truncate">{match.awayTeam?.shortName}</span>
                        </div>
                        {match.homeScore != null && (
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            {match.homeScore} - {match.awayScore}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={statusCfg.variant} live={match.status === 'LIVE'}>{statusCfg.label}</Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                          {new Date(match.date).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 hidden md:block">{match.stage}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(match)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => openResultModal(match)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors text-xs font-medium">
                            Score
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingMatch ? 'Edit Match' : 'Add Match'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Home Team</label>
              <select value={form.homeTeamId} onChange={(e) => setForm({ ...form, homeTeamId: e.target.value })}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)]">
                <option value="">Select team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Away Team</label>
              <select value={form.awayTeamId} onChange={(e) => setForm({ ...form, awayTeamId: e.target.value })}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)]">
                <option value="">Select team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Stadium</label>
            <select value={form.stadiumId} onChange={(e) => setForm({ ...form, stadiumId: e.target.value })}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)]">
              <option value="">Select stadium</option>
              {stadiums.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Stage</label>
              <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)]">
                <option value="">Select stage</option>
                {stages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>{editingMatch ? 'Guardar Cambios' : 'Crear Partido'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={resultModalOpen} onClose={() => setResultModalOpen(false)} title="Establecer Resultado" size="md">
        <div className="space-y-4">
          {scoringMatch && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {scoringMatch.homeTeam?.name} vs {scoringMatch.awayTeam?.name}
            </p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Home Score" type="number" value={scoreForm.homeScore.toString()}
              onChange={(e) => setScoreForm({ ...scoreForm, homeScore: parseInt(e.target.value) || 0 })} />
            <Input label="Away Score" type="number" value={scoreForm.awayScore.toString()}
              onChange={(e) => setScoreForm({ ...scoreForm, awayScore: parseInt(e.target.value) || 0 })} />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={scoreForm.extraTime} onChange={(e) => setScoreForm({ ...scoreForm, extraTime: e.target.checked })}
                className="rounded border-gray-300 dark:border-zinc-600" />
              Extra Tiempo
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={scoreForm.penalties} onChange={(e) => setScoreForm({ ...scoreForm, penalties: e.target.checked })}
                className="rounded border-gray-300 dark:border-zinc-600" />
              Penales
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setResultModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSetResult} loading={saving}>Establecer Resultado</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}
