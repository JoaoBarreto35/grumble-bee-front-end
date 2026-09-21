import { useCatalog } from '../context/CatalogContext'

export function AdminDashboardPage() {
  const { seasons, products } = useCatalog()
  const current = seasons.find(s => s.status === 'current')
  const stock = products.reduce((sum, p) => sum + p.total_available, 0)
  return (
    <div className="admin-page">
      <div className="admin-page-head"><div><small>PAINEL</small><h1>Visão geral</h1></div></div>
      <div className="admin-stats">
        <article><span>Temporada atual</span><strong>{current?.name ?? '—'}</strong></article>
        <article><span>Produtos</span><strong>{products.length}</strong></article>
        <article><span>Peças em estoque</span><strong>{stock}</strong></article>
        <article><span>Destaques</span><strong>{products.filter(p => p.is_featured).length}</strong></article>
      </div>
    </div>
  )
}
