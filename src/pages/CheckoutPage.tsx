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
} from '../context/CatalogContext'
import { useCart } from '../context/CartContext'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { MercadoPagoCardPayment } from '../components/MercadoPagoCardPayment'
import { CheckoutMotionStrip } from '../components/CheckoutMotionStrip'
import { remoteApi } from '../lib/api'
import {
  formatCep,
  isCompleteCep,
  lookupCep,
  onlyCepDigits
} from '../lib/cep'
import type {
  CheckoutSettings,
  MercadoPagoTransparentPayment,
  Order,
  ShippingQuote
} from '../lib/types'

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
      throw new Error('Pagamento online está desativado no ADM.')
    }
    if (settings.payment_flow !== 'checkout_transparente') {
      throw new Error('O backend ainda não está em Checkout Transparente.')
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
            ? 'Pagamento enviado. Estamos aguardando a confirmação do Mercado Pago.'
            : `Pagamento: ${payment.status_detail ?? payment.status}`
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
      <main>
        <section className="page-hero">
          <h1 className="page-title">Checkout</h1>
        </section>
        <section className="checkout-empty">
          <p>Seu carrinho está vazio.</p>
          <Link className="primary-cta" to="/produtos">Ver produtos</Link>
        </section>
      </main>
    )
  }

  return (
    <main>
      <section className="page-hero checkout-head brand-checkout-head">
        <div className="brand-checkout-stamp">
          <img src="/assets/brand-localz-badge.png" alt="" />
        </div>
        <div className="breadcrumb">
          <Link to="/carrinho">Carrinho</Link> {' > '} Checkout
        </div>
        <h1 className="page-title">Finalizar pedido</h1>
        <p className="page-copy">
          Pagamento seguro dentro da Grumble Bee. Entregas somente na Região 012.
        </p>
      </section>

      <CheckoutMotionStrip stage="payment" />

      <section className="checkout-grid checkout-real brand-checkout-grid">
        <div className="checkout-form brand-checkout-form">
          {!logged && (
            <div className="checkout-login-note">
              <span>Já tem conta?</span>
              <Link to="/entrar" state={{ from: '/checkout' }}>
                Entrar para preencher seus dados
              </Link>
            </div>
          )}

          <h2>Contato</h2>
          <label>
            Nome completo
            <input
              value={form.contact_name}
              readOnly={locked}
              onChange={e => setForm(v => ({ ...v, contact_name: e.target.value }))}
              required
            />
          </label>
          <div className="form-two">
            <label>
              E-mail
              <input
                type="email"
                value={form.contact_email}
                readOnly={logged || locked}
                onChange={e => setForm(v => ({ ...v, contact_email: e.target.value }))}
                required
              />
            </label>
            <label>
              Telefone
              <input
                value={form.contact_phone}
                readOnly={locked}
                onChange={e => setForm(v => ({ ...v, contact_phone: e.target.value }))}
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
                  readOnly={locked}
                  onChange={e => changeCep(e.target.value)}
                  onBlur={() => {
                    if (isCompleteCep(form.postal_code)) void searchCep()
                  }}
                  required
                />
                <span className={`cep-status-dot ${cepState}`} aria-hidden="true" />
              </div>
            </label>
            <button
              type="button"
              className="cep-search-button"
              disabled={
                locked
                || cepState === 'loading'
                || !isCompleteCep(form.postal_code)
              }
              onClick={() => void searchCep()}
            >
              {cepState === 'loading' ? 'Buscando...' : 'Buscar CEP'}
            </button>
          </div>
          {cepMessage && <div className={`cep-feedback ${cepState}`}>{cepMessage}</div>}

          <label>
            Rua
            <input
              value={form.street}
              readOnly={locked}
              onChange={e => setForm(v => ({ ...v, street: e.target.value }))}
              required
            />
          </label>
          <div className="form-two">
            <label>
              Número
              <input
                value={form.number}
                readOnly={locked}
                onChange={e => setForm(v => ({ ...v, number: e.target.value }))}
                required
              />
            </label>
            <label>
              Complemento
              <input
                value={form.complement}
                readOnly={locked}
                onChange={e => setForm(v => ({ ...v, complement: e.target.value }))}
              />
            </label>
          </div>
          <label>
            Bairro
            <input
              value={form.neighborhood}
              readOnly={locked}
              onChange={e => setForm(v => ({ ...v, neighborhood: e.target.value }))}
            />
          </label>
          <div className="form-two">
            <label>
              Cidade
              <input
                value={form.city}
                readOnly={addressLocked}
                className={addressLocked ? 'address-locked' : ''}
                onChange={e => {
                  setForm(v => ({ ...v, city: e.target.value }))
                  invalidateQuote()
                }}
                required
              />
            </label>
            <label>
              Estado
              <input
                value={form.state}
                readOnly={addressLocked}
                className={addressLocked ? 'address-locked' : ''}
                onChange={e => {
                  setForm(v => ({ ...v, state: e.target.value }))
                  invalidateQuote()
                }}
                required
              />
            </label>
          </div>

          <button
            className="shipping-quote-button"
            type="button"
            disabled={
              locked
              || loadingQuote
              || !quoteItems.length
              || !form.city.trim()
              || !form.state.trim()
            }
            onClick={() => void requestShippingQuote(form.city, form.state)}
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
                <strong>{quote.method}</strong>
                <span>
                  {quote.estimated_days_min != null && quote.estimated_days_max != null
                    ? `${quote.estimated_days_min} a ${quote.estimated_days_max} dias`
                    : 'Prazo a confirmar'}
                </span>
              </div>
              <b>
                {Number(quote.price ?? 0) === 0
                  ? 'GRÁTIS'
                  : money(Number(quote.price))}
              </b>
            </div>
          )}

          <label>
            Observação do pedido
            <textarea
              value={form.customer_note}
              readOnly={locked}
              onChange={e => setForm(v => ({ ...v, customer_note: e.target.value }))}
              placeholder="Opcional"
            />
          </label>

          <section className="transparent-payment-card">
            <div className="transparent-payment-head">
              <div>
                <small>PAGAMENTO SEGURO</small>
                <h2>Como você quer pagar?</h2>
              </div>
              <span>Mercado Pago</span>
            </div>

            {!settingsReady && <p>Carregando meios de pagamento…</p>}
            {(settingsError || !settings?.payment_enabled) && settingsReady && (
              <div className="payment-config-warning">
                {settingsError || 'Pagamento online está desativado no ADM.'}
              </div>
            )}
            {settings?.payment_enabled && !settings.mercado_pago_public_key && (
              <div className="payment-config-warning">
                MERCADO_PAGO_PUBLIC_KEY ainda não foi configurada no Render.
              </div>
            )}

            <div className="payment-method-tabs">
              {settings?.allow_pix && (
                <button
                  type="button"
                  className={paymentMethod === 'pix' ? 'active' : ''}
                  disabled={Boolean(pixPayment)}
                  onClick={() => setPaymentMethod('pix')}
                >
                  <b>PIX</b>
                  <span>QR Code instantâneo</span>
                </button>
              )}
              {settings?.allow_credit_card && (
                <button
                  type="button"
                  className={paymentMethod === 'card' ? 'active' : ''}
                  disabled={Boolean(pixPayment)}
                  onClick={() => setPaymentMethod('card')}
                >
                  <b>CARTÃO</b>
                  <span>Crédito / débito</span>
                </button>
              )}
            </div>

            {paymentMethod === 'pix' && !pixPayment && (
              <div className="pix-start-card">
                <div className="pix-icon">PIX</div>
                <div>
                  <strong>Pix</strong>
                  <p>Gere o QR Code aqui e pague pelo aplicativo do seu banco sem sair da Grumble Bee.</p>
                </div>
                <button
                  type="button"
                  className="buy-btn ready"
                  disabled={!paymentReady || paymentBusy}
                  onClick={() => void generatePix()}
                >
                  {paymentBusy ? 'Gerando Pix...' : `Gerar Pix · ${money(displayedTotal)}`}
                </button>
              </div>
            )}

            {paymentMethod === 'pix' && pixPayment && (
              <div className="pix-result-card">
                <small>PEDIDO {pixPayment.order_code}</small>
                <h3>Escaneie para pagar</h3>
                {pixPayment.qr_code_base64 && (
                  <img
                    className="pix-qr-image"
                    src={
                      pixPayment.qr_code_base64.startsWith('data:')
                        ? pixPayment.qr_code_base64
                        : `data:image/png;base64,${pixPayment.qr_code_base64}`
                    }
                    alt="QR Code Pix"
                  />
                )}
                <strong className="pix-total">{money(displayedTotal)}</strong>
                <div className="pix-waiting brand-pix-waiting">
                  <span className="pix-waiting-bee">
                    <img src="/assets/logo-grumble-bee.png" alt="" />
                  </span>
                  <div>
                    <strong>Aguardando o Mercado Pago</strong>
                    <small>Pagou? A abelha atualiza sozinha assim que o webhook confirmar.</small>
                  </div>
                </div>
                {pixPayment.qr_code && (
                  <>
                    <textarea
                      className="pix-code"
                      readOnly
                      value={pixPayment.qr_code}
                    />
                    <button
                      type="button"
                      className="pix-copy-button"
                      onClick={() => void copyPix()}
                    >
                      {copied ? 'COPIADO ✓' : 'COPIAR PIX COPIA E COLA'}
                    </button>
                  </>
                )}
                {pixPayment.ticket_url && (
                  <a
                    className="pix-ticket-link"
                    href={pixPayment.ticket_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir instruções do Pix
                  </a>
                )}
              </div>
            )}

            {paymentMethod === 'card' && !pixPayment && (
              <div className="card-payment-area">
                {!cardChallengeUrl && (
                  <MercadoPagoCardPayment
                    publicKey={settings?.mercado_pago_public_key ?? ''}
                    amount={displayedTotal}
                    email={form.contact_email}
                    disabled={!paymentReady || paymentBusy}
                    onSubmit={payCard}
                    onError={setPaymentMessage}
                  />
                )}
                {cardChallengeUrl && (
                  <div className="three-ds-shell">
                    <small>VERIFICAÇÃO DO BANCO</small>
                    <h3>Confirme a compra</h3>
                    <p>Essa etapa é exibida pelo banco emissor do cartão e acontece dentro do checkout.</p>
                    <iframe
                      className="three-ds-frame"
                      src={cardChallengeUrl}
                      title="Autenticação 3DS do cartão"
                    />
                    <span>Aguardando o retorno do banco…</span>
                  </div>
                )}
              </div>
            )}

            {pendingOrder && (
              <p className="pending-order-note">
                Pedido reservado: <strong>{pendingOrder.order_code}</strong>
              </p>
            )}

            {paymentMessage && (
              <p className="form-message error">{paymentMessage}</p>
            )}
          </section>

          {message && <p className="form-message error">{message}</p>}
        </div>

        <aside className="cart-summary checkout-summary brand-checkout-summary">
          <div className="brand-checkout-summary-head">
            <div>
              <small>SEU DROP</small>
              <h3>Seu pedido</h3>
            </div>
            <img src="/assets/logo-grumble-bee.png" alt="" />
          </div>
          {detailed.map(({ item, product, variant }) =>
            product && variant ? (
              <div className="checkout-product" key={`${item.id}-${variant.id}`}>
                <img src={productPrimaryImage(product)} alt={product.name} />
                <div>
                  <strong>{product.name}</strong>
                  <span>{variant.fit} · {variant.size} · {item.qty} un.</span>
                </div>
                <b>{money(product.effective_price * item.qty)}</b>
              </div>
            ) : null
          )}
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{money(subtotal)}</strong>
          </div>
          <div className="summary-row">
            <span>Frete</span>
            <strong>
              {quote?.available
                ? Number(quote.price ?? 0) === 0
                  ? 'GRÁTIS'
                  : money(Number(quote.price))
                : 'Calcular'}
            </strong>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <strong>{money(displayedTotal)}</strong>
          </div>
          <div className="checkout-security-box">
            <strong>Pagamento protegido</strong>
            <p>Cartão tokenizado pelo Mercado Pago. Pix confirmado via webhook.</p>
          </div>
        </aside>
      </section>
    </main>
  )
}
