import { Link } from 'react-router-dom'
import { SeasonPicture } from '../components/SeasonPicture'
import { pad, useCountdown } from '../hooks/useCountdown'
import { useCatalog } from '../context/CatalogContext'

export function UpcomingCollectionPage() {
  const { seasons } = useCatalog()
  const season = seasons
    .filter(s => s.status === 'upcoming')
    .sort((a, b) => a.sort_order - b.sort_order || a.number - b.number)[0]

  const countdown = useCountdown(season?.start_at ?? null)

  return (
    <main>
      <section className="collection-hero art-horror-image has-season-media">
        {season && (
          <SeasonPicture
            season={season}
            className="collection-hero-media"
            fallbackDesktop="/assets/colecao-horror.jpg"
            fallbackMobile="/assets/colecao-horror.jpg"
            alt={`Banner da temporada ${season.name}`}
          />
        )}
        <div className="collection-hero-content">
          <span className="status">Próxima temporada</span>
          <h1>{season?.name ?? 'Em breve'}</h1>
          <p>{season?.description ?? season?.theme ?? 'O próximo drop já está olhando de volta.'}</p>
          <Link className="btn light" to="/colecoes">Ver coleções</Link>
        </div>
      </section>

      <section className="countdown-section">
        <div className="section-kicker">Lançamento</div>
        <h2>{season?.start_at ? new Date(season.start_at).toLocaleString('pt-BR') : 'Data a definir'}</h2>
        {season?.start_at && (
          <div className="countdown-grid">
            <div className="count-box"><strong>{pad(countdown.days)}</strong><span>Dias</span></div>
            <div className="count-box"><strong>{pad(countdown.hours)}</strong><span>Horas</span></div>
            <div className="count-box"><strong>{pad(countdown.minutes)}</strong><span>Minutos</span></div>
            <div className="count-box"><strong>{pad(countdown.seconds)}</strong><span>Segundos</span></div>
          </div>
        )}
      </section>
    </main>
  )
}
