import { describe, expect, it } from 'vitest'
import { appConfig } from '@/config'
import { demoSensors } from '@/data/sensors'
import {
  applySimulationCommand,
  createSimulationState,
  deriveSensorView,
  tickSimulation,
} from '@/domain/simulationEngine'

const sensors = demoSensors

describe('simulation engine', () => {
  it('creates runtime only for simulated sensors', () => {
    const state = createSimulationState(sensors, appConfig, { now: new Date('2026-11-09T12:00:00Z') })
    expect(Object.keys(state.sensors)).toHaveLength(4)
    expect(state.sensors['PS-05']).toBeUndefined()
    expect(state.running).toBe(true)
    expect(state.sensors['PS-01'].history.length).toBeGreaterThan(10)
  })

  it('generates valid, provenance-tagged readings on a tick', () => {
    const now = new Date('2026-11-09T12:00:00Z')
    const state = createSimulationState(sensors, appConfig, { now })
    const result = tickSimulation(state, sensors, appConfig, { now })
    expect(result.readings).toHaveLength(4)
    result.readings.forEach((reading) => {
      expect(reading.source).toBe('simulation')
      expect(reading.quality).toBe('valid')
      expect(reading.metadata.simulated).toBe(true)
      expect(reading.water_level_cm).toBeGreaterThanOrEqual(0)
      expect(reading.distance_cm).toBeGreaterThan(0)
    })
  })

  it('raises the level with a manual command and marks a fault', () => {
    const now = new Date('2026-11-09T12:00:00Z')
    let state = createSimulationState(sensors, appConfig, { now })
    const before = state.sensors['PS-01'].levelCm
    state = applySimulationCommand(state, { action: 'raise', amountCm: 10 }, sensors, appConfig, { now })
    expect(state.sensors['PS-01'].levelCm).toBeGreaterThan(before)

    state = applySimulationCommand(state, { action: 'inject_fault', sensorId: 'PS-02', fault: 'offline' }, sensors, appConfig, { now })
    const view = deriveSensorView(sensors.find((sensor) => sensor.id === 'PS-02'), state, { now })
    expect(view.status).toBe('fault_offline')
    expect(view.validated).toBe(false)
    expect(view.connectivityProof).toContain('simulador')
  })

  it('moves level toward the selected scenario target', () => {
    const now = new Date('2026-11-09T12:00:00Z')
    let state = createSimulationState(sensors, appConfig, { now, scenario: 'attention' })
    const sensor = sensors.find((item) => item.id === 'PS-01')
    const initial = state.sensors['PS-01'].levelCm
    for (let index = 0; index < 30; index += 1) {
      state = tickSimulation(state, sensors, appConfig, { now: new Date(now.getTime() + index * 5000) }).state
    }
    expect(state.sensors['PS-01'].levelCm).toBeGreaterThan(initial)
    expect(state.sensors['PS-01'].levelCm).toBeLessThanOrEqual(appConfig.sensorGeometry.channelDepthCm)
    const view = deriveSensorView(sensor, state, { now })
    expect(view.source).toBe('simulation')
  })

  it('does not advance time while paused', () => {
    const now = new Date('2026-11-09T12:00:00Z')
    let state = createSimulationState(sensors, appConfig, { now })
    state = applySimulationCommand(state, { action: 'pause' }, sensors, appConfig, { now })
    const result = tickSimulation(state, sensors, appConfig, { now })
    expect(result.state.elapsedSeconds).toBe(state.elapsedSeconds)
    expect(result.readings.every((reading) => reading.status === 'simulation_paused')).toBe(true)
  })
})
