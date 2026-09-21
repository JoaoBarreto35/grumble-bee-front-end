import { Link, Navigate, useLocation } from 'react-router-dom'
import { OrderDetailView } from '../components/OrderDetailView'
import type { Order } from '../lib/types'

export function OrderConfirmationPage() {
  const location = useLocation()
  const order = (location.state as { order?: Order } | null)?.order
  if (!order) return <Navigate to="/consultar-pedido" replace />
  return <main><section className="order-success-hero"><span>✓</span><small>PEDIDO CRIADO</small><h1>Recebemos seu pedido.</h1><p>Guarde o código <strong>{order.order_code}</strong>. O status do pagamento e da entrega fica registrado neste pedido.</p><Link to="/consultar-pedido">Consultar depois</Link></section><section className="order-detail-section"><OrderDetailView order={order} /></section></main>
}
