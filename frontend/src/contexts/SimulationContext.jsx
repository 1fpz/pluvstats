import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { dataSource } from '@/services/dataSource'
import { scenarioDefinitions, simulationConfig } from '@/config'
import { useData } from './DataContext'
import { useToast } from './ToastContext'

const SimulationContext = createContext(null)

export function SimulationProvider({ children }) {
  const { snapshot, loading } = useData()
  const { showToast } = useToast()
  const [busy, setBusy] = useState(false)

  const simulation = snapshot?.simulation ?? null
  const isRunning = Boolean(simulation?.running)
  const scenario = simulation?.scenario ?? 'normal'
  const intervalMs = simulationConfig.tickSeconds * 1000

  useEffect(() => {
    if (!isRunning) return undefined
    const interval = window.setInterval(() => {
      dataSource.tickSimulation().catch(() => {
        // A transient tick failure is surfaced by the next data snapshot.
      })
    }, intervalMs)
    return () => window.clearInterval(interval)
  }, [intervalMs, isRunning])

  const sendCommand = useCallback(
    async (command, toast) => {
      setBusy(true)
      try {
        await dataSource.controlSimulation(command)
        if (toast) showToast({ variant: 'info', ...toast })
      } catch (err) {
        showToast({
          variant: 'error',
          title: 'Controle não aplicado',
          description: err?.message ?? 'Falha ao controlar o simulador.',
        })
      } finally {
        setBusy(false)
      }
    },
    [showToast],
  )

  const controls = useMemo(
    () => ({
      start: () =>
        sendCommand({ action: 'start' }, { title: 'Simulação iniciada', description: 'Novos ciclos de leitura serão gerados.' }),
      pause: () =>
        sendCommand({ action: 'pause' }, { title: 'Simulação pausada', description: 'As leituras permanecem identificadas como simuladas.' }),
      reset: () =>
        sendCommand({ action: 'reset' }, { title: 'Simulação reiniciada', description: 'Cenário normal e séries recriadas.' }),
      tickNow: () => dataSource.tickSimulation(),
      setScenario: (key) =>
        sendCommand(
          { action: 'set_scenario', scenario: key },
          {
            title: `Cenário ${scenarioDefinitions[key]?.label ?? key}`,
            description: scenarioDefinitions[key]?.description,
          },
        ),
      raiseWater: (sensorId, amountCm = 7) =>
        sendCommand({ action: 'raise', sensorId, amountCm }, { title: 'Nível elevado', description: 'Ajuste manual aplicado ao cenário simulado.' }),
      lowerWater: (sensorId, amountCm = 7) =>
        sendCommand({ action: 'lower', sensorId, amountCm }, { title: 'Nível reduzido', description: 'Ajuste manual aplicado ao cenário simulado.' }),
      drain: (sensorId, amountCm = 12) =>
        sendCommand({ action: 'drain', sensorId, amountCm }, { title: 'Drenagem simulada', description: 'Nível reduzido como se a drenagem tivesse sido acionada.' }),
      injectFault: (sensorId, fault = 'offline') =>
        sendCommand(
          { action: 'inject_fault', sensorId, fault },
          {
            title: fault === 'offline' ? 'Falha de comunicação simulada' : 'Leitura inválida simulada',
            description: 'O alerta correspondente será identificado como simulado.',
          },
        ),
      recoverSensor: (sensorId) =>
        sendCommand({ action: 'recover', sensorId }, { title: 'Dispositivo recuperado', description: 'A simulação voltou a gerar leituras válidas.' }),
    }),
    [sendCommand],
  )

  const value = useMemo(
    () => ({
      simulation,
      loading,
      isRunning,
      scenario,
      scenarioMeta: scenarioDefinitions[scenario] ?? scenarioDefinitions.normal,
      scenarios: scenarioDefinitions,
      controls,
      busy,
      tickSeconds: simulationConfig.tickSeconds,
      simulatedSensors: simulation?.simulatedSensors ?? 0,
      elapsedSeconds: simulation?.elapsedSeconds ?? 0,
      lastTickAt: simulation?.lastTickAt ?? null,
      hydrologyNote: simulation?.hydrologyNote,
    }),
    [busy, controls, isRunning, loading, scenario, simulation],
  )

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>
}

export function useSimulation() {
  const context = useContext(SimulationContext)
  if (!context) throw new Error('useSimulation deve ser usado dentro de SimulationProvider.')
  return context
}
