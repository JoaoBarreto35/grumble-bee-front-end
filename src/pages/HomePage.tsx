import { Link } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { SeasonPicture } from '../components/SeasonPicture'
import { useCatalog } from '../context/CatalogContext'
import { pad, useCountdown } from '../hooks/useCountdown'
import {
  isPublicProduct,
  isPublicSeason,
  seasonCardImage
} from '../lib/catalog'

export function HomePage() {
  const {
    seasons,
    products,
    loading,
    error
  } = useCatalog()

  const visibleSeasons =
    seasons.filter(isPublicSeason)

  const current =
    visibleSeasons.find(
      season => season.status === 'current'
    )

  const upcoming = visibleSeasons
    .filter(
      season => season.status === 'upcoming'
    )
    .sort(
      (a, b) =>
        a.sort_order - b.sort_order
        || a.number - b.number
    )[0]

  const archived = visibleSeasons
    .filter(
      season => season.status === 'archived'
    )
    .sort(
      (a, b) => b.number - a.number
    )[0]

  const upcomingCountdown =
    useCountdown(
      upcoming?.start_at ?? null
    )

  const featured = products
    .filter(
      product =>
        product.is_featured
        && isPublicProduct(product)
    )
    .sort(
      (a, b) =>
        (a.featured_order ?? 999)
        - (b.featured_order ?? 999)
    )
    .slice(0, 4)

  if (loading) {
    return (
      <main className="section">
        <p>Carregando Grumble Bee...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="section">
        <p>{error}</p>
      </main>
    )
  }

  return (
    <main className="gb-home-clean">
      {current && (
        <section
          className="gb-home-hero"
          aria-label={`Temporada atual ${current.name}`}
        >
          <SeasonPicture
            season={current}
            className="gb-home-hero-picture"
            fallbackDesktop="/assets/colecao-anime-landscape.jpg"
            fallbackMobile="/assets/colecao-anime.jpg"
            alt={`Temporada ${current.name}`}
          />

          <div className="gb-home-hero-shade" />

          <span
            className="gb-home-hero-bolt"
            aria-hidden="true"
          >
            ⚡
          </span>

          <div className="gb-home-hero-copy">
            <div className="gb-home-hero-kicker">
              Temporada atual · {String(current.number).padStart(2, '0')}
            </div>

            <h1>{current.name}</h1>

            <p>
              {current.description
                ?? current.theme}
            </p>

            <div className="gb-home-hero-actions">
              <Link
                className="gb-home-primary"
                to="/colecao-atual"
              >
                Ver temporada
              </Link>

              <Link
                className="gb-home-secondary"
                to="/produtos"
              >
                Ver peças
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="gb-home-products">
        <div className="gb-home-section-head">
          <div>
            <small>
              {current
                ? `Temporada ${String(current.number).padStart(2, '0')}`
                : 'Grumble Bee'}
            </small>

            <h2>Produtos em destaque</h2>
          </div>

          <Link to="/produtos">
            Ver tudo
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="gb-home-product-track">
            {featured.map(product => (
              <div
                className="gb-home-product-card"
                key={product.id}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <p className="catalog-empty">
            Nenhum produto em destaque cadastrado.
          </p>
        )}
      </section>

      <section
        className="gb-home-editorial"
        id="editorial"
      >
        <div className="gb-home-editorial-copy">
          <small>Editorial</small>

          <h2>
            NO BASIC.
            <br />
            JUST IDENTITY.
          </h2>

          <p>
            Limited drops, custom pieces, only 012
          </p>

          <Link
            className="gb-home-editorial-cta"
            to="/produtos"
          >
            Ver produtos
          </Link>
        </div>

        <div
          className="gb-home-editorial-brand"
          aria-hidden="true"
        >
          <img
            src="/assets/logo-grumble-bee.png"
            alt=""
          />

          <span>⚡</span>
        </div>
      </section>

      <section className="gb-home-collections">
        <div className="gb-home-section-head">
          <div>
            <small>Coleções</small>

            <h2>
              Agora, antes
              <br />
              e depois.
            </h2>
          </div>

          <Link to="/colecoes">
            Ver coleções
          </Link>
        </div>

        <div className="gb-home-collection-list">
          {current && (
            <Link
              className="gb-home-collection-card gb-current-card"
              to="/colecao-atual"
              style={{
                backgroundImage:
                  `linear-gradient(0deg,rgba(0,0,0,.72),rgba(0,0,0,.05) 70%),url("${seasonCardImage(current, '/assets/colecao-anime-landscape.jpg')}")`
              }}
            >
              <div>
                <small>
                  Agora · Temporada {String(current.number).padStart(2, '0')}
                </small>

                <h3>
                  {current.name} Drop.
                </h3>

                <p>{current.theme}</p>
              </div>

              <span aria-hidden="true">⚡</span>
            </Link>
          )}

          {upcoming && (
            <Link
              className="gb-home-collection-card gb-upcoming-card"
              to="/em-breve"
              style={{
                backgroundImage:
                  `linear-gradient(0deg,rgba(0,0,0,.78),rgba(0,0,0,.16) 72%),url("${seasonCardImage(upcoming, '/assets/colecao-horror.jpg')}")`
              }}
            >
              <div>
                <small>Próxima temporada</small>

                <h3>
                  {upcoming.name}
                </h3>

                <p>
                  {upcoming.description
                    ?? upcoming.theme}
                </p>

                {upcoming.start_at
                  && !upcomingCountdown.done && (
                    <div className="gb-home-upcoming-count">
                      <div>
                        <strong>
                          {pad(upcomingCountdown.days)}
                        </strong>
                        <span>Dias</span>
                      </div>

                      <i>:</i>

                      <div>
                        <strong>
                          {pad(upcomingCountdown.hours)}
                        </strong>
                        <span>Horas</span>
                      </div>

                      <i>:</i>

                      <div>
                        <strong>
                          {pad(upcomingCountdown.minutes)}
                        </strong>
                        <span>Min</span>
                      </div>
                    </div>
                  )}
              </div>
            </Link>
          )}

          <Link
            className="gb-home-archive-card"
            to="/colecao-arquivo"
          >
            <div>
              <small>Arquivo</small>

              <h3>
                {archived?.name
                  ?? 'As que já passaram.'}
              </h3>

              <p>
                {archived?.description
                  ?? 'Peças encerradas continuam na história da marca — sem reposição.'}
              </p>
            </div>

            <span>ESGOTADO</span>
          </Link>
        </div>
      </section>
    </main>
  )
}
