'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { showToast } from '@/components/ui/toast'
import { formatBRL } from '@/lib/currency'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { DeliveryZone } from '@/types/database'

export default function AdminEntregasPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<DeliveryZone | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', fee: 0, minimum_order: 0, estimated_time: '', is_active: true })

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const supabase = createClient()
    const { data } = await supabase.from('delivery_zones').select('*').order('name')
    setZones(data || [])
    setLoading(false)
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', fee: 0, minimum_order: 0, estimated_time: '', is_active: true })
    setDialogOpen(true)
  }

  const openEdit = (z: DeliveryZone) => {
    setEditing(z)
    setForm({ name: z.name, fee: z.fee, minimum_order: z.minimum_order, estimated_time: z.estimated_time || '', is_active: z.is_active })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name) { showToast('Nome é obrigatório', 'error'); return }
    setSaving(true)
    const supabase = createClient()
    const storeRes = await supabase.from('stores').select('id').eq('slug', 'acai-top').single()
    const payload = { ...form, store_id: storeRes.data?.id }

    if (editing) {
      const { error } = await supabase.from('delivery_zones').update(payload).eq('id', editing.id)
      if (error) showToast('Erro ao atualizar', 'error')
      else { showToast('Zona atualizada!', 'success'); setDialogOpen(false); fetchData() }
    } else {
      const { error } = await supabase.from('delivery_zones').insert(payload)
      if (error) showToast('Erro ao criar', 'error')
      else { showToast('Zona criada!', 'success'); setDialogOpen(false); fetchData() }
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta zona?')) return
    const supabase = createClient()
    const { error } = await supabase.from('delivery_zones').delete().eq('id', id)
    if (error) showToast('Erro ao excluir', 'error')
    else { showToast('Zona excluída', 'success'); fetchData() }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-acai-purple" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Zonas de Entrega</h1>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Nova zona</Button>
      </div>

      <div className="grid gap-4">
        {zones.map((zone) => (
          <Card key={zone.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{zone.name}</h3>
                  {!zone.is_active && <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">Inativa</span>}
                </div>
                <p className="text-sm text-muted-foreground">
                  Taxa: {formatBRL(zone.fee)} · Mínimo: {formatBRL(zone.minimum_order)} · {zone.estimated_time || '30-60 min'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEdit(zone)}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(zone.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Editar' : 'Nova'} zona</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Centro" /></div>
            <div><Label>Taxa de entrega (R$) *</Label><Input type="number" step="0.01" value={form.fee} onChange={(e) => setForm({ ...form, fee: parseFloat(e.target.value) || 0 })} /></div>
            <div><Label>Pedido mínimo (R$)</Label><Input type="number" step="0.01" value={form.minimum_order} onChange={(e) => setForm({ ...form, minimum_order: parseFloat(e.target.value) || 0 })} /></div>
            <div><Label>Tempo estimado</Label><Input value={form.estimated_time} onChange={(e) => setForm({ ...form, estimated_time: e.target.value })} placeholder="Ex: 30-45 min" /></div>
            <label className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(val) => setForm({ ...form, is_active: val })} /><span className="text-sm">Ativa</span></label>
            <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}