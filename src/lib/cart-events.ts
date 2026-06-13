export interface CartItemAddedDetail {
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  imageUrl?: string | null
}

declare global {
  interface WindowEventMap {
    'cart:item-added': CustomEvent<CartItemAddedDetail>
    'open-cart': Event
  }
}

export function emitCartItemAdded(detail: CartItemAddedDetail) {
  window.dispatchEvent(new CustomEvent('cart:item-added', { detail }))
}

export function emitOpenCart() {
  window.dispatchEvent(new Event('open-cart'))
}
