# Grumble Bee Frontend 6.0.0 — Final

Versão final reorganizada a partir da V5.4.0 aprovada.

## Arquitetura de páginas

Cada página pública segue o padrão:

```text
src/pages/Home/
  index.tsx
  styles.module.css
  stylesMobile.module.css
```

O mesmo padrão foi aplicado a Products, Product, Collections, CurrentCollection, UpcomingCollection, ArchiveCollection, Cart, Checkout, Login, Register, Account, AccountOrder, OrderLookup, OrderConfirmation e PaymentReturn.

As páginas ADM seguem o mesmo conceito em `src/admin/pages/<Page>/`.

## CSS

- `styles.module.css`: base mobile-first e regras desktop da página.
- `stylesMobile.module.css`: ajustes específicos para telas menores.
- Classes visuais previamente validadas foram preservadas com `:global(...)` dentro dos CSS Modules, evitando regressão visual durante a reorganização.
- `src/styles.css` permanece apenas como base global/compartilhada do shell e componentes históricos.
- estilos compartilhados de cliente: `src/styles/customerShared*.module.css`.
- estilos compartilhados do ADM: `src/admin/styles/adminShared*.module.css`.

## Preservado

- Home e identidade Grumble Bee aprovadas;
- temporadas atual, futura, arquivo e coleções;
- produto sem CEP;
- carrinho com quantidade por estoque;
- checkout com CEP/Região 012;
- Pix, cartão, Mercado Pago e 3DS;
- autenticação, conta e pedidos;
- ADM completo;
- API existente, backend e contratos de dados.

## Breakpoints

- mobile-first por padrão;
- ajustes específicos até 899 px / 820 px no ADM;
- safeguard em 360 px;
- desktop a partir de 900 px, conforme páginas existentes.

Versão: 6.0.0
