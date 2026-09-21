export type SeasonStatus = 'draft' | 'upcoming' | 'current' | 'archived'
export type ProductStatus = 'draft' | 'available' | 'sold_out' | 'archived'
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'authorized' | 'paid' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded'
export type ShippingStatus = 'pending' | 'preparing' | 'posted' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned' | 'cancelled'

export type Season = {
  id: string
  number: number
  name: string
  slug: string
  theme: string
  description: string | null
  status: SeasonStatus | string
  start_at: string | null
  end_at: string | null
  cover_image_url: string | null
  banner_image_url: string | null
  mobile_banner_image_url: string | null
  sort_order: number
}

export type ProductImage = {
  id: string
  image_url: string
  alt_text: string | null
  is_primary: boolean
  sort_order: number
}

export type ProductVariant = {
  id: string
  fit: string
  size: string
  quantity: number
  sort_order: number
}

export type Product = {
  id: string
  name: string
  slug: string
  product_type: string
  description: string | null
  price: number
  sale_price: number | null
  effective_price: number
  status: ProductStatus | string
  is_featured: boolean
  featured_order: number | null
  sort_order: number
  total_available: number
  season: Season
  images: ProductImage[]
  variants: ProductVariant[]
}

export type SeasonInput = Omit<Season, 'id'>
export type ProductInput = {
  name: string
  slug: string
  product_type: string
  season_id: string
  description: string | null
  price: number
  sale_price: number | null
  status: ProductStatus
  is_featured: boolean
  featured_order: number | null
  sort_order: number
}

export type Customer = {
  id: string
  name: string
  email: string
  phone: string | null
  is_active: boolean
  email_verified_at: string | null
  marketing_opt_in: boolean
  created_at: string
}

export type CustomerRegisterInput = {
  name: string
  email: string
  phone?: string | null
  password: string
  marketing_opt_in?: boolean
}

export type AddressInput = {
  label?: string | null
  recipient_name: string
  phone?: string | null
  postal_code: string
  street: string
  number: string
  complement?: string | null
  neighborhood?: string | null
  city: string
  state: string
  country_code?: string
  is_default?: boolean
}

export type CustomerAddress = Required<Pick<AddressInput,
  'recipient_name' | 'postal_code' | 'street' | 'number' | 'city' | 'state'
>> & {
  id: string
  label: string | null
  phone: string | null
  complement: string | null
  neighborhood: string | null
  country_code: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export type ShippingAddressInput = Omit<AddressInput, 'label' | 'is_default'>

export type OrderCreateInput = {
  contact_name: string
  contact_email: string
  contact_phone?: string | null
  items: { variant_id: string; quantity: number }[]
  shipping_address: ShippingAddressInput
  shipping_method?: string | null
  customer_note?: string | null
}

export type OrderItem = {
  id: string
  product_id: string | null
  variant_id: string | null
  product_name: string
  product_slug: string | null
  product_type: string | null
  fit: string | null
  size: string | null
  image_url: string | null
  unit_price: number
  unit_discount: number
  quantity: number
  line_total: number
}

export type OrderAddress = {
  id: string
  kind: string
  recipient_name: string
  phone: string | null
  postal_code: string
  street: string
  number: string
  complement: string | null
  neighborhood: string | null
  city: string
  state: string
  country_code: string
}

export type OrderHistory = {
  id: string
  status_type: string
  old_status: string | null
  new_status: string
  title: string | null
  message: string | null
  source: string
  is_customer_visible: boolean
  tracking_code_snapshot: string | null
  created_at: string
}

export type OrderSummary = {
  id: string
  order_code: string
  contact_name: string
  contact_email: string
  status: string
  payment_status: string
  shipping_status: string
  total: number
  currency: string
  tracking_code: string | null
  created_at: string
  item_quantity: number
}

export type Order = {
  id: string
  order_code: string
  contact_name: string
  contact_email: string
  contact_phone: string | null
  status: string
  payment_status: string
  shipping_status: string
  currency: string
  subtotal: number
  discount_total: number
  shipping_total: number
  total: number
  shipping_method: string | null
  shipping_carrier: string | null
  shipping_service: string | null
  tracking_code: string | null
  tracking_url: string | null
  estimated_delivery_at: string | null
  shipped_at: string | null
  delivered_at: string | null
  customer_note: string | null
  paid_at: string | null
  cancelled_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  items: OrderItem[]
  addresses: OrderAddress[]
  history: OrderHistory[]
}

export type AdminOrder = Order & {
  customer_id: string | null
  admin_notes: string | null
  stock_status: string
  stock_reserved_until: string | null
}


export type ShippingQuoteRequest = {
  city: string
  state: string
  country_code: string
  items: Array<{
    variant_id: string
    quantity: number
  }>
}

export type ShippingQuote = {
  available: boolean
  zone_id: string | null
  zone_code: string | null
  method: string | null
  price: number | null
  subtotal_after_discount: number | null
  total: number | null
  estimated_days_min: number | null
  estimated_days_max: number | null
  reason: string | null
}

export type CheckoutSettings = {
  payment_provider: string
  payment_flow: string
  payment_enabled: boolean
  allow_pix: boolean
  allow_credit_card: boolean
  allow_ticket: boolean
  stock_reservation_minutes: number
}

export type ShippingZoneAdmin = {
  id: string
  code: string
  name: string
  description?: string | null
  is_active: boolean
  currency?: string
  flat_rate: number | null
  free_shipping_minimum: number | null
  estimated_days_min: number | null
  estimated_days_max: number | null
}

export type MercadoPagoCheckout = {
  order_code: string
  payment_id: string
  provider_order_id: string
  checkout_url: string
  status: string
  status_detail: string | null
  expires_at: string | null
}
