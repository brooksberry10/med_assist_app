// frontend/src/utils/api/foodlogs.ts
// ============================================================

import AuthService from '../auth'
import { parseBackendDateString, formatDateForBackend } from '../date'

/* ======================= Types ======================= */

export interface FoodLog {
  foodlog_id: number
  recorded_on: Date | null
  breakfast: string | null
  lunch: string | null
  dinner: string | null
  notes: string | null
  total_calories: number
}

export interface FoodLogListResult {
  foodlogs: FoodLog[]
  totalCount: number
  totalPages: number
  currentPage: number
}

export interface FoodLogCreateInput {
  recorded_on?: Date | null
  breakfast?: string | null
  lunch?: string | null
  dinner?: string | null
  notes?: string | null
  total_calories?: number
}

export interface FoodLogUpdateInput {
  recorded_on?: Date | null
  breakfast?: string | null
  lunch?: string | null
  dinner?: string | null
  notes?: string | null
  total_calories?: number
}

/* ======================= Helpers ======================= */

function buildUrl(userId: number): string {
  return `/api/user/${userId}/food-logs`
}

function fromBackend(raw: any): FoodLog {
  return {
    foodlog_id: raw.foodlog_id,
    recorded_on: parseBackendDateString(raw.recorded_on),
    breakfast: raw.breakfast ?? null,
    lunch: raw.lunch ?? null,
    dinner: raw.dinner ?? null,
    notes: raw.notes ?? null,
    total_calories: Number(raw.total_calories ?? 0),
  }
}

/* ======================= API Calls ======================= */

export async function listFoodLogs(
  userId: number,
  page = 1,
  perPage = 20
): Promise<FoodLogListResult> {
  const response = await AuthService.authenticatedFetch(
    `${buildUrl(userId)}?page=${page}&per_page=${perPage}`
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch food logs')
  }

  return {
    foodlogs: (data.foodlogs ?? []).map(fromBackend),
    totalCount: data.total_num_of_foodlogs ?? 0,
    totalPages: data.total_pages ?? 0,
    currentPage: data.current_page ?? page,
  }
}

export async function createFoodLog(
  userId: number,
  payload: FoodLogCreateInput
): Promise<void> {
  const response = await AuthService.authenticatedFetch(buildUrl(userId), {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      recorded_on: payload.recorded_on
        ? formatDateForBackend(payload.recorded_on)
        : undefined,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create food log')
  }
}

export async function updateFoodLog(
  userId: number,
  foodlogId: number,
  payload: FoodLogUpdateInput
): Promise<void> {
  const body: any = { ...payload }

  if (payload.recorded_on !== undefined) {
    body.recorded_on = payload.recorded_on
      ? formatDateForBackend(payload.recorded_on)
      : null
  }

  const response = await AuthService.authenticatedFetch(
    `${buildUrl(userId)}/${foodlogId}/edit`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to update food log')
  }
}

export async function deleteFoodLog(
  userId: number,
  foodlogId: number
): Promise<void> {
  const response = await AuthService.authenticatedFetch(
    `${buildUrl(userId)}/${foodlogId}/delete`,
    { method: 'DELETE' }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete food log')
  }
}
