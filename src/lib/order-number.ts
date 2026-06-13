import { roundToTwoDecimals } from './currency'
import { createClient } from '@/lib/supabase/client'

export function generateOrderNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const dateStr = `${year}${month}${day}`
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `ACAI-${dateStr}-${random}`
}

export async function generateUniqueOrderNumber(): Promise<string> {
  const supabase = createClient()
  let attempts = 0
  const maxAttempts = 10
  while (attempts < maxAttempts) {
    const orderNumber = generateOrderNumber()
    const { data, error } = await supabase
      .from('orders')
      .select('order_number')
      .eq('order_number', orderNumber)
      .single()
    if (error || !data) {
      return orderNumber
    }
    attempts++
  }
  return generateOrderNumber()
}