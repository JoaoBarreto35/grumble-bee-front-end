export function CheckoutMotionStrip({
  stage = 'payment'
}: {
  stage?: 'address' | 'payment' | 'done'
}) {
  const current =
    stage === 'address' ? 1 :
    stage === 'payment' ? 2 : 3

  const items = [
    ['01', 'Sacola'],
    ['02', 'Entrega'],
    ['03', 'Pagamento'],
    ['04', 'Partiu']
  ]

  return (
    <div className="checkout-motion-strip" aria-label="Etapas do checkout">
      <div className="checkout-motion-road">
        <span className="checkout-motion-line" />
        <span
          className="checkout-motion-bee"
          style={{
            left: `calc(${(current / 3) * 100}% - 16px)`
          }}
        >
          <img src="/assets/logo-grumble-bee.png" alt="" />
        </span>
      </div>
      <div className="checkout-motion-labels">
        {items.map(([number, label], index) => (
          <div
            key={number}
            className={
              index <= current
                ? index === current
                  ? 'active'
                  : 'done'
                : ''
            }
          >
            <small>{number}</small>
            <strong>{label}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}
