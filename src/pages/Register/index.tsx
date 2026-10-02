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
  useNavigate
} from 'react-router-dom'
import { useCustomerAuth } from '../../context/CustomerAuthContext'

export function CustomerRegisterPage() {
  const {
    logged,
    register
  } = useCustomerAuth()

  const navigate = useNavigate()

  const [form, setForm] =
    useState({
      name: '',
      email: '',
      phone: '',
      password: '',
      marketing_opt_in: false
    })

  const [confirm, setConfirm] =
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
    setMessage('')

    if (
      form.password !== confirm
    ) {
      setMessage(
        'As senhas não são iguais.'
      )
      return
    }

    setSending(true)

    try {
      await register({
        ...form,
        phone:
          form.phone || null
      })

      navigate(
        '/minha-conta',
        {
          replace: true
        }
      )
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível criar sua conta.'
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
            GRUMBLE BEE
          </small>

          <h1>
            Sua conta.
            <br />
            Seus pedidos.
          </h1>

          <p>
            Crie sua conta para acompanhar compras
            e acessar seus pedidos em um só lugar.
          </p>
        </div>

        <div className="gb5312-auth-card gb5312-auth-card-wide">
          <div className="gb5312-auth-card-head">
            <small>CADASTRO</small>
            <h2>Criar conta</h2>
          </div>

          <form onSubmit={submit}>
            <label>
              <span>Nome completo</span>

              <input
                value={form.name}
                autoComplete="name"
                onChange={e =>
                  setForm(value => ({
                    ...value,
                    name:
                      e.target.value
                  }))
                }
                required
              />
            </label>

            <div className="gb5312-form-two">
              <label>
                <span>E-mail</span>

                <input
                  type="email"
                  value={form.email}
                  autoComplete="email"
                  onChange={e =>
                    setForm(value => ({
                      ...value,
                      email:
                        e.target.value
                    }))
                  }
                  required
                />
              </label>

              <label>
                <span>Telefone</span>

                <input
                  value={form.phone}
                  inputMode="tel"
                  autoComplete="tel"
                  onChange={e =>
                    setForm(value => ({
                      ...value,
                      phone:
                        e.target.value
                    }))
                  }
                  placeholder="(12) 99999-9999"
                />
              </label>
            </div>

            <div className="gb5312-form-two">
              <label>
                <span>Senha</span>

                <input
                  type="password"
                  minLength={8}
                  value={form.password}
                  autoComplete="new-password"
                  onChange={e =>
                    setForm(value => ({
                      ...value,
                      password:
                        e.target.value
                    }))
                  }
                  required
                />
              </label>

              <label>
                <span>Confirmar senha</span>

                <input
                  type="password"
                  minLength={8}
                  value={confirm}
                  autoComplete="new-password"
                  onChange={e =>
                    setConfirm(
                      e.target.value
                    )
                  }
                  required
                />
              </label>
            </div>

            <label className="gb5312-check">
              <input
                type="checkbox"
                checked={
                  form.marketing_opt_in
                }
                onChange={e =>
                  setForm(value => ({
                    ...value,
                    marketing_opt_in:
                      e.target.checked
                  }))
                }
              />

              <span>
                Quero receber novidades dos próximos drops.
              </span>
            </label>

            <button
              type="submit"
              disabled={sending}
            >
              {sending
                ? 'Criando...'
                : 'Criar minha conta'}
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
                Já tem conta?
              </span>

              <Link to="/entrar">
                Entrar
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
