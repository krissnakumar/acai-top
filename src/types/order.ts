import { DeliveryType, PaymentMethod } from './database'

export interface OrderSummary {
  orderNumber: string
  customerName: string
  customerPhone: string
  deliveryType: DeliveryType
  address?: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    reference?: string
  }
  items: OrderSummaryItem[]
  paymentMethod: PaymentMethod
  needsChange?: boolean
  changeFor?: number
  subtotal: number
  deliveryFee: number
  total: number
  notes?: string
}

export interface OrderSummaryItem {
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  notes?: string
  options?: {
    name: string
    type?: string
    price?: number
  }[]
}

export interface WhatsAppMessageData {
  storeName: string
  storeWhatsApp: string
  order: OrderSummary
}