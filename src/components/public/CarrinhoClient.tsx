'use client'

import Link from 'next/link'
import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatBRL } from '@/lib/currency'
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react'
import { Store } from '@/types/database'

export function CarrinhoClient({ store }: { store: Store | null }) {
  const { items, removeItem, updateQuantity, getSubtotal, getItemCount, clearCart } = useCart()
  const subtotal = getSubtotal()
  const itemCount = getItemCount()

  const getItemLabel = (item: typeof items[0]) => {
    if (item.type === 'product') return item.name
    return `${item.selection.sizeName} personalizado`
  }

  const getItemDetails = (item: typeof items[0]) => {
    if (item.type === 'product') return null
    const s = item.selection
    const parts: string[] = []
    parts.push(`Base: ${s.baseName}`)
    if (s.fruits.length > 0) parts.push(`Frutas: ${s.fruits.map(f => f.name).join(', ')}`)
    if (s.toppings.length > 0) parts.push(`Adicionais: ${s.toppings.map(t => t.name).join(', ')}`)
    if (s.syrups.length > 0) parts.push(`Caldas: ${s.syrups.map(s => s.name).join(', ')}`)
    if (s.extras.length > 0) parts.push(`Extras: ${s.extras.map(e => e.name).join(', ')}`)
    return parts
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header store={store} />
      <main className="flex-1">
        <div className="bg-[linear-gradient(135deg,#2d0817_0%,#4a0e2e_38%,#8c1853_68%,#e63946_100%)] py-12 text-white">
          <div className="container-custom">
            <h1 className="mb-2 text-4xl font-black tracking-tight">Carrinho</h1>
            <p className="text-white/70">{itemCount} {itemCount === 1 ? 'item' : 'itens'} no carrinho</p>
          </div>
        </div>

        <div className="container-custom py-8">
          {items.length === 0 ? (
            <Card className="rounded-[2rem] border-white/70 bg-white/80 p-12 text-center">
              <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-6">Seu carrinho está vazio</p>
              <div className="flex gap-3 justify-center">
                <Link href="/cardapio">
                  <Button>Ver cardápio</Button>
                </Link>
                <Link href="/montar-acai">
                  <Button variant="outline">Montar açaí</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-[1fr_360px] gap-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <Card key={item.id} className="rounded-[1.8rem] border-white/70 bg-white/80 p-4 shadow-[0_16px_50px_-35px_rgba(74,14,46,0.55)]">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold">{getItemLabel(item)}</h3>
                        <p className="text-sm text-acai-purple font-medium">
                          {formatBRL(item.unitPrice)} cada
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {getItemDetails(item) && (
                      <div className="text-xs text-muted-foreground space-y-1 mb-3">
                        {getItemDetails(item)!.map((detail, i) => (
                          <p key={i}>{detail}</p>
                        ))}
                      </div>
                    )}

                    {item.notes && (
                      <p className="text-xs text-muted-foreground mb-3">
                        Obs: {item.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-muted rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <span className="font-bold">{formatBRL(item.totalPrice)}</span>
                    </div>
                  </Card>
                ))}
              </div>

              <div>
                <Card className="sticky top-24 rounded-[2rem] border-white/70 bg-white/80 p-6 shadow-[0_18px_60px_-40px_rgba(74,14,46,0.55)]">
                  <h2 className="text-lg font-bold mb-4">Resumo</h2>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'itens'})</span>
                      <span>{formatBRL(subtotal)}</span>
                    </div>
                  </div>
                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{formatBRL(subtotal)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Taxa de entrega calculada no checkout
                    </p>
                  </div>
                  <Link href="/checkout" className="block">
                    <Button className="w-full" size="lg">
                      Finalizar pedido
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full mt-2"
                    onClick={clearCart}
                  >
                    Limpar carrinho
                  </Button>
                </Card>
              </div>
            </div>
          )}

          <div className="mt-6">
            <Link href="/cardapio">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continuar comprando
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer store={store} />
    </div>
  )
}
