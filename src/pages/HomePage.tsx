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
        p.is_featured && isPublicProduct(p)
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
          className="home-season-banner brand-season-hero"
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
            <span className="brand-hero-index">
              DROP {String(current.number).padStart(2, '0')}
            </span>
          </Link>

          <div className="home-season-copy brand-season-copy">
            <div className="brand-season-stamp">
              <img
                src="/assets/brand-localz-badge.png"
                alt=""
              />
            </div>

            <div className="section-kicker">
              Temporada atual · Localz Only
            </div>

            <h2>{current.name}</h2>

            <p>
              {(current.description ?? current.theme).toUpperCase()}
            </p>

            <div className="brand-season-tags">
              <span>012</span>
              <span>LIMITED DROP</span>
              <span>NO RESTOCK</span>
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

      <section className="brand-marquee" aria-hidden="true">
        <div>
          LOCALZ ONLY 012
          <b>⚡</b>
          GRUMBLE BEE
          <b>⚡</b>
          NO BASIC JUST IDENTITY
          <b>⚡</b>
          LIMITED DROPS
          <b>⚡</b>
          LOCALZ ONLY 012
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

            <h2>Peças que carregam<br />a marca na rua.</h2>
          </div>

          <Link className="text-link" to="/produtos">
            Ver tudo ↗
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

      <section className="brand-manifesto" id="editorial">
        <div className="brand-manifesto-art">
          <img
            src="/assets/brand-localz-graffiti.png"
            alt="Grumble Bee Localz Only 012"
          />
        </div>

        <div className="brand-manifesto-copy">
          <small>MANIFESTO 012</small>
          <h2>
            LOCAL<br />
            BARULHENTO<br />
            NOSSO.
          </h2>

          <p>
            A temporada muda. A abelha fica.
            Anime hoje, horror amanhã, mas sempre com
            a mesma assinatura: peça limitada, visual forte
            e identidade de quem é daqui.
          </p>

          <div className="brand-manifesto-numbers">
            <div>
              <strong>012</strong>
              <span>território</span>
            </div>
            <div>
              <strong>01</strong>
              <span>drop por vez</span>
            </div>
            <div>
              <strong>0</strong>
              <span>básico</span>
            </div>
          </div>

          <Link className="btn dark" to="/produtos">
            Entrar no drop
          </Link>
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
                      `linear-gradient(rgba(0,0,0,.7),rgba(0,0,0,.72)),url("${seasonCardImage(archived, '/assets/bomber-preta.jpg')}")`
                  }
                : undefined
            }
          >
            <div className="collection-tile-content">
              <span className="status">
                ARQUIVO · ESGOTADO
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
                  `linear-gradient(90deg,rgba(0,0,0,.76),rgba(0,0,0,.08)),url("${seasonCardImage(current, '/assets/colecao-anime-landscape.jpg')}")`
              }}
            >
              <div className="collection-tile-content">
                <span className="status">
                  AGORA · TEMPORADA {String(current.number).padStart(2, '0')}
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
                  `linear-gradient(rgba(0,0,0,.58),rgba(0,0,0,.72)),url("${seasonCardImage(upcoming, '/assets/colecao-horror.jpg')}")`
              }}
            >
              <div className="collection-tile-content">
                <span className="status">
                  PRÓXIMO SINAL
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
