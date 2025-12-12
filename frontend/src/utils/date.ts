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

export function formatDateForBackend(
  date: Date | null | undefined
): string | null {
  if (!date) {
    return null
  }

  // Backend expects ISO 8601 format (e.g., "2025-10-24T12:00:00Z")
  return date.toISOString()
}
