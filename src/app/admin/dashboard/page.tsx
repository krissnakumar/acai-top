'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { formatBRL } from '@/lib/currency'
import Link from 'next/link'
import {
  ShoppingBag,
  Package,
  DollarSign,
  Clock,
  Plus,
  Settings,
  IceCream2,
  Tag,
  MapPin,
} from 'lucide-react'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    totalProducts: 0,
  })
  const [store, setStore] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient()

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const [ordersRes, productsRes, storeRes] = await Promise.all([
        supabase
          .from('orders')
          .select('*')
          .gte('created_at', today.toISOString()),
        supabase.from('products').select('*'),
        supabase.from('stores').select('*').eq('slug', 'acai-top').single(),
      ])

      const orders = ordersRes.data || []
      setStats({
        todayOrders: orders.length,
        todayRevenue: orders.reduce((sum: number, o: any) => sum + o.total, 0),
        pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
        totalProducts: productsRes.data?.length || 0,
      })
      setStore(storeRes.data)
      setLoading(false)
    }
    fetchStats()
  }, [])

  const toggleStore = async (checked: boolean) => {
    const supabase = createClient()
    await supabase.from('stores').update({ is_open: checked }).eq('slug', 'acai-top')
    setStore({ ...store, is_open: checked })
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
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Loja:</span>
          <Switch
            checked={store?.is_open}
            onCheckedChange={toggleStore}
          />
          <Badge variant={store?.is_open ? 'success' : 'destructive'}>
            {store?.is_open ? 'Aberta' : 'Fechada'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pedidos hoje</CardTitle>
            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita hoje</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBRL(stats.todayRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Link href="/admin/pedidos">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-acai-purple/10 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-acai-purple" />
              </div>
              <div>
                <p className="font-semibold">Pedidos</p>
                <p className="text-xs text-muted-foreground">Gerenciar pedidos</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/produtos">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-acai-green/10 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-acai-green" />
              </div>
              <div>
                <p className="font-semibold">Produtos</p>
                <p className="text-xs text-muted-foreground">Adicionar/editar</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/tamanhos-acai">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-acai-purple/10 rounded-xl flex items-center justify-center">
                <IceCream2 className="w-6 h-6 text-acai-purple" />
              </div>
              <div>
                <p className="font-semibold">Tamanhos</p>
                <p className="text-xs text-muted-foreground">Tamanhos de açaí</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/adicionais">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-acai-green/10 rounded-xl flex items-center justify-center">
                <Tag className="w-6 h-6 text-acai-green" />
              </div>
              <div>
                <p className="font-semibold">Adicionais</p>
                <p className="text-xs text-muted-foreground">Coberturas/opções</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/categorias">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                <Tag className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold">Categorias</p>
                <p className="text-xs text-muted-foreground">Organizar produtos</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/entregas">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-acai-purple/10 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-acai-purple" />
              </div>
              <div>
                <p className="font-semibold">Entregas</p>
                <p className="text-xs text-muted-foreground">Zonas de entrega</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/configuracoes">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold">Configurações</p>
                <p className="text-xs text-muted-foreground">Dados da loja</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}