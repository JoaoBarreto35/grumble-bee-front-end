import '../../styles/customerShared.module.css'
import '../../styles/customerSharedMobile.module.css'
import './styles.module.css'
import './stylesMobile.module.css'
import {
  FormEvent,
  useState
} from 'react'
import {
  Link,
  Navigate,
  useLocation,
  useNavigate
} from 'react-router-dom'
import { useCustomerAuth } from '../../context/CustomerAuthContext'

export function CustomerLoginPage() {
  const {
    logged,
    login
  } = useCustomerAuth()

  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [message, setMessage] =
    useState('')

  const [sending, setSending] =
    useState(false)

  if (logged) {
    return (
      <Navigate
        to="/minha-conta"
        replace
      />
    )
  }

  const submit = async (
    event: FormEvent
  ) => {
    event.preventDefault()
    setSending(true)
    setMessage('')

    try {
      await login(
        email,
        password
      )

      const from = (
        location.state as {
          from?: string
        } | null
      )?.from

      navigate(
        from || '/minha-conta',
        {
          replace: true
        }
      )
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível entrar.'
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="gb5312-auth-page">
      <section className="gb5312-auth-shell">
        <div className="gb5312-auth-brand">
          <span aria-hidden="true">
            ⚡
          </span>

          <small>
            MINHA CONTA
          </small>

          <h1>
            Bem-vindo
            <br />
            de volta.
          </h1>

          <p>
            Entre para acompanhar seus pedidos
            e acessar seus dados de compra.
          </p>
        </div>

        <div className="gb5312-auth-card">
          <div className="gb5312-auth-card-head">
            <small>ENTRAR</small>
            <h2>Acesse sua conta</h2>
          </div>

          <form onSubmit={submit}>
            <label>
              <span>E-mail</span>

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

            <label>
              <span>Senha</span>

              <input
                type="password"
                value={password}
                autoComplete="current-password"
                onChange={e =>
                  setPassword(
                    e.target.value
                  )
                }
                minLength={8}
                required
              />
            </label>

            <button
              type="submit"
              disabled={sending}
            >
              {sending
                ? 'Entrando...'
                : 'Entrar'}
            </button>

            {message && (
              <p className="gb5312-form-error">
                {message}
              </p>
            )}
          </form>

          <div className="gb5312-auth-links">
            <div>
              <span>
                Ainda não tem conta?
              </span>

              <Link to="/cadastro">
                Criar conta
              </Link>
            </div>

            <div>
              <span>
                Comprou como visitante?
              </span>

              <Link to="/consultar-pedido">
                Consultar pedido
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
