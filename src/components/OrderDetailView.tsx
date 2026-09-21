import { Link } from 'react-router-dom'
import { money } from '../context/CatalogContext'
import { statusLabel } from '../lib/orderLabels'
import type { Order } from '../lib/types'

function dateTime(value: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

export function OrderDetailView({ order }: { order: Order }) {
  const address = order.addresses.find(item => item.kind === 'shipping')
  return (
    <div className="order-detail-view">
      <div className="order-detail-head">
        <div>
          <small>PEDIDO</small>
          <h2>{order.order_code}</h2>
          <p>Realizado em {dateTime(order.created_at)}</p>
        </div>
        <div className="order-status-stack">
          <span><b>Pedido</b>{statusLabel('order', order.status)}</span>
          <span><b>Pagamento</b>{statusLabel('payment', order.payment_status)}</span>
          <span><b>Envio</b>{statusLabel('shipping', order.shipping_status)}</span>
        </div>
      </div>

      {order.tracking_code && (
        <div className="tracking-card">
          <div><small>RASTREIO</small><strong>{order.tracking_code}</strong></div>
          {order.shipping_carrier && <span>{order.shipping_carrier}</span>}
          {order.tracking_url && <a href={order.tracking_url} target="_blank" rel="noreferrer">Acompanhar envio ↗</a>}
        </div>
      )}

      <div className="order-customer-grid">
        <article>
          <small>ENTREGA</small>
          {address ? <p>
            <strong>{address.recipient_name}</strong><br />
            {address.street}, {address.number}{address.complement ? ` · ${address.complement}` : ''}<br />
            {address.neighborhood ? `${address.neighborhood} · ` : ''}{address.city} / {address.state}<br />
            CEP {address.postal_code}
          </p> : <p>Endereço não disponível.</p>}
        </article>
        <article>
          <small>CONTATO</small>
          <p><strong>{order.contact_name}</strong><br />{order.contact_email}<br />{order.contact_phone ?? ''}</p>
        </article>
      </div>

      <div className="order-items-list">
        {order.items.map(item => (
          <article key={item.id}>
            {item.image_url ? <img src={item.image_url} alt={item.product_name} /> : <div className="order-item-placeholder" />}
            <div>
              <strong>{item.product_name}</strong>
              <span>{[item.fit, item.size].filter(Boolean).join(' · ')}</span>
              <span>Quantidade {item.quantity}</span>
            </div>
            <b>{money(Number(item.line_total))}</b>
          </article>
        ))}
      </div>

      <div className="order-total-box">
        <div><span>Subtotal</span><strong>{money(Number(order.subtotal))}</strong></div>
        <div><span>Frete</span><strong>{money(Number(order.shipping_total))}</strong></div>
        {Number(order.discount_total) > 0 && <div><span>Descontos</span><strong>- {money(Number(order.discount_total))}</strong></div>}
        <div className="total"><span>Total</span><strong>{money(Number(order.total))}</strong></div>
      </div>

      <section className="order-timeline">
        <div className="section-title"><span>ACOMPANHAMENTO</span><h3>Histórico do pedido</h3></div>
        {[...order.history].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(event => (
          <article key={event.id}>
            <span className="timeline-dot" />
            <div>
              <small>{dateTime(event.created_at)}</small>
              <strong>{event.title ?? statusLabel(event.status_type as 'order' | 'payment' | 'shipping', event.new_status)}</strong>
              {event.message && <p>{event.message}</p>}
              {event.tracking_code_snapshot && <code>{event.tracking_code_snapshot}</code>}
            </div>
          </article>
        ))}
      </section>

      <Link className="secondary-link" to="/produtos">Continuar comprando</Link>
    </div>
  )
}
