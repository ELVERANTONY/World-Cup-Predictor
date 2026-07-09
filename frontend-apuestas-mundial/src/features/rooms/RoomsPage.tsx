import { useState } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { Plus, LogIn, RefreshCw, Users, Lock, Globe } from 'lucide-react'
import { useMyRooms, useRooms } from '@/hooks/useQueries'
import type { Room } from '@/types'
import { CreateRoomModal } from './CreateRoomModal'
import { JoinRoomModal } from './JoinRoomModal'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { staggerContainer, staggerItem } from '@/utils/animation'
import { Badge } from '@/components/ui/badge'

export function RoomsPage() {
  const navigate = useNavigate()
  const { data: myRooms = [], isLoading: loading, error } = useMyRooms()
  const { data: allRooms = [] } = useRooms()
  const publicRooms = allRooms.filter(r => r.isPublic)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-500">Failed to load rooms</p>
        <Button variant="outline" onClick={() => window.location.reload()} iconLeft={<RefreshCw className="w-4 h-4" />}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Rooms</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Join prediction rooms and compete with others</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowJoin(true)} iconLeft={<LogIn className="w-4 h-4" />}>Join</Button>
          <Button onClick={() => setShowCreate(true)} iconLeft={<Plus className="w-4 h-4" />}>Create Room</Button>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid gap-4">{[1, 2, 3].map(i => <Skeleton key={i} variant="card" className="h-32" />)}</div>
      ) : (
        <>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Mis salas</h2>
            {myRooms.length > 0 ? (
              <motion.div className="grid gap-3" variants={staggerContainer} initial="hidden" animate="visible">
                {myRooms.map(r => <RoomCard key={r.id} room={r} onClick={() => navigate(`/rooms/${r.id}`)} />)}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 dark:bg-zinc-800/30 rounded-2xl border border-gray-200 dark:border-zinc-800">
                <p className="text-gray-500 dark:text-gray-400 font-medium">Aún no perteneces a ninguna sala.</p>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Public Rooms</h2>
            {publicRooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No public rooms available</p>
              </div>
            ) : (
              <motion.div className="grid gap-3" variants={staggerContainer} initial="hidden" animate="visible">
                {publicRooms.map(r => <RoomCard key={r.id} room={r} onClick={() => navigate(`/rooms/${r.id}`)} />)}
              </motion.div>
            )}
          </section>
        </>
      )}

      <CreateRoomModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={() => window.location.reload()} />
      <JoinRoomModal open={showJoin} onClose={() => setShowJoin(false)} onJoined={() => window.location.reload()} />
    </div>
  )
}

function RoomCard({ room, onClick }: { room: Room; onClick: () => void }) {
  return (
    <motion.div variants={staggerItem} whileHover={{ y: -2 }} onClick={onClick} className="rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 p-5 cursor-pointer hover:shadow-lg transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{room.name}</h3>
            <Badge variant={room.isPublic ? 'info' : 'default'}>
              {room.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {room.isPublic ? 'Public' : 'Private'}
            </Badge>
          </div>
          {room.description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-1">{room.description}</p>}
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{room._count?.members || 0}/{room.maxMembers} members</span>
        <span className="text-gray-300">•</span>
        <span>Code: {room.code}</span>
      </div>
    </motion.div>
  )
}
