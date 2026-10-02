import './styles.module.css'
import './stylesMobile.module.css'
import { Link } from 'react-router-dom'
import { useCatalog } from '../../context/CatalogContext'
import { pad, useCountdown } from '../../hooks/useCountdown'
import {
  isPublicSeason,
  seasonCardImage
} from '../../lib/catalog'

const statusOrder: Record<string, number> = {
  current: 0,
  upcoming: 1,
  archived: 2
}

export function CollectionsPage() {
  const {
    seasons,
    products,
    loading
  } = useCatalog()

  const visible = seasons
    .filter(isPublicSeason)
    .sort((a, b) => {
      const statusDiff =
        (statusOrder[a.status] ?? 9)
        - (statusOrder[b.status] ?? 9)

      if (statusDiff !== 0) {
        return statusDiff
      }

      if (a.status === 'archived') {
        return b.number - a.number
      }

      return a.number - b.number
    })

  const upcoming =
    visible.find(
      season => season.status === 'upcoming'
    )

  const upcomingCountdown =
    useCountdown(
      upcoming?.start_at ?? null
    )

  if (loading) {
    return (
      <main className="gb538-collections-page">
        <section className="gb538-loading">
          Carregando coleções...
        </section>
      </main>
    )
  }

  return (
    <main className="gb538-collections-page">
      <section className="gb538-hero">
        <div className="gb538-hero-copy">
          <div className="gb538-label">
            <span>Grumble Bee</span>
            <i />
            <span>Coleções</span>
          </div>

          <h1>
            Cada drop,
            <br />
            uma identidade.
          </h1>

          <p>
            Conheça a temporada atual, descubra o que vem a seguir
            e revisite os drops que já fizeram parte da Grumble Bee.
          </p>
        </div>

        <div
          className="gb538-hero-mark"
          aria-hidden="true"
        >
          <img
            src="/assets/logo-grumble-bee.png"
            alt=""
          />
          <span>⚡</span>
        </div>
      </section>

      <section className="gb538-status-strip">
        <div>
          <strong>Agora</strong>
          <span>Drop disponível</span>
        </div>

        <b>⚡</b>

        <div>
          <strong>Em breve</strong>
          <span>Próxima temporada</span>
        </div>

        <b>×</b>

        <div>
          <strong>Arquivo</strong>
          <span>Drops encerrados</span>
        </div>
      </section>

      <section className="gb538-list-section">
        <div className="gb538-section-head">
          <div>
            <small>Temporadas</small>

            <h2>
              Explore todos
              <br />
              os drops.
            </h2>
          </div>

          <span>
            {visible.length}{' '}
            {visible.length === 1
              ? 'coleção'
              : 'coleções'}
          </span>
        </div>

        {visible.length > 0 ? (
          <div className="gb538-season-list">
            {visible.map(season => {
              const isCurrent =
                season.status === 'current'

              const isUpcoming =
                season.status === 'upcoming'

              const isArchived =
                season.status === 'archived'

              const to = isCurrent
                ? '/colecao-atual'
                : isUpcoming
                  ? '/em-breve'
                  : '/colecao-arquivo'

              const fallback = isCurrent
                ? '/assets/colecao-anime-landscape.jpg'
                : isUpcoming
                  ? '/assets/colecao-horror.jpg'
                  : '/assets/bomber-preta.jpg'

              const itemCount =
                products.filter(
                  product =>
                    product.season.id
                    === season.id
                ).length

              const statusLabel = isCurrent
                ? 'No ar'
                : isUpcoming
                  ? 'Em breve'
                  : 'Arquivo'

              const actionLabel = isCurrent
                ? 'Ver temporada'
                : isUpcoming
                  ? 'Conhecer próxima temporada'
                  : 'Ver arquivo'

              return (
                <article
                  className={[
                    'gb538-season-card',
                    isCurrent
                      ? 'is-current'
                      : '',
                    isUpcoming
                      ? 'is-upcoming'
                      : '',
                    isArchived
                      ? 'is-archived'
                      : ''
                  ].filter(Boolean).join(' ')}
                  key={season.id}
                >
                  <Link
                    to={to}
                    className="gb538-season-media"
                    style={{
                      backgroundImage:
                        `linear-gradient(0deg,rgba(0,0,0,.80),rgba(0,0,0,.05) 72%),url("${seasonCardImage(season, fallback)}")`
                    }}
                  >
                    <div className="gb538-season-card-top">
                      <span>
                        Temporada {String(season.number).padStart(2, '0')}
                      </span>

                      <b>{statusLabel}</b>
                    </div>

                    <div className="gb538-season-card-copy">
                      <small>
                        {itemCount}{' '}
                        {itemCount === 1
                          ? 'peça'
                          : 'peças'}
                      </small>

                      <h3>{season.name}</h3>

                      <p>
                        {season.description
                          ?? season.theme}
                      </p>

                      {isUpcoming
                        && season.start_at
                        && !upcomingCountdown.done && (
                          <div className="gb538-countdown">
                            <div>
                              <strong>
                                {pad(
                                  upcomingCountdown.days
                                )}
                              </strong>
                              <span>Dias</span>
                            </div>

                            <i>:</i>

                            <div>
                              <strong>
                                {pad(
                                  upcomingCountdown.hours
                                )}
                              </strong>
                              <span>Horas</span>
                            </div>

                            <i>:</i>

                            <div>
                              <strong>
                                {pad(
                                  upcomingCountdown.minutes
                                )}
                              </strong>
                              <span>Min</span>
                            </div>
                          </div>
                        )}
                    </div>
                  </Link>

                  <div className="gb538-season-card-foot">
                    <span>
                      {isCurrent
                        ? 'Disponível agora'
                        : isUpcoming
                          ? 'Próximo lançamento'
                          : 'Temporada encerrada'}
                    </span>

                    <Link to={to}>
                      {actionLabel}
                      <b>↗</b>
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="gb538-empty">
            <span>⚡</span>

            <div>
              <small>COLEÇÕES</small>
              <h3>
                Novas temporadas serão anunciadas em breve.
              </h3>
            </div>
          </div>
        )}
      </section>

      <section className="gb538-editorial">
        <div>
          <small>GRUMBLE BEE</small>

          <h2>
            LIMITED DROPS.
            <br />
            IDENTIDADE EM CADA TEMPORADA.
          </h2>

          <p>
            Novos temas, novas peças, a mesma assinatura.
          </p>
        </div>

        <span aria-hidden="true">⚡</span>
      </section>

      <section className="gb538-bottom">
        <div>
          <small>Drop atual</small>

          <h2>
            Veja o que está
            <br />
            disponível agora.
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
