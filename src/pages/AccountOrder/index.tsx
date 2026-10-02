import '../../styles/customerShared.module.css'
import '../../styles/customerSharedMobile.module.css'
import './styles.module.css'
import './stylesMobile.module.css'
import {
  useEffect,
  useState
} from 'react'
import {
  Link,
  Navigate,
  useParams
} from 'react-router-dom'
import { OrderDetailView } from '../../components/OrderDetailView'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { remoteApi } from '../../lib/api'
import type { Order } from '../../lib/types'

export function CustomerOrderPage() {
  const {
    orderCode = ''
  } = useParams()

  const {
    ready,
    logged
  } = useCustomerAuth()

  const [order, setOrder] =
    useState<Order | null>(null)

  const [error, setError] =
    useState('')

  useEffect(() => {
    if (
      !logged
      || !orderCode
    ) {
      return
    }

    remoteApi
      .myOrder(orderCode)
      .then(setOrder)
      .catch(error =>
        setError(
          error instanceof Error
            ? error.message
            : 'Pedido não encontrado.'
        )
      )
  }, [
    logged,
    orderCode
  ])

  if (!ready) {
    return (
      <main className="gb5312-loading-page">
        Carregando...
      </main>
    )
  }

  if (!logged) {
    return (
      <Navigate
        to="/entrar"
        replace
        state={{
          from:
            `/minha-conta/pedidos/${orderCode}`
        }}
      />
    )
  }

  return (
    <main className="gb5312-order-page">
      <section className="gb5312-public-hero gb5312-order-hero">
        <div>
          <div className="gb5312-public-label">
            <Link to="/minha-conta">
              Minha conta
            </Link>
            <i />
            <span>Pedido</span>
          </div>

          <h1>
            Acompanhe
            <br />
            seu pedido.
          </h1>

          <p>
            Veja o pagamento, a entrega e o histórico
            da sua compra em um só lugar.
          </p>
        </div>

        <span
          className="gb5312-public-bolt"
          aria-hidden="true"
        >
          ⚡
        </span>
      </section>

      <section className="gb5312-order-detail-section">
        {error && (
          <p className="gb5312-form-error">
            {error}
          </p>
        )}

        {!error
          && !order && (
            <p className="gb5312-muted">
              Carregando pedido...
            </p>
          )}

        {order && (
          <OrderDetailView
            order={order}
          />
        )}
      </section>
    </main>
  )
}
