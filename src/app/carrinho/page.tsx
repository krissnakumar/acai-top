import { getStoreStatus } from '@/lib/store-data'
import { CarrinhoClient } from '@/components/public/CarrinhoClient'

export const unstable_instant = { prefetch: 'static', unstable_disableValidation: true }

export default async function CarrinhoPage() {
  const store = await getStoreStatus()

  return <CarrinhoClient store={store} />
}
