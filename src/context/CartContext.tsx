import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react'
import { useCatalog } from './CatalogContext'

export type CartItem = {
  id: string
  variantId?: string
  fit: string
  size: string
  qty: number
}

type CartContextValue = {
  items: CartItem[]
  count: number
  subtotal: number
  toastVisible: boolean
  addItem: (
    id: string,
    variantId: string,
    fit: string,
    size: string,
    qty?: number
  ) => void
  removeItem: (index: number) => void
  clearCart: () => void
  clearToast: () => void
}

const STORAGE_KEY = 'gb_cart_v2'
const CartContext = createContext<CartContextValue | null>(null)

function readInitialCart(): CartItem[] {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? '[]'
    )

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(item =>
      item
      && typeof item.id === 'string'
      && typeof item.fit === 'string'
      && typeof item.size === 'string'
      && Number(item.qty) > 0
    )
  } catch {
    return []
  }
}

export function CartProvider({
  children
}: {
  children: ReactNode
}) {
  const {
    products,
    loading: catalogLoading,
    error: catalogError
  } = useCatalog()

  const [items, setItems] =
    useState<CartItem[]>(readInitialCart)

  const [toastVisible, setToastVisible] =
    useState(false)

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items)
    )
  }, [items])

  /*
   * V4.1:
   * - migra carrinho antigo (que tinha só fit/size)
   * - passa a vincular cada item ao UUID real da variante
   * - remove itens órfãos/inválidos que antes ficavam invisíveis
   *
   * Só roda depois que o catálogo terminou de carregar.
   * Se a API falhar, NÃO apagamos o carrinho.
   */
  useEffect(() => {
    if (catalogLoading || catalogError) {
      return
    }

    setItems(current => {
      const normalized: CartItem[] = []

      for (const item of current) {
        const product = products.find(
          product => product.id === item.id
        )

        if (!product) {
          continue
        }

        const variant =
          (
            item.variantId
              ? product.variants.find(
                  candidate =>
                    candidate.id === item.variantId
                )
              : undefined
          )
          ?? product.variants.find(
            candidate =>
              candidate.fit === item.fit
              && candidate.size === item.size
          )

        if (!variant) {
          continue
        }

        normalized.push({
          id: product.id,
          variantId: variant.id,
          fit: variant.fit,
          size: variant.size,
          qty: Math.max(
            1,
            Math.floor(Number(item.qty) || 1)
          )
        })
      }

      const before = JSON.stringify(current)
      const after = JSON.stringify(normalized)

      return before === after
        ? current
        : normalized
    })
  }, [
    products,
    catalogLoading,
    catalogError
  ])

  useEffect(() => {
    if (!toastVisible) {
      return
    }

    const timer = window.setTimeout(
      () => setToastVisible(false),
      3000
    )

    return () => window.clearTimeout(timer)
  }, [toastVisible])

  const addItem = (
    id: string,
    variantId: string,
    fit: string,
    size: string,
    qty = 1
  ) => {
    setItems(current => {
      const index = current.findIndex(
        item =>
          item.id === id
          && (
            item.variantId === variantId
            || (
              !item.variantId
              && item.fit === fit
              && item.size === size
            )
          )
      )

      if (index < 0) {
        return [
          ...current,
          {
            id,
            variantId,
            fit,
            size,
            qty
          }
        ]
      }

      return current.map((item, i) =>
        i === index
          ? {
              ...item,
              variantId,
              fit,
              size,
              qty: item.qty + qty
            }
          : item
      )
    })

    setToastVisible(true)
  }

  const count = items.reduce(
    (sum, item) => sum + item.qty,
    0
  )

  const subtotal = items.reduce(
    (sum, item) => {
      const product = products.find(
        product => product.id === item.id
      )

      return (
        sum
        + (product?.effective_price ?? 0)
        * item.qty
      )
    },
    0
  )

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      toastVisible,
      addItem,

      removeItem: (index: number) =>
        setItems(current =>
          current.filter((_, i) => i !== index)
        ),

      clearCart: () => setItems([]),

      clearToast: () =>
        setToastVisible(false)
    }),
    [
      items,
      count,
      subtotal,
      toastVisible
    ]
  )

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const value = useContext(CartContext)

  if (!value) {
    throw new Error(
      'useCart precisa estar dentro de CartProvider.'
    )
  }

  return value
}
