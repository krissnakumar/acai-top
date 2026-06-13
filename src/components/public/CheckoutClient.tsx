'use client'

import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'
import { CheckoutForm } from '@/components/public/CheckoutForm'
import { Store, DeliveryZone } from '@/types/database'

interface CheckoutClientProps {
  store: Store | null
  zones: DeliveryZone[]
}

export function CheckoutClient({ store, zones }: CheckoutClientProps) {
  const isStoreOpen = store?.is_open || false
  const acceptsWhenClosed = store?.accepts_orders_when_closed || false
  const canOrder = isStoreOpen || acceptsWhenClosed

  return (
    <div className="min-h-screen flex flex-col">
      <Header store={store} />
      <main className="flex-1">
        <div className="bg-gradient-to-br from-acai-purple to-purple-900 text-white py-12">
          <div className="container-custom">
            <h1 className="text-3xl font-bold mb-2">Finalizar pedido</h1>
            <p className="text-white/70">Preencha seus dados para enviar o pedido</p>
          </div>
        </div>

        <div className="container-custom py-8 max-w-2xl">
          {!canOrder && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-yellow-800 font-medium">
                A loja está fechada no momento. O pedido pode demorar mais que o habitual.
              </p>
            </div>
          )}
          <CheckoutForm store={store} zones={zones} />
        </div>
      </main>
      <Footer store={store} />
    </div>
  )
}
