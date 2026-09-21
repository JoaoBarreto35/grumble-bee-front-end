import {
  CardPayment,
  initMercadoPago
} from '@mercadopago/sdk-react'
import { useEffect, useMemo, useState } from 'react'

let initializedPublicKey = ''

type CardFormData = {
  token: string
  issuer_id?: string
  payment_method_id: string
  transaction_amount: number
  payment_method_option_id?: string | null
  processing_mode?: string | null
  installments: number
  payer: {
    email: string
    identification?: {
      type?: string
      number?: string
    }
  }
}

type AdditionalData = {
  paymentTypeId?: string
  bin?: string
  lastFourDigits?: string
  cardholderName?: string
}

export function MercadoPagoCardPayment({
  publicKey,
  amount,
  email,
  disabled,
  onSubmit,
  onError
}: {
  publicKey: string
  amount: number
  email: string
  disabled?: boolean
  onSubmit: (
    formData: CardFormData,
    additionalData?: AdditionalData
  ) => Promise<void>
  onError?: (message: string) => void
}) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!publicKey) return

    if (initializedPublicKey !== publicKey) {
      initMercadoPago(publicKey)
      initializedPublicKey = publicKey
    }
  }, [publicKey])

  const initialization = useMemo(
    () => ({
      amount,
      payer: {
        email
      }
    }),
    [amount, email]
  )

  if (!publicKey) {
    return (
      <div className="mp-card-warning">
        Public Key do Mercado Pago não configurada no servidor.
      </div>
    )
  }

  if (disabled) {
    return (
      <div className="mp-card-warning">
        Confirme endereço e entrega antes de preencher o cartão.
      </div>
    )
  }

  return (
    <div className="mp-card-brick-shell">
      {!ready && (
        <div className="mp-card-loading">
          Carregando pagamento seguro…
        </div>
      )}

      <CardPayment
        initialization={initialization as any}
        onReady={() => setReady(true)}
        onSubmit={async (
          formData: any,
          additionalData?: any
        ) => {
          await onSubmit(
            formData as CardFormData,
            additionalData as AdditionalData | undefined
          )
        }}
        onError={(error: any) => {
          const message =
            error?.message
            ?? 'O formulário de cartão encontrou um erro.'
          onError?.(message)
        }}
      />

      <p className="mp-secure-note">
        Os dados do cartão são tokenizados pelo Mercado Pago e não passam pelo servidor da Grumble Bee.
      </p>
    </div>
  )
}
