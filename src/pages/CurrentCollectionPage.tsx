import { Link } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { SeasonPicture } from '../components/SeasonPicture'
import { useCatalog } from '../context/CatalogContext'
import { isPublicProduct } from '../lib/catalog'

export function CurrentCollectionPage() {
  const { seasons, products } = useCatalog()
  const season = seasons.find(s => s.status === 'current')

  if (!season) {
    return <main className="section"><h1>Nenhuma temporada atual.</h1></main>
  }

  const items = products.filter(
    p => p.season.id === season.id && isPublicProduct(p)
  )

  return (
    <main>
      <section className="collection-hero art-anime-image has-season-media">
        <SeasonPicture
          season={season}
          className="collection-hero-media"
          fallbackDesktop="/assets/colecao-anime-landscape.jpg"
          fallbackMobile="/assets/colecao-anime.jpg"
          alt={`Banner da temporada ${season.name}`}
        />
        <div className="collection-hero-content">
          <span className="status">Temporada atual · {String(season.number).padStart(2, '0')}</span>
          <h1>{season.name}</h1>
          <p>{season.description ?? season.theme}</p>
        </div>
      </section>
      <section className="section">
        <div className="section-head">
          <div><div className="section-kicker">Drop atual</div><h2>Peças da temporada</h2></div>
          <Link className="text-link" to="/produtos">Ver catálogo</Link>
        </div>
        {items.length > 0 ? (
          <div className="grid">
            {items.map(product => <ProductCard key={product.id} product={product} showSizes />)}
          </div>
        ) : (
          <p className="catalog-empty">Nenhum produto publicado nesta temporada.</p>
        )}
      </section>
    </main>
  )
}
