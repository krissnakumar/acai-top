'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Store } from '@/types/database'

export function useStoreStatus() {
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStore() {
      const supabase = createClient()
      const { data } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', 'acai-top')
        .single()
      setStore(data)
      setLoading(false)
    }
    fetchStore()
  }, [])

  const isStoreOpen = store?.is_open || false
  const acceptsWhenClosed = store?.accepts_orders_when_closed || false
  const canOrder = isStoreOpen || acceptsWhenClosed

  return {
    store,
    loading,
    isStoreOpen,
    acceptsWhenClosed,
    canOrder,
  }
}