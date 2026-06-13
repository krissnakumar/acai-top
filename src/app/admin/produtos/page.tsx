'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatBRL } from '@/lib/currency'
import { showToast } from '@/components/ui/toast'
import { Plus, Pencil, Trash2, Image as ImageIcon } from 'lucide-react'
import { Product, Category } from '@/types/database'
import Image from 'next/image'

export default function AdminProdutosPage() {
  const [products, setProducts] = useState<(Product & { category?: Category })[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    category_id: '',
    is_available: true,
    is_featured: false,
    sort_order: 0,
    image_url: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const supabase = createClient()
    const [prodRes, catRes] = await Promise.all([
      supabase.from('products').select('*, category:categories(*)').order('sort_order'),
      supabase.from('categories').select('*').order('sort_order'),
    ])
    setProducts(prodRes.data || [])
    setCategories(catRes.data || [])
    setLoading(false)
  }

  const openCreate = () => {
    setEditingProduct(null)
    setForm({
      name: '',
      description: '',
      price: 0,
      category_id: '',
      is_available: true,
      is_featured: false,
      sort_order: 0,
      image_url: '',
    })
    setDialogOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category_id: product.category_id || '',
      is_available: product.is_available,
      is_featured: product.is_featured,
      sort_order: product.sort_order,
      image_url: product.image_url || '',
    })
    setDialogOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      showToast('Imagem deve ter no máximo 5MB', 'error')
      return
    }

    setUploading(true)
    const supabase = createClient()
    const fileName = `${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file)

    if (error) {
      showToast('Erro ao fazer upload', 'error')
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path)

    setForm({ ...form, image_url: urlData.publicUrl })
    setUploading(false)
  }

  const handleSave = async () => {
    if (!form.name || form.price <= 0) {
      showToast('Preencha nome e preço', 'error')
      return
    }

    setSaving(true)
    const supabase = createClient()

    const payload = {
      name: form.name,
      description: form.description || null,
      price: form.price,
      category_id: form.category_id || null,
      is_available: form.is_available,
      is_featured: form.is_featured,
      sort_order: form.sort_order,
      image_url: form.image_url || null,
      store_id: (await supabase.from('stores').select('id').eq('slug', 'acai-top').single()).data?.id,
    }

    if (editingProduct) {
      const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id)
      if (error) {
        showToast('Erro ao atualizar produto', 'error')
      } else {
        showToast('Produto atualizado!', 'success')
        setDialogOpen(false)
        fetchData()
      }
    } else {
      const { error } = await supabase.from('products').insert(payload)
      if (error) {
        showToast('Erro ao criar produto', 'error')
      } else {
        showToast('Produto criado!', 'success')
        setDialogOpen(false)
        fetchData()
      }
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return
    const supabase = createClient()
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      showToast('Erro ao excluir', 'error')
    } else {
      showToast('Produto excluído', 'success')
      fetchData()
    }
  }

  const toggleAvailability = async (product: Product) => {
    const supabase = createClient()
    await supabase.from('products').update({ is_available: !product.is_available }).eq('id', product.id)
    fetchData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-acai-purple" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Novo produto
        </Button>
      </div>

      <div className="grid gap-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{product.name}</h3>
                  {!product.is_available && (
                    <Badge variant="destructive">Indisponível</Badge>
                  )}
                  {product.is_featured && (
                    <Badge variant="success">Destaque</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {product.category?.name || 'Sem categoria'} · {formatBRL(product.price)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={product.is_available}
                  onCheckedChange={() => toggleAvailability(product)}
                />
                <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(product.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar produto' : 'Novo produto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Imagem</Label>
              <div className="mt-2">
                {form.image_url && (
                  <Image
                    src={form.image_url}
                    alt="Preview"
                    width={200}
                    height={200}
                    className="w-full h-40 object-cover rounded-lg mb-2"
                  />
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </div>
            </div>
            <div>
              <Label>Nome *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nome do produto"
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descrição opcional"
                rows={2}
              />
            </div>
            <div>
              <Label>Preço (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Categoria</Label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Sem categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <Switch
                  checked={form.is_available}
                  onCheckedChange={(val) => setForm({ ...form, is_available: val })}
                />
                <span className="text-sm">Disponível</span>
              </label>
              <label className="flex items-center gap-2">
                <Switch
                  checked={form.is_featured}
                  onCheckedChange={(val) => setForm({ ...form, is_featured: val })}
                />
                <span className="text-sm">Destaque</span>
              </label>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}