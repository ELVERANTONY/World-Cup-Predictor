import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { joinRoom } from '@/services/room.service'
import { useToast } from '@/components/ui/toast'
import { LogIn } from 'lucide-react'

interface JoinRoomModalProps {
  open: boolean
  onClose: () => void
  onJoined: () => void
}

export function JoinRoomModal({ open, onClose, onJoined }: JoinRoomModalProps) {
  const { addToast } = useToast()
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!code.trim()) errs.code = 'El código de la sala es requerido'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSubmitting(true)
    try {
      await joinRoom(code.trim(), password || undefined)
      addToast('success', '¡Unido a la sala!')
      onJoined()
      onClose()
      setCode('')
      setPassword('')
    } catch {
      addToast('error', 'Error al unirse a la sala')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Unirse a la Sala" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Código de la Sala" value={code} onChange={e => setCode(e.target.value.toUpperCase())} error={errors.code} placeholder="ej. GOD2026" maxLength={10} />
        <Input label="Contraseña (si es privada)" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Ingresar contraseña" />
        <Button type="submit" loading={submitting} className="w-full" iconLeft={<LogIn className="w-4 h-4" />}>Unirse a la Sala</Button>
      </form>
    </Modal>
  )
}
