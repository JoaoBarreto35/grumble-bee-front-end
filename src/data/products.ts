export type ProductId = 'coach-amarela' | 'bomber-preta' | 'varsity-vinho' | 'campanha'

export type Product = {
  id: ProductId
  name: string
  price: number
  image: string
  secondary: string[]
  sizes: string[]
  stock: string
  desc: string
  details: string[]
  badge: string
}

export const products: Record<ProductId, Product> = {
  'coach-amarela': {
    id: 'coach-amarela',
    name: 'Coach Jacket Amarela',
    price: 339.9,
    image: '/assets/coach-amarela.jpg',
    secondary: ['/assets/campanha-coach.jpg', '/assets/bomber-preta.jpg'],
    sizes: ['P', 'M', 'G', 'GG'],
    stock: 'Últimas unidades desta temporada',
    desc: 'Coach jacket leve com identidade de campanha, modelagem streetwear e presença forte da cor de assinatura da Grumble Bee.',
    details: ['Tecido leve e resistente', 'Fechamento frontal por botões', 'Dois bolsos frontais', 'Peça da Temporada 01 / Drop 01'],
    badge: 'Novo',
  },
  'bomber-preta': {
    id: 'bomber-preta',
    name: 'Bomber Preta',
    price: 329.9,
    image: '/assets/bomber-preta.jpg',
    secondary: ['/assets/coach-amarela.jpg', '/assets/varsity-vinho.jpg'],
    sizes: ['P', 'M', 'G', 'GG'],
    stock: 'Peça em tiragem limitada',
    desc: 'Jaqueta bomber preta com leitura mais clássica, acabamento urbano e silhueta pensada para sobreposição.',
    details: ['Acabamento acetinado', 'Punhos e gola canelados', 'Bolsos frontais', 'Peça da Temporada 01 / Drop 01'],
    badge: 'Drop 01',
  },
  'varsity-vinho': {
    id: 'varsity-vinho',
    name: 'Varsity Vinho',
    price: 349.9,
    image: '/assets/varsity-vinho.jpg',
    secondary: ['/assets/bomber-preta.jpg', '/assets/campanha-coach.jpg'],
    sizes: ['P', 'M', 'G', 'GG'],
    stock: 'Produção em pequeno lote',
    desc: 'Varsity vinho com construção visual inspirada em jaquetas clássicas e linguagem gráfica de coleção.',
    details: ['Modelagem confortável', 'Punhos listrados', 'Aplicação frontal', 'Peça da Temporada 01 / Drop 01'],
    badge: 'Limitada',
  },
  campanha: {
    id: 'campanha',
    name: 'Coach Jacket — Editorial',
    price: 339.9,
    image: '/assets/campanha-coach.jpg',
    secondary: ['/assets/coach-amarela.jpg', '/assets/bomber-preta.jpg'],
    sizes: ['P', 'M', 'G', 'GG'],
    stock: 'Disponível enquanto durar o drop',
    desc: 'Variação editorial da Coach Jacket amarela, usada aqui como peça central da campanha da primeira temporada.',
    details: ['Peça principal do Drop 01', 'Tiragem limitada', 'Envio para todo Brasil', 'Produção sazonal'],
    badge: 'Editorial',
  },
}

export const productList = Object.values(products)

export function money(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
