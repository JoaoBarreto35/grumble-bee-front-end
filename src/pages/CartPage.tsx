import { Link } from 'react-router-dom'
import { money, productPrimaryImage, useCatalog } from '../context/CatalogContext'
import { useCart } from '../context/CartContext'

export function CartPage() {
  const { items, subtotal, removeItem } = useCart()
  const { products } = useCatalog()

  return (
    <main>
      <section className="page-hero">
        <div className="breadcrumb"><Link to="/">Início</Link> &gt; Carrinho</div>
        <h1 className="page-title">Carrinho</h1>
      </section>
      <section className="section">
        <div className="cart-list">
          {items.length === 0 && <p>Seu carrinho está vazio.</p>}
          {items.map((item, index) => {
            const product = products.find(
              p => p.id === item.id
            )

            const variant = product
              ? (
                  item.variantId
                    ? product.variants.find(
                        v => v.id === item.variantId
                      )
                    : undefined
                )
                ?? product.variants.find(
                  v =>
                    v.fit === item.fit
                    && v.size === item.size
                )
              : undefined

            if (!product || !variant) {
              return (
                <div
                  className="cart-item cart-item-invalid"
                  key={`invalid-${index}`}
                >
                  <div className="cart-invalid-placeholder">
                    !
                  </div>

                  <div>
                    <strong>
                      Item indisponível
                    </strong>
                    <p>
                      Esta opção não existe mais no catálogo.
                    </p>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() =>
                      removeItem(index)
                    }
                  >
                    Remover
                  </button>
                </div>
              )
            }

            return (
              <div
                className="cart-item"
                key={`${item.id}-${variant.id}`}
              >
                <img
                  src={productPrimaryImage(product)}
                  alt={product.name}
                />

                <div>
                  <strong>{product.name}</strong>
                  <p>
                    {variant.fit}
                    {' · '}
                    {variant.size}
                    {' · '}
                    Quantidade {item.qty}
                  </p>

                  <strong>
                    {money(
                      product.effective_price
                      * item.qty
                    )}
                  </strong>
                </div>

                <button
                  className="remove-btn"
                  onClick={() =>
                    removeItem(index)
                  }
                >
                  Remover
                </button>
              </div>
            )
          })}
        </div>
        <div className="cart-summary">
          <div className="summary-row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
          <div className="summary-row total"><span>Total</span><strong>{money(subtotal)}</strong></div>
          <Link className="buy-btn ready" to="/checkout">Continuar</Link>
          <p className="checkout-note">Você poderá entrar na sua conta ou continuar como visitante no checkout.</p>
        </div>
      </section>
    </main>
  )
}
