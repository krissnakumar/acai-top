'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { formatBRL } from '@/lib/currency'
import { generateWhatsAppMessage, getWhatsAppLink } from '@/lib/whatsapp'
import { CheckCircle, ArrowLeft, ShoppingBag, MessageCircle, Loader2, AlertCircle } from 'lucide-react'
import { OrderSummary } from '@/types/order'

export function ObrigadoClient() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [options, setOptions] = useState<any[]>([])
  const [whatsappUrl, setWhatsappUrl] = useState<string>('')

  useEffect(() => {
    if (!orderId) {
      setLoading(false)
      return
    }

    async function fetchOrderDetails() {
      try {
        const supabase = createClient()
        
        // 1. Fetch order and store info
        const { data: orderData, error: orderErr } = await supabase
          .from('orders')
          .select('*, store:stores(*)')
          .eq('id', orderId)
          .single()

        if (orderErr) throw orderErr
        setOrder(orderData)

        // 2. Fetch items
        const { data: itemsData, error: itemsErr } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId)

        if (itemsErr) throw itemsErr
        setItems(itemsData || [])

        // 3. Fetch item options
        const itemIds = itemsData?.map((item) => item.id) || []
        if (itemIds.length > 0) {
          const { data: optionsData, error: optionsErr } = await supabase
            .from('order_item_options')
            .select('*')
            .in('order_item_id', itemIds)

          if (optionsErr) throw optionsErr
          setOptions(optionsData || [])
        }
      } catch (err: any) {
        console.error('Error fetching order:', err)
        setError('Não foi possível carregar os detalhes do pedido.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId])

  useEffect(() => {
    if (!order) return

    // Generate WhatsApp link
    const typeMap: Record<string, string> = {
      base: 'Base',
      fruit: 'Fruta',
      topping: 'Adicional',
      syrup: 'Caldas',
      paid_extra: 'Extra',
    }

    const orderSummary: OrderSummary = {
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      deliveryType: order.delivery_type,
      address: order.delivery_type === 'delivery' ? {
        street: order.address_street || '',
        number: order.address_number || '',
        complement: order.address_complement || undefined,
        neighborhood: order.address_neighborhood || '',
        reference: order.address_reference || undefined,
      } : undefined,
      items: items.map((item) => {
        const itemOpts = options.filter((opt) => opt.order_item_id === item.id)
        return {
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          notes: item.notes || undefined,
          options: itemOpts.map((opt) => ({
            name: opt.option_name,
            type: typeMap[opt.option_type] || opt.option_type,
            price: opt.option_price || undefined,
          })),
        }
      }),
      paymentMethod: order.payment_method,
      needsChange: order.needs_change,
      changeFor: order.change_for || undefined,
      subtotal: order.subtotal,
      deliveryFee: order.delivery_fee,
      total: order.total,
      notes: order.order_notes || undefined,
    }

    const message = generateWhatsAppMessage({
      storeName: order.store?.name || 'Açaí Top',
      storeWhatsApp: order.store?.whatsapp_number || '',
      order: orderSummary,
    })

    const url = getWhatsAppLink(order.store?.whatsapp_number || '', message)
    setWhatsappUrl(url)
  }, [order, items, options])

  if (loading) {
    return (
      <Card className="p-8 text-center w-full">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-acai-purple mb-4" />
        <p className="text-muted-foreground">Carregando detalhes do seu pedido...</p>
      </Card>
    )
  }

  if (error || (!order && orderId)) {
    return (
      <Card className="p-8 text-center w-full">
        <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <h2 className="text-lg font-bold mb-2">Ops! Ocorreu um erro</h2>
        <p className="text-muted-foreground mb-6">{error || 'Pedido não encontrado.'}</p>
        <Link href="/cardapio">
          <Button>Voltar ao cardápio</Button>
        </Link>
      </Card>
    )
  }

  const typeMap: Record<string, string> = {
    base: 'Base',
    fruit: 'Fruta',
    topping: 'Adicional',
    syrup: 'Caldas',
    paid_extra: 'Extra',
  }

  return (
    <div className="container-custom py-12 max-w-2xl w-full">
      <Card className="p-8">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/35 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-3xl font-extrabold text-center mb-2 text-foreground">Pedido Criado!</h1>
        <p className="text-muted-foreground text-center mb-6">
          Seu pedido foi registrado no sistema. Finalize o envio pelo WhatsApp para confirmação e preparo.
        </p>

        {whatsappUrl && (
          <div className="space-y-4 mb-8">
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-xl text-sm text-amber-800 dark:text-amber-300 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Atenção!</p>
                <p>Se a janela do WhatsApp não abriu automaticamente, clique no botão verde abaixo para enviar os detalhes do seu pedido e garantir a sua entrega.</p>
              </div>
            </div>

            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
              <Button className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg shadow-lg hover:shadow-emerald-600/20 transition-all rounded-xl flex items-center justify-center gap-2 animate-pulse">
                <MessageCircle className="w-6 h-6 fill-white text-emerald-600" />
                Enviar Pedido para o WhatsApp
              </Button>
            </a>
          </div>
        )}

        {order && (
          <Card className="p-6 bg-muted/30 border border-border mb-8 text-left">
            <h3 className="font-bold text-lg border-b pb-2 mb-4 text-foreground flex justify-between items-center">
              <span>Resumo do Pedido</span>
              <span className="text-sm font-normal text-muted-foreground">Nº #{order.order_number}</span>
            </h3>
            
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Cliente</p>
                <p className="font-medium text-foreground">{order.customer_name} ({order.customer_phone})</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Forma de Retirada/Entrega</p>
                <p className="font-medium text-foreground">
                  {order.delivery_type === 'delivery' ? 'Entrega' : 'Retirada no local'}
                </p>
                {order.delivery_type === 'delivery' && (
                  <p className="text-muted-foreground mt-1 bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-border">
                    {order.address_street}, {order.address_number}
                    {order.address_complement && ` - ${order.address_complement}`}
                    <br />
                    Bairro: {order.address_neighborhood}
                    {order.address_reference && ` (Ref: ${order.address_reference})`}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold mb-2">Itens Solicitados</p>
                <div className="space-y-2">
                  {items.map((item) => {
                    const itemOpts = options.filter((opt) => opt.order_item_id === item.id)
                    return (
                      <div key={item.id} className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-border">
                        <div className="flex justify-between font-semibold text-foreground">
                          <span>{item.quantity}x {item.name}</span>
                          <span>{formatBRL(item.total_price)}</span>
                        </div>
                        {itemOpts.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {itemOpts.map((o) => `${typeMap[o.option_type] || o.option_type}: ${o.option_name}`).join(' | ')}
                          </p>
                        )}
                        {item.notes && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 italic">
                            Obs: {item.notes}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="border-t pt-3 space-y-1.5 text-right font-medium">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatBRL(order.subtotal)}</span>
                </div>
                {order.delivery_fee > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxa de Entrega</span>
                    <span>{formatBRL(order.delivery_fee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-foreground border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>{formatBRL(order.total)}</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Link href="/cardapio" className="block w-full">
            <Button className="w-full h-12" variant="outline">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Ver Cardápio
            </Button>
          </Link>
          <Link href="/" className="block w-full">
            <Button className="w-full h-12" variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Página Inicial
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
