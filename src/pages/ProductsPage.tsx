import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { useCatalog } from '../context/CatalogContext'
import { isPublicProduct } from '../lib/catalog'

type SortValue = '' | 'price-asc' | 'price-desc' | 'name'

export function ProductsPage() {
  const { products, seasons } = useCatalog()
  const current = seasons.find(s => s.status === 'current')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sort, setSort] = useState<SortValue>('')
  const [sizes, setSizes] = useState<string[]>([])

  const availableSizes = useMemo(() =>
    [...new Set(products.flatMap(p => p.variants.map(v => v.size)))],
    [products]
  )

  const visibleProducts = useMemo(() => {
    const list = products.filter(product =>
      isPublicProduct(product)
      && (sizes.length === 0 || sizes.some(size => product.variants.some(v => v.size === size)))
    )
    const sorted = [...list]
    if (sort === 'price-asc') sorted.sort((a, b) => a.effective_price - b.effective_price)
    if (sort === 'price-desc') sorted.sort((a, b) => b.effective_price - a.effective_price)
    if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    return sorted
  }, [products, sort, sizes])

  const toggleSize = (size: string) =>
    setSizes(currentSizes => currentSizes.includes(size)
      ? currentSizes.filter(item => item !== size)
      : [...currentSizes, size])

  return (
    <main>
      <section className="page-hero">
        <div className="breadcrumb"><Link to="/">Início</Link> &gt; Produtos</div>
        <h1 className="page-title">{current?.name ?? 'Produtos'}</h1>
        <div className="catalog-tools">
          <button className="tool-btn" onClick={() => setFiltersOpen(value => !value)}>Filtrar</button>
          <select className="tool-select" value={sort} onChange={e => setSort(e.target.value as SortValue)}>
            <option value="">Ordenar por</option>
            <option value="price-asc">Menor preço</option>
            <option value="price-desc">Maior preço</option>
            <option value="name">A–Z</option>
          </select>
        </div>
      </section>

      <div className={`filter-panel${filtersOpen ? ' open' : ''}`}>
        <div className="filter-title">Tamanho</div>
        <div className="filter-sizes">
          {availableSizes.map(size => (
            <button key={size} className={`filter-chip${sizes.includes(size) ? ' active' : ''}`} onClick={() => toggleSize(size)}>{size}</button>
          ))}
        </div>
      </div>

      <section className="section">
        <div className="catalog-count">
          {visibleProducts.length} produtos {current ? `· Temporada ${String(current.number).padStart(2, '0')}` : ''}
        </div>
        <div className="grid">
          {visibleProducts.map(product => <ProductCard key={product.id} product={product} showSizes />)}
        </div>
      </section>
    </main>
  )
}
