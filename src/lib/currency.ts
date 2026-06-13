export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function parseBRL(value: string): number {
  const cleaned = value.replace(/[^\d,-]/g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}

export function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100
}

export function calculatePrice(basePrice: number, quantity: number): number {
  return roundToTwoDecimals(basePrice * quantity)
}

export function sumPrices(...prices: number[]): number {
  return roundToTwoDecimals(prices.reduce((sum, price) => sum + price, 0))
}