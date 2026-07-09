import { useState } from 'react'
import { motion } from 'motion/react'
import { Lock, Globe, Users } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createRoom } from '@/services/room.service'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

interface CreateRoomModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function CreateRoomModal({ open, onClose, onCreated }: CreateRoomModalProps) {
  const { addToast } = useToast()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [password, setPassword] = useState('')
  const [color, setColor] = useState('#1457D9')
  const [maxMembers, setMaxMembers] = useState(20)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'El nombre es requerido'
    if (name.length > 50) errs.name = 'Nombre muy largo (máx 50)'
    if (!isPublic && !password) errs.password = 'Contraseña requerida'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await createRoom({ name: name.trim(), description: description.trim(), isPublic, password: password || undefined, color, maxMembers })
      addToast('success', '¡Sala creada!')
      onCreated()
      onClose()
      setName('')
      setDescription('')
      setIsPublic(true)
      setPassword('')
      setColor('#1457D9')
      setMaxMembers(20)
    } catch {
      addToast('error', 'Error al crear la sala')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Crear Sala" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nombre de la Sala" value={name} onChange={e => setName(e.target.value)} error={errors.name} placeholder="ej. Grupo de la Muerte" />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Descripción (opcional)</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Describe tu sala..." className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-worldcup-500 resize-none" />
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => setIsPublic(true)} className={cn('flex-1 flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all', isPublic ? 'border-worldcup-500 bg-worldcup-50 dark:bg-worldcup-500/10 text-worldcup-600 dark:text-worldcup-400' : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400')}>
            <Globe className="w-4 h-4" /> Pública
          </button>
          <button type="button" onClick={() => setIsPublic(false)} className={cn('flex-1 flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all', !isPublic ? 'border-worldcup-500 bg-worldcup-50 dark:bg-worldcup-500/10 text-worldcup-600 dark:text-worldcup-400' : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400')}>
            <Lock className="w-4 h-4" /> Privada
          </button>
        </div>

        {!isPublic && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <Input label="Contraseña de la Sala" type="password" value={password} onChange={e => setPassword(e.target.value)} error={errors.password} placeholder="Ingresar contraseña" />
          </motion.div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Máximo de Miembros</label>
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-gray-400" />
            <input type="range" min={2} max={100} value={maxMembers} onChange={e => setMaxMembers(parseInt(e.target.value))} className="flex-1 h-2 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-zinc-700 accent-worldcup-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8 text-right">{maxMembers}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Color del Tema</label>
          <div className="flex gap-2">
            {['#1457D9', '#059669', '#DC2626', '#D97706', '#7C3AED', '#DB2777'].map(c => (
              <button key={c} type="button" onClick={() => setColor(c)} className={cn('w-8 h-8 rounded-full border-2 transition-transform', color === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent hover:scale-105')} style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>

        <Button type="submit" loading={submitting} className="w-full">Crear Sala</Button>
      </form>
    </Modal>
  )
}
