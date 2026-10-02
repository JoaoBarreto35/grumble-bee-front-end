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
  Navigate
} from 'react-router-dom'
import { money } from '../../context/CatalogContext'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { remoteApi } from '../../lib/api'
import { statusLabel } from '../../lib/orderLabels'
import type { OrderSummary } from '../../lib/types'

export function CustomerAccountPage() {
  const {
    ready,
    customer,
    logged,
    logout
  } = useCustomerAuth()

  const [orders, setOrders] =
    useState<OrderSummary[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    if (!logged) {
      setLoading(false)
      return
    }

    remoteApi
      .myOrders()
      .then(setOrders)
      .catch(error =>
        setError(
          error instanceof Error
            ? error.message
            : 'Erro ao carregar pedidos.'
        )
      )
      .finally(
        () =>
          setLoading(false)
      )
  }, [logged])

  if (!ready) {
    return (
      <main className="gb5312-loading-page">
        Carregando...
      </main>
    )
  }

  if (
    !logged
    || !customer
  ) {
    return (
      <Navigate
        to="/entrar"
        replace
        state={{
          from: '/minha-conta'
        }}
      />
    )
  }

  return (
    <main className="gb5312-account-page">
      <section className="gb5312-account-hero">
        <div>
          <div className="gb5312-public-label">
            <span>Minha conta</span>
            <i />
            <span>Grumble Bee</span>
          </div>

          <h1>
            Olá,
            <br />
            {customer.name.split(' ')[0]}.
          </h1>

          <p>
            Acompanhe seus pedidos e consulte
            seus dados de compra.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void logout()
          }
        >
          Sair
        </button>
      </section>

      <section className="gb5312-account-layout">
        <aside className="gb5312-profile-card">
          <div className="gb5312-profile-head">
            <small>SEUS DADOS</small>
            <span>⚡</span>
          </div>

          <strong>
            {customer.name}
          </strong>

          <span>
            {customer.email}
          </span>

          {customer.phone && (
            <span>
              {customer.phone}
            </span>
          )}

          <Link to="/consultar-pedido">
            Consultar pedido de visitante
          </Link>
        </aside>

        <div className="gb5312-account-orders">
          <div className="gb5312-account-orders-head">
            <div>
              <small>HISTÓRICO</small>
              <h2>Meus pedidos</h2>
            </div>

            <span>
              {orders.length}{' '}
              {orders.length === 1
                ? 'pedido'
                : 'pedidos'}
            </span>
          </div>

          {loading && (
            <p className="gb5312-muted">
              Carregando pedidos...
            </p>
          )}

          {error && (
            <p className="gb5312-form-error">
              {error}
            </p>
          )}

          {!loading
            && orders.length === 0 && (
              <div className="gb5312-account-empty">
                <span>⚡</span>

                <h3>
                  Você ainda não tem pedidos.
                </h3>

                <Link to="/produtos">
                  Ver produtos
                </Link>
              </div>
            )}

          <div className="gb5312-order-cards">
            {orders.map(order => (
              <Link
                className="gb5312-order-card"
                to={`/minha-conta/pedidos/${order.order_code}`}
                key={order.id}
              >
                <div>
                  <small>
                    {new Date(
                      order.created_at
                    ).toLocaleDateString(
                      'pt-BR'
                    )}
                  </small>

                  <strong>
                    {order.order_code}
                  </strong>

                  <span>
                    {order.item_quantity}{' '}
                    {order.item_quantity === 1
                      ? 'peça'
                      : 'peças'}
                  </span>
                </div>

                <div className="gb5312-order-card-right">
                  <span>
                    {statusLabel(
                      'shipping',
                      order.shipping_status
                    )}
                  </span>

                  <strong>
                    {money(
                      Number(
                        order.total
                      )
                    )}
                  </strong>
                </div>

                <b>↗</b>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
