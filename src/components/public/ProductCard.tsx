'use client'

import Image from 'next/image'
import { Minus, Plus, ShoppingBag, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Product } from '@/types/database'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatBRL } from '@/lib/currency'
import { emitCartItemAdded } from '@/lib/cart-events'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, items } = useCart()
  const [quantity, setQuantity] = useState(1)

  const cartItem = items.find(
    (i) => i.type === 'product' && i.productId === product.id
  )
  const currentQuantity = cartItem?.quantity || 0

  const handleAdd = () => {
    const totalPrice = product.price * quantity

    addItem({
      id: `${product.id}-${Date.now()}`,
      type: 'product',
      productId: product.id,
      name: product.name,
      price: product.price,
      unitPrice: product.price,
      totalPrice,
      quantity,
      notes: '',
      image_url: product.image_url,
    })

    emitCartItemAdded({
      name: product.name,
      quantity,
      unitPrice: product.price,
      totalPrice,
      imageUrl: product.image_url,
    })

    setQuantity(1)
  }

  return (
    <Card className="group overflow-hidden border-white/65 bg-white/80 shadow-[0_18px_50px_-28px_rgba(74,14,46,0.4)] backdrop-blur transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_28px_70px_-28px_rgba(74,14,46,0.55)]">
      <div className="relative aspect-square bg-[radial-gradient(circle_at_top,#fff6ef,transparent_55%),linear-gradient(145deg,#fff7f1,#f7d9ea)]">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">
            🍇
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#200613]/80 via-transparent to-transparent" />

        {!product.is_available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-lg font-bold text-white">Indisponível</span>
          </div>
        )}

        <div className="absolute left-3 top-3 flex items-center gap-2">
          {product.is_featured && (
            <div className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Destaque
            </div>
          )}
        </div>

        {currentQuantity > 0 && (
          <div className="absolute right-3 top-3 rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-acai-purple shadow-lg">
            {currentQuantity} no carrinho
          </div>
        )}
      </div>

      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <div className="inline-flex rounded-full bg-acai-cream px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-acai-purple/80">
            Pronto para pedir
          </div>
          <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
          {product.description && (
            <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{product.description}</p>
          )}
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">A partir de</p>
            <p className="text-2xl font-black tracking-tight text-acai-purple">{formatBRL(product.price)}</p>
          </div>

          {currentQuantity > 0 && (
            <p className="text-right text-xs font-medium text-muted-foreground">
              Total no carrinho
              <span className="block text-sm font-semibold text-foreground">
                {formatBRL(currentQuantity * product.price)}
              </span>
            </p>
          )}
        </div>

        {product.is_available ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-2xl border border-acai-purple/10 bg-acai-cream/80 p-1 shadow-inner">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-acai-purple hover:bg-white"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-acai-purple hover:bg-white"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button onClick={handleAdd} className="h-11 flex-1 rounded-2xl" size="sm">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </div>
        ) : (
          <Button disabled className="w-full rounded-2xl" variant="outline">
            Indisponível
          </Button>
        )}
      </div>
    </Card>
  )
}
