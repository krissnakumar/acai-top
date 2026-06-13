'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { showToast } from '@/components/ui/toast'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Category } from '@/types/database'

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', sort_order: 0, is_active: true })

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const supabase = createClient()
    const { data } = await supabase.from('categories').select('*').order('sort_order')
    setCategories(data || [])
    setLoading(false)
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', description: '', sort_order: 0, is_active: true })
    setDialogOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditing(cat)
    setForm({ name: cat.name, description: cat.description || '', sort_order: cat.sort_order, is_active: cat.is_active })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name) { showToast('Nome é obrigatório', 'error'); return }
    setSaving(true)
    const supabase = createClient()
    const storeRes = await supabase.from('stores').select('id').eq('slug', 'acai-top').single()
    const storeId = storeRes.data?.id
    const payload = { ...form, store_id: storeId }

    if (editing) {
      const { error } = await supabase.from('categories').update(payload).eq('id', editing.id)
      if (error) showToast('Erro ao atualizar', 'error')
      else { showToast('Categoria atualizada!', 'success'); setDialogOpen(false); fetchData() }
    } else {
      const { error } = await supabase.from('categories').insert(payload)
      if (error) showToast('Erro ao criar', 'error')
      else { showToast('Categoria criada!', 'success'); setDialogOpen(false); fetchData() }
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta categoria?')) return
    const supabase = createClient()
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) showToast('Erro ao excluir', 'error')
    else { showToast('Categoria excluída', 'success'); fetchData() }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-acai-purple" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Nova categoria</Button>
      </div>

      <div className="grid gap-4">
        {categories.map((cat) => (
          <Card key={cat.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{cat.name}</h3>
                  {!cat.is_active && <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">Inativa</span>}
                </div>
                {cat.description && <p className="text-sm text-muted-foreground">{cat.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(cat.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Editar' : 'Nova'} categoria</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Descrição</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
            <div><Label>Ordem</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
            <label className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(val) => setForm({ ...form, is_active: val })} /><span className="text-sm">Ativa</span></label>
            <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}