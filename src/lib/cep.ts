export type ViaCepAddress = {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  estado?: string
  ibge?: string
  ddd?: string
  erro?: boolean
}

export function onlyCepDigits(value: string) {
  return value.replace(/\D/g, '').slice(0, 8)
}

export function formatCep(value: string) {
  const digits = onlyCepDigits(value)

  if (digits.length <= 5) {
    return digits
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

export function isCompleteCep(value: string) {
  return onlyCepDigits(value).length === 8
}

export async function lookupCep(
  value: string
): Promise<ViaCepAddress> {
  const cep = onlyCepDigits(value)

  if (cep.length !== 8) {
    throw new Error(
      'Informe um CEP válido com 8 números.'
    )
  }

  let response: Response

  try {
    response = await fetch(
      `https://viacep.com.br/ws/${cep}/json/`,
      {
        headers: {
          Accept: 'application/json'
        }
      }
    )
  } catch {
    throw new Error(
      'Não foi possível consultar o CEP agora. Você pode preencher o endereço manualmente.'
    )
  }

  if (!response.ok) {
    throw new Error(
      'Não foi possível consultar esse CEP.'
    )
  }

  const data =
    await response.json() as ViaCepAddress

  if (data.erro) {
    throw new Error(
      'CEP não encontrado. Confira os números ou preencha o endereço manualmente.'
    )
  }

  return data
}
