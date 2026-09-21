import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { CountdownBar } from './CountdownBar'
import { Footer } from './Footer'
import { Header } from './Header'
import { MenuDrawer } from './MenuDrawer'

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const [menuOpen, setMenuOpen] = useState(false)
  const { toastVisible, clearToast } = useCart()
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  useEffect(() => {
    closeMenu()
    if (location.hash) {
      requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' }))
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [location.pathname, location.search, location.hash, closeMenu])

  return (
    <div className={`app-shell${isHome ? ' home-page' : ''}`}>
      <CountdownBar isHome={isHome} />
      <Header onOpenMenu={() => setMenuOpen(true)} />
      <MenuDrawer open={menuOpen} onClose={closeMenu} />
      {children}
      <Footer />
      <div className={`toast${toastVisible ? ' show' : ''}`} onClick={clearToast}>
        <span>Produto adicionado ao carrinho.</span>
        <Link to="/carrinho">Ver carrinho</Link>
      </div>
    </div>
  )
}
