import { Link } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'
import { isPublicSeason, seasonCardImage } from '../lib/catalog'

export function CollectionsPage() {
  const { seasons } = useCatalog()
  const visible = seasons.filter(isPublicSeason)

  return (
    <main>
      <section className="page-hero">
        <div className="breadcrumb"><Link to="/">Início</Link> &gt; Coleções</div>
        <h1 className="page-title">Coleções</h1>
        <p className="page-copy">Cada temporada existe por um tempo. Depois, fica no arquivo da marca.</p>
      </section>
      <section className="section">
        <div className="collection-stack">
          {visible.map(season => {
            const to = season.status === 'current'
              ? '/colecao-atual'
              : season.status === 'upcoming'
                ? '/em-breve'
                : '/colecao-arquivo'
            const fallback = season.status === 'current'
              ? '/assets/colecao-anime-landscape.jpg'
              : season.status === 'upcoming'
                ? '/assets/colecao-horror.jpg'
                : '/assets/bomber-preta.jpg'

            return (
              <Link
                key={season.id}
                className={`collection-tile ${season.status === 'archived' ? 'art-archive' : season.status === 'current' ? 'art-anime-image' : 'art-horror-image'}`}
                to={to}
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,.48),rgba(0,0,0,.62)),url("${seasonCardImage(season, fallback)}")`
                }}
              >
                <div className="collection-tile-content">
                  <span className="status">
                    {season.status === 'current' ? 'Agora' : season.status === 'upcoming' ? 'Em breve' : 'Arquivo'} · Temporada {String(season.number).padStart(2, '0')}
                  </span>
                  <h2>{season.name}</h2>
                  <p>{season.description ?? season.theme}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </main>
  )
}
