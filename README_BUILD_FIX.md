# Grumble Bee React V5.3.1 — Mercado Pago SDK build fix

O deploy anterior ficou misturado:
- código src/ da V5.3;
- package.json antigo da V5.2.

Por isso o Netlify mostrou:
`grumble-bee-storefront@5.2.0`
e
`Cannot find module '@mercadopago/sdk-react'`.

Esta versão contém a dependência correta do SDK React do Mercado Pago.

IMPORTANTE:
Substitua a RAIZ INTEIRA do frontend, não apenas `src/`.

Se existir `package-lock.json` antigo no seu repositório, rode:

```bash
npm install
npm run build
```

Ou, para corrigir o projeto atual sem substituir tudo:

```bash
npm install @mercadopago/sdk-react
npm run build
```
