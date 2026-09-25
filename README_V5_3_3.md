# Grumble Bee React V5.3.3 — Home Mobile Clean

Base: V5.3.1 estável.

## Escopo

Nesta rodada a única página redesenhada é a Home.

Mantidos visual e funcionalmente na V5.3.1:

- produto;
- catálogo;
- carrinho;
- checkout;
- Mercado Pago;
- conta;
- pedidos;
- ADM.

## Home mobile

Pensada primeiro para 390 px, com safeguards para 360 px e bom encaixe em
430 px.

### Mudanças

- menu horizontal escondido apenas na Home mobile;
- contador continua no topo;
- header permanece compacto;
- hero virou uma composição única:
  - imagem;
  - título;
  - descrição;
  - CTAs;
  - sem repetir Anime em uma segunda área;
- raio aparece só como assinatura;
- produtos em destaque menores, em scroll horizontal, mostrando parte do
  próximo card;
- editorial compacto, com o mascote da marca sem usar a arte Localz gigante;
- coleções mais baixas e legíveis;
- sem quadrados decorativos nos cantos;
- próxima temporada possui countdown compacto.

## Cronômetro / datas

A infraestrutura de data foi corrigida para `America/Sao_Paulo`.

O ADM não foi redesenhado, mas os campos Início/Fim agora exibem corretamente
o horário de Brasília em `datetime-local`.

Depois de publicar, abra a temporada upcoming no ADM e salve novamente o
horário desejado uma vez, caso ele tenha sido gravado pela versão antiga com
deslocamento UTC.

## Build

```bash
npm install
npm run build
```

Versão: 5.3.3
