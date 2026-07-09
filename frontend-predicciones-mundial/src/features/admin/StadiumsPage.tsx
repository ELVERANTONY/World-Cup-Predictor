import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { Search, Plus, Pencil, Trash2, Building2, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { useStadiums, useCreateStadium, useUpdateStadium, useDeleteStadium } from '@/hooks/useQueries'
import type { Stadium } from '@/types'
import { staggerContainer, staggerItem } from '@/utils/animation'

interface StadiumForm {
  name: string
  city: string
  country: string
  capacity: number
  imageUrl: string
  surface: string
}

const emptyForm: StadiumForm = { name: '', city: '', country: '', capacity: 0, imageUrl: '', surface: '' }

export function StadiumsPage() {
  const { data: stadiums = [], isLoading: loading, error } = useStadiums()
  const createStadiumMutation = useCreateStadium()
  const updateStadiumMutation = useUpdateStadium()
  const deleteStadiumMutation = useDeleteStadium()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editingStadium, setEditingStadium] = useState<Stadium | null>(null)
  const [deletingStadium, setDeletingStadium] = useState<Stadium | null>(null)
  const [form, setForm] = useState<StadiumForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  const filteredStadiums = useMemo(() => {
    const q = search.toLowerCase()
    return stadiums.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      s.country.toLowerCase().includes(q)
    )
  }, [stadiums, search])

  function openAddModal() {
    setEditingStadium(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEditModal(stadium: Stadium) {
    setEditingStadium(stadium)
    setForm({
      name: stadium.name,
      city: stadium.city,
      country: stadium.country,
      capacity: stadium.capacity,
      imageUrl: stadium.imageUrl || '',
      surface: stadium.surface || '',
    })
    setModalOpen(true)
  }

  function openDeleteModal(stadium: Stadium) {
    setDeletingStadium(stadium)
    setDeleteModalOpen(true)
  }

  async function handleSave() {
    try {
      setSaving(true)
      if (editingStadium) {
        await updateStadiumMutation.mutateAsync({ id: editingStadium.id, data: form })
        addToast('success', 'Stadium updated successfully')
      } else {
        await createStadiumMutation.mutateAsync(form as unknown as Stadium)
        addToast('success', 'Stadium created successfully')
      }
      setModalOpen(false)
    } catch {
      addToast('error', `Failed to ${editingStadium ? 'update' : 'create'} stadium`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingStadium) return
    try {
      setSaving(true)
      await deleteStadiumMutation.mutateAsync(deletingStadium.id)
      addToast('success', 'Stadium deleted successfully')
      setDeleteModalOpen(false)
      setDeletingStadium(null)
    } catch {
      addToast('error', 'Failed to delete stadium')
    } finally {
      setSaving(false)
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-red-500 dark:text-red-400 font-medium">Failed to load stadiums</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <motion.div className="max-w-7xl mx-auto space-y-6" initial="hidden" animate="visible" variants={staggerContainer}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Stadiums</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage World Cup 2026 stadiums</p>
        </div>
        <Button onClick={openAddModal} iconLeft={<Plus className="w-4 h-4" />}>Add Stadium</Button>
      </div>

      <div className="flex-1 max-w-md">
        <Input
          placeholder="Search stadiums..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          iconLeft={<Search className="w-4 h-4" />}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-5"><Skeleton variant="rectangular" height={180} /></CardContent></Card>
          ))}
        </div>
      ) : filteredStadiums.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No stadiums found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            {search ? 'Try adjusting your search' : 'Add your first stadium'}
          </p>
        </div>
      ) : (
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={staggerContainer}>
          {filteredStadiums.map(stadium => (
            <motion.div key={stadium.id} variants={staggerItem}>
              <Card className="group overflow-hidden">
                {stadium.imageUrl && (
                  <div className="h-36 overflow-hidden">
                    <img src={stadium.imageUrl} alt={stadium.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{stadium.name}</h3>
                      <div className="flex items-center gap-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{stadium.city}, {stadium.country}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <button onClick={() => openEditModal(stadium)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => openDeleteModal(stadium)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="info">{stadium.capacity.toLocaleString()} seats</Badge>
                    {stadium.surface && <Badge variant="default">{stadium.surface}</Badge>}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingStadium ? 'Edit Stadium' : 'Add Stadium'} size="md">
        <div className="space-y-4">
          <Input label="Stadium Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <Input label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Capacity" type="number" value={form.capacity.toString()} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })} />
            <Input label="Surface" value={form.surface} onChange={(e) => setForm({ ...form, surface: e.target.value })} />
          </div>
          <Input label="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>{editingStadium ? 'Guardar Cambios' : 'Crear Estadio'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Eliminar Estadio" size="sm">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          ¿Estás seguro de que deseas eliminar <strong className="text-gray-900 dark:text-white">{deletingStadium?.name}</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete} loading={saving}>Eliminar</Button>
        </div>
      </Modal>
    </motion.div>
  )
}
