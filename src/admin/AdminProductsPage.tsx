import {
  FormEvent,
  useMemo,
  useRef,
  useState
} from 'react'
import { useCatalog } from '../context/CatalogContext'
import type {
  Product,
  ProductInput,
  ProductStatus
} from '../lib/types'

const empty = (seasonId = ''): ProductInput => ({
  name: '',
  slug: '',
  product_type: 'camiseta',
  season_id: seasonId,
  description: '',
  price: 0,
  sale_price: null,
  status: 'draft',
  is_featured: false,
  featured_order: null,
  sort_order: 0
})

export function AdminProductsPage() {
  const {
    seasons,
    products,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage,
    updateImage,
    deleteImage,
    addVariant,
    updateVariant,
    deleteVariant
  } = useCatalog()

  const [selected, setSelected] =
    useState<Product | null>(null)

  const [form, setForm] =
    useState<ProductInput>(
      empty(seasons[0]?.id)
    )

  const [message, setMessage] = useState('')
  const [imageFile, setImageFile] =
    useState<File | null>(null)
  const [imagePrimary, setImagePrimary] =
    useState(false)
  const [imageUploading, setImageUploading] =
    useState(false)

  const fileRef = useRef<HTMLInputElement>(null)

  const [fit, setFit] = useState('oversized')
  const [size, setSize] = useState('M')
  const [quantity, setQuantity] = useState(0)

  const liveSelected = useMemo(
    () =>
      selected
        ? products.find(p => p.id === selected.id) ?? null
        : null,
    [products, selected]
  )

  const choose = (p: Product) => {
    setSelected(p)
    setMessage('')
    setImageFile(null)
    setImagePrimary(false)

    setForm({
      name: p.name,
      slug: p.slug,
      product_type: p.product_type,
      season_id: p.season.id,
      description: p.description,
      price: p.price,
      sale_price: p.sale_price,
      status: p.status as ProductStatus,
      is_featured: p.is_featured,
      featured_order: p.featured_order,
      sort_order: p.sort_order
    })
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage('')

    try {
      if (selected) {
        await updateProduct(selected.id, form)
      } else {
        await createProduct(form)
      }

      setMessage('Produto salvo.')

      if (!selected) {
        setForm(empty(seasons[0]?.id))
      }
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : 'Erro ao salvar.'
      )
    }
  }

  const uploadImage = async () => {
    if (!liveSelected || !imageFile) {
      return
    }

    setImageUploading(true)
    setMessage('')

    try {
      await uploadProductImage(
        liveSelected.id,
        imageFile,
        {
          altText: liveSelected.name,
          isPrimary:
            liveSelected.images.length === 0
            || imagePrimary
        }
      )

      setImageFile(null)
      setImagePrimary(false)

      if (fileRef.current) {
        fileRef.current.value = ''
      }

      setMessage('Imagem enviada com sucesso.')
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : 'Erro ao enviar imagem.'
      )
    } finally {
      setImageUploading(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <small>CATÁLOGO</small>
          <h1>Produtos</h1>
        </div>

        <button
          className="admin-secondary"
          onClick={() => {
            setSelected(null)
            setMessage('')
            setForm(empty(seasons[0]?.id))
          }}
        >
          Novo produto
        </button>
      </div>

      <div className="admin-products-layout">
        <div className="admin-list">
          {products.map(p => (
            <button
              className={
                `admin-product-pick${
                  selected?.id === p.id
                    ? ' active'
                    : ''
                }`
              }
              key={p.id}
              onClick={() => choose(p)}
            >
              <span>{p.name}</span>
              <small>
                {p.product_type}
                {' · '}
                {p.season.name}
                {' · '}
                estoque {p.total_available}
              </small>
            </button>
          ))}
        </div>

        <div>
          <form
            className="admin-form-card"
            onSubmit={submit}
          >
            <h2>
              {selected
                ? 'Editar produto'
                : 'Novo produto'}
            </h2>

            <label>
              Nome
              <input
                value={form.name}
                onChange={e =>
                  setForm(v => ({
                    ...v,
                    name: e.target.value
                  }))
                }
                required
              />
            </label>

            <div className="admin-two">
              <label>
                Slug
                <input
                  value={form.slug}
                  onChange={e =>
                    setForm(v => ({
                      ...v,
                      slug: e.target.value
                    }))
                  }
                  required
                />
              </label>

              <label>
                Tipo
                <input
                  value={form.product_type}
                  onChange={e =>
                    setForm(v => ({
                      ...v,
                      product_type: e.target.value
                    }))
                  }
                  required
                />
              </label>
            </div>

            <label>
              Temporada
              <select
                value={form.season_id}
                onChange={e =>
                  setForm(v => ({
                    ...v,
                    season_id: e.target.value
                  }))
                }
              >
                {seasons.map(s => (
                  <option
                    value={s.id}
                    key={s.id}
                  >
                    {s.number} · {s.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Descrição
              <textarea
                value={form.description ?? ''}
                onChange={e =>
                  setForm(v => ({
                    ...v,
                    description: e.target.value
                  }))
                }
              />
            </label>

            <div className="admin-two">
              <label>
                Preço
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={e =>
                    setForm(v => ({
                      ...v,
                      price: Number(e.target.value)
                    }))
                  }
                />
              </label>

              <label>
                Preço promocional
                <input
                  type="number"
                  step="0.01"
                  value={form.sale_price ?? ''}
                  onChange={e =>
                    setForm(v => ({
                      ...v,
                      sale_price:
                        e.target.value === ''
                          ? null
                          : Number(e.target.value)
                    }))
                  }
                />
              </label>
            </div>

            <div className="admin-two">
              <label>
                Status
                <select
                  value={form.status}
                  onChange={e =>
                    setForm(v => ({
                      ...v,
                      status:
                        e.target.value as ProductStatus
                    }))
                  }
                >
                  <option value="draft">
                    Rascunho
                  </option>
                  <option value="available">
                    Disponível
                  </option>
                  <option value="sold_out">
                    Esgotado
                  </option>
                  <option value="archived">
                    Arquivado
                  </option>
                </select>
              </label>

              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={e =>
                    setForm(v => ({
                      ...v,
                      is_featured: e.target.checked
                    }))
                  }
                />
                Produto em destaque
              </label>
            </div>

            <div className="admin-actions">
              <button className="admin-primary">
                Salvar produto
              </button>

              {selected && (
                <button
                  className="admin-danger"
                  type="button"
                  onClick={() =>
                    window.confirm(
                      'Excluir produto?'
                    )
                    && void deleteProduct(selected.id)
                  }
                >
                  Excluir
                </button>
              )}
            </div>

            {message && (
              <p className="admin-message">
                {message}
              </p>
            )}
          </form>

          {liveSelected && (
            <>
              <section className="admin-subcard">
                <div className="admin-subhead">
                  <div>
                    <h3>Imagens</h3>
                    <p>
                      Selecione JPG, PNG ou WEBP.
                      O arquivo será enviado ao Cloudinary.
                    </p>
                  </div>
                </div>

                <div className="admin-upload-box">
                  <label className="admin-file-field">
                    <span>Arquivo da imagem</span>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={e =>
                        setImageFile(
                          e.target.files?.[0] ?? null
                        )
                      }
                    />
                  </label>

                  {imageFile && (
                    <div className="admin-file-selected">
                      <strong>{imageFile.name}</strong>
                      <span>
                        {(imageFile.size / 1024 / 1024)
                          .toFixed(2)} MB
                      </span>
                    </div>
                  )}

                  {liveSelected.images.length > 0 && (
                    <label className="admin-check">
                      <input
                        type="checkbox"
                        checked={imagePrimary}
                        onChange={e =>
                          setImagePrimary(
                            e.target.checked
                          )
                        }
                      />
                      Tornar imagem principal
                    </label>
                  )}

                  <button
                    className="admin-primary"
                    type="button"
                    disabled={
                      !imageFile || imageUploading
                    }
                    onClick={() => void uploadImage()}
                  >
                    {imageUploading
                      ? 'Enviando...'
                      : 'Enviar imagem'}
                  </button>
                </div>

                <div className="admin-image-list">
                  {liveSelected.images.map(img => (
                    <div key={img.id}>
                      <img
                        src={img.image_url}
                        alt={img.alt_text ?? ''}
                      />

                      <span>
                        {img.is_primary
                          ? 'Principal'
                          : 'Secundária'}
                      </span>

                      {!img.is_primary && (
                        <button
                          className="admin-image-primary"
                          type="button"
                          title="Tornar principal"
                          onClick={() =>
                            void updateImage(
                              img.id,
                              { is_primary: true }
                            )
                          }
                        >
                          ★
                        </button>
                      )}

                      <button
                        className="admin-image-delete"
                        type="button"
                        title="Excluir imagem"
                        onClick={() =>
                          window.confirm(
                            'Excluir esta imagem?'
                          )
                          && void deleteImage(img.id)
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="admin-subcard">
                <div className="admin-subhead">
                  <h3>
                    Modelagens, tamanhos e estoque
                  </h3>
                </div>

                <div className="admin-variant-add">
                  <input
                    placeholder="Modelagem"
                    value={fit}
                    onChange={e =>
                      setFit(e.target.value)
                    }
                  />

                  <input
                    placeholder="Tamanho"
                    value={size}
                    onChange={e =>
                      setSize(e.target.value)
                    }
                  />

                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={e =>
                      setQuantity(
                        Number(e.target.value)
                      )
                    }
                  />

                  <button
                    className="admin-secondary"
                    type="button"
                    onClick={() =>
                      void addVariant(
                        liveSelected.id,
                        {
                          fit,
                          size,
                          quantity,
                          sort_order:
                            liveSelected.variants.length + 1
                        }
                      )
                    }
                  >
                    Adicionar
                  </button>
                </div>

                <div className="admin-variant-list">
                  {liveSelected.variants.map(v => (
                    <div key={v.id}>
                      <span>{v.fit}</span>
                      <strong>{v.size}</strong>

                      <input
                        type="number"
                        min="0"
                        value={v.quantity}
                        onChange={e =>
                          void updateVariant(
                            v.id,
                            {
                              quantity:
                                Number(
                                  e.target.value
                                )
                            }
                          )
                        }
                      />

                      <button
                        type="button"
                        onClick={() =>
                          void deleteVariant(v.id)
                        }
                      >
                        Excluir
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
