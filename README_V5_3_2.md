# Grumble Bee React V5.3.2 — Home Mobile First

Base funcional: V5.3.1 estável.

## Escopo desta versão

Foi alterada visualmente SOMENTE a Home.

Páginas que continuam visualmente na base V5.3.1:

- Catálogo
- Produto
- Carrinho
- Checkout
- Login / conta
- Consulta de pedido
- ADM

Nenhum endpoint/API foi alterado.

## Home

A Home foi construída mobile-first:

- hero vertical maior no celular;
- imagem da temporada continua vindo do banco;
- copy original preservada;
- raios apenas como assinatura visual;
- faixa de marca discreta;
- produtos em destaque viraram scroll horizontal no mobile;
- editorial usa a arte enviada pelo usuário;
- coleções empilhadas no mobile;
- atual → próxima → arquivo;
- próxima temporada mostra o contador real;
- desktop é adaptação da estrutura mobile.

## Frases preservadas

- Temporada atual
- Produtos em destaque
- Editorial
- NO BASIC / JUST IDENTITY
- Limited drops, custom pieces, only 012
- Coleções
- Agora, antes e depois.
- Arquivo
- Próxima temporada

## Correção do contador "Em breve"

Também foi corrigido um erro de timezone no ADM.

Antes, o campo `datetime-local` fazia:

1. recebia a data UTC;
2. usava `toISOString()`;
3. colocava o horário UTC dentro de um campo que representa horário local.

Isso podia deslocar o horário da temporada.

Agora:

- temporada é interpretada/exibida em `America/Sao_Paulo`;
- countdown usa o instante correto;
- página Em breve informa "Horário de Brasília";
- data do ADM não sofre mais conversão visual UTC indevida.

### Importante para uma data que já foi salva antes da correção

Depois de publicar a V5.3.2:

1. abra ADM → Temporadas;
2. selecione a temporada "Em breve";
3. confira o campo "Início";
4. coloque o horário que você realmente quer para o lançamento;
5. salve uma vez.

Isso corrige qualquer horário antigo que já tenha sido salvo deslocado.

## Build

```bash
npm install
npm run build
```

Versão: `5.3.2`.
