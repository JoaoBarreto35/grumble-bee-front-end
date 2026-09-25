const STORE_TIME_ZONE = 'America/Sao_Paulo'
const STORE_UTC_OFFSET = '-03:00'

function hasTimezone(value: string) {
  return /(?:Z|[+-]\d{2}:\d{2})$/i.test(value)
}

export function parseSeasonDate(
  value: string | null | undefined
): Date | null {
  if (!value) return null

  const raw = value.trim()
  if (!raw) return null

  let normalized = raw

  // PostgreSQL/API should normally return an explicit timezone.
  // If an older record is naive, treat it as store wall-clock time.
  if (!hasTimezone(normalized)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      normalized = `${normalized}T00:00:00${STORE_UTC_OFFSET}`
    } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized)) {
      normalized = `${normalized}:00${STORE_UTC_OFFSET}`
    } else if (/^\d{4}-\d{2}-\d{2}T/.test(normalized)) {
      normalized = `${normalized}${STORE_UTC_OFFSET}`
    }
  }

  const parsed = new Date(normalized)

  return Number.isNaN(parsed.getTime())
    ? null
    : parsed
}

function storeParts(date: Date) {
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

  return Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, part.value])
  ) as Record<string, string>
}

export function toSeasonDateTimeLocal(
  value: string | null | undefined
) {
  const parsed = parseSeasonDate(value)
  if (!parsed) return ''

  const parts = storeParts(parsed)

  return (
    `${parts.year}-${parts.month}-${parts.day}`
    + `T${parts.hour}:${parts.minute}`
  )
}

export function fromSeasonDateTimeLocal(
  value: string
): string | null {
  if (!value) return null

  // Brazil has no DST in 2026; the store operates on UTC-03.
  const parsed = new Date(
    `${value}:00${STORE_UTC_OFFSET}`
  )

  return Number.isNaN(parsed.getTime())
    ? null
    : parsed.toISOString()
}

export function formatSeasonDateTime(
  value: string | null | undefined
) {
  const parsed = parseSeasonDate(value)

  if (!parsed) {
    return 'Data a definir'
  }

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
  ).format(parsed)
}
