import { OrderSummary, WhatsAppMessageData } from '@/types/order'
import { formatBRL } from './currency'
import { cleanPhone } from './utils'

function formatPaymentMethod(method: string): string {
  const methods: Record<string, string> = {
    pix: 'Pix',
    cash: 'Dinheiro',
    debit_card: 'Cartão de débito',
    credit_card: 'Cartão de crédito',
    pickup_payment: 'Pagar na retirada',
  }
  return methods[method] || method
}

function formatDeliveryType(type: string): string {
  return type === 'delivery' ? 'Entrega' : 'Retirada no local'
}

function formatOrderItems(items: OrderSummary['items']): string {
  return items
    .map((item) => {
      let text = `${item.quantity}x ${item.name} - ${formatBRL(item.totalPrice)}`
      if (item.options && item.options.length > 0) {
        const grouped: Record<string, string[]> = {}
        item.options.forEach((opt) => {
          const key = opt.type || 'Opções'
          if (!grouped[key]) grouped[key] = []
          grouped[key].push(opt.name)
        })
        Object.entries(grouped).forEach(([type, names]) => {
          text += `\n${type}: ${names.join(', ')}`
        })
      }
      if (item.notes) {
        text += `\nObservação: ${item.notes}`
      }
      return text
    })
    .join('\n\n')
}

export function generateWhatsAppMessage(data: WhatsAppMessageData): string {
  const { storeName, order } = data
  let message = `🛒 *Novo pedido - ${storeName}*\n\n`
  message += `📋 *Pedido: #${order.orderNumber}*\n\n`
  message += `👤 *Cliente:*\n`
  message += `Nome: ${order.customerName}\n`
  message += `Telefone: ${order.customerPhone}\n\n`
  message += `📦 *Tipo:*\n${formatDeliveryType(order.deliveryType)}\n\n`
  if (order.deliveryType === 'delivery' && order.address) {
    message += `📍 *Endereço:*\n`
    message += `${order.address.street}, ${order.address.number}\n`
    message += `Bairro: ${order.address.neighborhood}\n`
    if (order.address.complement) {
      message += `Complemento: ${order.address.complement}\n`
    }
    if (order.address.reference) {
      message += `Referência: ${order.address.reference}\n`
    }
    message += '\n'
  }
  message += `🛒 *Itens:*\n${formatOrderItems(order.items)}\n\n`
  message += `💳 *Pagamento:*\n${formatPaymentMethod(order.paymentMethod)}\n`
  if (order.needsChange && order.changeFor) {
    message += `Troco para: ${formatBRL(order.changeFor)}\n`
  }
  message += `\n💰 *Resumo:*\n`
  message += `Subtotal: ${formatBRL(order.subtotal)}\n`
  if (order.deliveryFee > 0) {
    message += `Entrega: ${formatBRL(order.deliveryFee)}\n`
  }
  message += `*Total: ${formatBRL(order.total)}*\n`
  if (order.notes) {
    message += `\n📝 *Observações:*\n${order.notes}\n`
  }
  return message
}

export function getWhatsAppLink(phone: string, message: string): string {
  const clean = cleanPhone(phone)
  const encoded = encodeURIComponent(message)
  return `https://wa.me/55${clean}?text=${encoded}`
}