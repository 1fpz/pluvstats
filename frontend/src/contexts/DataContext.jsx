import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { dataSource, dataSourceInfo, initializeDataSource } from '@/services/dataSource'
import { ValidationError } from '@/services/demoRepository'
import { useToast } from './ToastContext'
import { useOperationMode } from './OperationModeContext'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [snapshot, setSnapshot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { showToast } = useToast()
  const { reportHardware, reportConnection } = useOperationMode()

  useEffect(() => {
    let mounted = true
    const unsubscribe = dataSource.subscribe((next) => {
      if (mounted) setSnapshot(next)
    })

    initializeDataSource()
      .then((initial) => {
        if (!mounted) return
        setSnapshot(initial)
        setLoading(false)
      })
      .catch((err) => {
        if (!mounted) return
        setError(err?.message ?? 'Falha ao inicializar a fonte de dados.')
        setLoading(false)
      })

    return () => {
      mounted = false
      unsubscribe?.()
    }
  }, [])

  useEffect(() => {
    if (!snapshot) return
    const hardwareSensors = snapshot.sensors.filter((sensor) => sensor.source === 'hardware')
    const validatedSensors = hardwareSensors.filter((sensor) => sensor.validated)
    const lastReadingAt = hardwareSensors
      .map((sensor) => sensor.lastReadingAt)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null

    reportHardware({
      total: hardwareSensors.length,
      validated: validatedSensors.length,
      lastReadingAt,
      devices: hardwareSensors.map((sensor) => ({
        id: sensor.id,
        deviceId: sensor.deviceId,
        status: sensor.status,
        validated: sensor.validated,
        lastReadingAt: sensor.lastReadingAt,
        readingAgeSeconds: sensor.readingAgeSeconds,
      })),
    })

    reportConnection({
      kind: snapshot.sourceKind,
      isDemo: snapshot.isDemo,
      apiReachable: snapshot.sourceKind === 'api',
      checkedAt: snapshot.updatedAt,
      message:
        snapshot.sourceKind === 'api'
          ? 'API PLUVSTATS conectada.'
          : dataSourceInfo.description,
    })
  }, [snapshot, reportHardware, reportConnection])

  const handleFailure = useCallback(
    (err) => {
      if (!(err instanceof ValidationError)) {
        showToast({
          variant: 'error',
          title: 'Não foi possível concluir a operação',
          description: err?.message ?? 'Erro inesperado.',
        })
      }
      throw err
    },
    [showToast],
  )

  const createOccurrence = useCallback(
    async (form) => {
      try {
        const record = await dataSource.createOccurrence(form)
        showToast({ variant: 'success', title: 'Ocorrência registrada', description: record.id })
        return record
      } catch (err) {
        return handleFailure(err)
      }
    },
    [handleFailure, showToast],
  )

  const updateOccurrence = useCallback(
    async (id, form) => {
      try {
        const record = await dataSource.updateOccurrence(id, form)
        showToast({ variant: 'success', title: 'Ocorrência atualizada', description: record.id })
        return record
      } catch (err) {
        return handleFailure(err)
      }
    },
    [handleFailure, showToast],
  )

  const deleteOccurrence = useCallback(
    async (id) => {
      try {
        const result = await dataSource.deleteOccurrence(id)
        showToast({ variant: 'success', title: 'Ocorrência excluída', description: id })
        return result
      } catch (err) {
        return handleFailure(err)
      }
    },
    [handleFailure, showToast],
  )

  const createIntervention = useCallback(
    async (form) => {
      try {
        const record = await dataSource.createIntervention(form)
        showToast({ variant: 'success', title: 'Intervenção registrada', description: record.id })
        return record
      } catch (err) {
        return handleFailure(err)
      }
    },
    [handleFailure, showToast],
  )

  const updateIntervention = useCallback(
    async (id, form) => {
      try {
        const record = await dataSource.updateIntervention(id, form)
        showToast({ variant: 'success', title: 'Intervenção atualizada', description: record.id })
        return record
      } catch (err) {
        return handleFailure(err)
      }
    },
    [handleFailure, showToast],
  )

  const acknowledgeAlert = useCallback(
    async (id) => {
      try {
        const record = await dataSource.acknowledgeAlert(id)
        showToast({ variant: 'success', title: 'Alerta reconhecido', description: record.title })
        return record
      } catch (err) {
        return handleFailure(err)
      }
    },
    [handleFailure, showToast],
  )

  const resolveAlert = useCallback(
    async (id) => {
      try {
        const record = await dataSource.resolveAlert(id)
        showToast({ variant: 'success', title: 'Alerta resolvido', description: record.title })
        return record
      } catch (err) {
        return handleFailure(err)
      }
    },
    [handleFailure, showToast],
  )

  const resetDemo = useCallback(async () => {
    try {
      const next = await dataSource.resetDemo()
      showToast({
        variant: 'info',
        title: 'Demonstração reiniciada',
        description: 'Séries, ocorrências, intervenções e alertas voltaram ao estado inicial.',
      })
      return next
    } catch (err) {
      return handleFailure(err)
    }
  }, [handleFailure, showToast])

  const actions = useMemo(
    () => ({
      createOccurrence,
      updateOccurrence,
      deleteOccurrence,
      createIntervention,
      updateIntervention,
      acknowledgeAlert,
      resolveAlert,
      resetDemo,
    }),
    [
      acknowledgeAlert,
      createIntervention,
      createOccurrence,
      deleteOccurrence,
      resetDemo,
      resolveAlert,
      updateIntervention,
      updateOccurrence,
    ],
  )

  const value = useMemo(
    () => ({
      snapshot,
      loading,
      error,
      actions,
      sourceInfo: dataSourceInfo,
      isDemo: snapshot?.isDemo ?? true,
    }),
    [actions, error, loading, snapshot],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData deve ser usado dentro de DataProvider.')
  return context
}
