import { Link } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { SeasonPicture } from '../components/SeasonPicture'
import { useCatalog } from '../context/CatalogContext'
import {
  isPublicProduct,
  isPublicSeason,
  seasonCardImage
} from '../lib/catalog'

export function HomePage() {
  const { seasons, products, loading, error } = useCatalog()

  const visibleSeasons = seasons.filter(isPublicSeason)
  const current = visibleSeasons.find(s => s.status === 'current')

  const upcoming = visibleSeasons
    .filter(s => s.status === 'upcoming')
    .sort(
      (a, b) =>
        a.sort_order - b.sort_order
        || a.number - b.number
    )[0]

  const archived = visibleSeasons
    .filter(s => s.status === 'archived')
    .sort((a, b) => b.number - a.number)[0]

  const featured = products
    .filter(
      p =>
        p.is_featured
        && isPublicProduct(p)
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
    <main>
      {current && (
        <section
          className="home-season-banner brand-season-hero lightning-hero"
          aria-label={`Temporada atual ${current.name}`}
        >
          <Link
            className="home-season-image"
            to="/colecao-atual"
          >
            <SeasonPicture
              season={current}
              className="home-season-picture"
              fallbackDesktop="/assets/colecao-anime-landscape.jpg"
              fallbackMobile="/assets/colecao-anime.jpg"
              alt={`Temporada ${current.name}`}
            />

            <span className="brand-hero-lightning lightning-one">
              ⚡
            </span>

            <span className="brand-hero-lightning lightning-two">
              ⚡
            </span>
          </Link>

          <div className="home-season-copy brand-season-copy">
            <div className="brand-season-mark">
              <img
                src="/assets/logo-grumble-bee.png"
                alt=""
              />
              <span>⚡</span>
            </div>

            <div className="section-kicker">
              Temporada atual
            </div>

            <h2>{current.name}</h2>

            <p>
              {(current.description ?? current.theme).toUpperCase()}
            </p>

            <div className="brand-season-tags">
              <span>LIMITED DROP</span>
              <span>GRUMBLE BEE</span>
              <span>⚡</span>
            </div>

            <div className="actions">
              <Link className="btn dark" to="/colecao-atual">
                Ver temporada
              </Link>

              <Link className="btn" to="/produtos">
                Ver peças
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="brand-marquee lightning-marquee" aria-hidden="true">
        <div>
          GRUMBLE BEE
          <b>⚡</b>
          LIMITED DROPS
          <b>⚡</b>
          STREETWEAR
          <b>⚡</b>
          GRBBZZZZ
          <b>⚡</b>
          GRUMBLE BEE
          <b>⚡</b>
          LIMITED DROPS
        </div>
      </section>

      <section className="section brand-featured-section">
        <div className="section-head">
          <div>
            <div className="section-kicker">
              {current
                ? `Temporada ${String(current.number).padStart(2, '0')}`
                : 'Grumble Bee'}
            </div>

            <h2>Produtos em destaque</h2>
          </div>

          <Link className="text-link" to="/produtos">
            Ver tudo
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid">
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

      <section className="campaign brand-campaign" id="editorial">
        <div className="brand-campaign-art">
          <img
            src="/assets/brand-localz-graffiti.png"
            alt="Editorial Grumble Bee"
          />

          <span className="campaign-lightning campaign-lightning-a">⚡</span>
          <span className="campaign-lightning campaign-lightning-b">⚡</span>
        </div>

        <div className="campaign-copy">
          <div className="eyebrow">Editorial</div>

          <h2>
            NO BASIC<br />
            JUST IDENTITY
          </h2>

          <p>
            Limited drops, custom pieces, only 012
          </p>

          <div className="actions">
            <Link className="btn light" to="/produtos">
              Ver produtos
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <div className="section-kicker">
              Coleções
            </div>

            <h2>
              Agora, antes<br />
              e depois.
            </h2>
          </div>

          <Link className="text-link" to="/colecoes">
            Ver coleções
          </Link>
        </div>

        <div className="collection-stack brand-collection-stack">
          <Link
            className="collection-tile art-archive"
            to="/colecao-arquivo"
            style={
              archived
                ? {
                    backgroundImage:
                      `linear-gradient(rgba(0,0,0,.62),rgba(0,0,0,.62)),url("${seasonCardImage(archived, '/assets/bomber-preta.jpg')}")`
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

          {current && (
            <Link
              className="collection-tile art-anime-image"
              to="/colecao-atual"
              style={{
                backgroundImage:
                  `linear-gradient(90deg,rgba(0,0,0,.62),rgba(0,0,0,.08)),url("${seasonCardImage(current, '/assets/colecao-anime-landscape.jpg')}")`
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
              className="collection-tile art-horror-image"
              to="/em-breve"
              style={{
                backgroundImage:
                  `linear-gradient(rgba(0,0,0,.48),rgba(0,0,0,.62)),url("${seasonCardImage(upcoming, '/assets/colecao-horror.jpg')}")`
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
              </div>
            </Link>
          )}
        </div>
      </section>
    </main>
  )
}
