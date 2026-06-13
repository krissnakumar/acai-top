export interface CartProductItem {
  id: string
  type: 'product'
  productId: string
  name: string
  price: number
  unitPrice: number
  totalPrice: number
  quantity: number
  notes: string
  image_url: string | null
}

export interface CustomAcaiSelection {
  sizeId: string
  sizeName: string
  sizePrice: number
  baseId: string
  baseName: string
  fruits: { id: string; name: string }[]
  toppings: { id: string; name: string }[]
  syrups: { id: string; name: string }[]
  extras: { id: string; name: string; price: number }[]
}

export interface CartAcaiItem {
  id: string
  type: 'custom_acai'
  selection: CustomAcaiSelection
  unitPrice: number
  totalPrice: number
  quantity: number
  notes: string
}

export type CartItem = CartProductItem | CartAcaiItem

export interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  updateItemNotes: (id: string, notes: string) => void
  clearCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
}