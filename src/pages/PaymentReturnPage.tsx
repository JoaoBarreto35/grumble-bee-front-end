import { Link, useLocation } from 'react-router-dom'

type PaymentReturnVariant =
  | 'success'
  | 'pending'
  | 'failure'

const content = {
  success: {
    eyebrow: 'PAGAMENTO',
    title: 'Pagamento recebido',
    text: 'Você voltou do Mercado Pago. A confirmação definitiva é feita automaticamente pelo nosso servidor; o status do pedido pode levar alguns segundos para atualizar.'
  },
  pending: {
    eyebrow: 'PAGAMENTO',
    title: 'Pagamento pendente',
    text: 'Seu pagamento ainda está sendo processado pelo Mercado Pago. Acompanhe o status pelo código do pedido.'
  },
  failure: {
    eyebrow: 'PAGAMENTO',
    title: 'Pagamento não concluído',
    text: 'O pagamento não foi concluído. Seu pedido pode continuar reservado por alguns minutos; consulte o pedido para acompanhar o status.'
  }
} as const

export function PaymentReturnPage({
  variant
}: {
  variant: PaymentReturnVariant
}) {
  const location = useLocation()
  const params =
    new URLSearchParams(location.search)

  const orderCode = params.get('pedido')
  const page = content[variant]

  return (
    <main className="payment-return-page">
      <section className={`payment-return-card ${variant}`}>
        <small>{page.eyebrow}</small>
        <h1>{page.title}</h1>
        <p>{page.text}</p>

        {orderCode && (
          <div className="payment-return-code">
            <span>Pedido</span>
            <strong>{orderCode}</strong>
          </div>
        )}

        <div className="payment-return-actions">
          <Link
            className="primary-cta"
            to="/consultar-pedido"
          >
            Consultar pedido
          </Link>

          <Link
            className="secondary-link"
            to="/"
          >
            Voltar para a loja
          </Link>
        </div>
      </section>
    </main>
  )
}
