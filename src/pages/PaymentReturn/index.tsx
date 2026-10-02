import '../../styles/customerShared.module.css'
import '../../styles/customerSharedMobile.module.css'
import './styles.module.css'
import './stylesMobile.module.css'
import {
  Link,
  useLocation
} from 'react-router-dom'

type PaymentReturnVariant =
  | 'success'
  | 'pending'
  | 'failure'

const content = {
  success: {
    symbol: '✓',
    eyebrow: 'PAGAMENTO',
    title:
      'Pagamento recebido',
    text:
      'Recebemos a atualização do pagamento. O status do pedido pode levar alguns instantes para aparecer como confirmado.'
  },

  pending: {
    symbol: '…',
    eyebrow: 'PAGAMENTO',
    title:
      'Pagamento em análise',
    text:
      'Seu pagamento ainda está sendo processado. Você pode acompanhar a atualização pelo código do pedido.'
  },

  failure: {
    symbol: '×',
    eyebrow: 'PAGAMENTO',
    title:
      'Pagamento não concluído',
    text:
      'O pagamento não foi concluído. Consulte o pedido para verificar o status e tente novamente quando necessário.'
  }
} as const

export function PaymentReturnPage({
  variant
}: {
  variant: PaymentReturnVariant
}) {
  const location = useLocation()

  const params =
    new URLSearchParams(
      location.search
    )

  const orderCode =
    params.get('pedido')

  const page =
    content[variant]

  return (
    <main className="gb5312-payment-return-page">
      <section
        className={[
          'gb5312-payment-return-card',
          variant
        ].join(' ')}
      >
        <span
          className="gb5312-payment-symbol"
          aria-hidden="true"
        >
          {page.symbol}
        </span>

        <small>
          {page.eyebrow}
        </small>

        <h1>
          {page.title}
        </h1>

        <p>
          {page.text}
        </p>

        {orderCode && (
          <div className="gb5312-payment-code">
            <span>Pedido</span>
            <strong>
              {orderCode}
            </strong>
          </div>
        )}

        <div className="gb5312-payment-actions">
          <Link
            className="primary"
            to="/consultar-pedido"
          >
            Consultar pedido
          </Link>

          <Link
            className="secondary"
            to="/"
          >
            Voltar para a loja
          </Link>
        </div>
      </section>
    </main>
  )
}
