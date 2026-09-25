const STORE_TIME_ZONE = 'America/Sao_Paulo'
const STORE_UTC_OFFSET = '-03:00'

function hasExplicitTimezone(value: string) {
  return /(?:Z|[+-]\d{2}:\d{2})$/i.test(value)
}

export function parseSeasonDate(
  value: string | null | undefined
): Date | null {
  if (!value) return null

  const raw = value.trim()
  if (!raw) return null

  let normalized = raw

  // If the API ever returns a naive timestamp, interpret it as the
  // store's wall-clock time instead of letting each browser guess.
  if (!hasExplicitTimezone(normalized)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      normalized = `${normalized}T00:00:00${STORE_UTC_OFFSET}`
    } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized)) {
      normalized = `${normalized}:00${STORE_UTC_OFFSET}`
    } else if (/^\d{4}-\d{2}-\d{2}T/.test(normalized)) {
      normalized = `${normalized}${STORE_UTC_OFFSET}`
    }
  }

  const date = new Date(normalized)

  return Number.isNaN(date.getTime())
    ? null
    : date
}

function saoPauloParts(date: Date) {
  const formatter = new Intl.DateTimeFormat(
    'en-CA',
    {
      timeZone: STORE_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }
  )

  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, part.value])
  )

  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute
  }
}

export function toSeasonDateTimeLocal(
  value: string | null | undefined
) {
  const date = parseSeasonDate(value)
  if (!date) return ''

  const parts = saoPauloParts(date)

  return (
    `${parts.year}-${parts.month}-${parts.day}`
    + `T${parts.hour}:${parts.minute}`
  )
}

export function fromSeasonDateTimeLocal(
  value: string
): string | null {
  if (!value) return null

  // São Paulo has used UTC-03:00 since DST was abolished in 2019.
  // datetime-local has no timezone, so make the store timezone explicit.
  const date = new Date(`${value}:00${STORE_UTC_OFFSET}`)

  return Number.isNaN(date.getTime())
    ? null
    : date.toISOString()
}

export function formatSeasonDateTime(
  value: string | null | undefined
) {
  const date = parseSeasonDate(value)
  if (!date) return 'Data a definir'

  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      timeZone: STORE_TIME_ZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  ).format(date)
}
