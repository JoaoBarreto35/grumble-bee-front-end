export const orderStatusLabel: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  processing: 'Em preparação',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado'
}

export const paymentStatusLabel: Record<string, string> = {
  pending: 'Pendente',
  authorized: 'Autorizado',
  paid: 'Pago',
  failed: 'Falhou',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
  partially_refunded: 'Reembolso parcial'
}

export const shippingStatusLabel: Record<string, string> = {
  pending: 'Pendente',
  preparing: 'Preparando envio',
  posted: 'Postado',
  in_transit: 'A caminho',
  out_for_delivery: 'Saiu para entrega',
  delivered: 'Entregue',
  returned: 'Retornado',
  cancelled: 'Cancelado'
}

export function statusLabel(kind: 'order' | 'payment' | 'shipping', value: string) {
  const map = kind === 'order' ? orderStatusLabel : kind === 'payment' ? paymentStatusLabel : shippingStatusLabel
  return map[value] ?? value
}
