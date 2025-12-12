// frontend/src/hooks/useFoodlogs.ts
//==========================================================

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import {
  listFoodLogs,
  createFoodLog as apiCreateFoodLog,
  updateFoodLog as apiUpdateFoodLog,
  deleteFoodLog as apiDeleteFoodLog,
  type FoodLog,
  type FoodLogCreateInput,
  type FoodLogUpdateInput,
} from '../utils/api/foodlogs'

interface UseFoodLogsReturn {
  foodlogs: FoodLog[]
  loading: boolean
  error: string | null
  page: number
  totalPages: number
  totalCount: number
  setPage: (page: number) => void
  refresh: () => Promise<void>
  createFoodLog: (input: FoodLogCreateInput) => Promise<void>
  updateFoodLog: (foodlogId: number, input: FoodLogUpdateInput) => Promise<void>
  deleteFoodLog: (foodlogId: number) => Promise<void>
}

export function useFoodlogs(): UseFoodLogsReturn {
  const { user, loading: authLoading, isAuthenticated } = useAuth()

  const [foodlogs, setFoodLogs] = useState<FoodLog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [perPage] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  const loadFoodLogs = useCallback(async () => {
    if (!user || !isAuthenticated) return

    setLoading(true)
    setError(null)

    try {
      const result = await listFoodLogs(user.id, page, perPage)
      setFoodLogs(result.foodlogs)
      setTotalPages(result.totalPages)
      setTotalCount(result.totalCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load food logs')
    } finally {
      setLoading(false)
    }
  }, [user, isAuthenticated, page, perPage])

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      void loadFoodLogs()
    }
  }, [authLoading, isAuthenticated, user, loadFoodLogs])

  const refresh = async () => {
    await loadFoodLogs()
  }

  const createFoodLog = async (input: FoodLogCreateInput) => {
    if (!user) return
    setError(null)

    try {
      await apiCreateFoodLog(user.id, input)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create food log')
      throw err
    }
  }

  const updateFoodLog = async (
    foodlogId: number,
    input: FoodLogUpdateInput
  ) => {
    if (!user) return
    setError(null)

    try {
      await apiUpdateFoodLog(user.id, foodlogId, input)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update food log')
      throw err
    }
  }

  const deleteFoodLog = async (foodlogId: number) => {
    if (!user) return
    setError(null)

    try {
      await apiDeleteFoodLog(user.id, foodlogId)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete food log')
      throw err
    }
  }

  return {
    foodlogs,
    loading,
    error,
    page,
    totalPages,
    totalCount,
    setPage,
    refresh,
    createFoodLog,
    updateFoodLog,
    deleteFoodLog,
  }
}




