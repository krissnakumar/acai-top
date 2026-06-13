import { getStoreStatus, getCategories, getProducts } from '@/lib/store-data'
import { CardapioClient } from '@/components/public/CardapioClient'

export const unstable_instant = { prefetch: 'static', unstable_disableValidation: true }

export default async function CardapioPage() {
  const [store, categories, products] = await Promise.all([
    getStoreStatus(),
    getCategories(),
    getProducts(),
  ])

  return (
    <CardapioClient
      store={store}
      initialCategories={categories}
      initialProducts={products}
    />
  )
}
