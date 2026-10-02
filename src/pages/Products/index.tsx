import '../../styles/customerShared.module.css'
import '../../styles/customerSharedMobile.module.css'
import './styles.module.css'
import './stylesMobile.module.css'
import {
  useMemo,
  useState
} from 'react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../../components/ProductCard'
import { useCatalog } from '../../context/CatalogContext'
import { isPublicProduct } from '../../lib/catalog'

type SortValue =
  | ''
  | 'price-asc'
  | 'price-desc'
  | 'name'

export function ProductsPage() {
  const {
    products,
    seasons
  } = useCatalog()

  const current =
    seasons.find(
      season =>
        season.status === 'current'
    )

  const [filtersOpen, setFiltersOpen] =
    useState(false)

  const [sort, setSort] =
    useState<SortValue>('')

  const [sizes, setSizes] =
    useState<string[]>([])

  const availableSizes = useMemo(
    () =>
      [
        ...new Set(
          products.flatMap(
            product =>
              product.variants.map(
                variant => variant.size
              )
          )
        )
      ],
    [products]
  )

  const visibleProducts = useMemo(() => {
    const list = products.filter(
      product =>
        isPublicProduct(product)
        && (
          sizes.length === 0
          || sizes.some(
            size =>
              product.variants.some(
                variant =>
                  variant.size === size
              )
          )
        )
    )

    const sorted = [...list]

    if (sort === 'price-asc') {
      sorted.sort(
        (a, b) =>
          a.effective_price
          - b.effective_price
      )
    }

    if (sort === 'price-desc') {
      sorted.sort(
        (a, b) =>
          b.effective_price
          - a.effective_price
      )
    }

    if (sort === 'name') {
      sorted.sort(
        (a, b) =>
          a.name.localeCompare(
            b.name,
            'pt-BR'
          )
      )
    }

    return sorted
  }, [
    products,
    sort,
    sizes
  ])

  const toggleSize = (
    size: string
  ) =>
    setSizes(currentSizes =>
      currentSizes.includes(size)
        ? currentSizes.filter(
            item => item !== size
          )
        : [
            ...currentSizes,
            size
          ]
    )

  return (
    <main className="gb5312-products-page">
      <section className="gb5312-public-hero">
        <div>
          <div className="gb5312-public-label">
            <span>Grumble Bee</span>
            <i />
            <span>Produtos</span>
          </div>

          <h1>
            Peças do
            <br />
            drop atual.
          </h1>

          <p>
            Explore as peças disponíveis e escolha
            a que combina com a sua identidade.
          </p>
        </div>

        <span
          className="gb5312-public-bolt"
          aria-hidden="true"
        >
          ⚡
        </span>
      </section>

      <section className="gb5312-catalog-tools">
        <button
          type="button"
          onClick={() =>
            setFiltersOpen(
              value => !value
            )
          }
          className={
            filtersOpen
              ? 'active'
              : ''
          }
        >
          Filtrar
          {sizes.length > 0
            ? ` (${sizes.length})`
            : ''}
        </button>

        <select
          value={sort}
          onChange={e =>
            setSort(
              e.target.value as SortValue
            )
          }
          aria-label="Ordenar produtos"
        >
          <option value="">
            Ordenar por
          </option>
          <option value="price-asc">
            Menor preço
          </option>
          <option value="price-desc">
            Maior preço
          </option>
          <option value="name">
            A–Z
          </option>
        </select>
      </section>

      {filtersOpen && (
        <section className="gb5312-filter-panel">
          <div>
            <small>TAMANHO</small>

            <button
              type="button"
              onClick={() =>
                setSizes([])
              }
            >
              Limpar
            </button>
          </div>

          <div className="gb5312-filter-sizes">
            {availableSizes.map(
              size => (
                <button
                  type="button"
                  key={size}
                  className={
                    sizes.includes(size)
                      ? 'active'
                      : ''
                  }
                  onClick={() =>
                    toggleSize(size)
                  }
                >
                  {size}
                </button>
              )
            )}
          </div>
        </section>
      )}

      <section className="gb5312-products-section">
        <div className="gb5312-products-head">
          <div>
            <small>
              {current
                ? `TEMPORADA ${String(
                    current.number
                  ).padStart(2, '0')}`
                : 'GRUMBLE BEE'}
            </small>

            <h2>
              Todos os
              <br />
              produtos.
            </h2>
          </div>

          <span>
            {visibleProducts.length}{' '}
            {visibleProducts.length === 1
              ? 'produto'
              : 'produtos'}
          </span>
        </div>

        {visibleProducts.length > 0 ? (
          <div className="gb5312-products-grid">
            {visibleProducts.map(
              product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showSizes
                />
              )
            )}
          </div>
        ) : (
          <div className="gb5312-public-empty">
            <span>⚡</span>

            <small>PRODUTOS</small>

            <h3>
              Nenhuma peça encontrada com esses filtros.
            </h3>

            <button
              type="button"
              onClick={() =>
                setSizes([])
              }
            >
              Limpar filtros
            </button>
          </div>
        )}
      </section>

      <section className="gb5312-yellow-bottom">
        <div>
          <small>GRUMBLE BEE</small>

          <h2>
            Limited drops.
            <br />
            Identidade em cada peça.
          </h2>
        </div>

        <Link to="/colecoes">
          Ver coleções
          <span>↗</span>
        </Link>
      </section>
    </main>
  )
}
