import { Suspense } from 'react'
import { getStoreStatus } from '@/lib/store-data'
import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'
import { ObrigadoClient } from '@/components/public/ObrigadoClient'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export const unstable_instant = { prefetch: 'static', unstable_disableValidation: true }

export default async function ObrigadoPage() {
  const store = await getStoreStatus()

  return (
    <div className="min-h-screen flex flex-col">
      <Header store={store} />
      <main className="flex-1 flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-950/20">
        <Suspense fallback={
          <Card className="p-8 text-center max-w-lg w-full">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-acai-purple mb-4" />
            <p className="text-muted-foreground">Carregando detalhes do seu pedido...</p>
          </Card>
        }>
          <ObrigadoClient />
        </Suspense>
      </main>
      <Footer store={store} />
    </div>
  )
}