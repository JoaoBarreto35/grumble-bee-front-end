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
    <main className="home-v532">
      {current && (
        <section
          className="home-season-banner home-v532-hero"
          aria-label={`Temporada atual ${current.name}`}
        >
          <Link
            className="home-season-image home-v532-hero-image"
            to="/colecao-atual"
          >
            <SeasonPicture
              season={current}
              className="home-season-picture"
              fallbackDesktop="/assets/colecao-anime-landscape.jpg"
              fallbackMobile="/assets/colecao-anime.jpg"
              alt={`Temporada ${current.name}`}
            />

            <span
              className="home-v532-bolt home-v532-bolt-one"
              aria-hidden="true"
            >
              ⚡
            </span>

            <div className="home-v532-image-label">
              <span>GRUMBLE BEE</span>
              <b>⚡</b>
              <span>
                TEMPORADA {String(current.number).padStart(2, '0')}
              </span>
            </div>
          </Link>

          <div className="home-season-copy home-v532-hero-copy">
            <div className="section-kicker">
              Temporada atual
            </div>

            <h2>{current.name}</h2>

            <p>
              {(current.description
                ?? current.theme).toUpperCase()}
            </p>

            <div className="home-v532-drop-meta">
              <span>LIMITED DROP</span>
              <i>⚡</i>
              <span>GRBBZZZZ</span>
            </div>

            <div className="actions">
              <Link
                className="btn dark"
                to="/colecao-atual"
              >
                Ver temporada
              </Link>

              <Link
                className="btn"
                to="/produtos"
              >
                Ver peças
              </Link>
            </div>
          </div>
        </section>
      )}

      <div
        className="home-v532-marquee"
        aria-hidden="true"
      >
        <div>
          <span>GRUMBLE BEE</span>
          <b>⚡</b>
          <span>LIMITED DROPS</span>
          <b>⚡</b>
          <span>NO BASIC · JUST IDENTITY</span>
          <b>⚡</b>
          <span>GRUMBLE BEE</span>
          <b>⚡</b>
        </div>
      </div>

      <section className="section home-v532-featured">
        <div className="section-head">
          <div>
            <div className="section-kicker">
              {current
                ? `Temporada ${String(current.number).padStart(2, '0')}`
                : 'Grumble Bee'}
            </div>

            <h2>Produtos em destaque</h2>
          </div>

          <Link
            className="text-link"
            to="/produtos"
          >
            Ver tudo
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="home-v532-product-scroll">
            {featured.map(product => (
              <div
                className="home-v532-product-slot"
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
        className="campaign home-v532-editorial"
        id="editorial"
      >
        <div className="home-v532-editorial-art">
          <img
            src="/assets/home-editorial-grumble-bee.png"
            alt="Editorial Grumble Bee"
          />

          <span
            className="home-v532-bolt editorial-bolt"
            aria-hidden="true"
          >
            ⚡
          </span>
        </div>

        <div className="campaign-copy">
          <div className="eyebrow">
            Editorial
          </div>

          <h2>
            NO BASIC
            <br />
            JUST IDENTITY
          </h2>

          <p>
            Limited drops, custom pieces, only 012
          </p>

          <div className="actions">
            <Link
              className="btn light"
              to="/produtos"
            >
              Ver produtos
            </Link>
          </div>
        </div>
      </section>

      <section className="section home-v532-collections">
        <div className="section-head">
          <div>
            <div className="section-kicker">
              Coleções
            </div>

            <h2>
              Agora, antes
              <br />
              e depois.
            </h2>
          </div>

          <Link
            className="text-link"
            to="/colecoes"
          >
            Ver coleções
          </Link>
        </div>

        <div className="collection-stack home-v532-collection-stack">
          {current && (
            <Link
              className="collection-tile art-anime-image home-v532-collection-current"
              to="/colecao-atual"
              style={{
                backgroundImage:
                  `linear-gradient(90deg,rgba(0,0,0,.67),rgba(0,0,0,.10)),url("${seasonCardImage(current, '/assets/colecao-anime-landscape.jpg')}")`
              }}
            >
              <div className="collection-tile-content">
                <span className="status">
                  Agora · Temporada {String(current.number).padStart(2, '0')}
                </span>

                <h2>
                  {current.name}
                  <br />
                  Drop.
                </h2>

                <p>{current.theme}</p>
              </div>
            </Link>
          )}

          {upcoming && (
            <Link
              className="collection-tile art-horror-image home-v532-collection-upcoming"
              to="/em-breve"
              style={{
                backgroundImage:
                  `linear-gradient(rgba(0,0,0,.48),rgba(0,0,0,.72)),url("${seasonCardImage(upcoming, '/assets/colecao-horror.jpg')}")`
              }}
            >
              <div className="collection-tile-content">
                <span className="status">
                  Próxima temporada
                </span>

                <h2>
                  {upcoming.name}
                  <br />
                  is coming.
                </h2>

                <p>
                  {upcoming.description
                    ?? upcoming.theme}
                </p>

                {upcoming.start_at
                  && !upcomingCountdown.done && (
                    <div className="home-v532-upcoming-timer">
                      <div>
                        <strong>
                          {pad(upcomingCountdown.days)}
                        </strong>
                        <span>dias</span>
                      </div>

                      <i>:</i>

                      <div>
                        <strong>
                          {pad(upcomingCountdown.hours)}
                        </strong>
                        <span>hrs</span>
                      </div>

                      <i>:</i>

                      <div>
                        <strong>
                          {pad(upcomingCountdown.minutes)}
                        </strong>
                        <span>min</span>
                      </div>
                    </div>
                  )}
              </div>
            </Link>
          )}

          <Link
            className="collection-tile art-archive home-v532-collection-archive"
            to="/colecao-arquivo"
            style={
              archived
                ? {
                    backgroundImage:
                      `linear-gradient(rgba(0,0,0,.68),rgba(0,0,0,.72)),url("${seasonCardImage(archived, '/assets/bomber-preta.jpg')}")`
                  }
                : undefined
            }
          >
            <div className="collection-tile-content">
              <span className="status">
                Arquivo
              </span>

              <h2>
                {archived?.name
                  ?? 'As que já passaram.'}
              </h2>

              <p>
                {archived?.description
                  ?? 'Peças encerradas continuam na história da marca — sem reposição.'}
              </p>
            </div>
          </Link>
        </div>
      </section>
    </main>
  )
}
