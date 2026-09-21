import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { OrderDetailView } from '../components/OrderDetailView'
import { remoteApi } from '../lib/api'
import type { Order } from '../lib/types'

export function OrderLookupPage() {
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSending(true); setMessage(''); setOrder(null)
    try { setOrder(await remoteApi.lookupOrder(code, email)) }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Pedido não encontrado.') }
    finally { setSending(false) }
  }

  return <main>
    <section className="page-hero"><div className="breadcrumb"><Link to="/">Início</Link> &gt; Pedido</div><h1 className="page-title">Consultar pedido</h1><p className="page-copy">Comprou sem entrar? Use o código do pedido e o e-mail informado na compra.</p></section>
    <section className="order-lookup-section">
      <form className="order-lookup-card" onSubmit={submit}>
        <label>Código do pedido<input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="GB-260916-..." required /></label>
        <label>E-mail da compra<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
        <button className="buy-btn ready" disabled={sending}>{sending ? 'Consultando...' : 'Consultar pedido'}</button>
        {message && <p className="form-message error">{message}</p>}
      </form>
      {order && <OrderDetailView order={order} />}
    </section>
  </main>
}
