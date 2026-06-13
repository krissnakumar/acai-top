'use client'

import Link from 'next/link'
import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'
import { CartDrawer } from '@/components/public/CartDrawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Product, Store } from '@/types/database'
import { ProductCard } from '@/components/public/ProductCard'
import {
  ArrowRight,
  Clock3,
  IceCream2,
  MapPin,
  Phone,
  Sparkles,
  Star,
  Truck,
  Zap,
} from 'lucide-react'

interface HomePageClientProps {
  store: Store | null
  featuredProducts: Product[]
}

export function HomePageClient({ store, featuredProducts }: HomePageClientProps) {
  const isStoreOpen = store?.is_open || false

  return (
    <div className="flex min-h-screen flex-col">
      <Header store={store} />
      <main className="flex-1 overflow-hidden">
        <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#2d0817_0%,#4a0e2e_36%,#8c1853_66%,#e63946_100%)] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,183,3,0.22),transparent_24%)]" />
          <div className="floating-orb left-[8%] top-28 h-28 w-28 bg-white/12" />
          <div className="floating-orb right-[12%] top-16 h-40 w-40 bg-acai-cream-dark/25" style={{ animationDelay: '1.2s' }} />
          <div className="floating-orb bottom-12 right-[35%] h-24 w-24 bg-white/10" style={{ animationDelay: '2.1s' }} />

          <div className="container-custom relative py-16 md:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-[1.12fr_0.88fr]">
              <div className="max-w-2xl">
                <Badge className="mb-5 border-white/15 bg-white/12 px-4 py-1.5 text-white">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Açaí fresco diariamente
                </Badge>

                <h1 className="max-w-xl text-5xl font-black leading-[0.96] tracking-tight md:text-7xl">
                  Um app com cara de sobremesa e vontade de pedir de novo.
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-8 text-white/78 md:text-xl">
                  Monte bowls irresistíveis, descubra combinações em destaque e finalize seu pedido com uma sacola animada, rápida e deliciosa de usar.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Link href="/montar-acai">
                    <Button size="xl" className="w-full rounded-2xl sm:w-auto">
                      <IceCream2 className="mr-2 h-5 w-5" />
                      Montar meu açaí
                    </Button>
                  </Link>
                  <Link href="/cardapio">
                    <Button
                      size="xl"
                      variant="outline"
                      className="w-full rounded-2xl border-white/30 bg-white/8 text-white hover:bg-white/14 sm:w-auto"
                    >
                      Ver cardápio
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>

                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  {[
                    { icon: Clock3, label: 'Pedido rápido', value: 'Fluxo ágil' },
                    { icon: Truck, label: 'Entrega fácil', value: 'ou retirada' },
                    { icon: Star, label: 'Combos em alta', value: 'mais desejados' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[1.6rem] border border-white/14 bg-white/10 p-4 backdrop-blur">
                      <item.icon className="h-5 w-5 text-acai-cream-dark" />
                      <p className="mt-4 text-sm font-medium text-white/72">{item.label}</p>
                      <p className="text-lg font-bold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-8 hidden w-52 rounded-[1.7rem] border border-white/18 bg-white/12 p-4 shadow-[0_25px_80px_-40px_rgba(0,0,0,0.7)] backdrop-blur lg:block animate-fade-up">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/65">Hit do dia</p>
                  <p className="mt-2 text-xl font-black">Açaí com morango, ninho e Nutella</p>
                  <p className="mt-2 text-sm text-white/75">Textura cremosa e acabamento brilhando na tela.</p>
                </div>

                <div className="relative rounded-[2.5rem] border border-white/16 bg-white/10 p-5 shadow-[0_35px_110px_-55px_rgba(0,0,0,0.8)] backdrop-blur">
                  <div className="absolute inset-x-8 top-6 h-20 rounded-full bg-white/10 blur-3xl" />
                  <div className="grid gap-4 md:grid-cols-[1.25fr_0.75fr]">
                    <div className="rounded-[2rem] bg-[linear-gradient(160deg,#fff8f1,#f6d9e7)] p-5 text-acai-purple shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                      <div className="aspect-[4/4.6] rounded-[1.7rem] bg-[radial-gradient(circle_at_top,#fff_0%,#ffe4d2_38%,#f1b2cc_100%)] p-5">
                        <div className="h-full rounded-[1.4rem] border border-acai-purple/8 bg-[linear-gradient(180deg,rgba(74,14,46,0.04),rgba(74,14,46,0.12))] p-5">
                          <div className="mx-auto flex h-full max-w-[18rem] flex-col justify-between rounded-[1.4rem] bg-[linear-gradient(180deg,#5c1238_0%,#8c1853_58%,#d03a68_100%)] p-5 text-white shadow-[0_28px_80px_-45px_rgba(74,14,46,0.9)]">
                            <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-white/65">
                              <span>Bowl signature</span>
                              <span>450ml</span>
                            </div>
                            <div className="space-y-3">
                              <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold">
                                <Zap className="h-3.5 w-3.5" />
                                Ultra cremoso
                              </div>
                              <h2 className="text-3xl font-black leading-tight">
                                Açaí com
                                <br />
                                banana e
                                <br />
                                granola
                              </h2>
                              <p className="text-sm leading-6 text-white/74">
                                Com frutas frescas, adicionais crocantes e finalização indulgente.
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs uppercase tracking-[0.22em] text-white/65">A partir de</p>
                                <p className="text-3xl font-black">R$ 16,90</p>
                              </div>
                              <div className="rounded-full bg-white/14 px-4 py-2 text-sm font-semibold">Peça já</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <div className="rounded-[1.8rem] border border-white/16 bg-[#fff5ec] p-5 text-acai-purple shadow-[0_25px_80px_-45px_rgba(0,0,0,0.75)]">
                        <p className="text-xs uppercase tracking-[0.22em] text-acai-purple/65">Experiência nova</p>
                        <p className="mt-2 text-2xl font-black leading-tight">Sacola em popup com feedback instantâneo.</p>
                      </div>
                      <div className="rounded-[1.8rem] border border-white/16 bg-white/12 p-5 backdrop-blur">
                        <p className="text-xs uppercase tracking-[0.22em] text-white/65">Destaques</p>
                        <div className="mt-4 space-y-3">
                          {['Morango fresco', 'Nutella cremosa', 'Granola crocante'].map((feature) => (
                            <div key={feature} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium">
                              <span className="h-2.5 w-2.5 rounded-full bg-acai-cream-dark" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-acai-purple/8 bg-white/65 backdrop-blur">
          <div className="container-custom py-6">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Badge variant={isStoreOpen ? 'success' : 'destructive'} className="px-4 py-2">
                {isStoreOpen ? 'Aberto agora' : 'Fechado'}
              </Badge>
              {store?.address && (
                <div className="inline-flex items-center gap-2 rounded-full border border-acai-purple/10 bg-white px-4 py-2 text-sm text-muted-foreground shadow-sm">
                  <MapPin className="h-4 w-4 text-acai-purple" />
                  <span>{store.address}</span>
                </div>
              )}
              {store?.delivery_enabled && (
                <div className="inline-flex items-center gap-2 rounded-full border border-acai-purple/10 bg-white px-4 py-2 text-sm text-muted-foreground shadow-sm">
                  <Truck className="h-4 w-4 text-acai-green" />
                  <span>Entrega disponível</span>
                </div>
              )}
              {store?.whatsapp_number && (
                <a
                  href={`https://wa.me/55${store.whatsapp_number.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-acai-purple/10 bg-white px-4 py-2 text-sm font-medium text-acai-purple shadow-sm transition hover:-translate-y-0.5"
                >
                  <Phone className="h-4 w-4" />
                  <span>Chamar no WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </section>

        <section className="bg-[linear-gradient(180deg,rgba(255,241,230,0.65),rgba(255,255,255,0.35))] py-8">
          <div className="container-custom">
            <div className="grid gap-4 md:grid-cols-4">
              {[
                'Base cremosa de açaí',
                'Frutas frescas todo dia',
                'Toppings que brilham',
                'Checkout pronto em segundos',
              ].map((item, index) => (
                <div
                  key={item}
                  className="animate-fade-up rounded-[1.6rem] border border-white/70 bg-white/80 px-5 py-4 text-sm font-medium text-acai-purple shadow-[0_18px_50px_-35px_rgba(74,14,46,0.55)]"
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {featuredProducts.length > 0 && (
          <section className="py-20">
            <div className="container-custom">
              <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <Badge className="border-acai-purple/10 bg-acai-cream px-4 py-1.5 text-acai-purple">
                    Seleção favorita
                  </Badge>
                  <h2 className="mt-4 text-3xl font-black tracking-tight text-acai-purple md:text-4xl">
                    Destaques com cara de hit do cardápio
                  </h2>
                  <p className="mt-3 max-w-2xl text-muted-foreground">
                    Produtos com visual forte, preço claro e interação pronta para converter mais rápido.
                  </p>
                </div>
                <Link href="/cardapio">
                  <Button variant="outline" size="lg" className="rounded-2xl bg-white/80">
                    Ver cardápio completo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="pb-20">
          <div className="container-custom">
            <div className="grid gap-6 lg:grid-cols-3">
              {[
                {
                  icon: IceCream2,
                  title: 'Monte sem fricção',
                  text: 'Fluxo em etapas com animações leves para o cliente sentir progresso a cada escolha.',
                },
                {
                  icon: Truck,
                  title: 'Peça e acompanhe',
                  text: 'Entrega ou retirada com informação clara e checkout sempre a poucos toques.',
                },
                {
                  icon: Sparkles,
                  title: 'Sacola com presença',
                  text: 'Adicionar ao carrinho agora vira popup moderno, com resumo instantâneo e CTA forte.',
                },
              ].map((feature, index) => (
                <div
                  key={feature.title}
                  className="animate-fade-up rounded-[2rem] border border-white/70 bg-white/82 p-6 shadow-[0_18px_60px_-40px_rgba(74,14,46,0.55)]"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-[linear-gradient(145deg,#fff5ec,#f6d9e7)] text-acai-purple shadow-inner">
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 text-2xl font-black tracking-tight text-acai-purple">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer store={store} />
      <CartDrawer />
    </div>
  )
}
