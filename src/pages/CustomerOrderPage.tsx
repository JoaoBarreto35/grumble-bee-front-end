import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { OrderDetailView } from '../components/OrderDetailView'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { remoteApi } from '../lib/api'
import type { Order } from '../lib/types'

export function CustomerOrderPage() {
  const { orderCode = '' } = useParams()
  const { ready, logged } = useCustomerAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!logged || !orderCode) return
    remoteApi.myOrder(orderCode).then(setOrder).catch(err => setError(err instanceof Error ? err.message : 'Pedido não encontrado.'))
  }, [logged, orderCode])

  if (!ready) return <main className="account-loading">Carregando...</main>
  if (!logged) return <Navigate to="/entrar" replace state={{ from: `/minha-conta/pedidos/${orderCode}` }} />

  return <main><section className="page-hero"><div className="breadcrumb"><Link to="/minha-conta">Minha conta</Link> &gt; Pedido</div><h1 className="page-title">Acompanhar pedido</h1></section><section className="order-detail-section">{error && <p className="form-message error">{error}</p>}{!error && !order && <p>Carregando...</p>}{order && <OrderDetailView order={order} />}</section></main>
}
