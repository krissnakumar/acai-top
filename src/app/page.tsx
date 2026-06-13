import { getStoreStatus, getFeaturedProducts } from '@/lib/store-data'
import { HomePageClient } from '@/components/public/HomePageClient'

export const unstable_instant = { prefetch: 'static', unstable_disableValidation: true }

export default async function HomePage() {
  const [store, featuredProducts] = await Promise.all([
    getStoreStatus(),
    getFeaturedProducts(),
  ])

  return <HomePageClient store={store} featuredProducts={featuredProducts} />
}
