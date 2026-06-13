'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/stores/cart-store'
import { CartItem } from '@/types/cart'

const emptyState = {
  items: [] as CartItem[],
  addItem: (item: CartItem) => {},
  removeItem: (id: string) => {},
  updateQuantity: (id: string, quantity: number) => {},
  updateItemNotes: (id: string, notes: string) => {},
  clearCart: () => {},
  getItemCount: () => 0,
  getSubtotal: () => 0,
  isHydrated: false,
}

export function useCart() {
  const store = useCartStore()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return {
      ...emptyState,
      addItem: store.addItem,
      removeItem: store.removeItem,
      updateQuantity: store.updateQuantity,
      updateItemNotes: store.updateItemNotes,
      clearCart: store.clearCart,
    }
  }

  return {
    items: store.items,
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    updateItemNotes: store.updateItemNotes,
    clearCart: store.clearCart,
    getItemCount: store.getItemCount,
    getSubtotal: store.getSubtotal,
    isHydrated: true,
  }
}
