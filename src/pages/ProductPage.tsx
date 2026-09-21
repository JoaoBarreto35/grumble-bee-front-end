import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { money, productPrimaryImage, useCatalog } from '../context/CatalogContext'
import { useCart } from '../context/CartContext'
import { isPublicProduct } from '../lib/catalog'

export function ProductPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { products } = useCatalog()
  const product = products.find(p => p.slug === slug && isPublicProduct(p))
  const { addItem } = useCart()

  const [selectedImage, setSelectedImage] = useState('')
  const [selectedFit, setSelectedFit] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [qty, setQty] = useState(1)
  const [cep, setCep] = useState('')
  const [shipping, setShipping] = useState('')
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ desc: true })

  useEffect(() => {
    if (!product) return
    document.title = `${product.name} — Grumble Bee`
    setSelectedImage(productPrimaryImage(product))
    const firstFit = product.variants.find(v => v.quantity > 0)?.fit ?? product.variants[0]?.fit ?? ''
    setSelectedFit(firstFit)
    setSelectedSize('')
    setQty(1)
  }, [product])

  const images = useMemo(() => product?.images ?? [], [product])
  const fits = useMemo(() => product ? [...new Set(product.variants.map(v => v.fit))] : [], [product])
  const sizes = useMemo(() => product
    ? product.variants.filter(v => v.fit === selectedFit).sort((a, b) => a.sort_order - b.sort_order)
    : [], [product, selectedFit])

  if (!product) {
    return (
      <main className="section">
        <h1>Produto não encontrado</h1>
        <button className="btn dark" onClick={() => navigate('/produtos')}>Voltar aos produtos</button>
      </main>
    )
  }

  const selectedVariant = product.variants.find(v => v.fit === selectedFit && v.size === selectedSize)
  const canBuy = product.status === 'available' && (selectedVariant?.quantity ?? 0) > 0

  const calculateShipping = () => {
    const digits = cep.replace(/\D/g, '')
    setShipping(digits.length < 8
      ? 'Digite um CEP válido para simular o frete.'
      : 'Simulação visual: o frete real entra na próxima fase de compra/pedidos.')
  }

  const add = () => {
    if (!selectedFit || !selectedSize || !canBuy) return
    addItem(product.id, selectedVariant!.id, selectedFit, selectedSize, qty)
  }

  const related = products.filter(p => p.id !== product.id && p.season.id === product.season.id && isPublicProduct(p)).slice(0, 4)

  return (
    <main className="product-page">
      <div>
        <div className="breadcrumb"><Link to="/">Início</Link> &gt; <Link to="/produtos">Produtos</Link> &gt; Produto</div>
        <div className="product-gallery">
          <div className="thumbs">
            {images.map(image => (
              <button key={image.id} className={`thumb${selectedImage === image.image_url ? ' active' : ''}`} onClick={() => setSelectedImage(image.image_url)}>
                <img src={image.image_url} alt="" />
              </button>
            ))}
          </div>
          <div className="main-photo"><img src={selectedImage || productPrimaryImage(product)} alt={product.name} /></div>
        </div>
      </div>

      <section className="product-detail">
        <div className="section-kicker">Temporada {String(product.season.number).padStart(2, '0')} · {product.season.name}</div>
        <h1>{product.name}</h1>
        <div className="price">{money(product.effective_price)}</div>
        {product.sale_price && <div className="installment">de {money(product.price)}</div>}
        <div className="installment">ou 2x de {money(product.effective_price / 2)} sem juros</div>
        <div className="pay-note">Catálogo real. Pagamento será conectado na próxima fase.</div>

        <div className="option-label"><span>Modelagem</span></div>
        <div className="size-picker">
          {fits.map(fit => <button key={fit} className={`size-btn${selectedFit === fit ? ' active' : ''}`} onClick={() => { setSelectedFit(fit); setSelectedSize('') }}>{fit}</button>)}
        </div>

        <div className="option-label"><span>Tamanho</span><a href="#medidas" className="text-link">Tabela de medidas</a></div>
        <div className="size-picker">
          {sizes.map(variant => (
            <button
              key={variant.id}
              disabled={variant.quantity <= 0}
              className={`size-btn${selectedSize === variant.size ? ' active' : ''}`}
              onClick={() => setSelectedSize(variant.size)}
              title={variant.quantity <= 0 ? 'Esgotado' : `${variant.quantity} disponíveis`}
            >
              {variant.size}
            </button>
          ))}
        </div>

        <div className="option-label"><span>Quantidade</span></div>
        <div className="qty-row">
          <div className="qty">
            <button onClick={() => setQty(value => Math.max(1, value - 1))}>−</button>
            <span>{qty}</span>
            <button onClick={() => setQty(value => Math.min(selectedVariant?.quantity ?? 1, value + 1))}>+</button>
          </div>
        </div>

        <div className="stock-note">
          {selectedVariant ? `${selectedVariant.quantity} peças disponíveis nesta combinação` : `${product.total_available} peças disponíveis no total`}
        </div>
        <button className={`buy-btn${canBuy ? ' ready' : ''}`} disabled={!canBuy} onClick={add}>
          {!selectedFit ? 'Escolha a modelagem' : !selectedSize ? 'Escolha um tamanho' : canBuy ? 'Adicionar ao carrinho' : 'Esgotado'}
        </button>

        <div className="shipping">
          <h3>Calcule o frete</h3>
          <div className="cep-row">
            <input inputMode="numeric" placeholder="Digite seu CEP" value={cep} onChange={e => setCep(e.target.value)} />
            <button onClick={calculateShipping}>Calcular</button>
          </div>
          <div className="shipping-result">{shipping}</div>
        </div>

        <div className="accordion">
          <div className={`accordion-item${openSections.desc ? ' open' : ''}`}>
            <button className="accordion-btn" onClick={() => setOpenSections(v => ({ ...v, desc: !v.desc }))}>
              <span className="accordion-title">Descrição do produto</span><span>+</span>
            </button>
            <div className="accordion-body">{product.description ?? 'Produto Grumble Bee.'}</div>
          </div>
          <div className={`accordion-item${openSections.payment ? ' open' : ''}`}>
            <button className="accordion-btn" onClick={() => setOpenSections(v => ({ ...v, payment: !v.payment }))}>
              <span className="accordion-title">Meios de pagamento</span><span>+</span>
            </button>
            <div className="accordion-body">Pagamento será implementado na próxima fase.</div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="related">
          <div className="section-head"><div><div className="section-kicker">Você também pode gostar</div><h2>Produtos relacionados</h2></div></div>
          <div className="grid">{related.map(item => <ProductCard key={item.id} product={item} showSizes />)}</div>
        </section>
      )}
    </main>
  )
}
