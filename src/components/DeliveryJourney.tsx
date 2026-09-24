import type { ShippingStatus } from '../lib/types'

const steps = [
  { key: 'pending', label: 'Recebido', icon: '✓' },
  { key: 'preparing', label: 'Preparando', icon: '✦' },
  { key: 'in_transit', label: 'A caminho', icon: '➜' },
  { key: 'out_for_delivery', label: 'Saiu pra entrega', icon: '⚡' },
  { key: 'delivered', label: 'Entregue', icon: '★' }
] as const

const rank: Record<string, number> = {
  pending: 0,
  preparing: 1,
  posted: 2,
  in_transit: 2,
  out_for_delivery: 3,
  delivered: 4,
  returned: 2,
  cancelled: 0
}

export function DeliveryJourney({
  status
}: {
  status: ShippingStatus | string
}) {
  const current = rank[status] ?? 0
  const progress = Math.max(
    0,
    Math.min(100, (current / (steps.length - 1)) * 100)
  )

  return (
    <section className={`delivery-journey status-${status}`}>
      <div className="delivery-journey-head">
        <div>
          <small>ROTA DO PEDIDO</small>
          <h3>Da colmeia até você.</h3>
        </div>
        <img src="/assets/logo-grumble-bee.png" alt="" />
      </div>

      <div className="delivery-track">
        <div className="delivery-track-base" />
        <div
          className="delivery-track-progress"
          style={{ width: `${progress}%` }}
        />
        <div
          className="delivery-bee-runner"
          style={{ left: `calc(${progress}% - 19px)` }}
          aria-hidden="true"
        >
          <img src="/assets/logo-grumble-bee.png" alt="" />
        </div>

        {steps.map((step, index) => {
          const done = index <= current
          const active = index === current
          return (
            <div
              key={step.key}
              className={`delivery-step${done ? ' done' : ''}${active ? ' active' : ''}`}
            >
              <span className="delivery-step-icon">{step.icon}</span>
              <strong>{step.label}</strong>
            </div>
          )
        })}
      </div>

      {status === 'returned' && (
        <p className="delivery-special-note">
          O envio iniciou retorno. Consulte o histórico abaixo para mais detalhes.
        </p>
      )}
      {status === 'cancelled' && (
        <p className="delivery-special-note">
          O envio foi cancelado. Consulte o histórico abaixo para mais detalhes.
        </p>
      )}
    </section>
  )
}
