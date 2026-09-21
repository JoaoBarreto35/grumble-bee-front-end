import type { Product, ProductImage, ProductInput, ProductVariant, Season, SeasonInput } from './types'

const KEY = 'gb_stackblitz_demo_v1'

type DemoState = {
  seasons: Season[]
  products: Product[]
}

const now = new Date()
const future = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30)
const later = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 60)
const oldStart = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 90)
const oldEnd = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 45)

const seasons: Season[] = [
  {
    id: 'demo-season-archive',
    number: 0,
    name: 'Arquivo 00',
    slug: 'arquivo-00',
    theme: 'Primeiros experimentos',
    description: 'Peças que já passaram pela história da Grumble Bee.',
    status: 'archived',
    start_at: oldStart.toISOString(),
    end_at: oldEnd.toISOString(),
    cover_image_url: '/assets/campanha-coach.jpg',
    banner_image_url: '/assets/campanha-coach.jpg',
    mobile_banner_image_url: '/assets/campanha-coach.jpg',
    sort_order: 0
  },
  {
    id: 'demo-season-anime',
    number: 1,
    name: 'Anime',
    slug: 'anime',
    theme: 'Anime',
    description: 'Artes exclusivas. Você não vai querer perder.',
    status: 'current',
    start_at: now.toISOString(),
    end_at: future.toISOString(),
    cover_image_url: '/assets/colecao-anime-landscape.jpg',
    banner_image_url: '/assets/colecao-anime-landscape.jpg',
    mobile_banner_image_url: '/assets/colecao-anime.jpg',
    sort_order: 1
  },
  {
    id: 'demo-season-horror',
    number: 2,
    name: 'Horror Story',
    slug: 'horror-story',
    theme: 'Cinema de horror',
    description: 'O próximo drop já está olhando de volta.',
    status: 'upcoming',
    start_at: later.toISOString(),
    end_at: null,
    cover_image_url: '/assets/colecao-horror.jpg',
    banner_image_url: '/assets/colecao-horror.jpg',
    mobile_banner_image_url: '/assets/colecao-horror.jpg',
    sort_order: 2
  }
]

const makeImage = (id: string, src: string, primary: boolean, order: number): ProductImage => ({
  id, image_url: src, alt_text: null, is_primary: primary, sort_order: order
})

const products: Product[] = [
  {
    id: 'demo-coach',
    name: 'Coach Jacket Amarela',
    slug: 'coach-jacket-amarela',
    product_type: 'jaqueta',
    description: 'Coach jacket leve com identidade de campanha e presença forte da cor de assinatura da Grumble Bee.',
    price: 339.9,
    sale_price: null,
    effective_price: 339.9,
    status: 'available',
    is_featured: true,
    featured_order: 1,
    sort_order: 1,
    total_available: 18,
    season: seasons[1],
    images: [
      makeImage('img-coach-1', '/assets/coach-amarela.jpg', true, 1),
      makeImage('img-coach-2', '/assets/campanha-coach.jpg', false, 2),
      makeImage('img-coach-3', '/assets/bomber-preta.jpg', false, 3)
    ],
    variants: [
      { id: 'var-c1', fit: 'oversized', size: 'P', quantity: 4, sort_order: 1 },
      { id: 'var-c2', fit: 'oversized', size: 'M', quantity: 6, sort_order: 2 },
      { id: 'var-c3', fit: 'oversized', size: 'G', quantity: 5, sort_order: 3 },
      { id: 'var-c4', fit: 'oversized', size: 'GG', quantity: 3, sort_order: 4 }
    ]
  },
  {
    id: 'demo-bomber',
    name: 'Bomber Preta',
    slug: 'bomber-preta',
    product_type: 'jaqueta',
    description: 'Jaqueta bomber preta com leitura clássica, acabamento urbano e silhueta para sobreposição.',
    price: 329.9,
    sale_price: 299.9,
    effective_price: 299.9,
    status: 'available',
    is_featured: true,
    featured_order: 2,
    sort_order: 2,
    total_available: 13,
    season: seasons[1],
    images: [
      makeImage('img-bomber-1', '/assets/bomber-preta.jpg', true, 1),
      makeImage('img-bomber-2', '/assets/varsity-vinho.jpg', false, 2)
    ],
    variants: [
      { id: 'var-b1', fit: 'normal', size: 'P', quantity: 3, sort_order: 1 },
      { id: 'var-b2', fit: 'normal', size: 'M', quantity: 5, sort_order: 2 },
      { id: 'var-b3', fit: 'normal', size: 'G', quantity: 5, sort_order: 3 }
    ]
  },
  {
    id: 'demo-varsity',
    name: 'Varsity Vinho',
    slug: 'varsity-vinho',
    product_type: 'jaqueta',
    description: 'Varsity vinho com construção inspirada em jaquetas clássicas e linguagem gráfica de coleção.',
    price: 349.9,
    sale_price: null,
    effective_price: 349.9,
    status: 'available',
    is_featured: true,
    featured_order: 3,
    sort_order: 3,
    total_available: 12,
    season: seasons[1],
    images: [
      makeImage('img-varsity-1', '/assets/varsity-vinho.jpg', true, 1),
      makeImage('img-varsity-2', '/assets/bomber-preta.jpg', false, 2)
    ],
    variants: [
      { id: 'var-v1', fit: 'oversized', size: 'P', quantity: 3, sort_order: 1 },
      { id: 'var-v2', fit: 'oversized', size: 'M', quantity: 5, sort_order: 2 },
      { id: 'var-v3', fit: 'oversized', size: 'G', quantity: 4, sort_order: 3 }
    ]
  },
  {
    id: 'demo-archive-product',
    name: 'Coach Jacket — Arquivo',
    slug: 'coach-jacket-arquivo',
    product_type: 'jaqueta',
    description: 'Peça encerrada de uma temporada anterior.',
    price: 319.9,
    sale_price: null,
    effective_price: 319.9,
    status: 'sold_out',
    is_featured: false,
    featured_order: null,
    sort_order: 1,
    total_available: 0,
    season: seasons[0],
    images: [makeImage('img-archive-1', '/assets/campanha-coach.jpg', true, 1)],
    variants: [
      { id: 'var-a1', fit: 'normal', size: 'P', quantity: 0, sort_order: 1 },
      { id: 'var-a2', fit: 'normal', size: 'M', quantity: 0, sort_order: 2 }
    ]
  }
]

