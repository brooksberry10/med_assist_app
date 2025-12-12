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

  // Backend expects: "%b %d, %Y" (e.g., "Oct 24, 2025")
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}
