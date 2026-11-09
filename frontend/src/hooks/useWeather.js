import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchWeather } from '@/services/weatherService'

export function useWeather() {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
    fromCache: false,
  })
  const requestRef = useRef(0)

  const load = useCallback(async ({ force = false } = {}) => {
    const requestId = ++requestRef.current
    setState((current) => ({ ...current, loading: true, error: null }))
    try {
      const result = await fetchWeather({ force })
      if (requestRef.current !== requestId) return
      setState({
        data: result.data,
        loading: false,
        error: result.error ?? null,
        fromCache: result.fromCache,
      })
    } catch (error) {
      if (requestRef.current !== requestId) return
      setState((current) => ({
        ...current,
        loading: false,
        error: error?.message ?? 'Falha ao consultar a meteorologia.',
      }))
    }
  }, [])

  useEffect(() => {
    load()
    return () => {
      requestRef.current += 1
    }
  }, [load])

  return {
    ...state,
    refresh: () => load({ force: true }),
    reload: load,
  }
}
