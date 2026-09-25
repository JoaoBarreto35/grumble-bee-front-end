import {
  FormEvent,
  useMemo,
  useState
} from 'react'
import { useCatalog } from '../context/CatalogContext'
import type {
  Season,
  SeasonInput,
  SeasonStatus
} from '../lib/types'
import {
  fromSeasonDateTimeLocal,
  toSeasonDateTimeLocal
} from '../lib/seasonDateTime'

type SeasonImageSlot =
  | 'cover'
  | 'banner'
  | 'mobile_banner'

const empty: SeasonInput = {
  number: 1,
  name: '',
  slug: '',
  theme: '',
  description: '',
  status: 'draft',
  start_at: null,
  end_at: null,
  cover_image_url: null,
  banner_image_url: null,
  mobile_banner_image_url: null,
  sort_order: 0
}

export function AdminSeasonsPage() {
  const {
    seasons,
    createSeason,
    updateSeason,
    deleteSeason,
    uploadSeasonImage,
    deleteSeasonImage
  } = useCatalog()

  const [editing, setEditing] =
    useState<Season | null>(null)

  const [form, setForm] =
    useState<SeasonInput>(empty)

  const [message, setMessage] = useState('')
  const [uploadingSlot, setUploadingSlot] =
    useState<SeasonImageSlot | null>(null)

  const liveEditing = useMemo(
    () =>
      editing
        ? seasons.find(s => s.id === editing.id)
          ?? editing
        : null,
    [editing, seasons]
  )

  const edit = (s: Season) => {
    setEditing(s)
    setMessage('')

    setForm({
      number: s.number,
      name: s.name,
      slug: s.slug,
      theme: s.theme,
      description: s.description,
      status: s.status as SeasonStatus,
      start_at: s.start_at,
      end_at: s.end_at,
      cover_image_url: s.cover_image_url,
      banner_image_url: s.banner_image_url,
      mobile_banner_image_url:
        s.mobile_banner_image_url,
      sort_order: s.sort_order
    })
  }

  const reset = () => {
    setEditing(null)
    setMessage('')

    setForm({
      ...empty,
      number:
        Math.max(
          0,
          ...seasons.map(s => s.number)
        ) + 1
    })
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage('')

    try {
      const payload = {
        number: form.number,
        name: form.name,
        slug: form.slug,
        theme: form.theme,
        description: form.description,
        status: form.status,
        start_at: form.start_at,
        end_at: form.end_at,
        sort_order: form.sort_order
      }

      if (editing) {
        await updateSeason(
          editing.id,
          payload
        )
        setMessage('Temporada atualizada.')
      } else {
        await createSeason({
          ...payload,
          cover_image_url: null,
          banner_image_url: null,
          mobile_banner_image_url: null
        })

        setMessage(
          'Temporada criada. Selecione-a na lista para enviar as imagens.'
        )

        setForm({
          ...empty,
          number:
            Math.max(
              0,
              ...seasons.map(s => s.number)
            ) + 1
        })
      }
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : 'Erro ao salvar.'
      )
    }
  }

  const upload = async (
    slot: SeasonImageSlot,
    file: File | null
  ) => {
    if (!liveEditing || !file) {
      return
    }

    setUploadingSlot(slot)
    setMessage('')

    try {
      await uploadSeasonImage(
        liveEditing.id,
        slot,
        file
      )

      setMessage('Imagem enviada com sucesso.')
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : 'Erro ao enviar imagem.'
      )
    } finally {
      setUploadingSlot(null)
    }
  }

  const imageBlock = (
    title: string,
    slot: SeasonImageSlot,
    imageUrl: string | null
  ) => (
    <div className="admin-season-image-card">
      <div className="admin-season-image-preview">
        {imageUrl ? (
          <img src={imageUrl} alt="" />
        ) : (
          <span>Sem imagem</span>
        )}
      </div>

      <div className="admin-season-image-info">
        <strong>{title}</strong>

        <label className="admin-file-button">
          {uploadingSlot === slot
            ? 'Enviando...'
            : imageUrl
              ? 'Substituir'
              : 'Selecionar imagem'}

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploadingSlot !== null}
            onChange={e => {
              const file =
                e.target.files?.[0] ?? null

              void upload(slot, file)
              e.target.value = ''
            }}
          />
        </label>

        {imageUrl && (
          <button
            type="button"
            className="admin-image-remove"
            onClick={() =>
              window.confirm(
                'Remover esta imagem?'
              )
              && void deleteSeasonImage(
                liveEditing!.id,
                slot
              )
            }
          >
            Remover
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <small>CATÁLOGO</small>
          <h1>Temporadas</h1>
        </div>

        {editing && (
          <button
            className="admin-secondary"
            onClick={reset}
          >
            Nova temporada
          </button>
        )}
      </div>

      <div className="admin-split">
        <div>
          <form
            className="admin-form-card"
            onSubmit={submit}
          >
            <h2>
              {editing
                ? 'Editar temporada'
                : 'Nova temporada'}
            </h2>

            <div className="admin-two">
              <label>
                Número
                <input
                  type="number"
                  min="1"
                  value={form.number}
                  onChange={e =>
                    setForm(v => ({
                      ...v,
                      number:
                        Number(e.target.value)
                    }))
                  }
                />
              </label>

              <label>
                Status
                <select
                  value={form.status}
                  onChange={e =>
                    setForm(v => ({
                      ...v,
                      status:
                        e.target.value as SeasonStatus
                    }))
                  }
                >
                  <option value="draft">
                    Rascunho
                  </option>
                  <option value="upcoming">
                    Em breve
                  </option>
                  <option value="current">
                    Atual
                  </option>
                  <option value="archived">
                    Arquivada
                  </option>
                </select>
              </label>
            </div>

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
              Tema
              <input
                value={form.theme}
                onChange={e =>
                  setForm(v => ({
                    ...v,
                    theme: e.target.value
                  }))
                }
                required
              />
            </label>

            <label>
              Descrição
              <textarea
                value={form.description ?? ''}
                onChange={e =>
                  setForm(v => ({
                    ...v,
                    description:
                      e.target.value
                  }))
                }
              />
            </label>

            <div className="admin-two">
              <label>
                Início
                <input
                  type="datetime-local"
                  value={toSeasonDateTimeLocal(form.start_at)}
                  onChange={e =>
                    setForm(v => ({
                      ...v,
                      start_at:
                        fromSeasonDateTimeLocal(e.target.value)
                    }))
                  }
                />
              </label>

              <label>
                Fim
                <input
                  type="datetime-local"
                  value={toSeasonDateTimeLocal(form.end_at)}
                  onChange={e =>
                    setForm(v => ({
                      ...v,
                      end_at:
                        fromSeasonDateTimeLocal(e.target.value)
                    }))
                  }
                />
              </label>
            </div>

            <div className="admin-actions">
              <button
                className="admin-primary"
                type="submit"
              >
                Salvar
              </button>

              {editing && (
                <button
                  type="button"
                  className="admin-secondary"
                  onClick={reset}
                >
                  Cancelar
                </button>
              )}
            </div>

            {message && (
              <p className="admin-message">
                {message}
              </p>
            )}
          </form>

          {liveEditing && (
            <section className="admin-subcard admin-season-images">
              <div className="admin-subhead">
                <div>
                  <h3>Imagens da temporada</h3>
                  <p>
                    Envie os arquivos diretamente.
                    As URLs serão geradas automaticamente.
                  </p>
                </div>
              </div>

              {imageBlock(
                'Capa / card',
                'cover',
                liveEditing.cover_image_url
              )}

              {imageBlock(
                'Banner desktop',
                'banner',
                liveEditing.banner_image_url
              )}

              {imageBlock(
                'Banner mobile',
                'mobile_banner',
                liveEditing.mobile_banner_image_url
              )}
            </section>
          )}
        </div>

        <div className="admin-list">
          {seasons.map(s => (
            <article
              className="admin-row-card"
              key={s.id}
            >
              <div>
                <small>
                  Temporada{' '}
                  {String(s.number).padStart(2, '0')}
                  {' · '}
                  {s.status}
                </small>

                <strong>{s.name}</strong>
                <span>{s.theme}</span>
              </div>

              <div className="admin-row-actions">
                <button
                  onClick={() => edit(s)}
                >
                  Editar
                </button>

                <button
                  className="danger"
                  onClick={() =>
                    window.confirm(
                      'Excluir esta temporada?'
                    )
                    && void deleteSeason(s.id)
                  }
                >
                  Excluir
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
