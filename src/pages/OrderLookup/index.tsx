import '../../styles/customerShared.module.css'
import '../../styles/customerSharedMobile.module.css'
import './styles.module.css'
import './stylesMobile.module.css'
import {
  FormEvent,
  useState
} from 'react'
import { Link } from 'react-router-dom'
import { OrderDetailView } from '../../components/OrderDetailView'
import { remoteApi } from '../../lib/api'
import type { Order } from '../../lib/types'

export function OrderLookupPage() {
  const [code, setCode] =
    useState('')

  const [email, setEmail] =
    useState('')

  const [order, setOrder] =
    useState<Order | null>(null)

  const [message, setMessage] =
    useState('')

  const [sending, setSending] =
    useState(false)

  const submit = async (
    event: FormEvent
  ) => {
    event.preventDefault()
    setSending(true)
    setMessage('')
    setOrder(null)

    try {
      setOrder(
        await remoteApi.lookupOrder(
          code,
          email
        )
      )
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Pedido não encontrado.'
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="gb5312-lookup-page">
      <section className="gb5312-public-hero">
        <div>
          <div className="gb5312-public-label">
            <span>Seu pedido</span>
            <i />
            <span>Consulta</span>
          </div>

          <h1>
            Consulte
            <br />
            sua compra.
          </h1>

          <p>
            Comprou como visitante? Use o código do pedido
            e o e-mail informado na compra.
          </p>
        </div>

        <span
          className="gb5312-public-bolt"
          aria-hidden="true"
        >
          ⚡
        </span>
      </section>

      <section className="gb5312-lookup-section">
        <form
          className="gb5312-lookup-card"
          onSubmit={submit}
        >
          <div>
            <small>CONSULTAR PEDIDO</small>
            <h2>
              Encontre sua compra
            </h2>
          </div>

          <label>
            <span>
              Código do pedido
            </span>

            <input
              value={code}
              onChange={e =>
                setCode(
                  e.target.value
                    .toUpperCase()
                )
              }
              placeholder="GB-..."
              required
            />
          </label>

          <label>
            <span>
              E-mail da compra
            </span>

            <input
              type="email"
              value={email}
              autoComplete="email"
              onChange={e =>
                setEmail(
                  e.target.value
                )
              }
              required
            />
          </label>

          <button
            type="submit"
            disabled={sending}
          >
            {sending
              ? 'Consultando...'
              : 'Consultar pedido'}
          </button>

          {message && (
            <p className="gb5312-form-error">
              {message}
            </p>
          )}

          <Link to="/entrar">
            Entrar na minha conta
          </Link>
        </form>

        {order && (
          <div className="gb5312-lookup-result">
            <OrderDetailView
              order={order}
            />
          </div>
        )}
      </section>
    </main>
  )
}
