import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="brand-footer">
      <div className="brand-footer-art">
        <img src="/assets/brand-localz-badge.png" alt="" />
        <div>
          <small>LOCALZ ONLY · 012</small>
          <h2>GRUMBLE<br />BEE</h2>
          <p>
            Drops limitados, identidade local e peças que não voltam
            só porque alguém perdeu.
          </p>
        </div>
      </div>

      <div className="footer-cols">
        <div className="footer-col">
          <strong>Comprar</strong>
          <Link to="/produtos">Drop atual</Link>
          <Link to="/produtos">Camisetas</Link>
          <Link to="/produtos">Jaquetas</Link>
        </div>

        <div className="footer-col">
          <strong>Ajuda</strong>
          <a href="#medidas">Tabela de medidas</a>
          <a href="#trocas">Trocas e devoluções</a>
          <a href="#envios">Envios · Região 012</a>
        </div>

        <div className="footer-col">
          <strong>Marca</strong>
          <Link to="/#editorial">Editorial</Link>
          <Link to="/#sobre">Sobre a Grumble Bee</Link>
          <a
            href="https://www.instagram.com/grbbzzzz"
            target="_blank"
            rel="noreferrer"
          >
            @grbbzzzz
          </a>
        </div>

        <div className="footer-col">
          <strong>Conta</strong>
          <Link to="/carrinho">Carrinho</Link>
          <Link to="/consultar-pedido">Meus pedidos</Link>
          <Link to="/entrar">Entrar</Link>
        </div>
      </div>

      <div className="brand-footer-bottom">
        <span>© 2026 GRUMBLE BEE</span>
        <b>NO BASIC · JUST IDENTITY</b>
        <span>012 · SP</span>
      </div>
    </footer>
  )
}
