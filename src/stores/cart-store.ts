import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, CartState, CartAcaiItem, CartProductItem } from '@/types/cart'
import { roundToTwoDecimals } from '@/lib/currency'

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item: CartItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex((existing) => {
            if (existing.type !== item.type) return false
            if (existing.type === 'product' && item.type === 'product') {
              return existing.productId === item.productId && existing.notes === item.notes
            }
            if (existing.type === 'custom_acai' && item.type === 'custom_acai') {
              return (
                existing.selection.sizeId === item.selection.sizeId &&
                existing.selection.baseId === item.selection.baseId &&
                JSON.stringify(existing.selection.fruits) ===
                  JSON.stringify(item.selection.fruits) &&
                JSON.stringify(existing.selection.toppings) ===
                  JSON.stringify(item.selection.toppings) &&
                JSON.stringify(existing.selection.syrups) ===
                  JSON.stringify(item.selection.syrups) &&
                JSON.stringify(existing.selection.extras) ===
                  JSON.stringify(item.selection.extras) &&
                existing.notes === item.notes
              )
            }
            return false
          })
          if (existingIndex >= 0) {
            const updated = [...state.items]
            const existing = updated[existingIndex]
            updated[existingIndex] = {
              ...existing,
              quantity: existing.quantity + item.quantity,
              totalPrice: roundToTwoDecimals(
                (existing.quantity + item.quantity) * existing.unitPrice
              ),
            }
            return { items: updated }
          }
          return { items: [...state.items, item] }
        })
      },
      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },
      updateQuantity: (id: string, quantity: number) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, quantity, totalPrice: roundToTwoDecimals(quantity * item.unitPrice) }
              : item
          ),
        }))
      },
      updateItemNotes: (id: string, notes: string) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, notes } : item
          ),
        }))
      },
      clearCart: () => {
        set({ items: [] })
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
      getSubtotal: () => {
        return roundToTwoDecimals(
          get().items.reduce((sum, item) => sum + item.totalPrice, 0)
        )
      },
    }),
    {
      name: 'acai-top-cart',
    }
  )
)