import { createStaticClient } from './supabase/static'
import { Store, Product, Category, AcaiSize, AcaiOption, DeliveryZone } from '@/types/database'
import { cacheLife } from 'next/cache'

export async function getStoreStatus(): Promise<Store | null> {
  'use cache'
  cacheLife({ revalidate: 60 })
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', 'acai-top')
    .single()
  return data
}

export async function getFeaturedProducts(): Promise<Product[]> {
  'use cache'
  cacheLife({ revalidate: 60 })
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .eq('is_available', true)
    .limit(4)
  return data || []
}

export async function getCategories(): Promise<Category[]> {
  'use cache'
  cacheLife({ revalidate: 60 })
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  return data || []
}

export async function getProducts(): Promise<(Product & { category: Category | null })[]> {
  'use cache'
  cacheLife({ revalidate: 60 })
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_available', true)
    .order('sort_order')
  return data || []
}

export async function getAcaiSizes(): Promise<AcaiSize[]> {
  'use cache'
  cacheLife({ revalidate: 60 })
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('acai_sizes')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  return data || []
}

export async function getAcaiOptions(): Promise<AcaiOption[]> {
  'use cache'
  cacheLife({ revalidate: 60 })
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('acai_options')
    .select('*')
    .eq('is_available', true)
    .order('sort_order')
  return data || []
}

export async function getDeliveryZones(): Promise<DeliveryZone[]> {
  'use cache'
  cacheLife({ revalidate: 60 })
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('delivery_zones')
    .select('*')
    .eq('is_active', true)
    .order('name')
  return data || []
}
