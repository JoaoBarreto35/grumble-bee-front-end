# Grumble Bee React V5.3 — Checkout Transparente Mercado Pago

Base visual preservada da V5.2/V6.10.

## Novo fluxo

O comprador não sai mais da Grumble Bee.

### Pix

1. endereço e frete são validados;
2. o pedido `GB-...` é criado;
3. o frontend chama `/payments/mercado-pago/pix`;
4. o QR Code e o Pix Copia e Cola aparecem na própria página;
5. o checkout consulta o pedido a cada 5 segundos;
6. o webhook confirma o pagamento;
7. o carrinho é limpo e o pedido aparece como pago.

### Cartão

Usa o componente oficial `CardPayment` de `@mercadopago/sdk-react`.

- número do cartão, CVV e validade são tratados pelo SDK do Mercado Pago;
- a Grumble Bee recebe apenas o token;
- o backend envia esse token à Orders API;
- o total utilizado vem do pedido salvo no backend, nunca do frontend.

## Public Key

O frontend NÃO precisa guardar a Public Key no Netlify.

O backend V2.5 lê:

```env
MERCADO_PAGO_PUBLIC_KEY=...
```

e entrega a chave pública por `/checkout/settings`.

## Deploy Netlify

A API continua:

```env
VITE_DEMO_MODE=false
VITE_API_URL=https://grumble-bee-backend-v2-1-admin-fix.onrender.com
```

`netlify.toml` já mantém o fallback SPA.

## Ordem recomendada

1. subir Backend V2.5;
2. rodar SQL 005;
3. configurar Public Key no Render;
4. confirmar `/checkout/settings`;
5. publicar esta V5.3 no Netlify;
6. ativar pagamentos no ADM;
7. testar Pix e cartão.

## 3DS 2.0

Se o banco exigir autenticação adicional, a API retorna `challenge_url` e a V5.3 abre o Challenge em iframe dentro da própria Grumble Bee. O frontend monitora o pedido e conclui a compra quando o webhook/status confirmar o pagamento.
