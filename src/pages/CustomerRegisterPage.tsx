import { FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useCustomerAuth } from '../context/CustomerAuthContext'

export function CustomerRegisterPage() {
  const { logged, register } = useCustomerAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', marketing_opt_in: false })
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  if (logged) return <Navigate to="/minha-conta" replace />

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setMessage('')
    if (form.password !== confirm) { setMessage('As senhas não são iguais.'); return }
    setSending(true)
    try {
      await register({ ...form, phone: form.phone || null })
      navigate('/minha-conta', { replace: true })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível criar sua conta.')
    } finally { setSending(false) }
  }

  return <main>
    <section className="account-auth-section">
      <div className="account-auth-card wide">
        <small>GRUMBLE BEE</small><h1>Criar conta</h1>
        <p>Ter conta é opcional. Você também pode comprar como visitante.</p>
        <form onSubmit={submit}>
          <label>Nome completo<input value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} required /></label>
          <div className="form-two">
            <label>E-mail<input type="email" value={form.email} onChange={e => setForm(v => ({ ...v, email: e.target.value }))} required /></label>
            <label>Telefone<input value={form.phone} onChange={e => setForm(v => ({ ...v, phone: e.target.value }))} placeholder="(12) 99999-9999" /></label>
          </div>
          <div className="form-two">
            <label>Senha<input type="password" minLength={8} value={form.password} onChange={e => setForm(v => ({ ...v, password: e.target.value }))} required /></label>
            <label>Confirmar senha<input type="password" minLength={8} value={confirm} onChange={e => setConfirm(e.target.value)} required /></label>
          </div>
          <label className="customer-check"><input type="checkbox" checked={form.marketing_opt_in} onChange={e => setForm(v => ({ ...v, marketing_opt_in: e.target.checked }))} /> Quero receber novidades dos próximos drops.</label>
          <button className="buy-btn ready" disabled={sending}>{sending ? 'Criando...' : 'Criar minha conta'}</button>
          {message && <p className="form-message error">{message}</p>}
        </form>
        <div className="account-auth-links"><span>Já tem conta?</span><Link to="/entrar">Entrar</Link></div>
      </div>
    </section>
  </main>
}
