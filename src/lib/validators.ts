import { z } from 'zod'

export const checkoutSchema = z.object({
  customerName: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  customerPhone: z
    .string()
    .min(14, 'Telefone deve ter pelo menos 14 caracteres')
    .max(15, 'Telefone deve ter no máximo 15 caracteres'),
  deliveryType: z.enum(['delivery', 'pickup'], {
    message: 'Selecione o tipo de entrega',
  }),
  addressStreet: z.string().optional(),
  addressNumber: z.string().optional(),
  addressComplement: z.string().optional(),
  addressNeighborhood: z.string().optional(),
  addressReference: z.string().optional(),
  deliveryZoneId: z.string().optional(),
  paymentMethod: z.enum(['pix', 'cash', 'debit_card', 'credit_card', 'pickup_payment'], {
    message: 'Selecione a forma de pagamento',
  }),
  needsChange: z.boolean().optional(),
  changeFor: z.number().optional(),
  orderNotes: z.string().optional(),
}).refine(
  (data) => {
    if (data.deliveryType === 'delivery') {
      return !!data.addressStreet && data.addressStreet.length > 0
    }
    return true
  },
  {
    message: 'Rua é obrigatória para entrega',
    path: ['addressStreet'],
  }
).refine(
  (data) => {
    if (data.deliveryType === 'delivery') {
      return !!data.addressNumber && data.addressNumber.length > 0
    }
    return true
  },
  {
    message: 'Número é obrigatório para entrega',
    path: ['addressNumber'],
  }
).refine(
  (data) => {
    if (data.deliveryType === 'delivery') {
      return !!data.addressNeighborhood && data.addressNeighborhood.length > 0
    }
    return true
  },
  {
    message: 'Bairro é obrigatório para entrega',
    path: ['addressNeighborhood'],
  }
)

export const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  price: z.number().min(0.01, 'Preço deve ser maior que 0'),
  category_id: z.string().nullable().optional(),
  is_available: z.boolean(),
  is_featured: z.boolean(),
  sort_order: z.number().optional(),
})

export const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  sort_order: z.number().optional(),
  is_active: z.boolean(),
})

export const acaiSizeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  ml: z.number().optional(),
  base_price: z.number().min(0.01, 'Preço deve ser maior que 0'),
  max_free_toppings: z.number().min(0, 'Mínimo de 0'),
  max_free_fruits: z.number().min(0, 'Mínimo de 0'),
  is_active: z.boolean(),
  sort_order: z.number().optional(),
})

export const acaiOptionSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['base', 'fruit', 'topping', 'syrup', 'cream', 'paid_extra']),
  price: z.number().min(0, 'Preço não pode ser negativo'),
  is_free: z.boolean(),
  is_available: z.boolean(),
  sort_order: z.number().optional(),
})

export const deliveryZoneSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  fee: z.number().min(0, 'Taxa não pode ser negativa'),
  minimum_order: z.number().min(0, 'Pedido mínimo não pode ser negativo'),
  estimated_time: z.string().optional(),
  is_active: z.boolean(),
})

export const storeSettingsSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  whatsapp_number: z.string().min(10, 'Número de WhatsApp inválido'),
  instagram_url: z.string().optional(),
  address: z.string().optional(),
  google_maps_url: z.string().optional(),
  is_open: z.boolean(),
  accepts_orders_when_closed: z.boolean(),
  pickup_enabled: z.boolean(),
  delivery_enabled: z.boolean(),
  minimum_order: z.number().min(0),
  default_delivery_time: z.string().optional(),
  show_unavailable_products: z.boolean(),
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>
export type ProductFormData = z.infer<typeof productSchema>
export type CategoryFormData = z.infer<typeof categorySchema>
export type AcaiSizeFormData = z.infer<typeof acaiSizeSchema>
export type AcaiOptionFormData = z.infer<typeof acaiOptionSchema>
export type DeliveryZoneFormData = z.infer<typeof deliveryZoneSchema>
export type StoreSettingsFormData = z.infer<typeof storeSettingsSchema>