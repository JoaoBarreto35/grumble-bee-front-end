import { FormEvent, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { DEMO_MODE } from '../lib/config'
import { useAdminAuth } from './AdminAuthContext'

export function AdminLoginPage() {
  const { logged, login } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (logged) return <Navigate to="/admin" replace />

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar.')
    }
  }

  return (
    <main className="admin-login">
      <form className="admin-login-card" onSubmit={submit}>
        <img src="/assets/logo-grumble-bee.png" alt="Grumble Bee" />
        <h1>GRUMBLE BEE</h1>
        <p>Painel administrativo</p>
        {DEMO_MODE && <div className="demo-note">StackBlitz está em modo demonstração. Digite qualquer e-mail e senha.</div>}
        <label>E-mail<input value={email} onChange={e => setEmail(e.target.value)} type="email" required /></label>
        <label>Senha<input value={password} onChange={e => setPassword(e.target.value)} type="password" required /></label>
        {error && <div className="admin-error">{error}</div>}
        <button className="admin-primary" type="submit">Entrar</button>
        <a href="/">Voltar para loja</a>
      </form>
    </main>
  )
}
