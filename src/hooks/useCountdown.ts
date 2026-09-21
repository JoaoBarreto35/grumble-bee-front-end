import { useEffect, useMemo, useState } from 'react'

export type CountdownValue = {
  days: number
  hours: number
  minutes: number
  seconds: number
  done: boolean
}

const EMPTY_COUNTDOWN: CountdownValue = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  done: false
}

function calculate(targetISO: string | null): CountdownValue {
  if (!targetISO) {
    return EMPTY_COUNTDOWN
  }

  const now = Date.now()
  const target = new Date(targetISO).getTime()

  if (Number.isNaN(target)) {
    return EMPTY_COUNTDOWN
  }

  let diff = Math.max(0, target - now)
  const days = Math.floor(diff / 86_400_000)
  diff -= days * 86_400_000
  const hours = Math.floor(diff / 3_600_000)
  diff -= hours * 3_600_000
  const minutes = Math.floor(diff / 60_000)
  diff -= minutes * 60_000
  const seconds = Math.floor(diff / 1_000)

  return {
    days,
    hours,
    minutes,
    seconds,
    done: now >= target
  }
}

export function useCountdown(
  targetISO: string | null,
  intervalMs = 1000
) {
  const stableTarget = useMemo(
    () => targetISO,
    [targetISO]
  )

  const [value, setValue] = useState(
    () => calculate(stableTarget)
  )

  useEffect(() => {
    setValue(calculate(stableTarget))

    if (!stableTarget) {
      return undefined
    }

    const timer = window.setInterval(
      () => setValue(calculate(stableTarget)),
      intervalMs
    )

    return () => window.clearInterval(timer)
  }, [stableTarget, intervalMs])

  return value
}

export const pad = (n: number) =>
  String(Math.max(0, n)).padStart(2, '0')
