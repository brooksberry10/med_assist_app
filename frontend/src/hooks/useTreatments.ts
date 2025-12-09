// frontend/src/hooks/useTreatments.ts

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import {
  listTreatments,
  createTreatment as apiCreateTreatment,
  updateTreatment as apiUpdateTreatment,
  deleteTreatment as apiDeleteTreatment,
  type Treatment,
  type TreatmentCreateInput,
  type TreatmentUpdateInput,
} from '../utils/api/treatments'

interface UseTreatmentsReturn {
  treatments: Treatment[]
  loading: boolean
  error: string | null
  page: number
  totalPages: number
  totalCount: number
  setPage: (page: number) => void
  refresh: () => Promise<void>
  createTreatment: (input: TreatmentCreateInput) => Promise<void>
  updateTreatment: (
    treatmentId: number,
    input: TreatmentUpdateInput
  ) => Promise<void>
  deleteTreatment: (treatmentId: number) => Promise<void>
}

export function useTreatments(): UseTreatmentsReturn {
  const { user, loading: authLoading, isAuthenticated } = useAuth()

  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState<number>(1)
  const [perPage] = useState<number>(20)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [totalCount, setTotalCount] = useState<number>(0)

  const loadTreatments = useCallback(async () => {
    if (!user || !isAuthenticated) return

    setLoading(true)
    setError(null)

    try {
      const result = await listTreatments(user.id, page, perPage)
      setTreatments(result.treatments)
      setTotalPages(result.totalPages)
      setTotalCount(result.totalCount)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load treatments'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [user, isAuthenticated, page, perPage])

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      void loadTreatments()
    }
  }, [authLoading, isAuthenticated, user, loadTreatments])

  const refresh = async () => {
    await loadTreatments()
  }

  const createTreatment = async (input: TreatmentCreateInput) => {
    if (!user) return
    setError(null)

    try {
      await apiCreateTreatment(user.id, input)
      await refresh()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create treatment'
      setError(message)
      throw err
    }
  }

  const updateTreatment = async (
    treatmentId: number,
    input: TreatmentUpdateInput
  ) => {
    if (!user) return
    setError(null)

    try {
      await apiUpdateTreatment(user.id, treatmentId, input)
      await refresh()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update treatment'
      setError(message)
      throw err
    }
  }

  const deleteTreatment = async (treatmentId: number) => {
    if (!user) return
    setError(null)

    try {
      await apiDeleteTreatment(user.id, treatmentId)
      await refresh()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete treatment'
      setError(message)
      throw err
    }
  }

  return {
    treatments,
    loading,
    error,
    page,
    totalPages,
    totalCount,
    setPage,
    refresh,
    createTreatment,
    updateTreatment,
    deleteTreatment,
  }
}
