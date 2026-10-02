import './styles.module.css'
import './stylesMobile.module.css'
import { Link } from 'react-router-dom'
import { SeasonPicture } from '../../components/SeasonPicture'
import { pad, useCountdown } from '../../hooks/useCountdown'
import { useCatalog } from '../../context/CatalogContext'
import { formatSeasonDateTime } from '../../lib/seasonDateTime'

export function UpcomingCollectionPage() {
  const { seasons } = useCatalog()

  const season = seasons
    .filter(item => item.status === 'upcoming')
    .sort(
      (a, b) =>
        a.sort_order - b.sort_order
        || a.number - b.number
    )[0]

  const countdown =
    useCountdown(season?.start_at ?? null)

  return (
    <main className="gb536-upcoming-page">
      <section className="gb536-upcoming-hero">
        {season && (
          <SeasonPicture
            season={season}
            className="gb536-upcoming-hero-media"
            fallbackDesktop="/assets/colecao-horror.jpg"
            fallbackMobile="/assets/colecao-horror.jpg"
            alt={`Banner da temporada ${season.name}`}
          />
        )}

        <div className="gb536-upcoming-hero-overlay" />

        <div
          className="gb536-upcoming-bolt"
          aria-hidden="true"
        >
          ⚡
        </div>

        <div className="gb536-upcoming-hero-content">
          <div className="gb536-upcoming-label">
            <span>Próxima temporada</span>
            <i />
            <span>
              {season
                ? String(season.number).padStart(2, '0')
                : '--'}
            </span>
          </div>

          <h1>
            {season?.name ?? 'Em breve'}
          </h1>

          <p>
            {season?.description
              ?? season?.theme
              ?? 'O próximo drop já está olhando de volta.'}
          </p>

          <Link
            className="gb536-upcoming-ghost"
            to="/colecoes"
          >
            Ver coleções
          </Link>
        </div>
      </section>

      <section className="gb536-launch">
        <div className="gb536-launch-head">
          <div>
            <small>Lançamento</small>

            <h2>
              {formatSeasonDateTime(
                season?.start_at
              )}
            </h2>
          </div>

          <span>⚡</span>
        </div>

        {season?.start_at && !countdown.done && (
          <>
            <div className="gb536-countdown">
              <div className="gb536-count-box">
                <strong>
                  {pad(countdown.days)}
                </strong>
                <span>Dias</span>
              </div>

              <div className="gb536-count-box">
                <strong>
                  {pad(countdown.hours)}
                </strong>
                <span>Horas</span>
              </div>

              <div className="gb536-count-box">
                <strong>
                  {pad(countdown.minutes)}
                </strong>
                <span>Min</span>
              </div>

              <div className="gb536-count-box">
                <strong>
                  {pad(countdown.seconds)}
                </strong>
                <span>Seg</span>
              </div>
            </div>

            <div className="gb536-launch-foot">
              <span>Contagem regressiva para o próximo drop</span>
              <strong>Horário de Brasília</strong>
            </div>
          </>
        )}

        {season?.start_at && countdown.done && (
          <div className="gb536-launch-live">
            <span>⚡</span>

            <div>
              <small>LANÇAMENTO</small>
              <strong>
                O horário do drop chegou.
              </strong>
            </div>

            <Link to="/produtos">
              Ver produtos
            </Link>
          </div>
        )}
      </section>

      <section className="gb536-upcoming-info">
        <div>
          <small>PRÓXIMO DROP</small>

          <h2>
            {season?.theme
              ?? season?.name
              ?? 'Em breve'}
          </h2>

          <p>
            {season?.description
              ?? 'A próxima temporada da Grumble Bee chega em breve.'}
          </p>
        </div>

        <div
          className="gb536-upcoming-mark"
          aria-hidden="true"
        >
          <img
            src="/assets/logo-grumble-bee.png"
            alt=""
          />
          <span>⚡</span>
        </div>
      </section>

      <section className="gb536-upcoming-bottom">
        <div>
          <small>Coleções</small>

          <h2>
            Enquanto isso,
            <br />
            veja o drop atual.
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
