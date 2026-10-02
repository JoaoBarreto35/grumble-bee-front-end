import './styles.module.css'
import './stylesMobile.module.css'
import {
  useEffect,
  useMemo,
  useState
} from 'react'
import {
  Link,
  useNavigate,
  useParams
} from 'react-router-dom'
import { ProductCard } from '../../components/ProductCard'
import {
  money,
  productPrimaryImage,
  useCatalog
} from '../../context/CatalogContext'
import { useCart } from '../../context/CartContext'
import { isPublicProduct } from '../../lib/catalog'

export function ProductPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { products } = useCatalog()
  const { addItem } = useCart()

  const product = products.find(
    item =>
      item.slug === slug
      && isPublicProduct(item)
  )

  const [selectedImage, setSelectedImage] =
    useState('')

  const [selectedFit, setSelectedFit] =
    useState('')

  const [selectedSize, setSelectedSize] =
    useState('')

  const [qty, setQty] =
    useState(1)

  const [openSections, setOpenSections] =
    useState<Record<string, boolean>>({
      desc: true
    })

  useEffect(() => {
    if (!product) return

    document.title =
      `${product.name} — Grumble Bee`

    setSelectedImage(
      productPrimaryImage(product)
    )

    const firstFit =
      product.variants.find(
        variant => variant.quantity > 0
      )?.fit
      ?? product.variants[0]?.fit
      ?? ''

    setSelectedFit(firstFit)
    setSelectedSize('')
    setQty(1)
  }, [product])

  const galleryImages = useMemo(() => {
    if (!product) return []

    const images = [...product.images]
      .sort(
        (a, b) =>
          a.sort_order - b.sort_order
      )

    if (images.length > 0) {
      return images
    }

    return [{
      id: 'primary',
      image_url: productPrimaryImage(product),
      alt_text: product.name,
      is_primary: true,
      sort_order: 0
    }]
  }, [product])

  const fits = useMemo(
    () =>
      product
        ? [
            ...new Set(
              product.variants.map(
                variant => variant.fit
              )
            )
          ]
        : [],
    [product]
  )

  const sizes = useMemo(
    () =>
      product
        ? product.variants
            .filter(
              variant =>
                variant.fit === selectedFit
            )
            .sort(
              (a, b) =>
                a.sort_order
                - b.sort_order
            )
        : [],
    [product, selectedFit]
  )

  if (!product) {
    return (
      <main className="gb539-product-page">
        <section className="gb539-not-found">
          <small>GRUMBLE BEE</small>

          <h1>
            Produto não encontrado.
          </h1>

          <button
            onClick={() =>
              navigate('/produtos')
            }
          >
            Voltar aos produtos
          </button>
        </section>
      </main>
    )
  }

  const selectedVariant =
    product.variants.find(
      variant =>
        variant.fit === selectedFit
        && variant.size === selectedSize
    )

  const canBuy =
    product.status === 'available'
    && (selectedVariant?.quantity ?? 0) > 0

  const isLowStock =
    selectedVariant
    && selectedVariant.quantity > 0
    && selectedVariant.quantity <= 5

  const add = () => {
    if (
      !selectedFit
      || !selectedSize
      || !canBuy
      || !selectedVariant
    ) {
      return
    }

    addItem(
      product.id,
      selectedVariant.id,
      selectedFit,
      selectedSize,
      qty
    )
  }

  const related = products
    .filter(
      item =>
        item.id !== product.id
        && item.season.id === product.season.id
        && isPublicProduct(item)
    )
    .slice(0, 4)

  return (
    <main className="gb539-product-page">
      <section className="gb539-product-main">
        <div className="gb539-gallery">
          <div className="gb539-main-photo">
            <img
              src={
                selectedImage
                || productPrimaryImage(product)
              }
              alt={product.name}
            />

            <div className="gb539-photo-top">
              <span>
                Temporada {String(
                  product.season.number
                ).padStart(2, '0')}
              </span>

              <b aria-hidden="true">
                ⚡
              </b>
            </div>
          </div>

          {galleryImages.length > 1 && (
            <div
              className="gb539-thumbs"
              aria-label="Fotos do produto"
            >
              {galleryImages.map(image => (
                <button
                  key={image.id}
                  type="button"
                  className={
                    selectedImage
                    === image.image_url
                      ? 'active'
                      : ''
                  }
                  onClick={() =>
                    setSelectedImage(
                      image.image_url
                    )
                  }
                  aria-label={
                    image.alt_text
                    || product.name
                  }
                >
                  <img
                    src={image.image_url}
                    alt=""
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="gb539-product-info">
          <div className="gb539-product-kicker">
            <span>
              {product.product_type
                ?? 'Grumble Bee'}
            </span>

            <i />

            <Link to="/colecao-atual">
              {product.season.name}
            </Link>
          </div>

          <h1>{product.name}</h1>

          <div className="gb539-price-block">
            <strong>
              {money(
                product.effective_price
              )}
            </strong>

            {product.sale_price && (
              <span>
                de {money(product.price)}
              </span>
            )}

            <small>
              ou 2x de{' '}
              {money(
                product.effective_price / 2
              )}{' '}
              sem juros
            </small>
          </div>

          <div className="gb539-benefits">
            <div>
              <strong>Pagamento seguro</strong>
              <span>Pix ou cartão</span>
            </div>

            <i />

            <div>
              <strong>Estoque real</strong>
              <span>Por tamanho</span>
            </div>

            <i />

            <div>
              <strong>Entrega</strong>
              <span>Calculada no checkout</span>
            </div>
          </div>

          {fits.length > 0 && (
            <div className="gb539-option">
              <div className="gb539-option-head">
                <span>Modelagem</span>

                {selectedFit && (
                  <small>
                    {selectedFit}
                  </small>
                )}
              </div>

              <div className="gb539-choice-grid">
                {fits.map(fit => (
                  <button
                    type="button"
                    key={fit}
                    className={
                      selectedFit === fit
                        ? 'active'
                        : ''
                    }
                    onClick={() => {
                      setSelectedFit(fit)
                      setSelectedSize('')
                      setQty(1)
                    }}
                  >
                    {fit}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="gb539-option">
            <div className="gb539-option-head">
              <span>Tamanho</span>

              <a
                href="#medidas"
                className="gb539-size-guide"
              >
                Tabela de medidas
              </a>
            </div>

            <div className="gb539-size-grid">
              {sizes.map(variant => (
                <button
                  type="button"
                  key={variant.id}
                  disabled={
                    variant.quantity <= 0
                  }
                  className={
                    selectedSize
                    === variant.size
                      ? 'active'
                      : ''
                  }
                  onClick={() => {
                    setSelectedSize(
                      variant.size
                    )
                    setQty(1)
                  }}
                >
                  <span>
                    {variant.size}
                  </span>

                  {variant.quantity <= 0 && (
                    <small>
                      Esgotado
                    </small>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="gb539-buy-row">
            <div className="gb539-qty">
              <button
                type="button"
                onClick={() =>
                  setQty(value =>
                    Math.max(
                      1,
                      value - 1
                    )
                  )
                }
                aria-label="Diminuir quantidade"
              >
                −
              </button>

              <span>{qty}</span>

              <button
                type="button"
                onClick={() =>
                  setQty(value =>
                    Math.min(
                      selectedVariant
                        ?.quantity
                        ?? 1,
                      value + 1
                    )
                  )
                }
                aria-label="Aumentar quantidade"
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="gb539-buy-button"
              disabled={!canBuy}
              onClick={add}
            >
              {!selectedFit
                ? 'Escolha a modelagem'
                : !selectedSize
                  ? 'Escolha um tamanho'
                  : canBuy
                    ? 'Adicionar ao carrinho'
                    : 'Esgotado'}
            </button>
          </div>

          <div
            className={[
              'gb539-stock',
              isLowStock
                ? 'low'
                : ''
            ].filter(Boolean).join(' ')}
          >
            <span />

            <p>
              {selectedVariant
                ? selectedVariant.quantity > 0
                  ? isLowStock
                    ? `Últimas ${selectedVariant.quantity} unidades nesta opção.`
                    : 'Disponível para envio.'
                  : 'Esta opção está esgotada.'
                : `${product.total_available} unidades disponíveis no drop.`}
            </p>
          </div>

          <div className="gb539-checkout-note">
            <span aria-hidden="true">
              ⚡
            </span>

            <p>
              Frete, prazo e disponibilidade de entrega são confirmados no checkout antes do pagamento.
            </p>
          </div>

          <div className="gb539-accordion">
            <div
              className={
                openSections.desc
                  ? 'gb539-accordion-item open'
                  : 'gb539-accordion-item'
              }
            >
              <button
                type="button"
                onClick={() =>
                  setOpenSections(
                    value => ({
                      ...value,
                      desc: !value.desc
                    })
                  )
                }
              >
                <span>
                  Descrição do produto
                </span>

                <b>
                  {openSections.desc
                    ? '−'
                    : '+'}
                </b>
              </button>

              {openSections.desc && (
                <div>
                  {product.description
                    ?? 'Peça Grumble Bee da temporada atual.'}
                </div>
              )}
            </div>

            <div
              className={
                openSections.payment
                  ? 'gb539-accordion-item open'
                  : 'gb539-accordion-item'
              }
            >
              <button
                type="button"
                onClick={() =>
                  setOpenSections(
                    value => ({
                      ...value,
                      payment:
                        !value.payment
                    })
                  )
                }
              >
                <span>
                  Pagamento e entrega
                </span>

                <b>
                  {openSections.payment
                    ? '−'
                    : '+'}
                </b>
              </button>

              {openSections.payment && (
                <div>
                  Pague por Pix ou cartão de crédito. O frete e o prazo são calculados no checkout de acordo com o endereço informado.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="gb539-related">
          <div className="gb539-related-head">
            <div>
              <small>
                Do mesmo drop
              </small>

              <h2>
                Você também
                <br />
                pode gostar.
              </h2>
            </div>

            <Link to="/colecao-atual">
              Ver temporada
            </Link>
          </div>

          <div className="gb539-related-grid">
            {related.map(item => (
              <ProductCard
                key={item.id}
                product={item}
              />
            ))}
          </div>
        </section>
      )}

      <section className="gb539-product-bottom">
        <div>
          <small>
            GRUMBLE BEE
          </small>

          <h2>
            Limited drops.
            <br />
            Peças com identidade.
          </h2>
        </div>

        <Link to="/produtos">
          Ver produtos
          <span>↗</span>
        </Link>

        <b aria-hidden="true">
          ⚡
        </b>
      </section>
    </main>
  )
}
