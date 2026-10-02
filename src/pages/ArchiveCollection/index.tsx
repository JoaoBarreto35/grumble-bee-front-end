import './styles.module.css'
import './stylesMobile.module.css'
import { Link } from 'react-router-dom'
import { useCatalog } from '../../context/CatalogContext'
import {
  isPublicSeason,
  seasonCardImage
} from '../../lib/catalog'

export function ArchiveCollectionPage() {
  const {
    seasons,
    products,
    loading
  } = useCatalog()

  const archived = seasons
    .filter(
      season =>
        season.status === 'archived'
        && isPublicSeason(season)
    )
    .sort(
      (a, b) =>
        b.number - a.number
        || b.sort_order - a.sort_order
    )

  if (loading) {
    return (
      <main className="gb537-archive-page">
        <section className="gb537-archive-loading">
          Carregando arquivo...
        </section>
      </main>
    )
  }

  return (
    <main className="gb537-archive-page">
      <section className="gb537-archive-hero">
        <div className="gb537-archive-hero-copy">
          <div className="gb537-archive-label">
            <span>Arquivo</span>
            <i />
            <span>Grumble Bee</span>
          </div>

          <h1>
            Drops que
            <br />
            já passaram.
          </h1>

          <p>
            Temporadas encerradas continuam aqui.
            Sem reposição. Sem segunda chance.
          </p>

          <div className="gb537-archive-stats">
            <div>
              <strong>{archived.length}</strong>
              <span>
                {archived.length === 1
                  ? 'temporada arquivada'
                  : 'temporadas arquivadas'}
              </span>
            </div>

            <i />

            <div>
              <strong>
                {
                  products.filter(
                    product =>
                      archived.some(
                        season =>
                          season.id === product.season.id
                      )
                  ).length
                }
              </strong>
              <span>peças no histórico</span>
            </div>
          </div>
        </div>

        <div
          className="gb537-archive-bolt"
          aria-hidden="true"
        >
          ⚡
        </div>
      </section>

      <section className="gb537-archive-strip">
        <div>
          <strong>Arquivo</strong>
          <span>Temporadas passadas</span>
        </div>

        <b>×</b>

        <div>
          <strong>Sem reposição</strong>
          <span>Quando acaba, acaba</span>
        </div>

        <b>⚡</b>

        <div>
          <strong>Grumble Bee</strong>
          <span>Histórico de drops</span>
        </div>
      </section>

      <section className="gb537-archive-list-section">
        <div className="gb537-archive-head">
          <div>
            <small>Temporadas</small>

            <h2>
              O que já fez
              <br />
              parte da história.
            </h2>
          </div>

          <Link to="/colecoes">
            Ver coleções
          </Link>
        </div>

        {archived.length > 0 ? (
          <div className="gb537-archive-list">
            {archived.map(season => {
              const count = products.filter(
                product =>
                  product.season.id === season.id
              ).length

              return (
                <article
                  className="gb537-archive-card"
                  key={season.id}
                >
                  <div
                    className="gb537-archive-card-image"
                    style={{
                      backgroundImage:
                        `linear-gradient(0deg,rgba(0,0,0,.80),rgba(0,0,0,.08) 72%),url("${seasonCardImage(season, '/assets/bomber-preta.jpg')}")`
                    }}
                  >
                    <div className="gb537-archive-card-top">
                      <span>
                        Temporada {String(season.number).padStart(2, '0')}
                      </span>

                      <b>ARQUIVO</b>
                    </div>

                    <div className="gb537-archive-card-copy">
                      <small>
                        {count} {count === 1 ? 'peça' : 'peças'}
                      </small>

                      <h3>{season.name}</h3>

                      <p>
                        {season.description
                          ?? season.theme}
                      </p>
                    </div>
                  </div>

                  <div className="gb537-archive-card-foot">
                    <span>ESGOTADO</span>

                    <span className="gb537-archive-closed">
                      Temporada encerrada
                    </span>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="gb537-archive-empty">
            <span>×</span>

            <div>
              <small>ARQUIVO</small>
              <h3>
                Nenhuma temporada arquivada ainda.
              </h3>
            </div>
          </div>
        )}
      </section>

      <section className="gb537-archive-editorial">
        <div>
          <small>GRUMBLE BEE</small>

          <h2>
            ESGOTOU.
            <br />
            FICOU NA HISTÓRIA.
          </h2>

          <p>
            Cada drop encerra um capítulo.
            O próximo começa com outra identidade.
          </p>
        </div>

        <span aria-hidden="true">⚡</span>
      </section>

      <section className="gb537-archive-bottom">
        <div>
          <small>Agora</small>

          <h2>
            Veja a temporada
            <br />
            que está no ar.
          </h2>
        </div>

        <Link to="/colecao-atual">
          Temporada atual
          <span>↗</span>
        </Link>
      </section>
    </main>
  )
}
