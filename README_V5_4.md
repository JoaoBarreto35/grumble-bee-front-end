# Grumble Bee React V5.4 — Brand Rework

Base funcional: V5.3.1.

## O que foi preservado

- Backend/API atual
- Checkout Transparente Mercado Pago
- Pix dentro da página
- Cartão via Mercado Pago Brick
- 3DS
- CEP automático
- Região 012
- Frete
- Carrinho
- Login cliente
- Pedidos e consulta
- Admin de temporadas
- Admin de produtos
- Admin de pedidos
- Admin de configurações

Nenhum contrato de API foi alterado.

## Nova direção visual

Referência principal: identidade Localz Only / 012 enviada pelo usuário.

### Loja

- faixa Localz Only 012 no header
- lockup de marca mais forte
- hero da temporada com selo da marca
- marquee animado
- manifesto visual com arte Grumble Bee
- cards de produto com 012 e microinterações
- coleções com presença mais editorial
- footer totalmente reformulado
- amarelo usado como assinatura, não como fundo dominante

### Checkout

- régua visual animada das etapas
- abelha se movendo pelo checkout
- resumo do pedido escuro / premium
- Pix com animação de espera
- identidade Grumble Bee sem afetar o fluxo do Mercado Pago

### Acompanhamento do pedido

Nova rota visual:

- Recebido
- Preparando
- A caminho
- Saiu pra entrega
- Entregue

A abelha percorre a linha conforme `shipping_status`.

### Admin

- "Control Room · 012"
- sidebar totalmente reformulada
- navegação com ícones
- status ONLINE
- topbar administrativa
- dashboard editorial
- radar de estoque baixo
- destaque da próxima temporada
- cards e pedidos com linguagem visual da marca

## Assets adicionados

- `/public/assets/brand-localz-badge.png`
- `/public/assets/brand-localz-graffiti.png`

São as artes enviadas pelo usuário nesta conversa.

## Build

```bash
npm install
npm run build
```

Deploy Netlify continua usando o `netlify.toml` existente.

Backend continua apontando para:

`https://grumble-bee-backend-v2-1-admin-fix.onrender.com`
