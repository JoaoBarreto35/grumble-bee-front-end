import './styles.module.css'
import './stylesMobile.module.css'
import { Link } from 'react-router-dom'
import {
  money,
  productPrimaryImage,
  useCatalog
} from '../../context/CatalogContext'
import { useCart } from '../../context/CartContext'

export function CartPage() {
  const {
    items,
    count,
    subtotal,
    removeItem,
    updateItemQty,
    clearCart
  } = useCart()

  const { products } = useCatalog()

  const validItems = items
    .map((item, index) => {
      const product = products.find(
        candidate =>
          candidate.id === item.id
      )

      const variant = product
        ? (
            item.variantId
              ? product.variants.find(
                  candidate =>
                    candidate.id
                    === item.variantId
                )
              : undefined
          )
          ?? product.variants.find(
            candidate =>
              candidate.fit === item.fit
              && candidate.size === item.size
          )
        : undefined

      return {
        item,
        index,
        product,
        variant
      }
    })

  const hasItems =
    validItems.length > 0

  return (
    <main className="gb5310-cart-page">
      <section className="gb5310-cart-hero">
        <div>
          <div className="gb5310-cart-label">
            <span>Grumble Bee</span>
            <i />
            <span>Carrinho</span>
          </div>

          <h1>
            Seu carrinho.
          </h1>

          <p>
            Revise suas peças antes de seguir para o checkout.
          </p>
        </div>

        <div className="gb5310-cart-count">
          <strong>{count}</strong>
          <span>
            {count === 1
              ? 'item'
              : 'itens'}
          </span>
        </div>
      </section>

      {!hasItems ? (
        <section className="gb5310-empty-cart">
          <span aria-hidden="true">
            ⚡
          </span>

          <small>SEU CARRINHO</small>

          <h2>
            Ainda não tem nada por aqui.
          </h2>

          <p>
            Escolha suas peças e volte quando quiser finalizar a compra.
          </p>

          <Link to="/produtos">
            Ver produtos
          </Link>
        </section>
      ) : (
        <>
          <section className="gb5310-cart-content">
            <div className="gb5310-cart-list">
              <div className="gb5310-cart-list-head">
                <span>
                  {count}{' '}
                  {count === 1
                    ? 'item selecionado'
                    : 'itens selecionados'}
                </span>

                <button
                  type="button"
                  onClick={clearCart}
                >
                  Esvaziar carrinho
                </button>
              </div>

              {validItems.map(
                ({
                  item,
                  index,
                  product,
                  variant
                }) => {
                  if (!product || !variant) {
                    return (
                      <article
                        className="gb5310-cart-item gb5310-cart-item-invalid"
                        key={`invalid-${index}`}
                      >
                        <div className="gb5310-invalid-mark">
                          !
                        </div>

                        <div>
                          <small>ITEM INDISPONÍVEL</small>

                          <h3>
                            Esta opção não está mais disponível.
                          </h3>

                          <p>
                            Remova o item para continuar.
                          </p>
                        </div>

                        <button
                          type="button"
                          className="gb5310-remove"
                          onClick={() =>
                            removeItem(index)
                          }
                        >
                          Remover
                        </button>
                      </article>
                    )
                  }

                  const lineTotal =
                    product.effective_price
                    * item.qty

                  const lowStock =
                    variant.quantity > 0
                    && variant.quantity <= 5

                  return (
                    <article
                      className="gb5310-cart-item"
                      key={`${item.id}-${variant.id}`}
                    >
                      <Link
                        className="gb5310-cart-image"
                        to={`/produto/${product.slug}`}
                      >
                        <img
                          src={
                            productPrimaryImage(
                              product
                            )
                          }
                          alt={product.name}
                        />

                        <span aria-hidden="true">
                          ⚡
                        </span>
                      </Link>

                      <div className="gb5310-cart-item-info">
                        <div className="gb5310-cart-item-top">
                          <div>
                            <small>
                              {product.product_type
                                ?? product.season.name}
                            </small>

                            <Link
                              to={`/produto/${product.slug}`}
                            >
                              <h2>
                                {product.name}
                              </h2>
                            </Link>
                          </div>

                          <button
                            type="button"
                            className="gb5310-remove"
                            onClick={() =>
                              removeItem(index)
                            }
                            aria-label={`Remover ${product.name}`}
                          >
                            Remover
                          </button>
                        </div>

                        <div className="gb5310-variant">
                          <span>
                            {variant.fit}
                          </span>

                          <i />

                          <span>
                            Tamanho {variant.size}
                          </span>
                        </div>

                        <div className="gb5310-cart-item-bottom">
                          <div className="gb5310-cart-qty">
                            <button
                              type="button"
                              disabled={
                                item.qty <= 1
                              }
                              onClick={() =>
                                updateItemQty(
                                  index,
                                  item.qty - 1
                                )
                              }
                              aria-label="Diminuir quantidade"
                            >
                              −
                            </button>

                            <span>
                              {item.qty}
                            </span>

                            <button
                              type="button"
                              disabled={
                                item.qty
                                >= variant.quantity
                              }
                              onClick={() =>
                                updateItemQty(
                                  index,
                                  item.qty + 1
                                )
                              }
                              aria-label="Aumentar quantidade"
                            >
                              +
                            </button>
                          </div>

                          <div className="gb5310-line-price">
                            <strong>
                              {money(lineTotal)}
                            </strong>

                            {item.qty > 1 && (
                              <small>
                                {money(
                                  product.effective_price
                                )}{' '}
                                cada
                              </small>
                            )}
                          </div>
                        </div>

                        <div
                          className={[
                            'gb5310-stock-note',
                            lowStock
                              ? 'low'
                              : ''
                          ].filter(Boolean).join(' ')}
                        >
                          <span />

                          <p>
                            {lowStock
                              ? `Últimas ${variant.quantity} unidades nesta opção.`
                              : 'Disponível para compra.'}
                          </p>
                        </div>
                      </div>
                    </article>
                  )
                }
              )}
            </div>

            <aside className="gb5310-summary">
              <div className="gb5310-summary-head">
                <div>
                  <small>RESUMO</small>
                  <h2>Seu pedido</h2>
                </div>

                <span aria-hidden="true">
                  ⚡
                </span>
              </div>

              <div className="gb5310-summary-lines">
                <div>
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    {money(subtotal)}
                  </strong>
                </div>

                <div>
                  <span>
                    Frete
                  </span>

                  <strong>
                    Calculado no checkout
                  </strong>
                </div>
              </div>

              <div className="gb5310-summary-total">
                <span>
                  Total dos produtos
                </span>

                <strong>
                  {money(subtotal)}
                </strong>
              </div>

              <Link
                className="gb5310-checkout-button"
                to="/checkout"
              >
                Ir para o checkout
              </Link>

              <div className="gb5310-summary-trust">
                <div>
                  <strong>
                    Pagamento seguro
                  </strong>

                  <span>
                    Pix ou cartão
                  </span>
                </div>

                <i />

                <div>
                  <strong>
                    Entrega
                  </strong>

                  <span>
                    Definida no checkout
                  </span>
                </div>
              </div>

              <Link
                className="gb5310-continue"
                to="/produtos"
              >
                Continuar comprando
              </Link>
            </aside>
          </section>

          <section className="gb5310-cart-footer-copy">
            <div>
              <small>GRUMBLE BEE</small>

              <h2>
                Escolheu.
                <br />
                Agora é só fechar.
              </h2>
            </div>

            <span aria-hidden="true">
              ⚡
            </span>
          </section>
        </>
      )}
    </main>
  )
}
