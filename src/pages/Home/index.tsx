import './styles.module.css'
import './stylesMobile.module.css'
import { Link } from 'react-router-dom'
import { ProductCard } from '../../components/ProductCard'
import { SeasonPicture } from '../../components/SeasonPicture'
import { useCatalog } from '../../context/CatalogContext'
import { pad, useCountdown } from '../../hooks/useCountdown'
import {
  isPublicProduct,
  isPublicSeason,
  seasonCardImage
} from '../../lib/catalog'

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
    <main className="gb534-home">
      {current && (
        <section className="gb534-hero">
          <SeasonPicture
            season={current}
            className="gb534-hero-media"
            fallbackDesktop="/assets/colecao-anime-landscape.jpg"
            fallbackMobile="/assets/colecao-anime.jpg"
            alt={`Temporada ${current.name}`}
          />

          <div className="gb534-hero-overlay" />

          <div
            className="gb534-hero-lightning"
            aria-hidden="true"
          >
            ⚡
          </div>

          <div className="gb534-hero-content">
            <div className="gb534-eyebrow">
              <span>Temporada atual</span>
              <i />
              <span>
                {String(current.number).padStart(2, '0')}
              </span>
            </div>

            <h1>{current.name}</h1>

            <p>
              {current.description
                ?? current.theme}
            </p>

            <div className="gb534-hero-actions">
              <Link
                to="/colecao-atual"
                className="gb534-button gb534-button-primary"
              >
                Ver temporada
              </Link>

              <Link
                to="/produtos"
                className="gb534-button gb534-button-ghost"
              >
                Ver peças
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="gb534-trustbar">
        <div>
          <strong>Compra segura</strong>
          <span>Pix e cartão</span>
        </div>

        <i />

        <div>
          <strong>Peças únicas</strong>
          <span>Exclusivas</span>
        </div>

        <i />

        <div>
          <strong>Seu pedido</strong>
          <span>Acompanhado</span>
        </div>
      </section>

      <section className="gb534-section gb534-products">
        <div className="gb534-section-head">
          <div>
            <small>
              {current
                ? `Temporada ${String(current.number).padStart(2, '0')}`
                : 'Grumble Bee'}
            </small>

            <h2>
              Produtos em
              <br />
              destaque
            </h2>
          </div>

          <Link to="/produtos">
            Ver tudo
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="gb534-product-grid">
            {featured.map(product => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <p className="catalog-empty">
            Nenhum produto em destaque cadastrado.
          </p>
        )}
      </section>

      <section
        className="gb534-editorial"
        id="editorial"
      >
        <div className="gb534-editorial-top">
          <span>Editorial</span>
          <b>⚡</b>
        </div>

        <div className="gb534-editorial-copy">
          <h2>
            NO BASIC.
            <br />
            JUST IDENTITY.
          </h2>

          <p>
            Limited drops, custom pieces, only 012
          </p>

          <Link to="/produtos">
            Ver produtos
            <span>↗</span>
          </Link>
        </div>

        <div className="gb534-editorial-mark">
          <img
            src="/assets/logo-grumble-bee.png"
            alt=""
          />

          <span>GRUMBLE BEE</span>
        </div>
      </section>

      <section className="gb534-section gb534-collections">
        <div className="gb534-section-head">
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

        <div className="gb534-collection-grid">
          {current && (
            <Link
              to="/colecao-atual"
              className="gb534-collection-card gb534-current"
              style={{
                backgroundImage:
                  `linear-gradient(0deg,rgba(0,0,0,.78),rgba(0,0,0,.05) 72%),url("${seasonCardImage(current, '/assets/colecao-anime-landscape.jpg')}")`
              }}
            >
              <span className="gb534-collection-status">
                Agora · Temporada {String(current.number).padStart(2, '0')}
              </span>

              <div>
                <h3>{current.name} Drop.</h3>
                <p>{current.theme}</p>
              </div>

              <b aria-hidden="true">⚡</b>
            </Link>
          )}

          {upcoming && (
            <Link
              to="/em-breve"
              className="gb534-collection-card gb534-upcoming"
              style={{
                backgroundImage:
                  `linear-gradient(0deg,rgba(0,0,0,.82),rgba(0,0,0,.12) 70%),url("${seasonCardImage(upcoming, '/assets/colecao-horror.jpg')}")`
              }}
            >
              <span className="gb534-collection-status">
                Próxima temporada
              </span>

              <div>
                <h3>{upcoming.name}</h3>

                <p>
                  {upcoming.description
                    ?? upcoming.theme}
                </p>

                {upcoming.start_at
                  && !upcomingCountdown.done && (
                    <div className="gb534-mini-countdown">
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
            to="/colecao-arquivo"
            className="gb534-archive"
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

      <section className="gb534-final-cta">
        <div>
          <small>GRUMBLE BEE</small>
          <h2>
            Drops limitados.
            <br />
            Identidade que não passa despercebida.
          </h2>
        </div>

        <Link to="/produtos">
          Comprar
          <span>↗</span>
        </Link>

        <b aria-hidden="true">
          ⚡
        </b>
      </section>
    </main>
  )
}
