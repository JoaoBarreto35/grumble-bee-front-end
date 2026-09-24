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

  const featured =
    products.filter(p => p.is_featured).length

  const available =
    products.filter(
      p => p.status === 'available'
    ).length

  return (
    <div className="admin-page brand-admin-dashboard">
      <div className="admin-dashboard-hero">
        <div>
          <small>CONTROL ROOM · 012</small>
          <h1>
            A colmeia<br />
            está operando.
          </h1>
          <p>
            Catálogo, drops, estoque e pedidos
            no mesmo radar.
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

        <img
          src="/assets/brand-localz-graffiti.png"
          alt=""
        />
      </div>

      <div className="admin-stats brand-admin-stats">
        <article>
          <span>Drop atual</span>
          <strong>{current?.name ?? '—'}</strong>
          <small>
            {current
              ? `TEMPORADA ${String(current.number).padStart(2, '0')}`
              : 'SEM TEMPORADA ATIVA'}
          </small>
        </article>

        <article>
          <span>Produtos ativos</span>
          <strong>{available}</strong>
          <small>{products.length} cadastrados</small>
        </article>

        <article>
          <span>Peças em estoque</span>
          <strong>{stock}</strong>
          <small>somando todas as variantes</small>
        </article>

        <article>
          <span>Grumble picks</span>
          <strong>{featured}</strong>
          <small>destaques na vitrine</small>
        </article>
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-brand-panel">
          <div className="admin-panel-head">
            <div>
              <small>PRÓXIMO SINAL</small>
              <h2>Próxima temporada</h2>
            </div>
            <span>⚡</span>
          </div>

          <div className="admin-next-drop">
            <strong>{upcoming?.name ?? 'Sem drop agendado'}</strong>
            <p>
              {upcoming?.description
                ?? 'Cadastre uma temporada upcoming para manter a fila da marca visível.'}
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
              <h2>Radar de baixa</h2>
            </div>
            <span>012</span>
          </div>

          {lowStock.length === 0 ? (
            <p className="admin-panel-empty">
              Nenhum produto com 5 peças ou menos.
            </p>
          ) : (
            <div className="admin-low-stock-list">
              {lowStock.map(product => (
                <div key={product.id}>
                  <span>
                    {product.name}
                  </span>
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
