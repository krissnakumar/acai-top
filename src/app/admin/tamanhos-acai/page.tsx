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
import { AcaiSize } from '@/types/database'

export default function AdminTamanhosPage() {
  const [sizes, setSizes] = useState<AcaiSize[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AcaiSize | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', ml: 0, base_price: 0, max_free_toppings: 0, max_free_fruits: 0, is_active: true, sort_order: 0 })

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const supabase = createClient()
    const { data } = await supabase.from('acai_sizes').select('*').order('sort_order')
    setSizes(data || [])
    setLoading(false)
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', ml: 0, base_price: 0, max_free_toppings: 0, max_free_fruits: 0, is_active: true, sort_order: 0 })
    setDialogOpen(true)
  }

  const openEdit = (s: AcaiSize) => {
    setEditing(s)
    setForm({ name: s.name, ml: s.ml || 0, base_price: s.base_price, max_free_toppings: s.max_free_toppings, max_free_fruits: s.max_free_fruits, is_active: s.is_active, sort_order: s.sort_order })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || form.base_price <= 0) { showToast('Preencha nome e preço', 'error'); return }
    setSaving(true)
    const supabase = createClient()
    const storeRes = await supabase.from('stores').select('id').eq('slug', 'acai-top').single()
    const payload = { ...form, store_id: storeRes.data?.id }

    if (editing) {
      const { error } = await supabase.from('acai_sizes').update(payload).eq('id', editing.id)
      if (error) showToast('Erro ao atualizar', 'error')
      else { showToast('Tamanho atualizado!', 'success'); setDialogOpen(false); fetchData() }
    } else {
      const { error } = await supabase.from('acai_sizes').insert(payload)
      if (error) showToast('Erro ao criar', 'error')
      else { showToast('Tamanho criado!', 'success'); setDialogOpen(false); fetchData() }
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este tamanho?')) return
    const supabase = createClient()
    const { error } = await supabase.from('acai_sizes').delete().eq('id', id)
    if (error) showToast('Erro ao excluir', 'error')
    else { showToast('Tamanho excluído', 'success'); fetchData() }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-acai-purple" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tamanhos de Açaí</h1>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Novo tamanho</Button>
      </div>

      <div className="grid gap-4">
        {sizes.map((size) => (
          <Card key={size.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{size.name}</h3>
                  {size.ml && <span className="text-sm text-muted-foreground">{size.ml}ml</span>}
                  {!size.is_active && <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">Inativo</span>}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatBRL(size.base_price)} · {size.max_free_toppings} adicionais grátis · {size.max_free_fruits} frutas
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEdit(size)}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(size.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Editar' : 'Novo'} tamanho</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Copo 500ml" /></div>
            <div><Label>ML</Label><Input type="number" value={form.ml} onChange={(e) => setForm({ ...form, ml: parseInt(e.target.value) || 0 })} /></div>
            <div><Label>Preço base (R$) *</Label><Input type="number" step="0.01" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: parseFloat(e.target.value) || 0 })} /></div>
            <div><Label>Adicionais grátis</Label><Input type="number" value={form.max_free_toppings} onChange={(e) => setForm({ ...form, max_free_toppings: parseInt(e.target.value) || 0 })} /></div>
            <div><Label>Frutas grátis</Label><Input type="number" value={form.max_free_fruits} onChange={(e) => setForm({ ...form, max_free_fruits: parseInt(e.target.value) || 0 })} /></div>
            <div><Label>Ordem</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
            <label className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(val) => setForm({ ...form, is_active: val })} /><span className="text-sm">Ativo</span></label>
            <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}