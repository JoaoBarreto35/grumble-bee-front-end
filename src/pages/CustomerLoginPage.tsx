import { FormEvent, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useCustomerAuth } from '../context/CustomerAuthContext'

export function CustomerLoginPage() {
  const { logged, login } = useCustomerAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  if (logged) return <Navigate to="/minha-conta" replace />

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSending(true); setMessage('')
    try {
      await login(email, password)
      const from = (location.state as { from?: string } | null)?.from
      navigate(from || '/minha-conta', { replace: true })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível entrar.')
    } finally { setSending(false) }
  }

  return <main>
    <section className="account-auth-section">
      <div className="account-auth-card">
        <small>MINHA CONTA</small>
        <h1>Entrar</h1>
        <p>Acesse seus pedidos, rastreios e dados salvos.</p>
        <form onSubmit={submit}>
          <label>E-mail<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
          <label>Senha<input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required /></label>
          <button className="buy-btn ready" disabled={sending}>{sending ? 'Entrando...' : 'Entrar'}</button>
          {message && <p className="form-message error">{message}</p>}
        </form>
        <div className="account-auth-links">
          <span>Ainda não tem conta?</span><Link to="/cadastro">Criar conta</Link>
          <span>Comprou sem criar conta?</span><Link to="/consultar-pedido">Consultar pedido</Link>
        </div>
      </div>
    </section>
  </main>
}
