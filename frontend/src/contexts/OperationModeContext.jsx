import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { DEMO_LABEL, HARDWARE_ABSENCE_MESSAGE, operationConfig, runtimeConfig } from '@/config'

const OperationModeContext = createContext(null)

const INITIAL_HARDWARE = {
  total: 0,
  validated: 0,
  lastReadingAt: null,
  devices: [],
}

const INITIAL_CONNECTION = {
  kind: 'demo',
  isDemo: true,
  apiReachable: false,
  checkedAt: null,
  message: 'Runtime demonstrativo local ativo.',
}

/**
 * Central authority for "demo" versus "hardware operation".
 * Components never infer the mode on their own.
 */
export function OperationModeProvider({ children }) {
  const [requestedMode, setRequestedMode] = useState(runtimeConfig.operationMode)
  const [hardware, setHardware] = useState(INITIAL_HARDWARE)
  const [connection, setConnection] = useState(INITIAL_CONNECTION)

  const reportHardware = useCallback((summary) => {
    setHardware((current) => ({ ...current, ...summary }))
  }, [])

  const reportConnection = useCallback((summary) => {
    setConnection((current) => ({ ...current, ...summary }))
  }, [])

  const hasValidatedHardware = hardware.validated > 0
  const apiConnected = connection.kind === 'api' && !connection.isDemo
  const hardwareAvailable = hasValidatedHardware && apiConnected
  const activeMode = requestedMode === 'hardware' && hardwareAvailable ? 'hardware' : 'demo'

  const requestMode = useCallback(
    (mode) => {
      if (mode === 'hardware') {
        if (!hasValidatedHardware) {
          return {
            ok: false,
            message: HARDWARE_ABSENCE_MESSAGE,
          }
        }
        if (!apiConnected) {
          return {
            ok: false,
            message: 'A API de operação não está disponível. O modo hardware exige ingestão validada via backend.',
          }
        }
      }
      setRequestedMode(mode)
      return {
        ok: true,
        message:
          mode === 'demo'
            ? 'Modo demonstração selecionado. Todas as leituras simuladas permanecem identificadas.'
            : 'Modo hardware selecionado.',
      }
    },
    [apiConnected, hasValidatedHardware],
  )

  const value = useMemo(
    () => ({
      mode: activeMode,
      requestedMode,
      requestMode,
      hasValidatedHardware,
      hardwareAvailable,
      hardware,
      connection,
      reportHardware,
      reportConnection,
      showDemoBanner: activeMode === 'demo' || !hasValidatedHardware,
      demoLabel: DEMO_LABEL,
      hardwareAbsenceMessage: HARDWARE_ABSENCE_MESSAGE,
      readingMaxAgeSeconds: operationConfig.readingMaxAgeSeconds,
      maxMode: operationConfig.defaultMode,
    }),
    [
      activeMode,
      apiConnected,
      connection,
      hardware,
      hasValidatedHardware,
      hardwareAvailable,
      reportConnection,
      reportHardware,
      requestMode,
      requestedMode,
    ],
  )

  return <OperationModeContext.Provider value={value}>{children}</OperationModeContext.Provider>
}

export function useOperationMode() {
  const context = useContext(OperationModeContext)
  if (!context) throw new Error('useOperationMode deve ser usado dentro de OperationModeProvider.')
  return context
}