function seed(): DemoState {
  return { seasons, products }
}

export function readDemo(): DemoState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as DemoState
  } catch {}
  const initial = seed()
  localStorage.setItem(KEY, JSON.stringify(initial))
  return initial
}

export function writeDemo(state: DemoState) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const demoApi = {
  reset() {
    const state = seed()
    writeDemo(state)
    return state
  },
  async catalog() {
    return readDemo()
  },
  async createSeason(input: SeasonInput) {
    const state = readDemo()
    if (input.status === 'current') {
      state.seasons = state.seasons.map(s => s.status === 'current' ? { ...s, status: 'archived' } : s)
    }
    const season: Season = { ...input, id: uid('season') }
    state.seasons.push(season)
    writeDemo(state)
    return season
  },
  async updateSeason(id: string, patch: Partial<SeasonInput>) {
    const state = readDemo()
    if (patch.status === 'current') {
      state.seasons = state.seasons.map(s => s.id !== id && s.status === 'current' ? { ...s, status: 'archived' } : s)
    }
    state.seasons = state.seasons.map(s => s.id === id ? { ...s, ...patch } : s)
    state.products = state.products.map(p => {
      const season = state.seasons.find(s => s.id === p.season.id)
      return season ? { ...p, season } : p
    })
    writeDemo(state)
  },
  async deleteSeason(id: string) {
    const state = readDemo()
    if (state.products.some(p => p.season.id === id)) throw new Error('Esta temporada possui produtos.')
    state.seasons = state.seasons.filter(s => s.id !== id)
    writeDemo(state)
  },
  async createProduct(input: ProductInput) {
    const state = readDemo()
    const season = state.seasons.find(s => s.id === input.season_id)
    if (!season) throw new Error('Temporada inválida.')
    const product: Product = {
      id: uid('product'),
      name: input.name,
      slug: input.slug,
      product_type: input.product_type,
      description: input.description,
      price: input.price,
      sale_price: input.sale_price,
      effective_price: input.sale_price ?? input.price,
      status: input.status,
      is_featured: input.is_featured,
      featured_order: input.featured_order,
      sort_order: input.sort_order,
      total_available: 0,
      season,
      images: [],
      variants: []
    }
    state.products.push(product)
    writeDemo(state)
    return product
  },
  async updateProduct(id: string, patch: Partial<ProductInput>) {
    const state = readDemo()
    state.products = state.products.map(p => {
      if (p.id !== id) return p
      const season = patch.season_id ? state.seasons.find(s => s.id === patch.season_id) ?? p.season : p.season
      const price = patch.price ?? p.price
      const sale = Object.prototype.hasOwnProperty.call(patch, 'sale_price') ? patch.sale_price ?? null : p.sale_price
      return {
        ...p,
        ...patch,
        season,
        price,
        sale_price: sale,
        effective_price: sale ?? price
      } as Product
    })
    writeDemo(state)
  },
  async deleteProduct(id: string) {
    const state = readDemo()
    state.products = state.products.filter(p => p.id !== id)
    writeDemo(state)
  },
  async addImage(productId: string, payload: Omit<ProductImage, 'id'>) {
    const state = readDemo()
    state.products = state.products.map(p => {
      if (p.id !== productId) return p
      const images = payload.is_primary ? p.images.map(i => ({ ...i, is_primary: false })) : p.images
      return { ...p, images: [...images, { ...payload, id: uid('image') }] }
    })
    writeDemo(state)
  },
  async deleteImage(imageId: string) {
    const state = readDemo()
    state.products = state.products.map(p => ({ ...p, images: p.images.filter(i => i.id !== imageId) }))
    writeDemo(state)
  },
  async addVariant(productId: string, payload: Omit<ProductVariant, 'id'>) {
    const state = readDemo()
    state.products = state.products.map(p => {
      if (p.id !== productId) return p
      if (p.variants.some(v => v.fit === payload.fit && v.size === payload.size)) {
        throw new Error('Essa combinação de modelagem e tamanho já existe.')
      }
      const variants = [...p.variants, { ...payload, id: uid('variant') }]
      return { ...p, variants, total_available: variants.reduce((sum, v) => sum + v.quantity, 0) }
    })
    writeDemo(state)
  },
  async updateVariant(variantId: string, patch: Partial<Omit<ProductVariant, 'id'>>) {
    const state = readDemo()
    state.products = state.products.map(p => {
      if (!p.variants.some(v => v.id === variantId)) return p
      const variants = p.variants.map(v => v.id === variantId ? { ...v, ...patch } : v)
      return { ...p, variants, total_available: variants.reduce((sum, v) => sum + v.quantity, 0) }
    })
    writeDemo(state)
  },
  async deleteVariant(variantId: string) {
    const state = readDemo()
    state.products = state.products.map(p => {
      const variants = p.variants.filter(v => v.id !== variantId)
      return { ...p, variants, total_available: variants.reduce((sum, v) => sum + v.quantity, 0) }
    })
    writeDemo(state)
  }
}


