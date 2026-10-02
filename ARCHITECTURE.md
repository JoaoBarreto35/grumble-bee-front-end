# Arquitetura do frontend — Grumble Bee 6.0.0

## Convenção de páginas

Todas as páginas seguem a mesma organização:

```text
pages/<Page>/
├── index.tsx
├── styles.module.css
└── stylesMobile.module.css
```

`styles.module.css` contém a base mobile-first da página e as adaptações desktop.
`stylesMobile.module.css` concentra correções específicas para telas menores e safeguards.

## Storefront

```text
src/pages/
├── Home/
├── Products/
├── Product/
├── Collections/
├── CurrentCollection/
├── UpcomingCollection/
├── ArchiveCollection/
├── Cart/
├── Checkout/
├── Login/
├── Register/
├── Account/
├── AccountOrder/
├── OrderLookup/
├── OrderConfirmation/
└── PaymentReturn/
```

## Administrativo

```text
src/admin/pages/
├── Login/
├── Dashboard/
├── Seasons/
├── Products/
├── Orders/
└── Settings/
```

## Estilos compartilhados

```text
src/styles/customerShared.module.css
src/styles/customerSharedMobile.module.css
src/admin/styles/adminShared.module.css
src/admin/styles/adminSharedMobile.module.css
```

As classes visuais previamente aprovadas foram preservadas explicitamente com `:global(...)` dentro dos CSS Modules. Isso permite reorganizar o projeto sem trocar os seletores e sem introduzir uma mudança visual acidental na versão final.

## Breakpoints

- Mobile-first: regra base.
- Mobile específico: até 899 px no storefront.
- Safeguard: 360 px nas páginas que já exigiam proteção adicional.
- Desktop: a partir de 900 px.
- ADM: ajustes intermediários em 1100/820/520 px.

## Integrações preservadas

A reorganização não altera os contratos de API nem o fluxo funcional existente: catálogo, temporadas, carrinho, estoque por variante, CEP, Região 012, checkout, Mercado Pago Pix/cartão, 3DS, clientes, pedidos e ADM continuam usando as mesmas camadas de contexto/API.
