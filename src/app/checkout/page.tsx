import { getStoreStatus, getDeliveryZones } from '@/lib/store-data'
import { CheckoutClient } from '@/components/public/CheckoutClient'

export const unstable_instant = { prefetch: 'static', unstable_disableValidation: true }

export default async function CheckoutPage() {
  const [store, zones] = await Promise.all([
    getStoreStatus(),
    getDeliveryZones(),
  ])

  return <CheckoutClient store={store} zones={zones} />
}