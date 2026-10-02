import '../../styles/adminShared.module.css'
import '../../styles/adminSharedMobile.module.css'
import './styles.module.css'
import './stylesMobile.module.css'
import { Link } from 'react-router-dom'
import { useCatalog } from '../../../context/CatalogContext'

export function AdminDashboardPage() {
  const {
    seasons,
    products
  } = useCatalog()

  const current =
    seasons.find(
      season =>
        season.status === 'current'
    )

  const upcoming =
    seasons.find(
      season =>
        season.status === 'upcoming'
    )

  const stock =
    products.reduce(
      (sum, product) =>
        sum
        + product.total_available,
      0
    )

  const featured =
    products.filter(
      product =>
        product.is_featured
    ).length

  return (
    <div className="admin-page admin-dashboard-page">
      <div className="admin-page-head">
        <div>
          <small>PAINEL</small>
          <h1>Visão geral</h1>

          <p>
            Acompanhe o estado atual da loja
            e acesse as áreas principais.
          </p>
        </div>

        <a
          className="admin-secondary"
          href="/"
        >
          Abrir loja
        </a>
      </div>

      <div className="admin-stats">
        <article>
          <span>Temporada atual</span>

          <strong>
            {current?.name ?? '—'}
          </strong>

          <small>
            {current
              ? `Temporada ${String(
                  current.number
                ).padStart(2, '0')}`
              : 'Nenhuma ativa'}
          </small>
        </article>

        <article>
          <span>Produtos</span>

          <strong>
            {products.length}
          </strong>

          <small>
            cadastrados
          </small>
        </article>

        <article>
          <span>Peças em estoque</span>

          <strong>
            {stock}
          </strong>

          <small>
            unidades disponíveis
          </small>
        </article>

        <article>
          <span>Destaques</span>

          <strong>
            {featured}
          </strong>

          <small>
            na vitrine
          </small>
        </article>
      </div>

      <section className="admin-dashboard-grid">
        <article className="admin-dashboard-card">
          <small>AGORA</small>

          <h2>
            {current?.name
              ?? 'Sem temporada atual'}
          </h2>

          <p>
            Controle a temporada em exibição,
            seus banners e datas.
          </p>

          <Link to="/admin/temporadas">
            Gerenciar temporadas
          </Link>
        </article>

        <article className="admin-dashboard-card">
          <small>PRÓXIMO DROP</small>

          <h2>
            {upcoming?.name
              ?? 'Não definido'}
          </h2>

          <p>
            Prepare a próxima temporada
            antes da publicação.
          </p>

          <Link to="/admin/temporadas">
            Configurar próximo drop
          </Link>
        </article>

        <article className="admin-dashboard-card dark">
          <small>OPERAÇÃO</small>

          <h2>
            Produtos e estoque
          </h2>

          <p>
            Cadastre peças, imagens,
            variações e disponibilidade.
          </p>

          <Link to="/admin/produtos">
            Abrir produtos
          </Link>
        </article>

        <article className="admin-dashboard-card yellow">
          <small>PEDIDOS</small>

          <h2>
            Acompanhe as compras
          </h2>

          <p>
            Atualize pagamento, envio,
            rastreio e histórico.
          </p>

          <Link to="/admin/pedidos">
            Abrir pedidos
          </Link>
        </article>
      </section>
    </div>
  )
}
