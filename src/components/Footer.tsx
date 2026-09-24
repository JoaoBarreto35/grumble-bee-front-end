import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="brand-footer lightning-footer">
      <div className="brand-footer-art">
        <div className="footer-lightning-mark">
          <img
            src="/assets/logo-grumble-bee.png"
            alt=""
          />
          <span>⚡</span>
        </div>

        <div>
          <small>GRUMBLE BEE</small>

          <h2>
            NO BASIC<br />
            JUST IDENTITY
          </h2>

          <p>
            Limited drops, custom pieces, only 012
          </p>
        </div>
      </div>

      <div className="footer-cols">
        <div className="footer-col">
          <strong>Comprar</strong>
          <Link to="/produtos">Nova coleção</Link>
          <Link to="/produtos">Camisetas</Link>
          <Link to="/produtos">Jaquetas</Link>
        </div>

        <div className="footer-col">
          <strong>Ajuda</strong>
          <a href="#medidas">Tabela de medidas</a>
          <a href="#trocas">Trocas e devoluções</a>
          <a href="#envios">Envios</a>
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
        <b>⚡</b>
        <span>STREETWEAR · LIMITED DROPS</span>
      </div>
    </footer>
  )
}
