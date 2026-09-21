import { API_URL } from './config'
import type {
  AddressInput,
  AdminOrder,
  Customer,
  CustomerAddress,
  CustomerRegisterInput,
  Order,
  OrderCreateInput,
  OrderSummary,
  PaymentStatus,
  Product,
  ProductImage,
  ProductInput,
  ProductVariant,
  Season,
  SeasonInput,
  ShippingStatus,
  OrderStatus,
  ShippingQuote,
  ShippingQuoteRequest,
  CheckoutSettings,
  ShippingZoneAdmin,
  MercadoPagoCheckout
} from './types'

type ProductListApi = { id: string; slug: string }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = init?.body instanceof FormData

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: isFormData
      ? { ...(init?.headers ?? {}) }
      : {
          'Content-Type': 'application/json',
          ...(init?.headers ?? {})
        }
  })

  if (!response.ok) {
    let detail = `Erro ${response.status}`
    try {
      const body = await response.json()
      if (Array.isArray(body.detail)) {
        detail = body.detail.map((item: { msg?: string }) => item.msg ?? 'Dados inválidos').join(' · ')
      } else {
        detail = body.detail ?? detail
      }
    } catch {}
    throw new Error(detail)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const remoteApi = {
  async catalog(): Promise<{ seasons: Season[]; products: Product[] }> {
    const [seasons, list] = await Promise.all([
      request<Season[]>('/seasons'),
      request<ProductListApi[]>('/products')
    ])
    const products = await Promise.all(list.map(item => request<Product>(`/products/${item.slug}`)))
    return { seasons, products }
  },

  // Admin auth
  async login(email: string, password: string) {
    return request('/admin/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
  },
  async me() { return request('/admin/auth/me') },
  async logout() { return request('/admin/auth/logout', { method: 'POST' }) },

  // Customer auth
  async customerRegister(input: CustomerRegisterInput) {
    return request<Customer>('/customer/auth/register', { method: 'POST', body: JSON.stringify(input) })
  },
  async customerLogin(email: string, password: string) {
    return request<Customer>('/customer/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
  },
  async customerMe() { return request<Customer>('/customer/auth/me') },
  async customerLogout() { return request('/customer/auth/logout', { method: 'POST' }) },
  async updateCustomer(patch: Partial<Pick<Customer, 'name' | 'phone' | 'marketing_opt_in'>>) {
    return request<Customer>('/customer/auth/me', { method: 'PATCH', body: JSON.stringify(patch) })
  },

  // Customer addresses
  async customerAddresses() { return request<CustomerAddress[]>('/customer/addresses') },
  async createCustomerAddress(input: AddressInput) {
    return request<CustomerAddress>('/customer/addresses', { method: 'POST', body: JSON.stringify(input) })
  },
  async updateCustomerAddress(id: string, patch: Partial<AddressInput>) {
    return request<CustomerAddress>(`/customer/addresses/${id}`, { method: 'PUT', body: JSON.stringify(patch) })
  },
  async deleteCustomerAddress(id: string) {
    return request<void>(`/customer/addresses/${id}`, { method: 'DELETE' })
  },

  // Public/customer orders
  async createOrder(input: OrderCreateInput) {
    return request<Order>('/orders', { method: 'POST', body: JSON.stringify(input) })
  },
  async lookupOrder(order_code: string, email: string) {
    return request<Order>('/orders/lookup', { method: 'POST', body: JSON.stringify({ order_code, email }) })
  },
  async myOrders() { return request<OrderSummary[]>('/customer/orders') },
  async myOrder(orderCode: string) { return request<Order>(`/customer/orders/${encodeURIComponent(orderCode)}`) },

  // Admin orders
  async adminOrders(params?: { q?: string; status?: string; payment_status?: string; shipping_status?: string }) {
    const search = new URLSearchParams()
    if (params?.q) search.set('q', params.q)
    if (params?.status) search.set('status', params.status)
    if (params?.payment_status) search.set('payment_status', params.payment_status)
    if (params?.shipping_status) search.set('shipping_status', params.shipping_status)
    const suffix = search.toString() ? `?${search}` : ''
    return request<OrderSummary[]>(`/admin/orders${suffix}`)
  },
  async adminOrder(id: string) { return request<AdminOrder>(`/admin/orders/${id}`) },
  async updateAdminOrderStatus(id: string, status: OrderStatus, message?: string, is_customer_visible = true) {
    return request<AdminOrder>(`/admin/orders/${id}/status`, {
      method: 'PATCH', body: JSON.stringify({ status, message: message || null, is_customer_visible })
    })
  },
  async updateAdminPayment(id: string, payment_status: PaymentStatus, message?: string, is_customer_visible = true) {
    return request<AdminOrder>(`/admin/orders/${id}/payment`, {
      method: 'PATCH', body: JSON.stringify({ payment_status, message: message || null, is_customer_visible })
    })
  },
  async updateAdminShipping(id: string, payload: {
    shipping_status: ShippingStatus
    shipping_carrier?: string | null
    shipping_service?: string | null
    tracking_code?: string | null
    tracking_url?: string | null
    estimated_delivery_at?: string | null
    message?: string | null
    is_customer_visible?: boolean
  }) {
    return request<AdminOrder>(`/admin/orders/${id}/shipping`, { method: 'PATCH', body: JSON.stringify(payload) })
  },
  async updateAdminNotes(id: string, admin_notes: string | null) {
    return request<AdminOrder>(`/admin/orders/${id}/notes`, { method: 'PATCH', body: JSON.stringify({ admin_notes }) })
  },

  // Existing catalog admin
  async createSeason(input: SeasonInput) { return request<Season>('/admin/seasons', { method: 'POST', body: JSON.stringify(input) }) },
  async updateSeason(id: string, patch: Partial<SeasonInput>) { return request<Season>(`/admin/seasons/${id}`, { method: 'PUT', body: JSON.stringify(patch) }) },
  async deleteSeason(id: string) { return request<void>(`/admin/seasons/${id}`, { method: 'DELETE' }) },
  async uploadSeasonImage(seasonId: string, slot: 'cover' | 'banner' | 'mobile_banner', file: File) {
    const form = new FormData(); form.append('slot', slot); form.append('file', file)
    return request<Season>(`/admin/seasons/${seasonId}/images/upload`, { method: 'POST', body: form })
  },
  async deleteSeasonImage(seasonId: string, slot: 'cover' | 'banner' | 'mobile_banner') {
    return request<Season>(`/admin/seasons/${seasonId}/images/${slot}`, { method: 'DELETE' })
  },
  async createProduct(input: ProductInput) { return request<Product>('/admin/products', { method: 'POST', body: JSON.stringify(input) }) },
  async updateProduct(id: string, patch: Partial<ProductInput>) { return request<Product>(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(patch) }) },
  async deleteProduct(id: string) { return request<void>(`/admin/products/${id}`, { method: 'DELETE' }) },
  async addImage(productId: string, payload: Omit<ProductImage, 'id'>) {
    return request<ProductImage>(`/admin/products/${productId}/images`, { method: 'POST', body: JSON.stringify(payload) })
  },
  async uploadProductImage(productId: string, file: File, options?: { altText?: string; isPrimary?: boolean; sortOrder?: number }) {
    const form = new FormData(); form.append('file', file)
    if (options?.altText) form.append('alt_text', options.altText)
    if (typeof options?.isPrimary === 'boolean') form.append('is_primary', String(options.isPrimary))
    if (typeof options?.sortOrder === 'number') form.append('sort_order', String(options.sortOrder))
    return request<ProductImage>(`/admin/products/${productId}/images/upload`, { method: 'POST', body: form })
  },
  async updateImage(imageId: string, patch: Partial<Omit<ProductImage, 'id'>>) {
    return request<ProductImage>(`/admin/images/${imageId}`, { method: 'PUT', body: JSON.stringify(patch) })
  },
  async deleteImage(imageId: string) { return request<void>(`/admin/images/${imageId}`, { method: 'DELETE' }) },
  async addVariant(productId: string, payload: Omit<ProductVariant, 'id'>) {
    return request<ProductVariant>(`/admin/products/${productId}/variants`, { method: 'POST', body: JSON.stringify(payload) })
  },
  async updateVariant(variantId: string, patch: Partial<Omit<ProductVariant, 'id'>>) {
    return request<ProductVariant>(`/admin/variants/${variantId}`, { method: 'PUT', body: JSON.stringify(patch) })
  },
  async deleteVariant(variantId: string) { return request<void>(`/admin/variants/${variantId}`, { method: 'DELETE' }) },

  // V5 - frete / checkout / Mercado Pago
  async shippingQuote(payload: ShippingQuoteRequest) {
    return request<ShippingQuote>('/shipping/quote', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  async checkoutSettings() {
    return request<CheckoutSettings>('/checkout/settings')
  },

  async createMercadoPagoCheckout(
    orderCode: string,
    email: string
  ) {
    return request<MercadoPagoCheckout>(
      '/payments/mercado-pago/checkout',
      {
        method: 'POST',
        body: JSON.stringify({
          order_code: orderCode,
          email
        })
      }
    )
  },

  async adminShippingZones() {
    return request<ShippingZoneAdmin[]>(
      '/admin/settings/shipping-zones'
    )
  },

  async updateAdminShippingZone(
    zoneId: string,
    patch: Partial<Pick<
      ShippingZoneAdmin,
      | 'is_active'
      | 'flat_rate'
      | 'free_shipping_minimum'
      | 'estimated_days_min'
      | 'estimated_days_max'
    >>
  ) {
    return request<ShippingZoneAdmin>(
      `/admin/settings/shipping-zones/${zoneId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(patch)
      }
    )
  },

  async adminCheckoutSettings() {
    return request<CheckoutSettings>(
      '/admin/settings/checkout'
    )
  },

  async updateAdminCheckoutSettings(
    patch: Partial<Pick<
      CheckoutSettings,
      | 'payment_enabled'
      | 'allow_pix'
      | 'allow_credit_card'
      | 'allow_ticket'
      | 'stock_reservation_minutes'
    >>
  ) {
    return request<CheckoutSettings>(
      '/admin/settings/checkout',
      {
        method: 'PATCH',
        body: JSON.stringify(patch)
      }
    )
  }

}
