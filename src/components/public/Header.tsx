'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  BookOpen,
  Home,
  IceCream2,
  Menu,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useCartStore } from '@/stores/cart-store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useStoreStatus } from '@/hooks/useStoreStatus'
import { emitOpenCart } from '@/lib/cart-events'
import { formatBRL } from '@/lib/currency'
import { Store } from '@/types/database'

export function Header({ store: initialStore }: { store?: Store | null }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [cartAnimated, setCartAnimated] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const cartRef = useRef<HTMLDivElement>(null)
  const {
    items,
    removeItem,
    updateQuantity,
    getSubtotal,
    getItemCount,
  } = useCartStore()
  const itemCount = getItemCount()
  const subtotal = getSubtotal()
  const { store: clientStore } = useStoreStatus()
  const store = initialStore !== undefined ? initialStore : clientStore

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const animateCart = () => {
      setCartAnimated(true)
      window.setTimeout(() => setCartAnimated(false), 650)

      if (window.innerWidth >= 768) {
        setCartOpen(true)
      }
    }

    const openCart = () => {
      if (window.innerWidth >= 768) {
        setCartOpen(true)
      }
    }

    window.addEventListener('cart:item-added', animateCart)
    window.addEventListener('open-cart', openCart)

    return () => {
      window.removeEventListener('cart:item-added', animateCart)
      window.removeEventListener('open-cart', openCart)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setCartOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navItems = [
    { href: '/', label: 'Início', icon: Home },
    { href: '/cardapio', label: 'Cardápio', icon: BookOpen },
    { href: '/montar-acai', label: 'Montar Açaí', icon: IceCream2 },
  ]

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

  const handleBagClick = () => {
    if (window.innerWidth < 768) {
      emitOpenCart()
      return
    }

    setCartOpen((current) => !current)
  }

  return (
    <>
      <header
        className={cn(
          'fixed left-0 right-0 top-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-background/78 shadow-[0_18px_45px_-35px_rgba(74,14,46,0.85)] backdrop-blur-2xl'
            : 'bg-transparent'
        )}
      >
        <div className="container-custom">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[1.25rem] bg-[linear-gradient(145deg,#4a0e2e,#d84a5f)] shadow-[0_16px_35px_-18px_rgba(74,14,46,0.9)]">
                {store?.logo_url ? (
                  <Image
                    src={store.logo_url}
                    alt={store.name || 'Logo'}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <IceCream2 className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-acai-purple/65">
                  Fresh bowls
                </p>
                <span className="text-xl font-black tracking-tight text-acai-purple">
                  {store?.name || 'Açaí Top'}
                </span>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 rounded-full border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(255,241,230,0.92))] p-1 shadow-[0_18px_45px_-35px_rgba(74,14,46,0.8)] backdrop-blur xl:flex">
              {navItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="animate-fade-up rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,#fff7ef,#ffd7b0)] hover:text-acai-purple"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <div ref={cartRef} className="relative hidden md:block">
                <Button
                  variant="ghost"
                  onClick={handleBagClick}
                  className={cn(
                    'relative h-11 rounded-full border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(255,241,230,0.94))] px-4 text-acai-purple shadow-[0_18px_45px_-35px_rgba(74,14,46,0.75)] backdrop-blur hover:bg-white',
                    cartAnimated && 'animate-cart-bump ring-4 ring-acai-green/20'
                  )}
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  <span className="hidden text-sm font-semibold sm:inline">Sacola</span>
                  {itemCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ff7a59,#e63946)] px-1 text-[11px] font-bold text-white shadow-lg">
                      {itemCount}
                    </span>
                  )}
                </Button>

                {cartOpen && (
                  <div className="absolute right-0 top-[calc(100%+16px)] w-[26rem] overflow-hidden rounded-[2rem] border border-white/70 bg-[radial-gradient(circle_at_top,#fff7ef_0%,#fff3e8_35%,#f5d9e7_100%)] shadow-[0_35px_120px_-45px_rgba(74,14,46,0.7)] animate-drop-in">
                    <div className="border-b border-acai-purple/10 px-5 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-acai-purple/60">
                            Sacola ao vivo
                          </p>
                          <h3 className="mt-1 text-2xl font-black tracking-tight text-acai-purple">
                            {itemCount > 0 ? `${itemCount} itens prontos` : 'Sua sacola'}
                          </h3>
                        </div>
                        <div className="rounded-full bg-white/75 px-3 py-1 text-sm font-semibold text-acai-purple">
                          {formatBRL(subtotal)}
                        </div>
                      </div>
                    </div>

                    <div className="max-h-[26rem] overflow-y-auto px-5 py-4">
                      {items.length === 0 ? (
                        <div className="py-8 text-center">
                          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/80 shadow-inner">
                            <ShoppingBag className="h-9 w-9 text-acai-purple" />
                          </div>
                          <p className="mt-4 text-lg font-bold text-acai-purple">Sua sacola está vazia</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Adicione um bowl e acompanhe tudo daqui.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {items.slice(0, 4).map((item, index) => (
                            <div
                              key={item.id}
                              className="animate-fade-up rounded-[1.5rem] border border-white/70 bg-white/72 p-4 shadow-[0_16px_40px_-35px_rgba(74,14,46,0.55)]"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-bold text-foreground">{getItemLabel(item)}</p>
                                  {getItemDetails(item) && (
                                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                                      {getItemDetails(item)}
                                    </p>
                                  )}
                                  <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-acai-purple">
                                    <span>{formatBRL(item.totalPrice)}</span>
                                    <span className="text-muted-foreground">• {item.quantity}x</span>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
                                  onClick={() => removeItem(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center gap-1 rounded-2xl border border-acai-purple/10 bg-acai-cream/75 p-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-xl text-acai-purple hover:bg-white"
                                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-xl text-acai-purple hover:bg-white"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>

                                <span className="rounded-full bg-[linear-gradient(135deg,#fff6ee,#ffd7b0)] px-3 py-1 text-xs font-semibold text-acai-purple">
                                  Atualizado ao vivo
                                </span>
                              </div>
                            </div>
                          ))}

                          {items.length > 4 && (
                            <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-acai-purple/60">
                              +{items.length - 4} itens na sacola
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-acai-purple/10 bg-white/55 px-5 py-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Subtotal</p>
                          <p className="text-2xl font-black tracking-tight text-acai-purple">
                            {formatBRL(subtotal)}
                          </p>
                        </div>
                        <div className="hidden items-center gap-2 rounded-full bg-[linear-gradient(135deg,#fff6ee,#ffd7b0)] px-4 py-2 text-sm font-semibold text-acai-purple lg:flex">
                          <Sparkles className="h-4 w-4" />
                          Live adding
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Link href="/carrinho" className="flex-1" onClick={() => setCartOpen(false)}>
                          <Button variant="outline" className="h-12 w-full rounded-2xl bg-white/75">
                            Ver sacola
                          </Button>
                        </Link>
                        <Link href="/checkout" className="flex-1" onClick={() => setCartOpen(false)}>
                          <Button className="h-12 w-full rounded-2xl" size="lg">
                            Finalizar
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden items-center gap-2 rounded-full border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(255,241,230,0.92))] px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-acai-purple/70 lg:flex">
                <Sparkles className="h-3.5 w-3.5" />
                Pedido rápido
              </div>

              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-11 w-11 rounded-full border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(255,241,230,0.94))] text-acai-purple shadow-[0_18px_45px_-35px_rgba(74,14,46,0.75)] md:hidden',
                  cartAnimated && 'animate-cart-bump ring-4 ring-acai-green/20'
                )}
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute left-4 right-4 top-20 overflow-hidden rounded-[1.75rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,243,232,0.98))] shadow-[0_30px_80px_-40px_rgba(74,14,46,0.8)] animate-slide-down"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col gap-2 px-4 py-4">
              {navItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="animate-fade-up flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 hover:bg-[linear-gradient(135deg,#fff7ef,#ffd7b0)]"
                  style={{ animationDelay: `${index * 60}ms` }}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon className="h-5 w-5 text-acai-purple" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="h-20" />
    </>
  )
}
