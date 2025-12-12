// frontend/src/hooks/useSymptoms.ts

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import {
  listSymptoms,
  createSymptom as apiCreateSymptom,
  updateSymptom as apiUpdateSymptom,
  deleteSymptom as apiDeleteSymptom,
  type Symptom,
  type SymptomCreateInput,
  type SymptomUpdateInput,
} from '../utils/api/symptoms'

interface UseSymptomsReturn {
  symptoms: Symptom[]
  loading: boolean
  error: string | null
  page: number
  totalPages: number
  totalCount: number
  setPage: (page: number) => void
  refresh: () => Promise<void>
  createSymptom: (input: SymptomCreateInput) => Promise<void>
  updateSymptom: (symptomId: number, input: SymptomUpdateInput) => Promise<void>
  deleteSymptom: (symptomId: number) => Promise<void>
}

export function useSymptoms(): UseSymptomsReturn {
  const { user, loading: authLoading, isAuthenticated } = useAuth()

  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [perPage] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  const loadSymptoms = useCallback(async () => {
    if (!user || !isAuthenticated) return

    setLoading(true)
    setError(null)

    try {
      const result = await listSymptoms(user.id, page, perPage)
      setSymptoms(result.symptoms)
      setTotalPages(result.totalPages)
      setTotalCount(result.totalCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load symptoms')
    } finally {
      setLoading(false)
    }
  }, [user, isAuthenticated, page, perPage])

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      void loadSymptoms()
    }
  }, [authLoading, isAuthenticated, user, loadSymptoms])

  const refresh = async () => {
    await loadSymptoms()
  }

  const createSymptom = async (input: SymptomCreateInput) => {
    if (!user) return
    setError(null)

    try {
      await apiCreateSymptom(user.id, input)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create symptom')
      throw err
    }
  }

  const updateSymptom = async (symptomId: number, input: SymptomUpdateInput) => {
    if (!user) return
    setError(null)

    try {
      await apiUpdateSymptom(user.id, symptomId, input)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update symptom')
      throw err
    }
  }

  const deleteSymptom = async (symptomId: number) => {
    if (!user) return
    setError(null)

    try {
      await apiDeleteSymptom(user.id, symptomId)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete symptom')
      throw err
    }
  }

  return {
    symptoms,
    loading,
    error,
    page,
    totalPages,
    totalCount,
    setPage,
    refresh,
    createSymptom,
    updateSymptom,
    deleteSymptom,
  }
}
