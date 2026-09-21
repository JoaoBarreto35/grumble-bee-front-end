import { Navigate, NavLink, Outlet } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'
import { useAdminAuth } from './AdminAuthContext'

export function AdminLayout() {
  const { ready, logged, logout } = useAdminAuth()
  const { demoMode, resetDemo } = useCatalog()

  if (!ready) return <main className="admin-loading">Carregando...</main>
  if (!logged) return <Navigate to="/admin/login" replace />

  return (
    <div className="admin-app">
      <aside className="admin-side">
        <a className="admin-brand" href="/">
          <img src="/assets/logo-grumble-bee.png" alt="" />
          <span>GRUMBLE BEE</span>
        </a>
        <nav>
          <NavLink end to="/admin">Visão geral</NavLink>
          <NavLink to="/admin/temporadas">Temporadas</NavLink>
          <NavLink to="/admin/produtos">Produtos</NavLink>
          <NavLink to="/admin/pedidos">Pedidos</NavLink>
          <NavLink to="/admin/configuracoes">Configurações</NavLink>
        </nav>
        {demoMode && <button className="admin-ghost" onClick={() => void resetDemo()}>Resetar demo</button>}
        <button className="admin-ghost" onClick={() => void logout()}>Sair</button>
      </aside>
      <section className="admin-content">
        {demoMode && <div className="admin-demo-bar">MODO DEMONSTRAÇÃO · dados salvos no localStorage do StackBlitz</div>}
        <Outlet />
      </section>
    </div>
  )
}
