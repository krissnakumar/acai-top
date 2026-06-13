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
import { AcaiOption, AcaiOptionType } from '@/types/database'

const TYPE_LABELS: Record<AcaiOptionType, string> = {
  base: 'Base',
  fruit: 'Fruta',
  topping: 'Adicional',
  syrup: 'Caldas/Cremes',
  cream: 'Caldas/Cremes',
  paid_extra: 'Extra pago',
}

export default function AdminAdicionaisPage() {
  const [options, setOptions] = useState<AcaiOption[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AcaiOption | null>(null)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [form, setForm] = useState({ name: '', type: 'topping' as AcaiOptionType, price: 0, is_free: true, is_available: true, sort_order: 0 })

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const supabase = createClient()
    const { data } = await supabase.from('acai_options').select('*').order('sort_order')
    setOptions(data || [])
    setLoading(false)
  }

  const filtered = filter === 'all' ? options : options.filter((o) => o.type === filter)

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', type: 'topping', price: 0, is_free: true, is_available: true, sort_order: 0 })
    setDialogOpen(true)
  }

  const openEdit = (opt: AcaiOption) => {
    setEditing(opt)
    setForm({ name: opt.name, type: opt.type, price: opt.price, is_free: opt.is_free, is_available: opt.is_available, sort_order: opt.sort_order })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name) { showToast('Nome é obrigatório', 'error'); return }
    setSaving(true)
    const supabase = createClient()
    const storeRes = await supabase.from('stores').select('id').eq('slug', 'acai-top').single()
    const payload = { ...form, store_id: storeRes.data?.id }

    if (editing) {
      const { error } = await supabase.from('acai_options').update(payload).eq('id', editing.id)
      if (error) showToast('Erro ao atualizar', 'error')
      else { showToast('Opção atualizada!', 'success'); setDialogOpen(false); fetchData() }
    } else {
      const { error } = await supabase.from('acai_options').insert(payload)
      if (error) showToast('Erro ao criar', 'error')
      else { showToast('Opção criada!', 'success'); setDialogOpen(false); fetchData() }
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta opção?')) return
    const supabase = createClient()
    const { error } = await supabase.from('acai_options').delete().eq('id', id)
    if (error) showToast('Erro ao excluir', 'error')
    else { showToast('Opção excluída', 'success'); fetchData() }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-acai-purple" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Adicionais do Açaí</h1>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Nova opção</Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'base', 'fruit', 'topping', 'syrup', 'cream', 'paid_extra'].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === t ? 'bg-acai-purple text-white' : 'bg-muted text-muted-foreground'}`}
          >
            {t === 'all' ? 'Todos' : TYPE_LABELS[t as AcaiOptionType]}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {filtered.map((opt) => (
          <Card key={opt.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{opt.name}</h3>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{TYPE_LABELS[opt.type]}</span>
                  {opt.is_free && <span className="text-xs bg-acai-green/10 text-acai-green px-2 py-0.5 rounded-full">Grátis</span>}
                  {!opt.is_available && <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">Indisponível</span>}
                </div>
                {!opt.is_free && <p className="text-sm text-muted-foreground">{formatBRL(opt.price)}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEdit(opt)}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(opt.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Editar' : 'Nova'} opção</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div>
              <Label>Tipo</Label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as AcaiOptionType })} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mt-1">
                {Object.entries(TYPE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div><Label>Preço (R$)</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} /></div>
            <div><Label>Ordem</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2"><Switch checked={form.is_free} onCheckedChange={(val) => setForm({ ...form, is_free: val })} /><span className="text-sm">Grátis</span></label>
              <label className="flex items-center gap-2"><Switch checked={form.is_available} onCheckedChange={(val) => setForm({ ...form, is_available: val })} /><span className="text-sm">Disponível</span></label>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}