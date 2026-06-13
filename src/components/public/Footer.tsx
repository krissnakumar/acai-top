'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ExternalLink, MapPin, Phone } from 'lucide-react'
import { useStoreStatus } from '@/hooks/useStoreStatus'
import { Badge } from '@/components/ui/badge'
import { Store } from '@/types/database'

export function Footer({ store: initialStore }: { store?: Store | null }) {
  const { store: clientStore, isStoreOpen: clientIsStoreOpen } = useStoreStatus()
  const store = initialStore !== undefined ? initialStore : clientStore
  const isStoreOpen = store ? store.is_open : clientIsStoreOpen

  const [currentYear, setCurrentYear] = useState<number | string>('')

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  const getInstagramHandle = () => {
    if (!store?.instagram_url) return null
    const match = store.instagram_url.match(/instagram\.com\/([^/?]+)/)
    return match ? `@${match[1]}` : 'Instagram'
  }

  const instagramHandle = getInstagramHandle()

  return (
    <footer className="relative overflow-hidden bg-[linear-gradient(135deg,#2d0817_0%,#4a0e2e_38%,#8c1853_72%,#e63946_100%)] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(255,183,3,0.18),transparent_24%)]" />

      <div className="container-custom relative py-16">
        <div className="mb-8 rounded-[2rem] border border-white/15 bg-white/8 p-6 backdrop-blur md:flex md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/65">
              Seu bowl em poucos cliques
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Visual gostoso, pedido mais rápido.
            </h2>
          </div>
          <div className="mt-4 md:mt-0">
            <Badge className="border-white/20 bg-white/15 px-4 py-2 text-white">
              {isStoreOpen ? 'Aceitando pedidos agora' : 'Loja fechada no momento'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-white/14">
                <span className="text-lg">🍓</span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Fresh energy</p>
                <span className="text-xl font-black tracking-tight">{store?.name || 'Açaí Top'}</span>
              </div>
            </div>
            <p className="max-w-sm text-sm leading-6 text-white/72">
              O melhor açaí da cidade. Feito com carinho e ingredientes selecionados.
            </p>
            <div className="mt-4">
              <Badge variant={isStoreOpen ? 'success' : 'destructive'} className="px-3 py-1">
                {isStoreOpen ? 'Aberto agora' : 'Fechado'}
              </Badge>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-white/62">Contato</h3>
            <div className="space-y-3 text-sm text-white/72">
              {store?.address && (
                <div className="flex items-start gap-2 rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{store.address}</span>
                </div>
              )}
              {store?.whatsapp_number && (
                <a
                  href={`https://wa.me/55${store.whatsapp_number.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 transition-colors hover:text-white"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{store.whatsapp_number}</span>
                </a>
              )}
              {store?.instagram_url && (
                <a
                  href={store.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 transition-colors hover:text-white"
                >
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  <span>{instagramHandle}</span>
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-white/62">Explorar</h3>
            <div className="space-y-2 text-sm">
              <Link href="/cardapio" className="block rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-white/72 transition-colors hover:text-white">
                Cardápio
              </Link>
              <Link href="/montar-acai" className="block rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-white/72 transition-colors hover:text-white">
                Montar meu Açaí
              </Link>
              <Link href="/carrinho" className="block rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-white/72 transition-colors hover:text-white">
                Carrinho
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/15 pt-8 text-center text-sm text-white/50">
          <p>&copy; {currentYear} {store?.name || 'Açaí Top'}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