function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
    reader.readAsDataURL(file)
  })
}

export const demoUploadHelpers = {
  async uploadProductImage(
    productId: string,
    file: File,
    options?: {
      altText?: string
      isPrimary?: boolean
      sortOrder?: number
    }
  ) {
    const image_url = await fileToDataUrl(file)
    const state = readDemo()
    const product = state.products.find(p => p.id === productId)

    if (!product) {
      throw new Error('Produto não encontrado.')
    }

    const isPrimary = product.images.length === 0
      ? true
      : Boolean(options?.isPrimary)

    const images = isPrimary
      ? product.images.map(i => ({ ...i, is_primary: false }))
      : product.images

    const image: ProductImage = {
      id: uid('image'),
      image_url,
      alt_text: options?.altText ?? product.name,
      is_primary: isPrimary,
      sort_order: options?.sortOrder ?? product.images.length + 1
    }

    product.images = [...images, image]
    writeDemo(state)
    return image
  },

  async updateImage(
    imageId: string,
    patch: Partial<Omit<ProductImage, 'id'>>
  ) {
    const state = readDemo()

    state.products = state.products.map(product => {
      if (!product.images.some(image => image.id === imageId)) {
        return product
      }

      let images = product.images

      if (patch.is_primary === true) {
        images = images.map(image => ({
          ...image,
          is_primary: image.id === imageId
        }))
      } else {
        images = images.map(image =>
          image.id === imageId
            ? { ...image, ...patch }
            : image
        )
      }

      return { ...product, images }
    })

    writeDemo(state)
  },

  async uploadSeasonImage(
    seasonId: string,
    slot: 'cover' | 'banner' | 'mobile_banner',
    file: File
  ) {
    const imageUrl = await fileToDataUrl(file)
    const state = readDemo()

    state.seasons = state.seasons.map(season => {
      if (season.id !== seasonId) {
        return season
      }

      if (slot === 'cover') {
        return { ...season, cover_image_url: imageUrl }
      }

      if (slot === 'banner') {
        return { ...season, banner_image_url: imageUrl }
      }

      return {
        ...season,
        mobile_banner_image_url: imageUrl
      }
    })

    state.products = state.products.map(product => {
      const season = state.seasons.find(s => s.id === product.season.id)
      return season ? { ...product, season } : product
    })

    writeDemo(state)
  },

  async deleteSeasonImage(
    seasonId: string,
    slot: 'cover' | 'banner' | 'mobile_banner'
  ) {
    const state = readDemo()

    state.seasons = state.seasons.map(season => {
      if (season.id !== seasonId) {
        return season
      }

      if (slot === 'cover') {
        return { ...season, cover_image_url: null }
      }

      if (slot === 'banner') {
        return { ...season, banner_image_url: null }
      }

      return {
        ...season,
        mobile_banner_image_url: null
      }
    })

    state.products = state.products.map(product => {
      const season = state.seasons.find(s => s.id === product.season.id)
      return season ? { ...product, season } : product
    })

    writeDemo(state)
  }
}
