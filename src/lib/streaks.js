import { addDays, todayYmd } from './dates'

/**
 * Compute streaks from a sorted-ascending array of 'YYYY-MM-DD' strings.
 * Current streak still counts if today isn't checked yet (starts from yesterday).
 */
export function computeStreaks(days) {
  const set = new Set(days)
  const today = todayYmd()

  let current = 0
  let cursor = set.has(today) ? today : addDays(today, -1)
  while (set.has(cursor)) {
    current += 1
    cursor = addDays(cursor, -1)
  }

  let best = 0
  let run = 0
  let prev = null
  for (const d of days) {
    run = prev !== null && addDays(prev, 1) === d ? run + 1 : 1
    if (run > best) best = run
    prev = d
  }

  return { current, best, total: days.length }
}
