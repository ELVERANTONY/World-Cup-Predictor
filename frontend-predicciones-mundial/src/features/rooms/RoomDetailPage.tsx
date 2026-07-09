import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, Users, Copy, Check, LogOut, Shield } from 'lucide-react'
import { useRoom, useRoomRanking, useLeaveRoom, useKickMember } from '@/hooks/useQueries'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

export function RoomDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToast } = useToast()
  const [copied, setCopied] = useState(false)

  const { data: room, isLoading: loading, error: roomError } = useRoom(id || '')
  const { data: members = [] } = useRoomRanking(id || '')
  const leaveRoomMutation = useLeaveRoom()
  const kickMemberMutation = useKickMember()

  const isAdmin = room?.createdById === user?.id
  const sortedMembers = [...members].sort((a, b) => a.rank - b.rank)
  const inviteLink = `${window.location.origin}/rooms/join?code=${room?.code || ''}`

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      addToast('success', '¡Link de invitación copiado!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      addToast('error', 'Error al copiar')
    }
  }

  async function handleLeave() {
    if (!id) return
    try {
      await leaveRoomMutation.mutateAsync(id)
      addToast('success', 'Saliste de la sala')
      navigate('/rooms')
    } catch {
      addToast('error', 'Error al salir de la sala')
    }
  }

  async function handleKick(userId: string) {
    if (!id) return
    try {
      await kickMemberMutation.mutateAsync({ roomId: id, userId })
      addToast('success', 'Miembro expulsado')
    } catch {
      addToast('error', 'Error al expulsar miembro')
    }
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto space-y-6"><Skeleton variant="rectangular" className="h-8 w-32" /><Skeleton variant="card" className="h-48" /><Skeleton variant="card" className="h-64" /></div>
  }

  if (roomError || !room) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-500">Error al cargar la sala</p>
        <Button variant="outline" onClick={() => navigate('/rooms')} iconLeft={<ArrowLeft className="w-4 h-4" />}>Volver a Salas</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate('/rooms')} className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver a Salas
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{room.name}</h1>
              <Badge variant={room.isPublic ? 'info' : 'default'}>{room.isPublic ? 'Pública' : 'Privada'}</Badge>
            </div>
            {room.description && <p className="text-sm text-gray-500 dark:text-gray-400">{room.description}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span className="flex items-center gap-1"><Users className="w-4 h-4" />{room._count?.members || 0}/{room.maxMembers} miembros</span>
          <span className="text-gray-300">•</span>
          <span>Código: {room.code}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={handleCopyLink} iconLeft={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}>
            {copied ? '¡Copiado!' : 'Copiar Link de Invitación'}
          </Button>
          <Button size="sm" variant="danger" onClick={handleLeave} iconLeft={<LogOut className="w-4 h-4" />}>Salir de la Sala</Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Clasificación</h2>
        <div className="space-y-2">
          {sortedMembers.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl transition-colors',
                member.userId === user?.id ? 'bg-worldcup-50 dark:bg-worldcup-500/10' : 'hover:bg-gray-50 dark:hover:bg-zinc-700/50'
              )}
            >
              <span className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                i === 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' :
                i === 1 ? 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400' :
                i === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' :
                'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-400'
              )}>
                {i + 1}
              </span>
              <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden">
                {member.user?.avatarUrl ? (
                  <img src={member.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : member.user?.name?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.user?.name || 'Desconocido'}</p>
                <p className="text-xs text-gray-400">{member.user?.email || ''}</p>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{member.points.toLocaleString()} pts</span>
              {isAdmin && member.userId !== user?.id && (
                <button onClick={() => handleKick(member.userId)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Shield className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
