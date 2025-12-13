// frontend/src/utils/date.ts

export function parseBackendDateString(
  value: string | null | undefined
): Date | null {
  if (!value) {
    return null
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed
}

// Takes "YYYY-MM-DD" from <input type="date"> and returns a Date at UTC midnight
export function parseDateInputToUtcDate(value: string | null | undefined): Date | null {
  if (!value) return null
  // Expect YYYY-MM-DD
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null

  return new Date(Date.UTC(year, month - 1, day))
}

// Formats a Date as YYYY-MM-DD using UTC (safe for date inputs)
export function formatUtcDateForDateInput(date: Date | null | undefined): string {
  if (!date) return ''
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}


export function formatDateForBackend(
  date: Date | null | undefined
): string | null {
  if (!date) {
    return null
  }

  // Backend expects ISO 8601 format (e.g., "2025-10-24T12:00:00Z")
  return date.toISOString()
}
