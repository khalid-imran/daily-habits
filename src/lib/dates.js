// All date handling uses LOCAL time, formatted as 'YYYY-MM-DD'.
// (Never toISOString() - it shifts to UTC and flips the day near midnight.)

const pad = (n) => String(n).padStart(2, '0')

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

/** Date object -> 'YYYY-MM-DD' (local) */
export const ymd = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const todayYmd = () => ymd(new Date())

/** month is 0-based */
export const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()

/** 'YYYY-MM-DD' for a given (year, 0-based month, day) */
export const dayStr = (year, month, day) => `${year}-${pad(month + 1)}-${pad(day)}`

/** Single-letter weekday for a given date */
export const dowLetter = (year, month, day) => DOW[new Date(year, month, day).getDay()]

/** Add n days (can be negative) to a 'YYYY-MM-DD' string */
export function addDays(s, n) {
  const [y, m, d] = s.split('-').map(Number)
  return ymd(new Date(y, m - 1, d + n))
}

/** 'YYYY-MM-DD' -> '18 March 2021' */
export function prettyDate(s) {
  const [y, m, d] = s.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}
