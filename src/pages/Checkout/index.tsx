import './styles.module.css'
import './stylesMobile.module.css'
import {
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
} from '../../context/CatalogContext'
import { useCart } from '../../context/CartContext'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { MercadoPagoCardPayment } from '../../components/MercadoPagoCardPayment'
import { remoteApi } from '../../lib/api'
import {
  formatCep,
  isCompleteCep,
  lookupCep,
  onlyCepDigits
} from '../../lib/cep'
import type {
  CheckoutSettings,
  MercadoPagoTransparentPayment,
  Order,
  ShippingQuote
} from '../../lib/types'

type CepState =
  | 'idle'
  | 'typing'
  | 'loading'
  | 'found'
  | 'manual'
  | 'error'

type PaymentMethod = 'pix' | 'card'

type PendingOrder = {
  order_code: string
  email: string
  fingerprint: string
}

const PENDING_ORDER_KEY =
  'gb_pending_transparent_order'

export function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const { products } = useCatalog()
  const { customer, logged } = useCustomerAuth()
  const navigate = useNavigate()

  const [loadingQuote, setLoadingQuote] = useState(false)
  const [message, setMessage] = useState('')
  const [paymentMessage, setPaymentMessage] = useState('')
  const [paymentBusy, setPaymentBusy] = useState(false)
  const [quote, setQuote] = useState<ShippingQuote | null>(null)
  const [settings, setSettings] = useState<CheckoutSettings | null>(null)
  const [settingsReady, setSettingsReady] = useState(false)
  const [settingsError, setSettingsError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null)
  const [pixPayment, setPixPayment] =
    useState<MercadoPagoTransparentPayment | null>(null)
  const [copied, setCopied] = useState(false)
  const [cardChallengeUrl, setCardChallengeUrl] = useState<string | null>(null)
  const [cardPendingOrderCode, setCardPendingOrderCode] = useState<string | null>(null)
  const [cepState, setCepState] = useState<CepState>('idle')
  const [cepMessage, setCepMessage] = useState('')
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
    return () => { active = false }
  }, [])

  const detailed = useMemo(
    () => items.map(item => {
      const product = products.find(p => p.id === item.id)
      const variant = product
        ? (
            item.variantId
              ? product.variants.find(v => v.id === item.variantId)
              : undefined
          )
          ?? product.variants.find(
            v => v.fit === item.fit && v.size === item.size
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

  const displayedTotal =
    quote?.available && quote.total != null
      ? Number(quote.total)
      : subtotal

  const fingerprint = useMemo(
    () => JSON.stringify({
      items: quoteItems,
      email: form.contact_email.trim().toLowerCase(),
      postal_code: onlyCepDigits(form.postal_code),
      street: form.street.trim().toLowerCase(),
      number: form.number.trim(),
      city: form.city.trim().toLowerCase(),
      state: form.state.trim().toUpperCase(),
      total: displayedTotal
    }),
    [
      quoteItems,
      form.contact_email,
      form.postal_code,
      form.street,
      form.number,
      form.city,
      form.state,
      displayedTotal
    ]
  )

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PENDING_ORDER_KEY)
      if (!raw) return
      const saved = JSON.parse(raw) as PendingOrder
      if (saved.fingerprint === fingerprint) {
        setPendingOrder(saved)
      }
    } catch {}
  }, [fingerprint])

  const savePendingOrder = (value: PendingOrder | null) => {
    setPendingOrder(value)
    if (value) {
      sessionStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(value))
    } else {
      sessionStorage.removeItem(PENDING_ORDER_KEY)
    }
  }

  const invalidateQuote = () => {
    if (pendingOrder || pixPayment) return
    setQuote(null)
    setMessage('')
  }

  const requestShippingQuote = async (
    city: string,
    state: string,
    options?: { silent?: boolean }
  ) => {
    if (
      !city.trim()
      || !state.trim()
      || !quoteItems.length
      || invalidItems.length > 0
    ) return null

    setLoadingQuote(true)
    if (!options?.silent) setMessage('')

    try {
      const result = await remoteApi.shippingQuote({
        city,
        state,
        country_code: 'BR',
        items: quoteItems
      })
      setQuote(result)
      setMessage(
        result.available
          ? ''
          : result.reason ?? 'Entrega indisponível para este endereço.'
      )
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

  const searchCep = async (value = form.postal_code) => {
    if (pendingOrder || pixPayment) return
    const digits = onlyCepDigits(value)
    if (digits.length !== 8) {
      setCepState(digits.length ? 'typing' : 'idle')
      setCepMessage(digits.length ? 'Digite os 8 números do CEP.' : '')
      return
    }
    if (cepState === 'loading' || lastLookedUpCep.current === digits) return

    lastLookedUpCep.current = digits
    setCepState('loading')
    setCepMessage('Buscando endereço...')
    setMessage('')
    setQuote(null)

    try {
      const address = await lookupCep(digits)
      setForm(current => ({
        ...current,
        postal_code: formatCep(address.cep || digits),
        street: address.logradouro || current.street,
        neighborhood: address.bairro || current.neighborhood,
        city: address.localidade || current.city,
        state: address.uf || current.state
      }))
      setCepState('found')
      setCepMessage('Endereço encontrado. Confira o número e o complemento.')
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
    const digits = onlyCepDigits(form.postal_code)
    if (digits.length !== 8 || pendingOrder || pixPayment) return
    const timer = window.setTimeout(() => {
      void searchCep(form.postal_code)
    }, 350)
    return () => window.clearTimeout(timer)
  }, [form.postal_code, pendingOrder, pixPayment])

  const changeCep = (value: string) => {
    if (pendingOrder || pixPayment) return
    const formatted = formatCep(value)
    const digits = onlyCepDigits(formatted)
    if (
      lastLookedUpCep.current
      && lastLookedUpCep.current !== digits
    ) lastLookedUpCep.current = ''

    setCepState(digits.length ? 'typing' : 'idle')
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

  const validateBeforePayment = () => {
    if (!settingsReady || settingsError || !settings) {
      throw new Error('A configuração do checkout ainda não está disponível.')
    }
    if (!settings.payment_enabled) {
      throw new Error('O pagamento online está temporariamente indisponível.')
    }
    if (settings.payment_flow !== 'checkout_transparente') {
      throw new Error('Não foi possível iniciar o pagamento agora. Tente novamente em instantes.')
    }
    if (!form.contact_name.trim() || !form.contact_email.trim()) {
      throw new Error('Preencha nome e e-mail.')
    }
    if (!isCompleteCep(form.postal_code)) {
      throw new Error('Informe um CEP válido.')
    }
    if (!form.street.trim() || !form.number.trim() || !form.city.trim() || !form.state.trim()) {
      throw new Error('Complete o endereço de entrega.')
    }
    if (!quote?.available) {
      throw new Error('Confirme uma entrega válida na Região 012.')
    }
    if (invalidItems.length) {
      throw new Error('Existe um item inválido no carrinho.')
    }
  }

  const ensureOrder = async () => {
    validateBeforePayment()

    if (
      pendingOrder
      && pendingOrder.email.toLowerCase() === form.contact_email.trim().toLowerCase()
      && pendingOrder.fingerprint === fingerprint
    ) {
      return pendingOrder.order_code
    }

    const order = await remoteApi.createOrder({
      contact_name: form.contact_name,
      contact_email: form.contact_email,
      contact_phone: form.contact_phone || null,
      items: detailed.map(({ item, variant }) => ({
        variant_id: variant!.id,
        quantity: item.qty
      })),
      shipping_address: {
        recipient_name: form.contact_name,
        phone: form.contact_phone || null,
        postal_code: form.postal_code,
        street: form.street,
        number: form.number,
        complement: form.complement || null,
        neighborhood: form.neighborhood || null,
        city: form.city,
        state: form.state,
        country_code: 'BR'
      },
      shipping_method: quote?.method ?? 'Região 012',
      customer_note: form.customer_note || null
    })

    const saved = {
      order_code: order.order_code,
      email: form.contact_email,
      fingerprint
    }
    savePendingOrder(saved)
    return order.order_code
  }

  const finishPaidOrder = async (orderCode: string) => {
    const order = await remoteApi.lookupOrder(orderCode, form.contact_email)
    if (order.payment_status !== 'paid') return false
    clearCart()
    savePendingOrder(null)
    setPixPayment(null)
    navigate('/pedido-confirmado', {
      replace: true,
      state: { order }
    })
    return true
  }

  const generatePix = async () => {
    setPaymentMessage('')
    setPaymentBusy(true)
    try {
      const orderCode = await ensureOrder()
      const payment = await remoteApi.createMercadoPagoPix(
        orderCode,
        form.contact_email
      )
      setPixPayment(payment)
      setPaymentMethod('pix')
      if (payment.status === 'paid') {
        await finishPaidOrder(orderCode)
      }
    } catch (error) {
      setPaymentMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível gerar o Pix.'
      )
    } finally {
      setPaymentBusy(false)
    }
  }

  const payCard = async (
    formData: any,
    additionalData?: any
  ) => {
    setPaymentMessage('')
    setPaymentBusy(true)
    try {
      const orderCode = await ensureOrder()
      const paymentType = additionalData?.paymentTypeId
        ?? 'credit_card'

      if (!['credit_card', 'debit_card'].includes(paymentType)) {
        throw new Error('Tipo de cartão não suportado.')
      }

      const payment = await remoteApi.createMercadoPagoCard({
        order_code: orderCode,
        email: form.contact_email,
        token: formData.token,
        payment_method_id: formData.payment_method_id,
        payment_type_id: paymentType,
        installments: Number(formData.installments || 1),
        identification_type:
          formData.payer?.identification?.type || null,
        identification_number:
          formData.payer?.identification?.number || null
      })

      if (payment.status === 'paid') {
        await finishPaidOrder(orderCode)
        return
      }

      setCardPendingOrderCode(orderCode)
      if (payment.challenge_url) {
        setCardChallengeUrl(payment.challenge_url)
        setPaymentMessage('Seu banco pediu uma verificação de segurança 3DS. Conclua abaixo sem sair da Grumble Bee.')
      } else {
        setPaymentMessage(
          payment.status === 'pending'
            ? 'Pagamento enviado. Estamos aguardando a confirmação.'
            : 'Não foi possível concluir o pagamento. Confira os dados ou tente outro meio.'
        )
      }
    } catch (error) {
      const text = error instanceof Error
        ? error.message
        : 'Não foi possível processar o cartão.'
      setPaymentMessage(text)
      throw error
    } finally {
      setPaymentBusy(false)
    }
  }

  useEffect(() => {
    if (!pixPayment || !pendingOrder) return
    let stopped = false
    const check = async () => {
      try {
        const order = await remoteApi.lookupOrder(
          pendingOrder.order_code,
          pendingOrder.email
        )
        if (!stopped && order.payment_status === 'paid') {
          clearCart()
          savePendingOrder(null)
          setPixPayment(null)
          navigate('/pedido-confirmado', {
            replace: true,
            state: { order }
          })
        }
      } catch {}
    }
    void check()
    const timer = window.setInterval(() => void check(), 5000)
    return () => {
      stopped = true
      window.clearInterval(timer)
    }
  }, [pixPayment, pendingOrder])

  useEffect(() => {
    if (!cardPendingOrderCode) return
    let stopped = false

    const check = async () => {
      try {
        const order = await remoteApi.lookupOrder(
          cardPendingOrderCode,
          form.contact_email
        )
        if (!stopped && order.payment_status === 'paid') {
          clearCart()
          savePendingOrder(null)
          setCardChallengeUrl(null)
          setCardPendingOrderCode(null)
          navigate('/pedido-confirmado', {
            replace: true,
            state: { order }
          })
        } else if (!stopped && ['failed', 'cancelled'].includes(order.payment_status)) {
          setPaymentMessage('O pagamento não foi aprovado. Você pode tentar novamente com outro cartão.')
          setCardChallengeUrl(null)
          setCardPendingOrderCode(null)
        }
      } catch {}
    }

    void check()
    const timer = window.setInterval(() => void check(), 4000)

    const onMessage = (event: MessageEvent) => {
      if (event?.data?.status === 'COMPLETE') {
        void check()
      }
    }
    window.addEventListener('message', onMessage)

    return () => {
      stopped = true
      window.clearInterval(timer)
      window.removeEventListener('message', onMessage)
    }
  }, [cardPendingOrderCode, form.contact_email])

  const copyPix = async () => {
    if (!pixPayment?.qr_code) return
    await navigator.clipboard.writeText(pixPayment.qr_code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  const locked = Boolean(pendingOrder || pixPayment)
  const addressLocked = cepState === 'found' || locked
  const paymentReady =
    Boolean(quote?.available)
    && Boolean(settings?.payment_enabled)
    && settings?.payment_flow === 'checkout_transparente'
    && isCompleteCep(form.postal_code)
    && !invalidItems.length

  if (!items.length && !pendingOrder) {
    return (
      <main className="gb5311-checkout-page">
        <section className="gb5311-checkout-hero gb5311-checkout-hero-empty">
          <div>
            <div className="gb5311-checkout-label">
              <span>Grumble Bee</span>
              <i />
              <span>Checkout</span>
            </div>

            <h1>Finalizar pedido.</h1>

            <p>
              Seu carrinho está vazio no momento.
            </p>
          </div>
        </section>

        <section className="gb5311-checkout-empty">
          <span aria-hidden="true">⚡</span>

          <small>SEU PEDIDO</small>

          <h2>
            Escolha suas peças antes de continuar.
          </h2>

          <Link to="/produtos">
            Ver produtos
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="gb5311-checkout-page">
      <section className="gb5311-checkout-hero">
        <div>
          <div className="gb5311-checkout-label">
            <Link to="/carrinho">Carrinho</Link>
            <i />
            <span>Checkout</span>
          </div>

          <h1>
            Finalize
            <br />
            seu pedido.
          </h1>

          <p>
            Preencha os dados de entrega e escolha a forma de pagamento.
          </p>
        </div>

        <span
          className="gb5311-checkout-bolt"
          aria-hidden="true"
        >
          ⚡
        </span>
      </section>

      <section className="gb5311-checkout-trust">
        <div>
          <strong>Compra segura</strong>
          <span>Ambiente protegido</span>
        </div>

        <i />

        <div>
          <strong>Região 012</strong>
          <span>Entrega validada</span>
        </div>

        <i />

        <div>
          <strong>Pagamento</strong>
          <span>Pix ou cartão</span>
        </div>
      </section>

      <section className="gb5311-checkout-layout">
        <div className="gb5311-checkout-main">
          <div className="gb5311-steps">
            <div className="active">
              <strong>01</strong>
              <span>Contato</span>
            </div>

            <i />

            <div className={isCompleteCep(form.postal_code) ? 'active' : ''}>
              <strong>02</strong>
              <span>Entrega</span>
            </div>

            <i />

            <div className={quote?.available ? 'active' : ''}>
              <strong>03</strong>
              <span>Pagamento</span>
            </div>
          </div>

          <section className="gb5311-form-section">
            <div className="gb5311-form-section-head">
              <div>
                <small>01 · CONTATO</small>
                <h2>Seus dados</h2>
              </div>

              <span aria-hidden="true">01</span>
            </div>

            {!logged && (
              <div className="gb5311-login-note">
                <span>Já tem conta?</span>

                <Link
                  to="/entrar"
                  state={{ from: '/checkout' }}
                >
                  Entrar e preencher automaticamente
                </Link>
              </div>
            )}

            <div className="gb5311-field-grid">
              <label className="gb5311-field gb5311-field-full">
                <span>Nome completo</span>

                <input
                  value={form.contact_name}
                  readOnly={locked}
                  autoComplete="name"
                  onChange={e =>
                    setForm(v => ({
                      ...v,
                      contact_name: e.target.value
                    }))
                  }
                  required
                />
              </label>

              <label className="gb5311-field">
                <span>E-mail</span>

                <input
                  type="email"
                  value={form.contact_email}
                  readOnly={logged || locked}
                  autoComplete="email"
                  onChange={e =>
                    setForm(v => ({
                      ...v,
                      contact_email: e.target.value
                    }))
                  }
                  required
                />
              </label>

              <label className="gb5311-field">
                <span>Telefone</span>

                <input
                  value={form.contact_phone}
                  readOnly={locked}
                  inputMode="tel"
                  autoComplete="tel"
                  onChange={e =>
                    setForm(v => ({
                      ...v,
                      contact_phone: e.target.value
                    }))
                  }
                />
              </label>
            </div>
          </section>

          <section className="gb5311-form-section">
            <div className="gb5311-form-section-head">
              <div>
                <small>02 · ENTREGA</small>
                <h2>Onde entregar</h2>
              </div>

              <span aria-hidden="true">02</span>
            </div>

            <div className="gb5311-cep-row">
              <label className="gb5311-field">
                <span>CEP</span>

                <div className="gb5311-cep-input">
                  <input
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={9}
                    placeholder="00000-000"
                    value={form.postal_code}
                    readOnly={locked}
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

                  <b
                    className={[
                      'gb5311-cep-dot',
                      cepState
                    ].join(' ')}
                    aria-hidden="true"
                  />
                </div>
              </label>

              <button
                type="button"
                className="gb5311-cep-search"
                disabled={
                  locked
                  || cepState === 'loading'
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
                  : 'Buscar CEP'}
              </button>
            </div>

            {cepMessage && (
              <div
                className={[
                  'gb5311-feedback',
                  cepState
                ].join(' ')}
              >
                {cepMessage}
              </div>
            )}

            <div className="gb5311-field-grid gb5311-address-grid">
              <label className="gb5311-field gb5311-field-full">
                <span>Rua</span>

                <input
                  value={form.street}
                  readOnly={locked}
                  autoComplete="address-line1"
                  onChange={e =>
                    setForm(v => ({
                      ...v,
                      street: e.target.value
                    }))
                  }
                  required
                />
              </label>

              <label className="gb5311-field">
                <span>Número</span>

                <input
                  value={form.number}
                  readOnly={locked}
                  autoComplete="address-line2"
                  onChange={e =>
                    setForm(v => ({
                      ...v,
                      number: e.target.value
                    }))
                  }
                  required
                />
              </label>

              <label className="gb5311-field">
                <span>Complemento</span>

                <input
                  value={form.complement}
                  readOnly={locked}
                  onChange={e =>
                    setForm(v => ({
                      ...v,
                      complement: e.target.value
                    }))
                  }
                  placeholder="Opcional"
                />
              </label>

              <label className="gb5311-field gb5311-field-full">
                <span>Bairro</span>

                <input
                  value={form.neighborhood}
                  readOnly={locked}
                  onChange={e =>
                    setForm(v => ({
                      ...v,
                      neighborhood: e.target.value
                    }))
                  }
                />
              </label>

              <label className="gb5311-field">
                <span>Cidade</span>

                <input
                  value={form.city}
                  readOnly={addressLocked}
                  className={
                    addressLocked
                      ? 'address-locked'
                      : ''
                  }
                  autoComplete="address-level2"
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

              <label className="gb5311-field">
                <span>Estado</span>

                <input
                  value={form.state}
                  readOnly={addressLocked}
                  className={
                    addressLocked
                      ? 'address-locked'
                      : ''
                  }
                  autoComplete="address-level1"
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

            <button
              className={[
                'gb5311-shipping-button',
                quote?.available
                  ? 'available'
                  : ''
              ].filter(Boolean).join(' ')}
              type="button"
              disabled={
                locked
                || loadingQuote
                || !quoteItems.length
                || !form.city.trim()
                || !form.state.trim()
              }
              onClick={() =>
                void requestShippingQuote(
                  form.city,
                  form.state
                )
              }
            >
              {loadingQuote
                ? 'Validando entrega...'
                : quote?.available
                  ? 'Recalcular entrega'
                  : 'Calcular entrega'}
            </button>

            {quote?.available && (
              <div className="gb5311-shipping-result">
                <div className="gb5311-shipping-icon">
                  ✓
                </div>

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
                  {Number(
                    quote.price ?? 0
                  ) === 0
                    ? 'GRÁTIS'
                    : money(
                        Number(
                          quote.price
                        )
                      )}
                </b>
              </div>
            )}

            <label className="gb5311-field gb5311-note-field">
              <span>Observação do pedido</span>

              <textarea
                value={form.customer_note}
                readOnly={locked}
                onChange={e =>
                  setForm(v => ({
                    ...v,
                    customer_note: e.target.value
                  }))
                }
                placeholder="Opcional"
              />
            </label>

            {message && (
              <p className="gb5311-message error">
                {message}
              </p>
            )}
          </section>

          <section className="gb5311-form-section gb5311-payment-section">
            <div className="gb5311-form-section-head">
              <div>
                <small>03 · PAGAMENTO</small>
                <h2>Como pagar</h2>
              </div>

              <span aria-hidden="true">03</span>
            </div>

            <div className="gb5311-payment-brand">
              <div>
                <strong>Pagamento seguro</strong>
                <span>Processado pelo Mercado Pago</span>
              </div>

              <b>MP</b>
            </div>

            {!settingsReady && (
              <div className="gb5311-payment-loading">
                Carregando meios de pagamento...
              </div>
            )}

            {(settingsError
              || !settings?.payment_enabled)
              && settingsReady && (
                <div className="gb5311-payment-warning">
                  O pagamento online está temporariamente indisponível.
                </div>
              )}

            {settings?.payment_enabled
              && !settings.mercado_pago_public_key && (
                <div className="gb5311-payment-warning">
                  O pagamento por cartão está temporariamente indisponível. Você ainda pode utilizar os outros meios exibidos.
                </div>
              )}

            <div className="gb5311-payment-tabs">
              {settings?.allow_pix && (
                <button
                  type="button"
                  className={
                    paymentMethod === 'pix'
                      ? 'active'
                      : ''
                  }
                  disabled={Boolean(pixPayment)}
                  onClick={() =>
                    setPaymentMethod('pix')
                  }
                >
                  <b>PIX</b>
                  <span>
                    QR Code e copia e cola
                  </span>
                </button>
              )}

              {settings?.allow_credit_card && (
                <button
                  type="button"
                  className={
                    paymentMethod === 'card'
                      ? 'active'
                      : ''
                  }
                  disabled={Boolean(pixPayment)}
                  onClick={() =>
                    setPaymentMethod('card')
                  }
                >
                  <b>CARTÃO</b>
                  <span>
                    Crédito ou débito
                  </span>
                </button>
              )}
            </div>

            {paymentMethod === 'pix'
              && !pixPayment && (
                <div className="gb5311-pix-start">
                  <div className="gb5311-pix-mark">
                    PIX
                  </div>

                  <div className="gb5311-pix-copy">
                    <strong>
                      Pagamento via Pix
                    </strong>

                    <p>
                      Gere o QR Code e conclua pelo aplicativo do seu banco.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="gb5311-pay-button"
                    disabled={
                      !paymentReady
                      || paymentBusy
                    }
                    onClick={() =>
                      void generatePix()
                    }
                  >
                    {paymentBusy
                      ? 'Gerando Pix...'
                      : `Gerar Pix · ${money(displayedTotal)}`}
                  </button>

                  {!paymentReady && (
                    <small className="gb5311-payment-hint">
                      Preencha seus dados e confirme a entrega para liberar o pagamento.
                    </small>
                  )}
                </div>
              )}

            {paymentMethod === 'pix'
              && pixPayment && (
                <div className="gb5311-pix-result">
                  <small>
                    PEDIDO {pixPayment.order_code}
                  </small>

                  <h3>
                    Escaneie para pagar
                  </h3>

                  {pixPayment.qr_code_base64 && (
                    <img
                      className="gb5311-pix-qr"
                      src={
                        pixPayment.qr_code_base64.startsWith(
                          'data:'
                        )
                          ? pixPayment.qr_code_base64
                          : `data:image/png;base64,${pixPayment.qr_code_base64}`
                      }
                      alt="QR Code Pix"
                    />
                  )}

                  <strong className="gb5311-pix-total">
                    {money(displayedTotal)}
                  </strong>

                  <p className="gb5311-pix-waiting">
                    Aguardando confirmação do pagamento...
                  </p>

                  {pixPayment.qr_code && (
                    <>
                      <textarea
                        className="gb5311-pix-code"
                        readOnly
                        value={pixPayment.qr_code}
                      />

                      <button
                        type="button"
                        className="gb5311-pix-copy-button"
                        onClick={() =>
                          void copyPix()
                        }
                      >
                        {copied
                          ? 'COPIADO ✓'
                          : 'COPIAR PIX COPIA E COLA'}
                      </button>
                    </>
                  )}

                  {pixPayment.ticket_url && (
                    <a
                      className="gb5311-pix-ticket"
                      href={pixPayment.ticket_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Abrir instruções do Pix
                    </a>
                  )}
                </div>
              )}

            {paymentMethod === 'card'
              && !pixPayment && (
                <div className="gb5311-card-area">
                  {!cardChallengeUrl && (
                    <MercadoPagoCardPayment
                      publicKey={
                        settings?.mercado_pago_public_key
                        ?? ''
                      }
                      amount={displayedTotal}
                      email={form.contact_email}
                      disabled={
                        !paymentReady
                        || paymentBusy
                      }
                      onSubmit={payCard}
                      onError={
                        setPaymentMessage
                      }
                    />
                  )}

                  {cardChallengeUrl && (
                    <div className="gb5311-three-ds">
                      <small>
                        VERIFICAÇÃO DO BANCO
                      </small>

                      <h3>
                        Confirme a compra
                      </h3>

                      <p>
                        Siga as instruções do seu banco para concluir o pagamento com segurança.
                      </p>

                      <iframe
                        className="gb5311-three-ds-frame"
                        src={cardChallengeUrl}
                        title="Autenticação 3DS do cartão"
                      />

                      <span>
                        Aguardando confirmação do banco...
                      </span>
                    </div>
                  )}
                </div>
              )}

            {pendingOrder && (
              <p className="gb5311-pending-order">
                Pedido reservado:{' '}
                <strong>
                  {pendingOrder.order_code}
                </strong>
              </p>
            )}

            {paymentMessage && (
              <p className="gb5311-message error">
                {paymentMessage}
              </p>
            )}
          </section>
        </div>

        <aside className="gb5311-summary">
          <div className="gb5311-summary-head">
            <div>
              <small>SEU PEDIDO</small>
              <h2>Resumo</h2>
            </div>

            <span aria-hidden="true">
              ⚡
            </span>
          </div>

          <div className="gb5311-summary-products">
            {detailed.map(
              ({
                item,
                product,
                variant
              }) =>
                product && variant ? (
                  <div
                    className="gb5311-summary-product"
                    key={`${item.id}-${variant.id}`}
                  >
                    <img
                      src={
                        productPrimaryImage(
                          product
                        )
                      }
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
                        {item.qty}{' '}
                        {item.qty === 1
                          ? 'un.'
                          : 'un.'}
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
          </div>

          <div className="gb5311-summary-lines">
            <div>
              <span>Subtotal</span>
              <strong>
                {money(subtotal)}
              </strong>
            </div>

            <div>
              <span>Frete</span>

              <strong>
                {quote?.available
                  ? Number(
                      quote.price ?? 0
                    ) === 0
                    ? 'GRÁTIS'
                    : money(
                        Number(
                          quote.price
                        )
                      )
                  : 'A calcular'}
              </strong>
            </div>
          </div>

          <div className="gb5311-summary-total">
            <span>Total</span>

            <strong>
              {money(displayedTotal)}
            </strong>
          </div>

          <div className="gb5311-summary-security">
            <span aria-hidden="true">
              ✓
            </span>

            <div>
              <strong>
                Pagamento protegido
              </strong>

              <p>
                Seus dados de pagamento são processados com segurança pelo Mercado Pago.
              </p>
            </div>
          </div>

          <Link
            className="gb5311-back-cart"
            to="/carrinho"
          >
            Voltar ao carrinho
          </Link>
        </aside>
      </section>

      <section className="gb5311-checkout-bottom">
        <div>
          <small>GRUMBLE BEE</small>

          <h2>
            Seu drop.
            <br />
            Seu pedido.
          </h2>
        </div>

        <span aria-hidden="true">
          ⚡
        </span>
      </section>
    </main>
  )
}
