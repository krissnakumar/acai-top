import { roundToTwoDecimals } from './currency'

export interface AcaiPriceBreakdown {
  basePrice: number
  extraToppingsCount: number
  extraToppingsCost: number
  extrasCost: number
  unitTotal: number
}

export function calculateCustomAcaiPrice(
  sizeBasePrice: number,
  maxFreeToppings: number,
  selectedToppingsCount: number,
  extras: { price: number }[]
): AcaiPriceBreakdown {
  const extraToppingsCount = Math.max(0, selectedToppingsCount - maxFreeToppings)
  const extraToppingsCost = roundToTwoDecimals(extraToppingsCount * EXTRA_TOPPING_PRICE)
  const extrasCost = roundToTwoDecimals(extras.reduce((sum, e) => sum + e.price, 0))
  const unitTotal = roundToTwoDecimals(sizeBasePrice + extraToppingsCost + extrasCost)

  return {
    basePrice: sizeBasePrice,
    extraToppingsCount,
    extraToppingsCost,
    extrasCost,
    unitTotal,
  }
}

export function calculateCartItemTotal(item: { unitPrice: number; quantity: number }): number {
  return roundToTwoDecimals(item.unitPrice * item.quantity)
}

export function calculateCartSubtotal(items: { totalPrice: number }[]): number {
  return roundToTwoDecimals(items.reduce((sum, item) => sum + item.totalPrice, 0))
}

export function calculateDeliveryFee(items: { totalPrice: number }[], zoneFee: number): number {
  const subtotal = calculateCartSubtotal(items)
  return subtotal > 0 ? zoneFee : 0
}

export function calculateOrderTotal(subtotal: number, deliveryFee: number): number {
  return roundToTwoDecimals(subtotal + deliveryFee)
}

export const EXTRA_TOPPING_PRICE = 2.0