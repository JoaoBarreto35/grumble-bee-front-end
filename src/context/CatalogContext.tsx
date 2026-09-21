import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react'
import { DEMO_MODE } from '../lib/config'
import { demoApi, demoUploadHelpers } from '../lib/demoStore'
import { remoteApi } from '../lib/api'
import type {
  Product,
  ProductImage,
  ProductInput,
  ProductVariant,
  Season,
  SeasonInput
} from '../lib/types'

type SeasonImageSlot = 'cover' | 'banner' | 'mobile_banner'

type CatalogValue = {
  demoMode: boolean
  seasons: Season[]
  products: Product[]
  loading: boolean
  error: string
  refresh: () => Promise<void>
  resetDemo: () => Promise<void>

  createSeason: (input: SeasonInput) => Promise<void>
  updateSeason: (
    id: string,
    patch: Partial<SeasonInput>
  ) => Promise<void>
  deleteSeason: (id: string) => Promise<void>

  uploadSeasonImage: (
    id: string,
    slot: SeasonImageSlot,
    file: File
  ) => Promise<void>

  deleteSeasonImage: (
    id: string,
    slot: SeasonImageSlot
  ) => Promise<void>

  createProduct: (input: ProductInput) => Promise<void>
  updateProduct: (
    id: string,
    patch: Partial<ProductInput>
  ) => Promise<void>
  deleteProduct: (id: string) => Promise<void>

  addImage: (
    productId: string,
    payload: Omit<ProductImage, 'id'>
  ) => Promise<void>

  uploadProductImage: (
    productId: string,
    file: File,
    options?: {
      altText?: string
      isPrimary?: boolean
      sortOrder?: number
    }
  ) => Promise<void>

  updateImage: (
    id: string,
    patch: Partial<Omit<ProductImage, 'id'>>
  ) => Promise<void>

  deleteImage: (id: string) => Promise<void>

  addVariant: (
    productId: string,
    payload: Omit<ProductVariant, 'id'>
  ) => Promise<void>

  updateVariant: (
    id: string,
    patch: Partial<Omit<ProductVariant, 'id'>>
  ) => Promise<void>

  deleteVariant: (id: string) => Promise<void>
}

const CatalogContext = createContext<CatalogValue | null>(null)

export function CatalogProvider({
  children
}: {
  children: ReactNode
}) {
  const [seasons, setSeasons] = useState<Season[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const api = DEMO_MODE ? demoApi : remoteApi

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await api.catalog()

      setSeasons(
        [...data.seasons].sort(
          (a, b) =>
            a.sort_order - b.sort_order
            || a.number - b.number
        )
      )

      setProducts(
        [...data.products].sort(
          (a, b) =>
            a.sort_order - b.sort_order
            || a.name.localeCompare(b.name, 'pt-BR')
        )
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao carregar catálogo.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const action = async (
    work: () => Promise<unknown>
  ) => {
    await work()
    await refresh()
  }

  const value = useMemo<CatalogValue>(() => ({
    demoMode: DEMO_MODE,
    seasons,
    products,
    loading,
    error,
    refresh,

    resetDemo: async () => {
      if (DEMO_MODE) {
        demoApi.reset()
      }
      await refresh()
    },

    createSeason: input =>
      action(() => api.createSeason(input)),

    updateSeason: (id, patch) =>
      action(() => api.updateSeason(id, patch)),

    deleteSeason: id =>
      action(() => api.deleteSeason(id)),

    uploadSeasonImage: (id, slot, file) =>
      action(() =>
        DEMO_MODE
          ? demoUploadHelpers.uploadSeasonImage(id, slot, file)
          : remoteApi.uploadSeasonImage(id, slot, file)
      ),

    deleteSeasonImage: (id, slot) =>
      action(() =>
        DEMO_MODE
          ? demoUploadHelpers.deleteSeasonImage(id, slot)
          : remoteApi.deleteSeasonImage(id, slot)
      ),

    createProduct: input =>
      action(() => api.createProduct(input)),

    updateProduct: (id, patch) =>
      action(() => api.updateProduct(id, patch)),

    deleteProduct: id =>
      action(() => api.deleteProduct(id)),

    addImage: (id, payload) =>
      action(() => api.addImage(id, payload)),

    uploadProductImage: (id, file, options) =>
      action(() =>
        DEMO_MODE
          ? demoUploadHelpers.uploadProductImage(
              id,
              file,
              options
            )
          : remoteApi.uploadProductImage(
              id,
              file,
              options
            )
      ),

    updateImage: (id, patch) =>
      action(() =>
        DEMO_MODE
          ? demoUploadHelpers.updateImage(id, patch)
          : remoteApi.updateImage(id, patch)
      ),

    deleteImage: id =>
      action(() => api.deleteImage(id)),

    addVariant: (id, payload) =>
      action(() => api.addVariant(id, payload)),

    updateVariant: (id, patch) =>
      action(() => api.updateVariant(id, patch)),

    deleteVariant: id =>
      action(() => api.deleteVariant(id))
  }), [
    seasons,
    products,
    loading,
    error,
    refresh
  ])

  return (
    <CatalogContext.Provider value={value}>
      {children}
    </CatalogContext.Provider>
  )
}

export function useCatalog() {
  const value = useContext(CatalogContext)

  if (!value) {
    throw new Error(
      'useCatalog precisa estar dentro de CatalogProvider.'
    )
  }

  return value
}

export function productPrimaryImage(product: Product) {
  return (
    product.images.find(image => image.is_primary)?.image_url
    ?? product.images[0]?.image_url
    ?? '/assets/logo_with_text_background.jpeg'
  )
}

export function money(value: number) {
  return Number(value).toLocaleString(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL'
    }
  )
}
