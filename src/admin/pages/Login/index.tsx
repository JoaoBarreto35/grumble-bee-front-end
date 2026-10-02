import '../../styles/adminShared.module.css'
import '../../styles/adminSharedMobile.module.css'
import './styles.module.css'
import './stylesMobile.module.css'
import {
  FormEvent,
  useState
} from 'react'
import { Navigate } from 'react-router-dom'
import { DEMO_MODE } from '../../../lib/config'
import { useAdminAuth } from '../../AdminAuthContext'

export function AdminLoginPage() {
  const {
    logged,
    login
  } = useAdminAuth()

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [error, setError] =
    useState('')

  if (logged) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    )
  }

  const submit = async (
    event: FormEvent
  ) => {
    event.preventDefault()
    setError('')

    try {
      await login(
        email,
        password
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao entrar.'
      )
    }
  }

  return (
    <main className="admin-login">
      <section className="admin-login-brand">
        <span aria-hidden="true">
          ⚡
        </span>

        <small>
          GRUMBLE BEE
        </small>

        <h1>
          Painel
          <br />
          administrativo.
        </h1>

        <p>
          Gerencie temporadas, produtos,
          estoque, pedidos e pagamentos.
        </p>
      </section>

      <form
        className="admin-login-card"
        onSubmit={submit}
      >
        <div className="admin-login-card-head">
          <img
            src="/assets/logo-grumble-bee.png"
            alt="Grumble Bee"
          />

          <div>
            <small>
              ACESSO RESTRITO
            </small>

            <h2>
              Entrar no ADM
            </h2>
          </div>
        </div>

        {DEMO_MODE && (
          <div className="demo-note">
            Modo demonstração ativo.
          </div>
        )}

        <label>
          <span>E-mail</span>

          <input
            value={email}
            onChange={e =>
              setEmail(
                e.target.value
              )
            }
            type="email"
            autoComplete="email"
            required
          />
        </label>

        <label>
          <span>Senha</span>

          <input
            value={password}
            onChange={e =>
              setPassword(
                e.target.value
              )
            }
            type="password"
            autoComplete="current-password"
            required
          />
        </label>

        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        <button
          className="admin-primary"
          type="submit"
        >
          Entrar
        </button>

        <a
          className="admin-login-store"
          href="/"
        >
          Voltar para a loja
        </a>
      </form>
    </main>
  )
}
