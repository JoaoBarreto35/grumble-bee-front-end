import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { money } from '../context/CatalogContext'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { remoteApi } from '../lib/api'
import { statusLabel } from '../lib/orderLabels'
import type { OrderSummary } from '../lib/types'

export function CustomerAccountPage() {
  const { ready, customer, logged, logout } = useCustomerAuth()
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!logged) { setLoading(false); return }
    remoteApi.myOrders().then(setOrders).catch(err => setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos.')).finally(() => setLoading(false))
  }, [logged])

  if (!ready) return <main className="account-loading">Carregando...</main>
  if (!logged || !customer) return <Navigate to="/entrar" replace state={{ from: '/minha-conta' }} />

  return <main>
    <section className="page-hero account-page-hero">
      <div><small>MINHA CONTA</small><h1 className="page-title">Olá, {customer.name.split(' ')[0]}</h1><p className="page-copy">Acompanhe seus pedidos e rastreios em um só lugar.</p></div>
      <button className="account-logout" onClick={() => void logout()}>Sair</button>
    </section>

    <section className="account-dashboard">
      <aside className="account-profile-card">
        <small>SEUS DADOS</small><strong>{customer.name}</strong><span>{customer.email}</span>{customer.phone && <span>{customer.phone}</span>}
        <Link to="/consultar-pedido">Consultar pedido de visitante</Link>
      </aside>
      <div className="account-orders">
        <div className="section-title"><span>HISTÓRICO</span><h2>Meus pedidos</h2></div>
        {loading && <p>Carregando pedidos...</p>}
        {error && <p className="form-message error">{error}</p>}
        {!loading && orders.length === 0 && <div className="account-empty"><p>Você ainda não tem pedidos.</p><Link className="primary-cta" to="/produtos">Ver coleção</Link></div>}
        {orders.map(order => <Link className="account-order-card" to={`/minha-conta/pedidos/${order.order_code}`} key={order.id}>
          <div><small>{new Date(order.created_at).toLocaleDateString('pt-BR')}</small><strong>{order.order_code}</strong><span>{order.item_quantity} {order.item_quantity === 1 ? 'peça' : 'peças'}</span></div>
          <div className="account-order-status"><span>{statusLabel('shipping', order.shipping_status)}</span><strong>{money(Number(order.total))}</strong></div>
          <b>›</b>
        </Link>)}
      </div>
    </section>
  </main>
}
