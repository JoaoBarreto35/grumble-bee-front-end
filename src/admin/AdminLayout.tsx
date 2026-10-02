import './styles/adminShared.module.css'
import './styles/adminSharedMobile.module.css'
import {
  Navigate,
  NavLink,
  Outlet
} from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'
import { useAdminAuth } from './AdminAuthContext'

export function AdminLayout() {
  const {
    ready,
    logged,
    logout
  } = useAdminAuth()

  const {
    demoMode,
    resetDemo
  } = useCatalog()

  if (!ready) {
    return (
      <main className="admin-loading">
        Carregando painel...
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
    <div className="admin-app">
      <aside className="admin-side">
        <div className="admin-side-top">
          <a
            className="admin-brand"
            href="/"
          >
            <img
              src="/assets/logo-grumble-bee.png"
              alt=""
            />

            <div>
              <strong>
                GRUMBLE BEE
              </strong>

              <span>
                ADMIN
              </span>
            </div>
          </a>

          <span
            className="admin-side-bolt"
            aria-hidden="true"
          >
            ⚡
          </span>
        </div>

        <nav>
          <NavLink
            end
            to="/admin"
          >
            <span>01</span>
            Visão geral
          </NavLink>

          <NavLink to="/admin/temporadas">
            <span>02</span>
            Temporadas
          </NavLink>

          <NavLink to="/admin/produtos">
            <span>03</span>
            Produtos
          </NavLink>

          <NavLink to="/admin/pedidos">
            <span>04</span>
            Pedidos
          </NavLink>

          <NavLink to="/admin/configuracoes">
            <span>05</span>
            Configurações
          </NavLink>
        </nav>

        <div className="admin-side-actions">
          {demoMode && (
            <button
              className="admin-ghost"
              onClick={() =>
                void resetDemo()
              }
            >
              Resetar demo
            </button>
          )}

          <a
            className="admin-ghost"
            href="/"
          >
            Ver loja
          </a>

          <button
            className="admin-ghost"
            onClick={() =>
              void logout()
            }
          >
            Sair
          </button>
        </div>
      </aside>

      <section className="admin-content">
        {demoMode && (
          <div className="admin-demo-bar">
            MODO DEMONSTRAÇÃO · ALTERAÇÕES LOCAIS
          </div>
        )}

        <Outlet />
      </section>
    </div>
  )
}
