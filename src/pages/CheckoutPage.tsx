import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  money,
  productPrimaryImage,
  useCatalog
} from '../context/CatalogContext'
import { useCart } from '../context/CartContext'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { remoteApi } from '../lib/api'
import {
  formatCep,
  isCompleteCep,
  lookupCep,
  onlyCepDigits
} from '../lib/cep'
import type {
  CheckoutSettings,
  ShippingQuote
} from '../lib/types'

type CepState =
  | 'idle'
  | 'typing'
  | 'loading'
  | 'found'
  | 'manual'
  | 'error'

export function CheckoutPage() {
  const {
    items,
    subtotal,
    clearCart
  } = useCart()

  const { products } = useCatalog()
  const { customer, logged } = useCustomerAuth()
  const navigate = useNavigate()

  const [sending, setSending] = useState(false)
  const [loadingQuote, setLoadingQuote] =
    useState(false)
  const [message, setMessage] = useState('')

  const [quote, setQuote] =
    useState<ShippingQuote | null>(null)

  const [settings, setSettings] =
    useState<CheckoutSettings | null>(null)

  const [settingsReady, setSettingsReady] =
    useState(false)

  const [settingsError, setSettingsError] =
    useState('')

  const [cepState, setCepState] =
    useState<CepState>('idle')

  const [cepMessage, setCepMessage] =
    useState('')

  const lastLookedUpCep = useRef('')

  const [form, setForm] = useState({
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    postal_code: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: 'SP',
    customer_note: ''
  })

  useEffect(() => {
    if (customer) {
      setForm(v => ({
        ...v,
        contact_name: customer.name,
        contact_email: customer.email,
        contact_phone: customer.phone ?? ''
      }))
    }
  }, [customer])

  useEffect(() => {
    let active = true

    void remoteApi.checkoutSettings()
      .then(result => {
        if (!active) return
        setSettings(result)
        setSettingsError('')
      })
      .catch(error => {
        if (!active) return
        setSettingsError(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar o checkout.'
        )
      })
      .finally(() => {
        if (active) setSettingsReady(true)
      })

    return () => {
      active = false
    }
  }, [])

  const detailed = useMemo(
    () => items.map(item => {
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

      return { item, product, variant }
    }),
    [items, products]
  )

  const invalidItems = detailed.filter(
    entry => !entry.product || !entry.variant
  )

  const quoteItems = useMemo(
    () => detailed
      .filter(entry => entry.variant)
      .map(entry => ({
        variant_id: entry.variant!.id,
        quantity: entry.item.qty
      })),
    [detailed]
  )

  const invalidateQuote = () => {
    setQuote(null)
    setMessage('')
  }

  const requestShippingQuote = async (
    city: string,
    state: string,
    options?: {
      silent?: boolean
    }
  ) => {
    if (
      !city.trim()
      || !state.trim()
      || !quoteItems.length
      || invalidItems.length > 0
    ) {
      return null
    }

    setLoadingQuote(true)

    if (!options?.silent) {
      setMessage('')
    }

    try {
      const result =
        await remoteApi.shippingQuote({
          city,
          state,
          country_code: 'BR',
          items: quoteItems
        })

      setQuote(result)

      if (!result.available) {
        setMessage(
          result.reason
          ?? 'Entrega indisponível para este endereço.'
        )
      } else {
        setMessage('')
      }

      return result
    } catch (error) {
      setQuote(null)

      if (!options?.silent) {
        setMessage(
          error instanceof Error
            ? error.message
            : 'Não foi possível calcular a entrega.'
        )
      }

      return null
    } finally {
      setLoadingQuote(false)
    }
  }

  const searchCep = async (
    value = form.postal_code
  ) => {
    const digits = onlyCepDigits(value)

    if (digits.length !== 8) {
      setCepState(
        digits.length === 0
          ? 'idle'
          : 'typing'
      )
      setCepMessage(
        digits.length
          ? 'Digite os 8 números do CEP.'
          : ''
      )
      return
    }

    if (
      cepState === 'loading'
      || lastLookedUpCep.current === digits
    ) {
      return
    }

    lastLookedUpCep.current = digits
    setCepState('loading')
    setCepMessage('Buscando endereço...')
    setMessage('')
    invalidateQuote()

    try {
      const address = await lookupCep(digits)

      setForm(current => ({
        ...current,
        postal_code:
          formatCep(address.cep || digits),
        street:
          address.logradouro
          || current.street,
        complement:
          current.complement,
        neighborhood:
          address.bairro
          || current.neighborhood,
        city:
          address.localidade
          || current.city,
        state:
          address.uf
          || current.state
      }))

      setCepState('found')
      setCepMessage(
        'Endereço encontrado. Confira o número e o complemento.'
      )

      if (address.localidade && address.uf) {
        await requestShippingQuote(
          address.localidade,
          address.uf,
          { silent: true }
        )
      }
    } catch (error) {
      lastLookedUpCep.current = ''
      setCepState('manual')
      setCepMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível consultar o CEP.'
      )

      setForm(current => ({
        ...current,
        city: '',
        state: 'SP'
      }))
    }
  }

  useEffect(() => {
    const digits =
      onlyCepDigits(form.postal_code)

    if (digits.length !== 8) {
      return
    }

    const timer = window.setTimeout(() => {
      void searchCep(form.postal_code)
    }, 350)

    return () => {
      window.clearTimeout(timer)
    }
  }, [form.postal_code])

  const calculateShipping = async () => {
    setMessage('')

    if (!form.city.trim() || !form.state.trim()) {
      setMessage(
        'Informe a cidade e o estado para calcular a entrega.'
      )
      return
    }

    if (!quoteItems.length || invalidItems.length) {
      setMessage(
        'Revise os produtos do carrinho antes de calcular a entrega.'
      )
      return
    }

    await requestShippingQuote(
      form.city,
      form.state
    )
  }

  const changeCep = (value: string) => {
    const formatted = formatCep(value)
    const digits = onlyCepDigits(formatted)

    if (
      lastLookedUpCep.current
      && lastLookedUpCep.current !== digits
    ) {
      lastLookedUpCep.current = ''
    }

    setCepState(
      digits.length === 0
        ? 'idle'
        : digits.length === 8
          ? 'typing'
          : 'typing'
    )

    setCepMessage(
      digits.length > 0 && digits.length < 8
        ? 'Digite os 8 números do CEP.'
        : ''
    )

    setForm(current => ({
      ...current,
      postal_code: formatted,
      ...(cepState === 'found'
        ? {
            street: '',
            neighborhood: '',
            city: '',
            state: 'SP'
          }
        : {})
    }))

    invalidateQuote()
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('')

    if (!items.length) {
      setMessage('Seu carrinho está vazio.')
      return
    }

    if (invalidItems.length > 0) {
      setMessage(
        'Existe um item inválido no carrinho. Volte ao carrinho e tente novamente.'
      )
      return
    }

    if (!settingsReady || settingsError || !settings) {
      setMessage(
        'A configuração do checkout ainda não está disponível.'
      )
      return
    }

    if (!isCompleteCep(form.postal_code)) {
      setMessage(
        'Informe um CEP válido antes de continuar.'
      )
      return
    }

    if (!quote?.available) {
      setMessage(
        'Confirme uma entrega válida na Região 012 antes de continuar.'
      )
      return
    }

    setSending(true)

    try {
      const order = await remoteApi.createOrder({
        contact_name: form.contact_name,
        contact_email: form.contact_email,
        contact_phone:
          form.contact_phone || null,

        items: detailed.map(
          ({ item, variant }) => ({
            variant_id: variant!.id,
            quantity: item.qty
          })
        ),

        shipping_address: {
          recipient_name: form.contact_name,
          phone: form.contact_phone || null,
          postal_code: form.postal_code,
          street: form.street,
          number: form.number,
          complement: form.complement || null,
          neighborhood:
            form.neighborhood || null,
          city: form.city,
          state: form.state,
          country_code: 'BR'
        },

        shipping_method:
          quote.method ?? 'Região 012',

        customer_note:
          form.customer_note || null
      })

      if (!settings.payment_enabled) {
        clearCart()

        navigate(
          '/pedido-confirmado',
          {
            replace: true,
            state: { order }
          }
        )

        return
      }

      const payment =
        await remoteApi.createMercadoPagoCheckout(
          order.order_code,
          form.contact_email
        )

      clearCart()
      window.location.assign(
        payment.checkout_url
      )

    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível finalizar o pedido.'
      )
    } finally {
      setSending(false)
    }
  }

  const displayedTotal =
    quote?.available && quote.total != null
      ? Number(quote.total)
      : subtotal

  const addressLocked =
    cepState === 'found'

  if (items.length === 0) {
    return (
      <main>
        <section className="page-hero">
          <h1 className="page-title">
            Checkout
          </h1>
        </section>

        <section className="checkout-empty">
          <p>Seu carrinho está vazio.</p>

          <Link
            className="primary-cta"
            to="/produtos"
          >
            Ver produtos
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main>
      <section className="page-hero checkout-head">
        <div className="breadcrumb">
          <Link to="/carrinho">
            Carrinho
          </Link>
          {' > '}
          Checkout
        </div>

        <h1 className="page-title">
          Finalizar pedido
        </h1>

        <p className="page-copy">
          Você pode comprar como visitante.
          No momento entregamos somente na Região 012.
        </p>
      </section>

      <section className="checkout-grid checkout-real">
        <form
          className="checkout-form"
          onSubmit={submit}
        >
          {!logged && (
            <div className="checkout-login-note">
              <span>Já tem conta?</span>

              <Link
                to="/entrar"
                state={{ from: '/checkout' }}
              >
                Entrar para preencher seus dados
              </Link>
            </div>
          )}

          <h2>Contato</h2>

          <label>
            Nome completo
            <input
              value={form.contact_name}
              onChange={e =>
                setForm(v => ({
                  ...v,
                  contact_name:
                    e.target.value
                }))
              }
              required
            />
          </label>

          <div className="form-two">
            <label>
              E-mail
              <input
                type="email"
                value={form.contact_email}
                readOnly={logged}
                onChange={e =>
                  setForm(v => ({
                    ...v,
                    contact_email:
                      e.target.value
                  }))
                }
                required
              />
            </label>

            <label>
              Telefone
              <input
                value={form.contact_phone}
                onChange={e =>
                  setForm(v => ({
                    ...v,
                    contact_phone:
                      e.target.value
                  }))
                }
              />
            </label>
          </div>

          <h2>Entrega</h2>

          <div className="checkout-cep-row">
            <label>
              CEP
              <div className="cep-input-wrap">
                <input
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={9}
                  placeholder="00000-000"
                  value={form.postal_code}
                  onChange={e =>
                    changeCep(e.target.value)
                  }
                  onBlur={() => {
                    if (
                      isCompleteCep(
                        form.postal_code
                      )
                    ) {
                      void searchCep()
                    }
                  }}
                  required
                />

                <span
                  className={
                    `cep-status-dot ${cepState}`
                  }
                  aria-hidden="true"
                />
              </div>
            </label>

            <button
              type="button"
              className="cep-search-button"
              disabled={
                cepState === 'loading'
                || !isCompleteCep(
                  form.postal_code
                )
              }
              onClick={() =>
                void searchCep()
              }
            >
              {cepState === 'loading'
                ? 'Buscando...'
                : cepState === 'found'
                  ? 'Buscar novamente'
                  : 'Buscar CEP'}
            </button>
          </div>

          {cepMessage && (
            <div
              className={
                `cep-feedback ${cepState}`
              }
            >
              {cepMessage}
            </div>
          )}

          <label>
            Rua
            <input
              autoComplete="address-line1"
              value={form.street}
              onChange={e =>
                setForm(v => ({
                  ...v,
                  street: e.target.value
                }))
              }
              placeholder={
                cepState === 'loading'
                  ? 'Buscando...'
                  : ''
              }
              required
            />
          </label>

          <div className="form-two">
            <label>
              Número
              <input
                autoComplete="address-line2"
                value={form.number}
                onChange={e =>
                  setForm(v => ({
                    ...v,
                    number: e.target.value
                  }))
                }
                required
              />
            </label>

            <label>
              Complemento
              <input
                value={form.complement}
                onChange={e =>
                  setForm(v => ({
                    ...v,
                    complement:
                      e.target.value
                  }))
                }
              />
            </label>
          </div>

          <label>
            Bairro
            <input
              value={form.neighborhood}
              onChange={e =>
                setForm(v => ({
                  ...v,
                  neighborhood:
                    e.target.value
                }))
              }
            />
          </label>

          <div className="form-two">
            <label>
              Cidade
              <input
                value={form.city}
                readOnly={addressLocked}
                className={
                  addressLocked
                    ? 'address-locked'
                    : ''
                }
                onChange={e => {
                  setForm(v => ({
                    ...v,
                    city: e.target.value
                  }))
                  invalidateQuote()
                }}
                required
              />
            </label>

            <label>
              Estado
              <input
                value={form.state}
                maxLength={80}
                readOnly={addressLocked}
                className={
                  addressLocked
                    ? 'address-locked'
                    : ''
                }
                onChange={e => {
                  setForm(v => ({
                    ...v,
                    state: e.target.value
                  }))
                  invalidateQuote()
                }}
                required
              />
            </label>
          </div>

          {addressLocked && (
            <p className="address-lock-note">
              Cidade e estado vieram do CEP.
              Para alterar, informe outro CEP.
            </p>
          )}

          {(cepState === 'manual'
            || cepState === 'error') && (
            <p className="address-manual-note">
              A busca automática não está disponível.
              Preencha o endereço e use o cálculo
              manual abaixo.
            </p>
          )}

          <button
            className="shipping-quote-button"
            type="button"
            disabled={
              loadingQuote
              || !quoteItems.length
              || !form.city.trim()
              || !form.state.trim()
            }
            onClick={() =>
              void calculateShipping()
            }
          >
            {loadingQuote
              ? 'Validando entrega...'
              : quote?.available
                ? 'Recalcular entrega'
                : 'Calcular entrega'}
          </button>

          {quote?.available && (
            <div className="shipping-quote-result">
              <div>
                <small>ENTREGA DISPONÍVEL</small>
                <strong>
                  {quote.method}
                </strong>

                <span>
                  {quote.estimated_days_min != null
                  && quote.estimated_days_max != null
                    ? `${quote.estimated_days_min} a ${quote.estimated_days_max} dias`
                    : 'Prazo a confirmar'}
                </span>
              </div>

              <b>
                {Number(quote.price ?? 0) === 0
                  ? 'GRÁTIS'
                  : money(
                      Number(quote.price)
                    )}
              </b>
            </div>
          )}

          <label>
            Observação do pedido
            <textarea
              value={form.customer_note}
              onChange={e =>
                setForm(v => ({
                  ...v,
                  customer_note:
                    e.target.value
                }))
              }
              placeholder="Opcional"
            />
          </label>

          <div className="checkout-payment-placeholder">
            <small>PAGAMENTO</small>

            <strong>
              {!settingsReady
                ? 'Carregando configuração...'
                : settingsError
                  ? 'Checkout indisponível'
                  : settings?.payment_enabled
                    ? 'Mercado Pago'
                    : 'Modo de teste'}
            </strong>

            <p>
              {settings?.payment_enabled
                ? 'Após confirmar o pedido, você será redirecionado ao Checkout Pro do Mercado Pago.'
                : 'O pagamento está desativado. O pedido será criado e o estoque ficará reservado para validarmos o fluxo.'}
            </p>
          </div>

          <button
            className="buy-btn ready"
            disabled={
              sending
              || loadingQuote
              || cepState === 'loading'
              || !quote?.available
              || !settingsReady
              || Boolean(settingsError)
            }
          >
            {sending
              ? 'Processando...'
              : settings?.payment_enabled
                ? 'Pagar com Mercado Pago'
                : 'Criar pedido de teste'}
          </button>

          {(message || settingsError) && (
            <p className="form-message error">
              {message || settingsError}
            </p>
          )}
        </form>

        <aside className="cart-summary checkout-summary">
          <h3>Seu pedido</h3>

          {detailed.map(
            ({ item, product, variant }) =>
              product && variant ? (
                <div
                  className="checkout-product"
                  key={`${item.id}-${variant.id}`}
                >
                  <img
                    src={productPrimaryImage(product)}
                    alt={product.name}
                  />

                  <div>
                    <strong>
                      {product.name}
                    </strong>

                    <span>
                      {variant.fit}
                      {' · '}
                      {variant.size}
                      {' · '}
                      {item.qty} un.
                    </span>
                  </div>

                  <b>
                    {money(
                      product.effective_price
                      * item.qty
                    )}
                  </b>
                </div>
              ) : null
          )}

          <div className="summary-row">
            <span>Subtotal</span>
            <strong>
              {money(subtotal)}
            </strong>
          </div>

          <div className="summary-row">
            <span>Frete</span>

            <strong>
              {quote?.available
                ? Number(quote.price ?? 0) === 0
                  ? 'GRÁTIS'
                  : money(
                      Number(quote.price)
                    )
                : 'Calcular'}
            </strong>
          </div>

          <div className="summary-row total">
            <span>Total</span>

            <strong>
              {money(displayedTotal)}
            </strong>
          </div>
        </aside>
      </section>
    </main>
  )
}
