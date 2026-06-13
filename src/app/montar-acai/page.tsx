import { getStoreStatus, getAcaiSizes, getAcaiOptions } from '@/lib/store-data'
import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'
import { CartDrawer } from '@/components/public/CartDrawer'
import { AcaiBuilder } from '@/components/public/AcaiBuilder'
import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'

export const unstable_instant = { prefetch: 'static', unstable_disableValidation: true }

export default async function MontarAcaiPage() {
  const [store, sizes, options] = await Promise.all([
    getStoreStatus(),
    getAcaiSizes(),
    getAcaiOptions(),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <Header store={store} />
      <main className="flex-1">
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#2d0817_0%,#4a0e2e_38%,#8c1853_66%,#e63946_100%)] py-14 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(255,183,3,0.18),transparent_24%)]" />
          <div className="container-custom relative">
            <Badge className="mb-4 border-white/15 bg-white/10 px-4 py-1.5 text-white">
              <Sparkles className="mr-2 h-4 w-4" />
              Builder imersivo
            </Badge>
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">Monte seu açaí com ritmo e impacto visual.</h1>
            <p className="mt-3 max-w-2xl text-white/74">
              Cada etapa dá feedback claro e o carrinho abre em popup assim que seu bowl ficar pronto.
            </p>
          </div>
        </div>

        <div className="container-custom py-8">
          <div className="rounded-[2.25rem] border border-white/70 bg-white/78 p-4 shadow-[0_22px_70px_-45px_rgba(74,14,46,0.55)] backdrop-blur md:p-6">
            <AcaiBuilder
              initialSizes={sizes}
              initialOptions={options}
            />
          </div>
        </div>
      </main>
      <Footer store={store} />
      <CartDrawer />
    </div>
  )
}
