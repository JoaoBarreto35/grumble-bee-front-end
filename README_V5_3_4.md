# Grumble Bee React V5.3.4 — Home Streetwear Mobile

Base: V5.3.1 estável.

## Objetivo desta versão

Reconstruir SOMENTE a Home mobile, sem reutilizar CSS das tentativas V5.3.2/V5.3.3.

Target principal: 390 px.
Safeguard: 360 px.
430 px deve expandir naturalmente.

## Princípios

- nenhuma seção usa `width: 100vw`;
- nenhuma seção usa margem externa negativa;
- todo grid usa `minmax(0, 1fr)`;
- Home usa `overflow-x: clip`;
- menu horizontal é escondido apenas na Home mobile;
- header mobile usa colunas reais para menu / marca / ações;
- foco em loja confiável, streetwear e personalizada;
- raio é assinatura, não decoração repetitiva.

## Estrutura

1. contador da temporada;
2. header compacto;
3. hero único, sem repetição de conteúdo;
4. faixa de confiança;
5. produtos em destaque em grid 2x2;
6. editorial;
7. coleções;
8. CTA final.

## Copy preservada

- Temporada atual
- Produtos em destaque
- Editorial
- NO BASIC. JUST IDENTITY.
- Limited drops, custom pieces, only 012
- Coleções
- Agora, antes e depois.
- Arquivo
- Próxima temporada

## Contador "Em breve"

Foi mantida a correção de timezone:

- `America/Sao_Paulo`;
- ADM continua visualmente intacto;
- campos Início/Fim não exibem mais UTC como horário local;
- página Em breve informa Horário de Brasília.

Se o horário da próxima temporada foi salvo antes da correção, abra a temporada no ADM,
confira o campo Início e salve novamente uma vez.

## Não alterado

- catálogo;
- produto;
- carrinho;
- checkout;
- Mercado Pago;
- pedidos;
- conta;
- ADM visual;
- backend/API.

Versão: 5.3.4
