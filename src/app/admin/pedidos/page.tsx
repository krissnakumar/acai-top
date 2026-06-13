'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatBRL } from '@/lib/currency'
import { formatPhone } from '@/lib/utils'
import { showToast } from '@/components/ui/toast'
import { Order, OrderItem, OrderItemOption, OrderStatus } from '@/types/database'
import { Search, ChevronDown, ChevronUp } from 'lucide-react'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendente',
  accepted: 'Aceito',
  preparing: 'Preparando',
  out_for_delivery: 'A caminho',
  ready_for_pickup: 'Pronto para retirada',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  out_for_delivery: 'bg-purple-100 text-purple-800',
  ready_for_pickup: 'bg-green-100 text-green-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<(Order & { items?: (OrderItem & { options?: OrderItemOption[] })[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const supabase = createClient()
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (ordersData) {
      const ordersWithItems = await Promise.all(
        ordersData.map(async (order) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('*, options:order_item_options(*)')
            .eq('order_id', order.id)
          return { ...order, items: items || [] }
        })
      )
      setOrders(ordersWithItems)
    }
    setLoading(false)
  }

  const filteredOrders = orders.filter((o) => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    const matchSearch = !search ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search) ||
      o.order_number.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const supabase = createClient()
    const { error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId)
    if (error) showToast('Erro ao atualizar status', 'error')
    else { showToast('Status atualizado', 'success'); fetchData() }
  }

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const flow: Record<OrderStatus, OrderStatus | null> = {
      pending: 'accepted',
      accepted: 'preparing',
      preparing: 'out_for_delivery',
      out_for_delivery: 'completed',
      ready_for_pickup: 'completed',
      completed: null,
      cancelled: null,
    }
    return flow[current]
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-acai-purple" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Pedidos</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome, telefone ou nº pedido..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
            <option value="all">Todos</option>
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido' : 'pedidos'} encontrado{filteredOrders.length !== 1 ? 's' : ''}
      </div>

      <div className="grid gap-4">
        {filteredOrders.map((order) => {
          const isExpanded = expandedOrder === order.id
          const nextStatus = getNextStatus(order.status)
          return (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-muted-foreground">#{order.order_number}</span>
                    <Badge className={STATUS_COLORS[order.status]}>{STATUS_LABELS[order.status]}</Badge>
                  </div>
                  <span className="text-lg font-bold">{formatBRL(order.total)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{order.customer_name}</span>
                    <span className="text-muted-foreground ml-2">{formatPhone(order.customer_phone)}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {new Date(order.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 text-sm">
                  <span className="text-muted-foreground">
                    {order.delivery_type === 'delivery' ? 'Entrega' : 'Retirada'} · {order.payment_method}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      Detalhes
                    </Button>
                    {nextStatus && (
                      <Button size="sm" onClick={() => updateStatus(order.id, nextStatus)}>
                        {STATUS_LABELS[nextStatus]}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => updateStatus(order.id, 'cancelled')}
                      disabled={order.status === 'completed' || order.status === 'cancelled'}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    {order.delivery_type === 'delivery' && (
                      <div className="text-sm">
                        <p className="font-medium mb-1">Endereço:</p>
                        <p className="text-muted-foreground">
                          {order.address_street}, {order.address_number}
                          {order.address_complement && ` - ${order.address_complement}`}
                          <br />
                          Bairro: {order.address_neighborhood}
                          {order.address_reference && <><br />Ref: {order.address_reference}</>}
                        </p>
                      </div>
                    )}
                    <div className="text-sm">
                      <p className="font-medium mb-1">Itens:</p>
                      {order.items?.map((item) => (
                        <div key={item.id} className="ml-2 mb-2">
                          <p>{item.quantity}x {item.name} - {formatBRL(item.total_price)}</p>
                          {item.options && item.options.length > 0 && (
                            <div className="ml-4 text-xs text-muted-foreground">
                              {item.options.map((opt) => (
                                <p key={opt.id}>{opt.option_type}: {opt.option_name}{opt.option_price > 0 && ` (+${formatBRL(opt.option_price)})`}</p>
                              ))}
                            </div>
                          )}
                          {item.notes && <p className="ml-4 text-xs text-muted-foreground">Obs: {item.notes}</p>}
                        </div>
                      ))}
                    </div>
                    {order.order_notes && (
                      <div className="text-sm">
                        <p className="font-medium mb-1">Observações:</p>
                        <p className="text-muted-foreground">{order.order_notes}</p>
                      </div>
                    )}
                    <div className="text-sm">
                      <p>Subtotal: {formatBRL(order.subtotal)}</p>
                      <p>Entrega: {formatBRL(order.delivery_fee)}</p>
                      <p className="font-bold">Total: {formatBRL(order.total)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}