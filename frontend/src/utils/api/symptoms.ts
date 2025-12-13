// frontend/src/utils/api/symptoms.ts


import AuthService from '../auth'
import { parseBackendDateString, formatDateForBackend } from '../date'

/* ======================= Types ======================= */

export interface Symptom {
  symptoms_id: number
  recorded_on: Date | null
  severity: number
  type_of_symptom: string
  weight_lbs: number | null
  notes: string
}

export interface SymptomListResult {
  symptoms: Symptom[]
  totalCount: number
  totalPages: number
  currentPage: number
}

export interface SymptomCreateInput {
  recorded_on?: Date | null
  severity: number
  type_of_symptom: string
  weight_lbs?: number | null
  notes?: string
}

export interface SymptomUpdateInput {
  recorded_on?: Date | null
  severity?: number
  type_of_symptom?: string
  weight_lbs?: number | null
  notes?: string
}

/* ======================= Helpers ======================= */

function buildBase(userId: number): string {
  return `/api/user/${userId}`
}

function fromBackend(raw: any): Symptom {
  return {
    symptoms_id: raw.symptoms_id,
    recorded_on: parseBackendDateString(raw.recorded_on),
    severity: Number(raw.severity ?? 0),
    type_of_symptom: raw.type_of_symptom ?? '',
    weight_lbs:
      raw.weight_lbs === null || raw.weight_lbs === undefined
        ? null
        : Number(raw.weight_lbs),
    notes: raw.notes ?? '',
  }
}

/* ======================= API Calls ======================= */

export async function listSymptoms(
  userId: number,
  page = 1,
  perPage = 20
): Promise<SymptomListResult> {
  const response = await AuthService.authenticatedFetch(
    `${buildBase(userId)}/my-symptoms?page=${page}&per_page=${perPage}`
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch symptoms')
  }

  return {
    symptoms: (data.symptoms ?? []).map(fromBackend),
    totalCount: data.total_num_of_symptoms ?? 0,
    totalPages: data.total_pages ?? 0,
    currentPage: data.current_page ?? page,
  }
}

export async function createSymptom(
  userId: number,
  payload: SymptomCreateInput
): Promise<void> {
  const response = await AuthService.authenticatedFetch(
    `${buildBase(userId)}/symptom/add`,
    {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        recorded_on: payload.recorded_on
          ? formatDateForBackend(payload.recorded_on)
          : undefined,
      }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create symptom')
  }
}

export async function updateSymptom(
  userId: number,
  symptomId: number,
  payload: SymptomUpdateInput
): Promise<void> {
  const body: any = { ...payload }

  if (payload.recorded_on !== undefined) {
    body.recorded_on = payload.recorded_on
      ? formatDateForBackend(payload.recorded_on)
      : null
  }

  const response = await AuthService.authenticatedFetch(
    `${buildBase(userId)}/symptom/${symptomId}/edit`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to update symptom')
  }
}

export async function deleteSymptom(
  userId: number,
  symptomId: number
): Promise<void> {
  const response = await AuthService.authenticatedFetch(
    `${buildBase(userId)}/symptom/${symptomId}/delete`,
    { method: 'DELETE' }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete symptom')
  }
}
