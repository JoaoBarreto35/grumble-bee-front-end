import '../../styles/customerShared.module.css'
import '../../styles/customerSharedMobile.module.css'
import './styles.module.css'
import './stylesMobile.module.css'
import {
  Link,
  Navigate,
  useLocation
} from 'react-router-dom'
import { OrderDetailView } from '../../components/OrderDetailView'
import type { Order } from '../../lib/types'

export function OrderConfirmationPage() {
  const location = useLocation()

  const order = (
    location.state as {
      order?: Order
    } | null
  )?.order

  if (!order) {
    return (
      <Navigate
        to="/consultar-pedido"
        replace
      />
    )
  }

  return (
    <main className="gb5312-confirmation-page">
      <section className="gb5312-success-hero">
        <span aria-hidden="true">
          ✓
        </span>

        <small>
          PEDIDO RECEBIDO
        </small>

        <h1>
          Seu pedido
          <br />
          está com a gente.
        </h1>

        <p>
          Código do pedido:
          {' '}
          <strong>
            {order.order_code}
          </strong>
          .
          Você pode acompanhar pagamento e entrega
          a qualquer momento.
        </p>

        <Link to="/consultar-pedido">
          Consultar depois
        </Link>
      </section>

      <section className="gb5312-order-detail-section">
        <OrderDetailView
          order={order}
        />
      </section>
    </main>
  )
}
