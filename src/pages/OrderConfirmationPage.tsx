import { Link, Navigate, useLocation } from 'react-router-dom'
import { OrderDetailView } from '../components/OrderDetailView'
import type { Order } from '../lib/types'

export function OrderConfirmationPage() {
  const location = useLocation()
  const order = (location.state as { order?: Order } | null)?.order
  if (!order) return <Navigate to="/consultar-pedido" replace />
  return (
    <main>
      <section className="order-success-hero brand-order-success">
        <div className="brand-order-success-art">
          <img src="/assets/brand-localz-badge.png" alt="" />
        </div>
        <span>✓</span>
        <small>PEDIDO NA COLMEIA</small>
        <h1>Recebemos seu pedido.</h1>
        <p>
          Código <strong>{order.order_code}</strong>.
          Agora você acompanha cada movimento até chegar na sua porta.
        </p>
        <Link to="/consultar-pedido">
          Consultar depois
        </Link>
      </section>

      <section className="order-detail-section">
        <OrderDetailView order={order} />
      </section>
    </main>
  )
}
