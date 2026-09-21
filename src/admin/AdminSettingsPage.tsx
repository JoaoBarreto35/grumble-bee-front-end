import {
  FormEvent,
  useEffect,
  useState
} from 'react'
import { remoteApi } from '../lib/api'
import type {
  CheckoutSettings,
  ShippingZoneAdmin
} from '../lib/types'

export function AdminSettingsPage() {
  const [zone, setZone] =
    useState<ShippingZoneAdmin | null>(null)

  const [checkout, setCheckout] =
    useState<CheckoutSettings | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [message, setMessage] =
    useState('')

  const [freight, setFreight] =
    useState('0')

  const [freeMinimum, setFreeMinimum] =
    useState('')

  const [daysMin, setDaysMin] =
    useState('')

  const [daysMax, setDaysMax] =
    useState('')

  useEffect(() => {
    let active = true

    void Promise.all([
      remoteApi.adminShippingZones(),
      remoteApi.adminCheckoutSettings()
    ])
      .then(([zones, cfg]) => {
        if (!active) return

        const region =
          zones.find(
            item =>
              item.code === 'regiao-012'
          )
          ?? zones[0]
          ?? null

        setZone(region)
        setCheckout(cfg)

        if (region) {
          setFreight(
            region.flat_rate == null
              ? ''
              : String(region.flat_rate)
          )

          setFreeMinimum(
            region.free_shipping_minimum == null
              ? ''
              : String(
                  region.free_shipping_minimum
                )
          )

          setDaysMin(
            region.estimated_days_min == null
              ? ''
              : String(
                  region.estimated_days_min
                )
          )

          setDaysMax(
            region.estimated_days_max == null
              ? ''
              : String(
                  region.estimated_days_max
                )
          )
        }
      })
      .catch(error => {
        if (!active) return
        setMessage(
          error instanceof Error
            ? error.message
            : 'Erro ao carregar configurações.'
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const saveFreight = async (
    event: FormEvent
  ) => {
    event.preventDefault()

    if (!zone) return

    setSaving(true)
    setMessage('')

    try {
      const updated =
        await remoteApi.updateAdminShippingZone(
          zone.id,
          {
            is_active: zone.is_active,
            flat_rate:
              freight === ''
                ? null
                : Number(freight),

            free_shipping_minimum:
              freeMinimum === ''
                ? null
                : Number(freeMinimum),

            estimated_days_min:
              daysMin === ''
                ? null
                : Number(daysMin),

            estimated_days_max:
              daysMax === ''
                ? null
                : Number(daysMax)
          }
        )

      setZone({
        ...zone,
        ...updated
      })

      setMessage(
        'Configuração de entrega salva.'
      )
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Erro ao salvar entrega.'
      )
    } finally {
      setSaving(false)
    }
  }

  const updatePayment = async (
    patch: Partial<CheckoutSettings>
  ) => {
    if (!checkout) return

    setSaving(true)
    setMessage('')

    try {
      const updated =
        await remoteApi.updateAdminCheckoutSettings(
          patch
        )

      setCheckout(updated)
      setMessage(
        'Configuração de pagamento salva.'
      )
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Erro ao salvar pagamento.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="admin-loading">
        Carregando...
      </main>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <small>LOJA</small>
          <h1>Configurações</h1>
        </div>
      </div>

      <div className="admin-settings-grid">
        <form
          className="admin-form-card"
          onSubmit={saveFreight}
        >
          <h2>Entrega · Região 012</h2>

          <p className="admin-settings-copy">
            A loja está restrita aos municípios
            cadastrados na Região 012.
          </p>

          <label className="admin-check">
            <input
              type="checkbox"
              checked={zone?.is_active ?? false}
              onChange={e =>
                setZone(current =>
                  current
                    ? {
                        ...current,
                        is_active:
                          e.target.checked
                      }
                    : current
                )
              }
            />
            Região 012 ativa
          </label>

          <label>
            Valor do frete (R$)
            <input
              type="number"
              min="0"
              step="0.01"
              value={freight}
              onChange={e =>
                setFreight(e.target.value)
              }
              placeholder="0,00"
            />
          </label>

          <label>
            Frete grátis acima de (R$)
            <input
              type="number"
              min="0"
              step="0.01"
              value={freeMinimum}
              onChange={e =>
                setFreeMinimum(
                  e.target.value
                )
              }
              placeholder="Desativado"
            />
          </label>

          <div className="admin-two">
            <label>
              Prazo mínimo
              <input
                type="number"
                min="0"
                value={daysMin}
                onChange={e =>
                  setDaysMin(
                    e.target.value
                  )
                }
                placeholder="Opcional"
              />
            </label>

            <label>
              Prazo máximo
              <input
                type="number"
                min="0"
                value={daysMax}
                onChange={e =>
                  setDaysMax(
                    e.target.value
                  )
                }
                placeholder="Opcional"
              />
            </label>
          </div>

          <button
            className="admin-primary"
            disabled={saving}
          >
            Salvar entrega
          </button>
        </form>

        <section className="admin-form-card">
          <h2>Mercado Pago</h2>

          <p className="admin-settings-copy">
            Checkout Transparente · Orders API.
            Ative somente quando Access Token,
            webhook e URL do frontend estiverem
            configurados no Render.
          </p>

          <div className="admin-setting-status">
            <span>Status</span>

            <strong>
              {checkout?.payment_enabled
                ? 'ATIVO'
                : 'DESATIVADO'}
            </strong>
          </div>

          <label className="admin-check">
            <input
              type="checkbox"
              checked={
                checkout?.allow_pix
                ?? true
              }
              onChange={e =>
                void updatePayment({
                  allow_pix:
                    e.target.checked
                })
              }
            />
            Permitir Pix
          </label>

          <label className="admin-check">
            <input
              type="checkbox"
              checked={
                checkout?.allow_credit_card
                ?? true
              }
              onChange={e =>
                void updatePayment({
                  allow_credit_card:
                    e.target.checked
                })
              }
            />
            Permitir cartão
          </label>

          <label className="admin-check">
            <input
              type="checkbox"
              checked={
                checkout?.allow_ticket
                ?? false
              }
              onChange={e =>
                void updatePayment({
                  allow_ticket:
                    e.target.checked
                })
              }
            />
            Permitir boleto
          </label>

          <label>
            Reserva de estoque (minutos)
            <input
              type="number"
              min="30"
              max="1440"
              value={
                checkout
                  ?.stock_reservation_minutes
                ?? 20
              }
              onChange={e =>
                setCheckout(current =>
                  current
                    ? {
                        ...current,
                        stock_reservation_minutes:
                          Number(
                            e.target.value
                          )
                      }
                    : current
                )
              }
              onBlur={() => {
                if (checkout) {
                  void updatePayment({
                    stock_reservation_minutes:
                      checkout
                        .stock_reservation_minutes
                  })
                }
              }}
            />
          </label>

          <button
            type="button"
            className={
              checkout?.payment_enabled
                ? 'admin-danger'
                : 'admin-primary'
            }
            disabled={saving}
            onClick={() =>
              void updatePayment({
                payment_enabled:
                  !checkout?.payment_enabled
              })
            }
          >
            {checkout?.payment_enabled
              ? 'Desativar pagamentos'
              : 'Ativar pagamentos'}
          </button>

          <p className="admin-settings-warning">
            Ative somente depois que Public Key, Access Token e webhook estiverem configurados no Render.
          </p>
        </section>
      </div>

      {message && (
        <p className="admin-message">
          {message}
        </p>
      )}
    </div>
  )
}
