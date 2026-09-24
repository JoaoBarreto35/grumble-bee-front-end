import { Link } from 'react-router-dom'
import type { Product } from '../lib/types'
import {
  money,
  productPrimaryImage
} from '../context/CatalogContext'

export function ProductCard({
  product,
  badge,
  subtitle,
  showSizes = false
}: {
  product: Product
  badge?: string
  subtitle?: string
  showSizes?: boolean
}) {
  const sizes = [...new Set(product.variants.map(v => v.size))]
  const soldOut =
    product.status === 'sold_out'
    || product.total_available <= 0

  return (
    <Link
      className="product-card brand-product-card"
      to={`/produto/${product.slug}`}
    >
      <div className="product-image">
        <span className="badge">
          {badge
            ?? (
              soldOut
                ? 'ESGOTADO'
                : product.is_featured
                  ? 'GRUMBLE PICK'
                  : product.season.name
            )}
        </span>

        <span className="brand-card-012">012</span>

        <img
          src={productPrimaryImage(product)}
          alt={product.name}
        />

        <span className="brand-card-view">
          VER PEÇA ↗
        </span>
      </div>

      <div className="card-body">
        <div className="brand-card-meta">
          <small>
            {product.product_type ?? 'DROP'}
          </small>
          <small>
            {product.season.name}
          </small>
        </div>

        <div className="card-row">
          <span>{product.name}</span>
          <strong>{money(product.effective_price)}</strong>
        </div>

        <div className="card-sub">
          {subtitle
            ?? (
              product.sale_price
                ? `de ${money(product.price)}`
                : `2x de ${money(product.effective_price / 2)} sem juros`
            )}
        </div>

        {showSizes && (
          <div className="size-mini">
            {sizes.map(size => (
              <span key={size}>{size}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
