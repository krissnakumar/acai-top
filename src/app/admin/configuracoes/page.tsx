'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { showToast } from '@/components/ui/toast'
import { Store } from '@/types/database'
import { Save } from 'lucide-react'

export default function AdminConfiguracoesPage() {
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function fetchStore() {
      const supabase = createClient()
      const { data } = await supabase.from('stores').select('*').eq('slug', 'acai-top').single()
      setStore(data)
      setLoading(false)
    }
    fetchStore()
  }, [])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !store) return

    setUploading(true)
    const supabase = createClient()
    const fileName = `logo-${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from('store-assets')
      .upload(fileName, file)

    if (error) {
      showToast('Erro ao fazer upload', 'error')
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('store-assets').getPublicUrl(data.path)
    await supabase.from('stores').update({ logo_url: urlData.publicUrl }).eq('id', store.id)
    setStore({ ...store, logo_url: urlData.publicUrl })
    setUploading(false)
    showToast('Logo atualizada!', 'success')
  }

  const handleSave = async () => {
    if (!store) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('stores').update({
      name: store.name,
      whatsapp_number: store.whatsapp_number,
      instagram_url: store.instagram_url,
      address: store.address,
      google_maps_url: store.google_maps_url,
      is_open: store.is_open,
      accepts_orders_when_closed: store.accepts_orders_when_closed,
      pickup_enabled: store.pickup_enabled,
      delivery_enabled: store.delivery_enabled,
      minimum_order: store.minimum_order,
      default_delivery_time: store.default_delivery_time,
      show_unavailable_products: store.show_unavailable_products,
      updated_at: new Date().toISOString(),
    }).eq('id', store.id)

    if (error) showToast('Erro ao salvar', 'error')
    else showToast('Configurações salvas!', 'success')
    setSaving(false)
  }

  if (loading || !store) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-acai-purple" /></div>

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Configurações da Loja</h1>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Dados gerais</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Logo</Label>
            <div className="mt-2 flex items-center gap-4">
              {store.logo_url && (
                <img src={store.logo_url} alt="Logo" className="w-16 h-16 rounded-full object-cover" />
              )}
              <Input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploading} className="max-w-xs" />
            </div>
          </div>
          <div><Label>Nome da loja</Label><Input value={store.name} onChange={(e) => setStore({ ...store, name: e.target.value })} /></div>
          <div><Label>WhatsApp *</Label><Input value={store.whatsapp_number} onChange={(e) => setStore({ ...store, whatsapp_number: e.target.value })} placeholder="11999998888" /></div>
          <div><Label>Instagram URL</Label><Input value={store.instagram_url || ''} onChange={(e) => setStore({ ...store, instagram_url: e.target.value })} placeholder="https://instagram.com/acaitop" /></div>
          <div><Label>Endereço</Label><Input value={store.address || ''} onChange={(e) => setStore({ ...store, address: e.target.value })} /></div>
          <div><Label>Google Maps URL</Label><Input value={store.google_maps_url || ''} onChange={(e) => setStore({ ...store, google_maps_url: e.target.value })} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Pedido e entrega</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Pedido mínimo (R$)</Label><Input type="number" step="0.01" value={store.minimum_order} onChange={(e) => setStore({ ...store, minimum_order: parseFloat(e.target.value) || 0 })} /></div>
          <div><Label>Tempo padrão de entrega</Label><Input value={store.default_delivery_time || ''} onChange={(e) => setStore({ ...store, default_delivery_time: e.target.value })} placeholder="Ex: 30-60 min" /></div>
          <div className="space-y-3">
            <label className="flex items-center gap-3"><Switch checked={store.is_open} onCheckedChange={(val) => setStore({ ...store, is_open: val })} /><span>Loja aberta</span></label>
            <label className="flex items-center gap-3"><Switch checked={store.accepts_orders_when_closed} onCheckedChange={(val) => setStore({ ...store, accepts_orders_when_closed: val })} /><span>Aceitar pedidos quando fechada</span></label>
            <label className="flex items-center gap-3"><Switch checked={store.pickup_enabled} onCheckedChange={(val) => setStore({ ...store, pickup_enabled: val })} /><span>Retirada habilitada</span></label>
            <label className="flex items-center gap-3"><Switch checked={store.delivery_enabled} onCheckedChange={(val) => setStore({ ...store, delivery_enabled: val })} /><span>Entrega habilitada</span></label>
            <label className="flex items-center gap-3"><Switch checked={store.show_unavailable_products} onCheckedChange={(val) => setStore({ ...store, show_unavailable_products: val })} /><span>Mostrar produtos indisponíveis</span></label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}