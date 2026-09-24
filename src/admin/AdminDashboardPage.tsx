import { Link } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'

export function AdminDashboardPage() {
  const { seasons, products } = useCatalog()

  const current =
    seasons.find(s => s.status === 'current')

  const upcoming =
    seasons.find(s => s.status === 'upcoming')

  const stock =
    products.reduce(
      (sum, p) => sum + p.total_available,
      0
    )

  const lowStock =
    products
      .filter(
        p =>
          p.status === 'available'
          && p.total_available <= 5
      )
      .slice(0, 5)

  return (
    <div className="admin-page brand-admin-dashboard">
      <div className="admin-dashboard-hero lightning-admin-hero">
        <div>
          <small>PAINEL</small>

          <h1>Visão geral</h1>

          <p>
            Acompanhe temporada, produtos, estoque e pedidos.
          </p>

          <div className="admin-dashboard-actions">
            <Link
              className="admin-primary"
              to="/admin/produtos"
            >
              Gerenciar produtos
            </Link>

            <Link
              className="admin-secondary"
              to="/admin/pedidos"
            >
              Ver pedidos
            </Link>
          </div>
        </div>

        <div className="admin-dashboard-brand-art">
          <img
            src="/assets/brand-localz-graffiti.png"
            alt=""
          />

          <span>⚡</span>
          <span>⚡</span>
        </div>
      </div>

      <div className="admin-stats brand-admin-stats">
        <article>
          <span>Temporada atual</span>
          <strong>{current?.name ?? '—'}</strong>
        </article>

        <article>
          <span>Produtos</span>
          <strong>{products.length}</strong>
        </article>

        <article>
          <span>Peças em estoque</span>
          <strong>{stock}</strong>
        </article>

        <article>
          <span>Destaques</span>
          <strong>
            {products.filter(p => p.is_featured).length}
          </strong>
        </article>
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-brand-panel">
          <div className="admin-panel-head">
            <div>
              <small>PRÓXIMA TEMPORADA</small>
              <h2>
                {upcoming?.name ?? 'Sem temporada agendada'}
              </h2>
            </div>

            <span>⚡</span>
          </div>

          <div className="admin-next-drop">
            <p>
              {upcoming?.description
                ?? 'Cadastre uma temporada upcoming para preparar o próximo drop.'}
            </p>

            <Link to="/admin/temporadas">
              Editar temporadas ↗
            </Link>
          </div>
        </section>

        <section className="admin-brand-panel">
          <div className="admin-panel-head">
            <div>
              <small>ESTOQUE</small>
              <h2>Produtos com estoque baixo</h2>
            </div>

            <span>⚡</span>
          </div>

          {lowStock.length === 0 ? (
            <p className="admin-panel-empty">
              Nenhum produto com 5 peças ou menos.
            </p>
          ) : (
            <div className="admin-low-stock-list">
              {lowStock.map(product => (
                <div key={product.id}>
                  <span>{product.name}</span>
                  <strong>
                    {product.total_available}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
