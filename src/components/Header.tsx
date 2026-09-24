import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useCustomerAuth } from '../context/CustomerAuthContext'

export function Header({
  onOpenMenu
}: {
  onOpenMenu: () => void
}) {
  const { count } = useCart()
  const { logged } = useCustomerAuth()

  return (
    <header className="header brand-header">
      <div className="brand-header-rail lightning-rail">
        <span>GRUMBLE BEE</span>
        <b>⚡</b>
        <span>LIMITED DROPS</span>
        <b>⚡</b>
        <span>STREETWEAR</span>
        <b>⚡</b>
        <span>GRBBZZZZ</span>
      </div>

      <div className="header-main">
        <button
          className="icon-btn brand-menu-btn"
          onClick={onOpenMenu}
          aria-label="Abrir menu"
        >
          <span />
          <span />
          <span />
        </button>

        <Link className="brand" to="/">
          <span className="brand-logo-circle">
            <img
              src="/assets/logo-grumble-bee.png"
              alt="Símbolo Grumble Bee"
            />
          </span>

          <span className="brand-lockup">
            <strong>GRUMBLE BEE</strong>
            <small>STREETWEAR · LIMITED DROPS</small>
          </span>
        </Link>

        <div className="header-right-actions">
          <Link
            className="icon-btn account-icon-btn"
            to={logged ? '/minha-conta' : '/entrar'}
            aria-label={logged ? 'Minha conta' : 'Entrar'}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="3.2" />
              <path d="M5.5 20c.6-4.1 2.8-6.2 6.5-6.2s5.9 2.1 6.5 6.2" />
            </svg>
          </Link>

          <Link
            className="icon-btn right"
            to="/carrinho"
            aria-label="Carrinho"
          >
            <svg className="cart-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20.4 8H7" />
              <circle cx="9.5" cy="19" r="1.25" />
              <circle cx="17.5" cy="19" r="1.25" />
            </svg>
            <span className="cart-count">{count}</span>
          </Link>
        </div>
      </div>

      <nav className="category-strip">
        <Link to="/produtos">Nova coleção</Link>
        <Link to="/produtos#camisetas">Camisetas</Link>
        <Link to="/produtos#camisas">Camisas</Link>
        <Link to="/produtos#jaquetas">Jaquetas</Link>
        <Link to="/produtos#moletom">Moletom</Link>
        <Link to="/colecoes">Coleções</Link>
      </nav>
    </header>
  )
}
