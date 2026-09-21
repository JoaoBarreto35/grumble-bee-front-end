import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { useCatalog } from '../context/CatalogContext'

type Props = { open: boolean; onClose: () => void }

export function MenuDrawer({ open, onClose }: Props) {
  const { customer, logged, logout } = useCustomerAuth()
  const { seasons } = useCatalog()
  const currentSeason = seasons.find(s => s.status === 'current')
  const upcomingSeason = seasons.find(s => s.status === 'upcoming')
  useEffect(() => {
    if (!open) return
    const scrollY = window.scrollY
    document.body.classList.add('menu-open')
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'

    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.classList.remove('menu-open')
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY)
    }
  }, [open, onClose])

  const closeLink = () => onClose()

  return (
    <>
      <div className="menu-overlay" onClick={onClose} aria-hidden="true" />
      <aside className="menu-drawer" aria-label="Menu lateral" aria-hidden={!open}>
        <div className="drawer-head">
          <Link className="drawer-brand" to="/" onClick={closeLink}>
            <img src="/assets/logo-grumble-bee.png" alt="Símbolo Grumble Bee" />
            <span>GRUMBLE BEE</span>
          </Link>
          <button className="drawer-close" onClick={onClose} aria-label="Fechar menu">×</button>
        </div>

        <div className="drawer-group"><Link className="drawer-group-title" to="/" onClick={closeLink}>HOME</Link></div>

        <div className="drawer-group">
          <span className="drawer-group-title">NAVEGUE</span>
          <div className="drawer-group-links">
            <Link to="/produtos#camisetas" onClick={closeLink}>Camisetas <span>›</span></Link>
            <Link to="/produtos#camisas" onClick={closeLink}>Camisas <span>›</span></Link>
            <Link to="/produtos#jaquetas" onClick={closeLink}>Jaquetas <span>›</span></Link>
            <Link to="/produtos#moletom" onClick={closeLink}>Moletom <span>›</span></Link>
            <Link to="/produtos#bermudas" onClick={closeLink}>Bermudas <span>›</span></Link>
            <Link to="/produtos#calcas" onClick={closeLink}>Calças <span>›</span></Link>
            <Link to="/produtos#feminino" onClick={closeLink}>Feminino <span>›</span></Link>
            <Link to="/produtos#saldos" onClick={closeLink}>Saldos <span>›</span></Link>
            <Link className="featured" to="/colecao-atual" onClick={closeLink}>Nova coleção <span>›</span></Link>
          </div>
        </div>

        <div className="drawer-group">
          <span className="drawer-group-title">ACESSÓRIOS</span>
          <div className="drawer-group-links">
            <Link to="/produtos#acessorios" onClick={closeLink}>Gorro <span>›</span></Link>
            <Link to="/produtos#acessorios" onClick={closeLink}>Boné <span>›</span></Link>
            <Link to="/produtos#acessorios" onClick={closeLink}>Bolsas <span>›</span></Link>
          </div>
        </div>

        <div className="drawer-group">
          <span className="drawer-group-title">COLEÇÕES</span>
          <div className="drawer-group-links">
            <Link to="/colecao-arquivo" onClick={closeLink}>Antigas / Arquivo <span>›</span></Link>
            <Link className="featured" to="/colecao-atual" onClick={closeLink}>Atual — {currentSeason?.name ?? 'Coleção atual'} <span>›</span></Link>
            <Link to="/em-breve" onClick={closeLink}>Em breve — {upcomingSeason?.name ?? 'Próxima coleção'} <span>›</span></Link>
            <Link to="/colecoes" onClick={closeLink}>Ver todas <span>›</span></Link>
          </div>
        </div>

        <div className="drawer-group"><a className="drawer-group-title" href="mailto:contato@grumblebee.com">CONTATO</a></div>

        <div className="drawer-account">
          {logged ? <>
            <Link to="/minha-conta" onClick={closeLink}>Minha conta · {customer?.name.split(' ')[0]}</Link>
            <button type="button" onClick={() => { void logout(); closeLink() }}>Sair</button>
          </> : <>
            <Link to="/cadastro" onClick={closeLink}>Cadastre-se</Link>
            <Link to="/entrar" onClick={closeLink}>Login</Link>
          </>}
          <Link to="/consultar-pedido" onClick={closeLink}>Consultar pedido</Link>
          <Link to="/carrinho" onClick={closeLink}>Carrinho</Link>
          <a href="https://www.instagram.com/grbbzzzz" target="_blank" rel="noreferrer">Instagram · @grbbzzzz</a>
        </div>
      </aside>
    </>
  )
}
