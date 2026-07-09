import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTeams } from '@/hooks/useQueries'
import { useToast } from '@/components/ui/toast'
import { Save } from 'lucide-react'

interface EditProfileModalProps {
  open: boolean
  onClose: () => void
  initialData: { name: string; avatarUrl?: string | null; favoriteTeamId?: string | null }
  onSave: (data: { name: string; avatarUrl?: string; favoriteTeamId?: string }) => Promise<void>
}

export function EditProfileModal({ open, onClose, initialData, onSave }: EditProfileModalProps) {
  const { addToast } = useToast()
  const [name, setName] = useState(initialData.name)
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl || '')
  const [favoriteTeamId, setFavoriteTeamId] = useState(initialData.favoriteTeamId || '')
  const { data: teams = [] } = useTeams()
  const [saving, setSaving] = useState(false)



  useEffect(() => {
    setName(initialData.name)
    setAvatarUrl(initialData.avatarUrl || '')
    setFavoriteTeamId(initialData.favoriteTeamId || '')
  }, [initialData])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { addToast('error', 'El nombre es requerido'); return }
    setSaving(true)
    try {
      await onSave({ name: name.trim(), avatarUrl: avatarUrl || undefined, favoriteTeamId: favoriteTeamId || undefined })
      addToast('success', '¡Perfil actualizado!')
      onClose()
    } catch {
      addToast('error', 'Error al actualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Editar Perfil" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nombre Completo" value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" />
        <Input label="URL del Avatar" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://ejemplo.com/avatar.jpg" />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Equipo Favorito</label>
          <select value={favoriteTeamId} onChange={e => setFavoriteTeamId(e.target.value)} className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-worldcup-500">
            <option value="">Sin equipo favorito</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <Button type="submit" loading={saving} className="w-full" iconLeft={<Save className="w-4 h-4" />}>Guardar Cambios</Button>
      </form>
    </Modal>
  )
}
