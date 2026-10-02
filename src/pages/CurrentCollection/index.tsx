import './styles.module.css'
import './stylesMobile.module.css'
import { Link } from 'react-router-dom'
import { ProductCard } from '../../components/ProductCard'
import { SeasonPicture } from '../../components/SeasonPicture'
import { useCatalog } from '../../context/CatalogContext'
import { isPublicProduct } from '../../lib/catalog'

export function CurrentCollectionPage() {
  const {
    seasons,
    products,
    loading
  } = useCatalog()

  const season = seasons.find(
    item => item.status === 'current'
  )

  if (loading) {
    return (
      <main className="gb535-current-page">
        <section className="gb535-current-loading">
          Carregando temporada...
        </section>
      </main>
    )
  }

  if (!season) {
    return (
      <main className="gb535-current-page">
        <section className="gb535-current-empty">
          <small>GRUMBLE BEE</small>
          <h1>Nenhuma temporada atual.</h1>

          <Link to="/colecoes">
            Ver coleções
          </Link>
        </section>
      </main>
    )
  }

  const items = products
    .filter(
      product =>
        product.season.id === season.id
        && isPublicProduct(product)
    )
    .sort(
      (a, b) =>
        a.sort_order - b.sort_order
    )

  const availableItems = items.filter(
    product =>
      product.status === 'available'
      && product.total_available > 0
  )

  return (
    <main className="gb535-current-page">
      <section className="gb535-current-hero">
        <SeasonPicture
          season={season}
          className="gb535-current-hero-media"
          fallbackDesktop="/assets/colecao-anime-landscape.jpg"
          fallbackMobile="/assets/colecao-anime.jpg"
          alt={`Temporada ${season.name}`}
        />

        <div className="gb535-current-hero-overlay" />

        <div
          className="gb535-current-bolt"
          aria-hidden="true"
        >
          ⚡
        </div>

        <div className="gb535-current-hero-content">
          <div className="gb535-current-label">
            <span>Temporada atual</span>
            <i />
            <span>
              {String(season.number).padStart(2, '0')}
            </span>
          </div>

          <h1>{season.name}</h1>

          <p>
            {season.description
              ?? season.theme}
          </p>

          <div className="gb535-current-meta">
            <div>
              <strong>{items.length}</strong>
              <span>
                {items.length === 1
                  ? 'peça no drop'
                  : 'peças no drop'}
              </span>
            </div>

            <i />

            <div>
              <strong>
                {availableItems.length}
              </strong>
              <span>disponíveis agora</span>
            </div>
          </div>
        </div>
      </section>

      <section className="gb535-current-strip">
        <div>
          <strong>Drop atual</strong>
          <span>Peças únicas</span>
        </div>

        <b>⚡</b>

        <div>
          <strong>Estoque limitado</strong>
          <span>Por tamanho</span>
        </div>

        <b>⚡</b>

        <div>
          <strong>Compra segura</strong>
          <span>Pix e cartão</span>
        </div>
      </section>

      <section className="gb535-current-products">
        <div className="gb535-current-section-head">
          <div>
            <small>
              Temporada {String(season.number).padStart(2, '0')}
            </small>

            <h2>
              Peças da
              <br />
              temporada
            </h2>
          </div>

          <Link to="/produtos">
            Ver catálogo
          </Link>
        </div>

        {items.length > 0 ? (
          <div className="gb535-current-grid">
            {items.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                showSizes
              />
            ))}
          </div>
        ) : (
          <div className="gb535-current-no-products">
            <span>⚡</span>

            <div>
              <small>DROP ATUAL</small>
              <h3>
                Nenhum produto publicado nesta temporada.
              </h3>
            </div>
          </div>
        )}
      </section>

      <section className="gb535-current-editorial">
        <div>
          <small>GRUMBLE BEE</small>

          <h2>
            NO BASIC.
            <br />
            JUST IDENTITY.
          </h2>

          <p>
            Limited drops, custom pieces, only 012
          </p>
        </div>

        <span aria-hidden="true">⚡</span>
      </section>

      <section className="gb535-current-bottom">
        <div>
          <small>Coleções</small>

          <h2>
            Veja o que vem
            <br />
            depois.
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
