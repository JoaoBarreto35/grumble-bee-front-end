import { Link } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { useCatalog } from '../context/CatalogContext'
import { seasonCardImage } from '../lib/catalog'

export function ArchiveCollectionPage() {
  const { seasons, products } = useCatalog()
  const archived = seasons
    .filter(s => s.status === 'archived')
    .sort((a, b) => b.number - a.number)
  const latest = archived[0]
  const items = products.filter(
    p => archived.some(s => s.id === p.season.id) && p.status !== 'draft'
  )

  return (
    <main>
      <section
        className="page-hero archive-hero dynamic-archive-hero"
        style={latest ? {
          backgroundImage: `linear-gradient(rgba(0,0,0,.66),rgba(0,0,0,.72)),url("${seasonCardImage(latest, '/assets/bomber-preta.jpg')}")`
        } : undefined}
      >
        <div className="breadcrumb"><Link to="/">Início</Link> &gt; Arquivo</div>
        <div className="section-kicker">Coleções antigas</div>
        <h1 className="page-title">Já passou.<br />Não volta.</h1>
        <p className="page-copy">O arquivo permanece visível. A reposição não.</p>
      </section>
      <section className="section">
        <div className="section-head"><div><h2>Esgotadas</h2><p className="page-copy">Vai perder a próxima?</p></div></div>
        {items.length > 0 ? (
          <div className="grid">
            {items.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                badge="ESGOTADO"
                subtitle={`Temporada ${String(product.season.number).padStart(2, '0')} · ${product.season.name}`}
              />
            ))}
          </div>
        ) : (
          <p className="catalog-empty">Nenhuma peça arquivada ainda.</p>
        )}
      </section>
    </main>
  )
}
