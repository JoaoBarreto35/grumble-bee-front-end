import {
  Navigate,
  NavLink,
  Outlet
} from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'
import { useAdminAuth } from './AdminAuthContext'

const nav = [
  ['◉', 'Visão geral', '/admin', true],
  ['✦', 'Temporadas', '/admin/temporadas', false],
  ['▦', 'Produtos', '/admin/produtos', false],
  ['➜', 'Pedidos', '/admin/pedidos', false],
  ['⚙', 'Configurações', '/admin/configuracoes', false]
] as const

export function AdminLayout() {
  const { ready, logged, logout } = useAdminAuth()
  const { demoMode, resetDemo } = useCatalog()

  if (!ready) {
    return (
      <main className="admin-loading">
        Carregando...
      </main>
    )
  }

  if (!logged) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    )
  }

  return (
    <div className="admin-app brand-admin-app">
      <aside className="admin-side brand-admin-side">
        <a className="admin-brand" href="/">
          <span className="admin-brand-symbol">
            <img
              src="/assets/logo-grumble-bee.png"
              alt=""
            />
            <b>⚡</b>
          </span>

          <span>
            <strong>GRUMBLE BEE</strong>
            <small>ADMIN</small>
          </span>
        </a>

        <div className="admin-side-label">
          PAINEL
        </div>

        <nav>
          {nav.map(([icon, label, to, end]) => (
            <NavLink
              key={to}
              end={end}
              to={to}
            >
              <span className="admin-nav-icon">
                {icon}
              </span>

              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-side-pulse">
          <span className="admin-live-dot" />

          <div>
            <small>SISTEMA</small>
            <strong>ONLINE</strong>
          </div>

          <b className="admin-pulse-lightning">
            ⚡
          </b>
        </div>

        <div className="admin-side-actions">
          {demoMode && (
            <button
              className="admin-ghost"
              onClick={() => void resetDemo()}
            >
              Resetar demo
            </button>
          )}

          <a
            className="admin-ghost admin-store-link"
            href="/"
          >
            Abrir loja ↗
          </a>

          <button
            className="admin-ghost"
            onClick={() => void logout()}
          >
            Sair
          </button>
        </div>

        <span className="admin-side-bolt admin-side-bolt-a">
          ⚡
        </span>

        <span className="admin-side-bolt admin-side-bolt-b">
          ⚡
        </span>
      </aside>

      <section className="admin-content brand-admin-content">
        {demoMode && (
          <div className="admin-demo-bar">
            MODO DEMONSTRAÇÃO · dados salvos no localStorage do StackBlitz
          </div>
        )}

        <div className="admin-topbar">
          <div>
            <span className="admin-topbar-kicker">
              GRUMBLE BEE
            </span>

            <strong>PAINEL ADMINISTRATIVO</strong>
          </div>

          <div className="admin-topbar-right">
            <b>⚡</b>
            <span>GRBBZZZZ</span>
          </div>
        </div>

        <Outlet />
      </section>
    </div>
  )
}
