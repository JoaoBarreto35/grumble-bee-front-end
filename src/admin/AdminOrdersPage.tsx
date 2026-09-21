import { useEffect, useMemo, useState } from 'react'
import { money } from '../context/CatalogContext'
import { remoteApi } from '../lib/api'
import { orderStatusLabel, paymentStatusLabel, shippingStatusLabel, statusLabel } from '../lib/orderLabels'
import type { AdminOrder, OrderStatus, OrderSummary, PaymentStatus, ShippingStatus } from '../lib/types'

function localDate(value: string) { return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) }

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [selected, setSelected] = useState<AdminOrder | null>(null)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState({ status: '', payment_status: '', shipping_status: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customerMessage, setCustomerMessage] = useState('')
  const [visible, setVisible] = useState(true)
  const [shipping, setShipping] = useState({ carrier: '', service: '', tracking: '', trackingUrl: '', estimated: '' })
  const [notes, setNotes] = useState('')

  const load = async () => {
    setLoading(true); setMessage('')
    try { setOrders(await remoteApi.adminOrders({ q: q || undefined, ...filter })) }
    catch (err) { setMessage(err instanceof Error ? err.message : 'Erro ao carregar pedidos.') }
    finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [filter.status, filter.payment_status, filter.shipping_status])

  const choose = async (summary: OrderSummary) => {
    setMessage('')
    try {
      const order = await remoteApi.adminOrder(summary.id)
      setSelected(order)
      setShipping({ carrier: order.shipping_carrier ?? '', service: order.shipping_service ?? '', tracking: order.tracking_code ?? '', trackingUrl: order.tracking_url ?? '', estimated: order.estimated_delivery_at ? order.estimated_delivery_at.slice(0, 16) : '' })
      setNotes(order.admin_notes ?? '')
      setCustomerMessage('')
      setVisible(true)
    } catch (err) { setMessage(err instanceof Error ? err.message : 'Erro ao abrir pedido.') }
  }

  const afterSave = async (order: AdminOrder) => {
    setSelected(order)
    setOrders(current => current.map(item => item.id === order.id ? { ...item, status: order.status, payment_status: order.payment_status, shipping_status: order.shipping_status, tracking_code: order.tracking_code } : item))
    setCustomerMessage('')
    setMessage('Pedido atualizado.')
  }

  const saveStatus = async (status: OrderStatus) => {
    if (!selected) return; setSaving(true); setMessage('')
    try { await afterSave(await remoteApi.updateAdminOrderStatus(selected.id, status, customerMessage, visible)) }
    catch (err) { setMessage(err instanceof Error ? err.message : 'Erro ao atualizar status.') }
    finally { setSaving(false) }
  }
  const savePayment = async (status: PaymentStatus) => {
    if (!selected) return; setSaving(true); setMessage('')
    try { await afterSave(await remoteApi.updateAdminPayment(selected.id, status, customerMessage, visible)) }
    catch (err) { setMessage(err instanceof Error ? err.message : 'Erro ao atualizar pagamento.') }
    finally { setSaving(false) }
  }
  const saveShipping = async (status: ShippingStatus) => {
    if (!selected) return; setSaving(true); setMessage('')
    try { await afterSave(await remoteApi.updateAdminShipping(selected.id, { shipping_status: status, shipping_carrier: shipping.carrier || null, shipping_service: shipping.service || null, tracking_code: shipping.tracking || null, tracking_url: shipping.trackingUrl || null, estimated_delivery_at: shipping.estimated ? new Date(shipping.estimated).toISOString() : null, message: customerMessage || null, is_customer_visible: visible })) }
    catch (err) { setMessage(err instanceof Error ? err.message : 'Erro ao atualizar envio.') }
    finally { setSaving(false) }
  }
  const saveNotes = async () => {
    if (!selected) return; setSaving(true); setMessage('')
    try { await afterSave(await remoteApi.updateAdminNotes(selected.id, notes || null)) }
    catch (err) { setMessage(err instanceof Error ? err.message : 'Erro ao salvar observações.') }
    finally { setSaving(false) }
  }

  const shippingAddress = useMemo(() => selected?.addresses.find(a => a.kind === 'shipping'), [selected])

  return <div className="admin-page admin-orders-page">
    <div className="admin-page-head"><div><small>OPERAÇÃO</small><h1>Pedidos</h1></div><button className="admin-secondary" onClick={() => void load()}>Atualizar</button></div>
    <div className="admin-order-filters">
      <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && void load()} placeholder="Código, cliente, e-mail ou rastreio" />
      <select value={filter.status} onChange={e => setFilter(v => ({ ...v, status: e.target.value }))}><option value="">Todos pedidos</option>{Object.entries(orderStatusLabel).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select>
      <select value={filter.payment_status} onChange={e => setFilter(v => ({ ...v, payment_status: e.target.value }))}><option value="">Todos pagamentos</option>{Object.entries(paymentStatusLabel).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select>
      <select value={filter.shipping_status} onChange={e => setFilter(v => ({ ...v, shipping_status: e.target.value }))}><option value="">Todos envios</option>{Object.entries(shippingStatusLabel).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select>
      <button className="admin-primary" onClick={() => void load()}>Buscar</button>
    </div>
    {message && <p className="admin-message">{message}</p>}
    <div className="admin-orders-layout">
      <div className="admin-order-list">
        {loading && <p>Carregando...</p>}
        {!loading && orders.length === 0 && <p>Nenhum pedido encontrado.</p>}
        {orders.map(order => <button key={order.id} className={`admin-order-row${selected?.id === order.id ? ' active' : ''}`} onClick={() => void choose(order)}>
          <div><small>{localDate(order.created_at)}</small><strong>{order.order_code}</strong><span>{order.contact_name}</span></div>
          <div><span>{statusLabel('shipping', order.shipping_status)}</span><strong>{money(Number(order.total))}</strong></div>
        </button>)}
      </div>
      <div className="admin-order-detail">
        {!selected && <div className="admin-order-placeholder">Selecione um pedido para visualizar e atualizar.</div>}
        {selected && <>
          <div className="admin-order-title"><div><small>{selected.order_code}</small><h2>{selected.contact_name}</h2><p>{selected.contact_email}{selected.contact_phone ? ` · ${selected.contact_phone}` : ''}</p></div><strong>{money(Number(selected.total))}</strong></div>
          <div className="admin-order-status-grid">
            <label>Pedido<select value={selected.status} disabled={saving} onChange={e => void saveStatus(e.target.value as OrderStatus)}>{Object.entries(orderStatusLabel).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label>Pagamento<select value={selected.payment_status} disabled={saving} onChange={e => void savePayment(e.target.value as PaymentStatus)}>{Object.entries(paymentStatusLabel).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label>Envio<select value={selected.shipping_status} disabled={saving} onChange={e => void saveShipping(e.target.value as ShippingStatus)}>{Object.entries(shippingStatusLabel).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          </div>
          <div className="admin-order-message"><label>Mensagem da atualização para o cliente<textarea value={customerMessage} onChange={e => setCustomerMessage(e.target.value)} placeholder="Ex.: Seu pedido já foi entregue aos Correios." /></label><label className="admin-check"><input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} /> Mostrar esta atualização ao cliente</label><p>Preencha a mensagem antes de mudar um status quando quiser adicionar contexto à timeline.</p></div>
          <section className="admin-subcard"><h3>Envio e rastreio</h3><div className="admin-two"><label>Transportadora<input value={shipping.carrier} onChange={e => setShipping(v => ({ ...v, carrier: e.target.value }))} placeholder="Correios" /></label><label>Serviço<input value={shipping.service} onChange={e => setShipping(v => ({ ...v, service: e.target.value }))} placeholder="PAC / SEDEX" /></label></div><div className="admin-two"><label>Código de rastreio<input value={shipping.tracking} onChange={e => setShipping(v => ({ ...v, tracking: e.target.value }))} /></label><label>Previsão<input type="datetime-local" value={shipping.estimated} onChange={e => setShipping(v => ({ ...v, estimated: e.target.value }))} /></label></div><label>URL de rastreio<input value={shipping.trackingUrl} onChange={e => setShipping(v => ({ ...v, trackingUrl: e.target.value }))} placeholder="https://..." /></label><button className="admin-primary" disabled={saving} onClick={() => void saveShipping(selected.shipping_status as ShippingStatus)}>Salvar dados de envio</button></section>
          <section className="admin-subcard"><h3>Itens</h3><div className="admin-order-items">{selected.items.map(item => <div key={item.id}>{item.image_url ? <img src={item.image_url} alt="" /> : <span className="admin-order-img-placeholder" />}<div><strong>{item.product_name}</strong><span>{item.fit} · {item.size} · {item.quantity} un.</span></div><b>{money(Number(item.line_total))}</b></div>)}</div></section>
          <section className="admin-subcard"><h3>Entrega</h3>{shippingAddress ? <p>{shippingAddress.recipient_name}<br />{shippingAddress.street}, {shippingAddress.number}{shippingAddress.complement ? ` · ${shippingAddress.complement}` : ''}<br />{shippingAddress.neighborhood ? `${shippingAddress.neighborhood} · ` : ''}{shippingAddress.city}/{shippingAddress.state} · CEP {shippingAddress.postal_code}</p> : <p>Sem endereço.</p>}</section>
          <section className="admin-subcard"><h3>Observações internas</h3><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Só administradores veem este campo." /><button className="admin-secondary" disabled={saving} onClick={() => void saveNotes()}>Salvar observação</button></section>
          <section className="admin-subcard"><h3>Histórico</h3><div className="admin-history">{[...selected.history].sort((a,b) => new Date(b.created_at).getTime()-new Date(a.created_at).getTime()).map(item => <div key={item.id}><small>{localDate(item.created_at)} · {item.source}</small><strong>{item.title ?? item.new_status}</strong>{item.message && <p>{item.message}</p>}<span>{item.is_customer_visible ? 'Visível ao cliente' : 'Interno'}</span></div>)}</div></section>
        </>}
      </div>
    </div>
  </div>
}
