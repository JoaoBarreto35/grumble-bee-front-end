import { Link } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'
import { pad, useCountdown } from '../hooks/useCountdown'

export function CountdownBar({ isHome }: { isHome: boolean }) {
  const { seasons } = useCatalog()
  const season = seasons.find(item => item.status === 'current')
  const countdown = useCountdown(season?.end_at ?? null, 30_000)

  if (!season) return null

  if (!season.end_at) {
    return (
      <Link className={`topbar${isHome ? ' home-counter-link' : ''}`} to="/colecao-atual">
        <strong>TEMPORADA {season.name.toUpperCase()} · EDIÇÃO LIMITADA</strong>
        {isHome && <span className="home-counter-arrow">→</span>}
      </Link>
    )
  }

  if (countdown.done) {
    return (
      <Link className={`topbar${isHome ? ' home-counter-link' : ''}`} to="/colecoes">
        <strong>TEMPORADA {season.name.toUpperCase()} ENCERRADA</strong>
        {isHome && <span className="home-counter-arrow">→</span>}
      </Link>
    )
  }

  return (
    <Link className={`topbar${isHome ? ' home-counter-link' : ''}`} to="/colecao-atual">
      <strong>{season.name.toUpperCase()} TERMINA EM</strong>
      <span className="topbar-time">
        <span>{pad(countdown.days)}</span>d{' '}
        <span>{pad(countdown.hours)}</span>h{' '}
        <span>{pad(countdown.minutes)}</span>m
      </span>
      {isHome && <span className="home-counter-arrow">→</span>}
    </Link>
  )
}
