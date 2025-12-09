// frontend/src/utils/api/treatments.ts

import AuthService from '../auth'
import { parseBackendDateString, formatDateForBackend } from '../date'

export interface Treatment {
  treatment_id: number
  treatment_name: string
  scheduled_on: Date | null
  notes: string
  is_completed: boolean
}

export interface TreatmentListResult {
  treatments: Treatment[]
  totalCount: number
  totalPages: number
  currentPage: number
}

export interface TreatmentCreateInput {
  treatment_name: string
  scheduled_on: Date | null
  notes: string
  is_completed: boolean
}

export interface TreatmentUpdateInput {
  treatment_name?: string
  scheduled_on?: Date | null
  notes?: string
  is_completed?: boolean
}

function buildUrl(userId: number): string {
  return `/api/user/${userId}/treatments`
}

function fromBackend(raw: any): Treatment {
  return {
    treatment_id: raw.treatment_id,
    treatment_name: raw.treatment_name,
    scheduled_on: parseBackendDateString(raw.scheduled_on),
    notes: raw.notes ?? '',
    is_completed: Boolean(raw.is_completed),
  }
}

export async function listTreatments(
  userId: number,
  page = 1,
  perPage = 20
): Promise<TreatmentListResult> {
  const response = await AuthService.authenticatedFetch(
    `${buildUrl(userId)}?page=${page}&per_page=${perPage}`
  )
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch treatments')
  }

  const items: Treatment[] = (data.treatments ?? []).map(fromBackend)

  return {
    treatments: items,
    totalCount: data.total_num_of_treatments ?? 0,
    totalPages: data.total_pages ?? 0,
    currentPage: data.current_page ?? page,
  }
}

export async function getTreatment(
  userId: number,
  treatmentId: number
): Promise<Treatment> {
  const response = await AuthService.authenticatedFetch(
    `${buildUrl(userId)}/${treatmentId}`
  )
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch treatment')
  }

  return fromBackend(data.treatment)
}

export async function createTreatment(
  userId: number,
  payload: TreatmentCreateInput
): Promise<void> {
  const response = await AuthService.authenticatedFetch(buildUrl(userId), {
    method: 'POST',
    body: JSON.stringify({
      treatment_name: payload.treatment_name,
      scheduled_on: formatDateForBackend(payload.scheduled_on),
      notes: payload.notes,
      is_completed: payload.is_completed,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create treatment')
  }
}

export async function updateTreatment(
  userId: number,
  treatmentId: number,
  payload: TreatmentUpdateInput
): Promise<void> {
  const body: any = {}

  if (payload.treatment_name !== undefined) {
    body.treatment_name = payload.treatment_name
  }
  if (payload.scheduled_on !== undefined) {
    body.scheduled_on = formatDateForBackend(payload.scheduled_on)
  }
  if (payload.notes !== undefined) {
    body.notes = payload.notes
  }
  if (payload.is_completed !== undefined) {
    body.is_completed = payload.is_completed
  }

  const response = await AuthService.authenticatedFetch(
    `${buildUrl(userId)}/${treatmentId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to update treatment')
  }
}

export async function deleteTreatment(
  userId: number,
  treatmentId: number
): Promise<void> {
  const response = await AuthService.authenticatedFetch(
    `${buildUrl(userId)}/${treatmentId}`,
    {
      method: 'DELETE',
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete treatment')
  }
}
