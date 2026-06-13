'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/stores/cart-store'
import { useStoreStatus } from '@/hooks/useStoreStatus'
import { checkoutSchema, CheckoutFormData } from '@/lib/validators'
import { generateUniqueOrderNumber } from '@/lib/order-number'
import { generateWhatsAppMessage, getWhatsAppLink } from '@/lib/whatsapp'
import { DeliveryZone, Store } from '@/types/database'
import { OrderSummary } from '@/types/order'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import { formatBRL } from '@/lib/currency'
import { showToast } from '@/components/ui/toast'
import { ShoppingBag, Truck, Store as StoreIcon, CreditCard, Banknote, QrCode, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CheckoutForm({ store: initialStore, zones: initialZones = [] }: { store?: Store | null, zones?: DeliveryZone[] }) {
  const router = useRouter()
  const { items, getSubtotal, clearCart } = useCartStore()
  const { store: clientStore } = useStoreStatus()
  const store = initialStore !== undefined ? initialStore : clientStore
  const [zones, setZones] = useState<DeliveryZone[]>(initialZones)
  const [submitting, setSubmitting] = useState(false)
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null)

  const subtotal = getSubtotal()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryType: 'pickup',
      paymentMethod: 'pix',
      needsChange: false,
    },
  })

  const deliveryType = watch('deliveryType')
  const paymentMethod = watch('paymentMethod')
  const needsChange = watch('needsChange')

  useEffect(() => {
    if (initialZones.length > 0) {
      setZones(initialZones)
      return
    }

    async function fetchZones() {
      const supabase = createClient()
      const { data } = await supabase
        .from('delivery_zones')
        .select('*')
        .eq('is_active', true)
        .order('name')
      setZones(data || [])
    }
    fetchZones()
  }, [initialZones])

  const deliveryFee = deliveryType === 'delivery' && selectedZone ? selectedZone.fee : 0
  const total = subtotal + deliveryFee

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      showToast('Adicione itens ao carrinho primeiro', 'error')
      return
    }

    setSubmitting(true)

    try {
      const supabase = createClient()
      const orderNumber = await generateUniqueOrderNumber()

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          store_id: store?.id,
          order_number: orderNumber,
          customer_name: data.customerName,
          customer_phone: data.customerPhone,
          delivery_type: data.deliveryType,
          address_street: data.addressStreet || null,
          address_number: data.addressNumber || null,
          address_complement: data.addressComplement || null,
          address_neighborhood: data.addressNeighborhood || null,
          address_reference: data.addressReference || null,
          delivery_zone_id: data.deliveryZoneId || null,
          payment_method: data.paymentMethod,
          needs_change: data.needsChange || false,
          change_for: data.changeFor || null,
          order_notes: data.orderNotes || null,
          subtotal,
          delivery_fee: deliveryFee,
          total,
          status: 'pending',
        })
        .select()
        .single()

      if (orderError) throw orderError

      for (const item of items) {
        const { data: orderItem, error: itemError } = await supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            product_id: item.type === 'product' ? item.productId : null,
            item_type: item.type,
            name: item.type === 'product' ? item.name : `${item.selection.sizeName} personalizado`,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total_price: item.totalPrice,
            notes: item.notes || null,
          })
          .select()
          .single()

        if (itemError) throw itemError

        if (item.type === 'custom_acai' && orderItem) {
          const options: { order_item_id: string; option_name: string; option_type: string; option_price: number }[] = []
          
          options.push({
            order_item_id: orderItem.id,
            option_name: item.selection.baseName,
            option_type: 'base',
            option_price: 0,
          })

          item.selection.fruits.forEach((f) => {
            options.push({
              order_item_id: orderItem.id,
              option_name: f.name,
              option_type: 'fruit',
              option_price: 0,
            })
          })

          item.selection.toppings.forEach((t) => {
            options.push({
              order_item_id: orderItem.id,
              option_name: t.name,
              option_type: 'topping',
              option_price: 0,
            })
          })

          item.selection.syrups.forEach((s) => {
            options.push({
              order_item_id: orderItem.id,
              option_name: s.name,
              option_type: 'syrup',
              option_price: 0,
            })
          })

          item.selection.extras.forEach((e) => {
            options.push({
              order_item_id: orderItem.id,
              option_name: e.name,
              option_type: 'paid_extra',
              option_price: e.price,
            })
          })

          if (options.length > 0) {
            await supabase.from('order_item_options').insert(options)
          }
        }
      }

      const orderSummary: OrderSummary = {
        orderNumber,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        deliveryType: data.deliveryType,
        address: data.deliveryType === 'delivery' ? {
          street: data.addressStreet || '',
          number: data.addressNumber || '',
          complement: data.addressComplement,
          neighborhood: data.addressNeighborhood || '',
          reference: data.addressReference,
        } : undefined,
        items: items.map((item) => ({
          name: item.type === 'product' ? item.name : `${item.selection.sizeName} personalizado`,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          notes: item.notes || undefined,
          options: item.type === 'custom_acai' ? [
            { name: item.selection.baseName, type: 'Base' },
            ...item.selection.fruits.map((f) => ({ name: f.name, type: 'Fruta' })),
            ...item.selection.toppings.map((t) => ({ name: t.name, type: 'Adicional' })),
            ...item.selection.syrups.map((s) => ({ name: s.name, type: 'Caldas' })),
            ...item.selection.extras.map((e) => ({ name: e.name, type: 'Extra', price: e.price })),
          ] : undefined,
        })),
        paymentMethod: data.paymentMethod,
        needsChange: data.needsChange,
        changeFor: data.changeFor,
        subtotal,
        deliveryFee,
        total,
        notes: data.orderNotes,
      }

      const message = generateWhatsAppMessage({
        storeName: store?.name || 'Açaí Top',
        storeWhatsApp: store?.whatsapp_number || '',
        order: orderSummary,
      })

      const whatsappUrl = getWhatsAppLink(store?.whatsapp_number || '', message)

      await supabase
        .from('orders')
        .update({ whatsapp_sent: true })
        .eq('id', order.id)

      clearCart()
      router.push(`/obrigado?orderId=${order.id}`)

      setTimeout(() => {
        window.open(whatsappUrl, '_blank')
      }, 500)
    } catch (error) {
      console.error('Error creating order:', error)
      showToast('Erro ao criar pedido. Tente novamente.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">Seu carrinho está vazio</p>
        <Button onClick={() => router.push('/cardapio')}>Ver cardápio</Button>
      </Card>
    )
  }

  const paymentMethods = [
    { value: 'pix', label: 'Pix', icon: QrCode },
    { value: 'cash', label: 'Dinheiro', icon: Banknote },
    { value: 'debit_card', label: 'Cartão de débito', icon: CreditCard },
    { value: 'credit_card', label: 'Cartão de crédito', icon: CreditCard },
    { value: 'pickup_payment', label: 'Pagar na retirada', icon: StoreIcon },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-4">Dados do cliente</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="customerName">Nome *</Label>
            <Input id="customerName" {...register('customerName')} placeholder="Seu nome" />
            {errors.customerName && (
              <p className="text-sm text-destructive mt-1">{errors.customerName.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="customerPhone">Telefone (com DDD) *</Label>
            <Input id="customerPhone" {...register('customerPhone')} placeholder="(11) 99999-9999" />
            {errors.customerPhone && (
              <p className="text-sm text-destructive mt-1">{errors.customerPhone.message}</p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-bold mb-4">Tipo de entrega</h2>
        <RadioGroup
          value={deliveryType}
          onValueChange={(val) => setValue('deliveryType', val as 'delivery' | 'pickup')}
          className="grid grid-cols-2 gap-3"
        >
          <label
            className={cn(
              'flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
              deliveryType === 'pickup'
                ? 'border-acai-purple bg-acai-purple/5'
                : 'border-border'
            )}
          >
            <RadioGroupItem value="pickup" id="pickup" />
            <div>
              <span className="font-medium">Retirada</span>
              <p className="text-xs text-muted-foreground">No local</p>
            </div>
          </label>
          <label
            className={cn(
              'flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
              deliveryType === 'delivery'
                ? 'border-acai-purple bg-acai-purple/5'
                : 'border-border'
            )}
          >
            <RadioGroupItem value="delivery" id="delivery" />
            <div>
              <span className="font-medium">Entrega</span>
              <p className="text-xs text-muted-foreground">Taxa variável</p>
            </div>
          </label>
        </RadioGroup>
      </Card>

      {deliveryType === 'delivery' && (
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">Endereço</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div>
                <Label htmlFor="addressStreet">Rua *</Label>
                <Input id="addressStreet" {...register('addressStreet')} placeholder="Nome da rua" />
                {errors.addressStreet && (
                  <p className="text-sm text-destructive mt-1">{errors.addressStreet.message}</p>
                )}
              </div>
              <div className="w-24">
                <Label htmlFor="addressNumber">Nº *</Label>
                <Input id="addressNumber" {...register('addressNumber')} placeholder="Nº" />
                {errors.addressNumber && (
                  <p className="text-sm text-destructive mt-1">{errors.addressNumber.message}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="addressComplement">Complemento</Label>
              <Input id="addressComplement" {...register('addressComplement')} placeholder="Apto, bloco, casa..." />
            </div>
            <div>
              <Label htmlFor="addressNeighborhood">Bairro *</Label>
              <Input id="addressNeighborhood" {...register('addressNeighborhood')} placeholder="Bairro" />
              {errors.addressNeighborhood && (
                <p className="text-sm text-destructive mt-1">{errors.addressNeighborhood.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="addressReference">Ponto de referência</Label>
              <Input id="addressReference" {...register('addressReference')} placeholder="Próximo à..." />
            </div>
            <div>
              <Label htmlFor="deliveryZoneId">Zona de entrega</Label>
              <select
                id="deliveryZoneId"
                {...register('deliveryZoneId')}
                onChange={(e) => {
                  const zone = zones.find((z) => z.id === e.target.value)
                  setSelectedZone(zone || null)
                  setValue('deliveryZoneId', e.target.value)
                }}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Selecione a zona</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} - {formatBRL(zone.fee)} ({zone.estimated_time || '30-60 min'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-lg font-bold mb-4">Forma de pagamento</h2>
        <RadioGroup
          value={paymentMethod}
          onValueChange={(val) => setValue('paymentMethod', val as CheckoutFormData['paymentMethod'])}
          className="space-y-2"
        >
          {paymentMethods.map((method) => {
            const Icon = method.icon
            return (
              <label
                key={method.value}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all',
                  paymentMethod === method.value
                    ? 'border-acai-purple bg-acai-purple/5'
                    : 'border-border'
                )}
              >
                <RadioGroupItem value={method.value} id={method.value} />
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="cursor-pointer">{method.label}</span>
              </label>
            )
          })}
        </RadioGroup>

        {paymentMethod === 'cash' && (
          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={needsChange}
                onCheckedChange={(checked) => setValue('needsChange', !!checked)}
              />
              <span className="text-sm">Precisa de troco?</span>
            </label>
            {needsChange && (
              <div>
                <Label htmlFor="changeFor">Troco para quanto?</Label>
                <Input
                  id="changeFor"
                  type="number"
                  step="0.01"
                  {...register('changeFor', { valueAsNumber: true })}
                  placeholder="0,00"
                />
              </div>
            )}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-bold mb-4">Observações</h2>
        <Textarea
          {...register('orderNotes')}
          placeholder="Alguma observação sobre o pedido?"
          rows={3}
        />
      </Card>

      <Card className="p-6 bg-muted/50">
        <h2 className="text-lg font-bold mb-4">Resumo</h2>
        <div className="space-y-2 mb-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.type === 'product' ? item.name : `${item.selection.sizeName} personalizado`}
              </span>
              <span>{formatBRL(item.totalPrice)}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatBRL(subtotal)}</span>
          </div>
          {deliveryFee > 0 && (
            <div className="flex justify-between">
              <span>Entrega</span>
              <span>{formatBRL(deliveryFee)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatBRL(total)}</span>
          </div>
        </div>
      </Card>

      <Button
        type="submit"
        className="w-full h-14 text-lg"
        size="lg"
        disabled={submitting || items.length === 0}
      >
        {submitting ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
        ) : (
          <>
            Enviar pedido pelo WhatsApp
            <ArrowRight className="w-5 h-5 ml-2" />
          </>
        )}
      </Button>
    </form>
  )
}
