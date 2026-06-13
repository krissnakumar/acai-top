export interface Store {
  id: string
  owner_id: string
  name: string
  slug: string
  logo_url: string | null
  whatsapp_number: string
  instagram_url: string | null
  address: string | null
  google_maps_url: string | null
  is_open: boolean
  accepts_orders_when_closed: boolean
  pickup_enabled: boolean
  delivery_enabled: boolean
  minimum_order: number
  default_delivery_time: string | null
  show_unavailable_products: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  store_id: string
  name: string
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  store_id: string
  category_id: string | null
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean
  is_featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
  category?: Category
}

export interface AcaiSize {
  id: string
  store_id: string
  name: string
  ml: number | null
  base_price: number
  max_free_toppings: number
  max_free_fruits: number
  is_active: boolean
  sort_order: number
  created_at: string
  image_url?: string
}

export type AcaiOptionType = 'base' | 'fruit' | 'topping' | 'syrup' | 'cream' | 'paid_extra'

export interface AcaiOption {
  id: string
  store_id: string
  name: string
  type: AcaiOptionType
  price: number
  is_free: boolean
  is_available: boolean
  sort_order: number
  created_at: string
  image_url?: string
}

export interface DeliveryZone {
  id: string
  store_id: string
  name: string
  fee: number
  minimum_order: number
  estimated_time: string | null
  is_active: boolean
  created_at: string
}

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'out_for_delivery' | 'ready_for_pickup' | 'completed' | 'cancelled'
export type DeliveryType = 'delivery' | 'pickup'
export type PaymentMethod = 'pix' | 'cash' | 'debit_card' | 'credit_card' | 'pickup_payment'
export type ItemType = 'product' | 'custom_acai'

export interface Order {
  id: string
  store_id: string
  order_number: string
  customer_name: string
  customer_phone: string
  delivery_type: DeliveryType
  address_street: string | null
  address_number: string | null
  address_complement: string | null
  address_neighborhood: string | null
  address_reference: string | null
  delivery_zone_id: string | null
  payment_method: PaymentMethod
  needs_change: boolean
  change_for: number | null
  order_notes: string | null
  subtotal: number
  delivery_fee: number
  total: number
  status: OrderStatus
  whatsapp_sent: boolean
  created_at: string
  updated_at: string
  items?: OrderItem[]
  delivery_zone?: DeliveryZone
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  item_type: ItemType
  name: string
  quantity: number
  unit_price: number
  total_price: number
  notes: string | null
  created_at: string
  options?: OrderItemOption[]
}

export interface OrderItemOption {
  id: string
  order_item_id: string
  option_name: string
  option_type: string | null
  option_price: number
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: 'owner' | 'admin'
  store_id?: string | null
  created_at: string
}