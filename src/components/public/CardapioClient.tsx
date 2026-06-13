'use client'

import { useDeferredValue, useState } from 'react'
import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'
import { CartDrawer } from '@/components/public/CartDrawer'
import { ProductCard } from '@/components/public/ProductCard'
import { CategoryTabs } from '@/components/public/CategoryTabs'
import { Product, Category, Store } from '@/types/database'
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface CardapioClientProps {
  store: Store | null
  initialCategories: Category[]
  initialProducts: (Product & { category: Category | null })[]
}

export function CardapioClient({ store, initialCategories, initialProducts }: CardapioClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)

  const filteredProducts = initialProducts.filter((p) => {
    const matchCategory = !activeCategory || p.category_id === activeCategory
    const matchSearch = !deferredSearch || p.name.toLowerCase().includes(deferredSearch.toLowerCase())
    return matchCategory && matchSearch
  })

  const groupedProducts = initialCategories
    .map((cat) => ({
      category: cat,
      products: filteredProducts.filter((p) => p.category_id === cat.id),
    }))
    .filter((g) => g.products.length > 0)

  const uncategorizedProducts = filteredProducts.filter((p) => !p.category_id)

  return (
    <div className="flex min-h-screen flex-col">
      <Header store={store} />
      <main className="flex-1">
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#2d0817_0%,#4a0e2e_38%,#8c1853_68%,#e63946_100%)] py-14 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(255,183,3,0.18),transparent_20%)]" />
          <div className="container-custom relative">
            <Badge className="mb-4 border-white/15 bg-white/10 px-4 py-1.5 text-white">
              <Sparkles className="mr-2 h-4 w-4" />
              Cardápio vivo
            </Badge>
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">Escolha seu próximo vício favorito.</h1>
            <p className="mt-3 max-w-2xl text-white/74">
              Produtos com cara de destaque, busca instantânea e acesso rápido à sacola em popup.
            </p>
          </div>
        </div>

        <div className="container-custom py-8">
          <div className="mb-8 rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-[0_18px_60px_-40px_rgba(74,14,46,0.55)] backdrop-blur">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-acai-purple/70">
              <SlidersHorizontal className="h-4 w-4" />
              Filtre do seu jeito
            </div>
            <div className="relative mb-5">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-14 rounded-2xl border-white/70 bg-background/70 pl-11"
              />
            </div>
            <div className="mb-2">
              <CategoryTabs
                categories={initialCategories}
                activeCategoryId={activeCategory}
                onSelect={setActiveCategory}
              />
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-acai-purple/18 bg-white/65 py-16 text-center">
              <p className="text-lg font-semibold text-acai-purple">Nenhum produto encontrado</p>
              <p className="mt-2 text-muted-foreground">Tente outra busca ou remova o filtro atual.</p>
            </div>
          ) : (
            <>
              {groupedProducts.map((group) => (
                <div key={group.category.id} className="mb-10">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black tracking-tight text-acai-purple">{group.category.name}</h2>
                      <p className="text-sm text-muted-foreground">{group.products.length} opções prontas para pedir</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {group.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              ))}

              {uncategorizedProducts.length > 0 && (
                <div className="mb-8">
                  <h2 className="mb-4 text-2xl font-black tracking-tight text-acai-purple">Outros</h2>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {uncategorizedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer store={store} />
      <CartDrawer />
    </div>
  )
}
