import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer>
      <div className="footer-brand"><img src="/assets/logo-grumble-bee.png" alt="" /><span>GRUMBLE BEE</span></div>
      <div className="footer-cols">
        <div className="footer-col"><strong>Comprar</strong><Link to="/produtos">Nova coleção</Link><Link to="/produtos">Camisetas</Link><Link to="/produtos">Jaquetas</Link></div>
        <div className="footer-col"><strong>Ajuda</strong><a href="#medidas">Tabela de medidas</a><a href="#trocas">Trocas e devoluções</a><a href="#envios">Envios</a></div>
        <div className="footer-col"><strong>Marca</strong><Link to="/#editorial">Editorial</Link><Link to="/#sobre">Sobre a Grumble Bee</Link><a href="https://www.instagram.com/grbbzzzz" target="_blank" rel="noreferrer">@grbbzzzz</a></div>
        <div className="footer-col"><strong>Conta</strong><Link to="/carrinho">Carrinho</Link><Link to="/consultar-pedido">Meus pedidos</Link><Link to="/entrar">Entrar</Link></div>
      </div>
      <div className="copyright">© 2026 Grumble Bee · Todos os direitos reservados.</div>
    </footer>
  )
}
