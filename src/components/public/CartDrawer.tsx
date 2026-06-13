'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/stores/cart-store'
import { Button } from '@/components/ui/button'
import { formatBRL } from '@/lib/currency'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { emitOpenCart } from '@/lib/cart-events'
import { cn } from '@/lib/utils'

export function CartDrawer() {
  const [open, setOpen] = useState(false)
  const [cartAnimated, setCartAnimated] = useState(false)
  const { items, removeItem, updateQuantity, getSubtotal, getItemCount } = useCartStore()
  const itemCount = getItemCount()
  const subtotal = getSubtotal()

  useEffect(() => {
    const openHandler = () => {
      if (window.innerWidth < 768) {
        setOpen(true)
      }
    }

    const addHandler = () => {
      setCartAnimated(true)
      window.setTimeout(() => setCartAnimated(false), 650)
    }

    window.addEventListener('open-cart', openHandler)
    window.addEventListener('cart:item-added', addHandler)

    return () => {
      window.removeEventListener('open-cart', openHandler)
      window.removeEventListener('cart:item-added', addHandler)
    }
  }, [])

  const getItemLabel = (item: typeof items[0]) => {
    if (item.type === 'product') return item.name
    return `${item.selection.sizeName} personalizado`
  }

  const getItemDetails = (item: typeof items[0]) => {
    if (item.type === 'product') return null

    const parts: string[] = []
    parts.push(item.selection.baseName)
    if (item.selection.fruits.length > 0) {
      parts.push(item.selection.fruits.map((fruit) => fruit.name).join(', '))
    }
    return parts.join(' • ')
  }

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 md:hidden">
        <div className="container-custom pb-4">
          <Button
            onClick={emitOpenCart}
            className={cn(
              'h-16 w-full rounded-[1.6rem] bg-[linear-gradient(135deg,#ff8a5b_0%,#e85d75_48%,#7b173d_100%)] px-5 text-white shadow-[0_20px_45px_-20px_rgba(123,23,61,0.72)]',
              cartAnimated && 'animate-cart-bump ring-4 ring-[#ffd7b0]/50'
            )}
            size="lg"
          >
            <ShoppingBag className="mr-3 h-5 w-5" />
            <span className="flex flex-1 flex-col items-start text-left">
              <span className="text-sm font-semibold leading-none">Sacola ao vivo</span>
              <span className="mt-1 text-xs text-white/70">
                {itemCount} {itemCount === 1 ? 'item' : 'itens'} prontos
              </span>
            </span>
            <span className="text-base font-black">{formatBRL(subtotal)}</span>
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden border-white/60 bg-transparent p-0 shadow-none sm:max-w-2xl">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-[radial-gradient(circle_at_top,#fff7ef_0%,#fff2ea_35%,#f5d9e7_100%)] text-foreground shadow-[0_35px_120px_-45px_rgba(74,14,46,0.7)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.9),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(230,57,70,0.18),transparent_35%)]" />

            <div className="relative flex max-h-[85vh] flex-col">
              <div className="border-b border-acai-purple/10 px-6 py-5">
                <div className="flex items-start justify-between gap-4 pr-8">
                  <div>
                    <DialogTitle className="text-2xl font-black tracking-tight text-acai-purple">
                      Sua sacola
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm leading-6 text-muted-foreground">
                      {itemCount > 0
                        ? `${itemCount} ${itemCount === 1 ? 'item pronto' : 'itens prontos'} para o checkout`
                        : 'Escolha seus favoritos e acompanhe tudo daqui.'}
                    </DialogDescription>
                  </div>
                  <div className="hidden rounded-full border border-acai-purple/10 bg-white/70 px-4 py-2 text-sm font-semibold text-acai-purple md:block">
                    {formatBRL(subtotal)}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="relative mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-white/80 shadow-inner">
                      <span className="absolute inline-flex h-full w-full rounded-full border border-acai-purple/10 animate-pulse-ring" />
                      <ShoppingBag className="h-10 w-10 text-acai-purple" />
                    </div>
                    <h3 className="text-xl font-black tracking-tight text-acai-purple">Sua sacola ainda está vazia</h3>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                      Escolha um bowl, combine toppings e a gente guarda tudo aqui para você.
                    </p>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <Link href="/cardapio" onClick={() => setOpen(false)}>
                        <Button className="rounded-2xl">Explorar cardápio</Button>
                      </Link>
                      <Link href="/montar-acai" onClick={() => setOpen(false)}>
                        <Button variant="outline" className="rounded-2xl bg-white/80">
                          Montar meu açaí
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        className="animate-fade-up rounded-[1.6rem] border border-white/70 bg-white/72 p-4 shadow-[0_16px_50px_-35px_rgba(74,14,46,0.55)]"
                        style={{ animationDelay: `${index * 55}ms` }}
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="inline-flex rounded-full bg-[linear-gradient(135deg,#fff6ee,#ffd7b0)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-acai-purple/80">
                              {item.type === 'product' ? 'Produto' : 'Açaí personalizado'}
                            </div>
                            <h3 className="mt-2 text-lg font-bold text-foreground">{getItemLabel(item)}</h3>
                            {getItemDetails(item) && (
                              <p className="mt-1 text-xs leading-5 text-muted-foreground">{getItemDetails(item)}</p>
                            )}
                            <p className="text-sm font-medium text-acai-purple">
                              {formatBRL(item.unitPrice)} cada
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full text-destructive hover:bg-destructive/10"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1 rounded-2xl border border-acai-purple/10 bg-acai-cream/75 p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-xl text-acai-purple hover:bg-white"
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-xl text-acai-purple hover:bg-white"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <span className="text-lg font-black tracking-tight text-acai-purple">
                            {formatBRL(item.totalPrice)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t border-acai-purple/10 bg-white/55 px-6 py-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Subtotal da sacola</p>
                      <p className="text-2xl font-black tracking-tight text-acai-purple">{formatBRL(subtotal)}</p>
                    </div>
                    <div className="hidden items-center gap-2 rounded-full bg-[linear-gradient(135deg,#fff6ee,#ffd7b0)] px-4 py-2 text-sm font-semibold text-acai-purple md:flex">
                      <Sparkles className="h-4 w-4" />
                      Checkout rápido
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link href="/carrinho" className="flex-1" onClick={() => setOpen(false)}>
                      <Button variant="outline" className="h-12 w-full rounded-2xl bg-white/75">
                        Abrir página do carrinho
                      </Button>
                    </Link>
                    <Link href="/checkout" className="flex-1" onClick={() => setOpen(false)}>
                      <Button className="h-12 w-full rounded-2xl" size="lg">
                        Finalizar pedido
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
