import { describe, expect, it } from 'vitest'
import { appConfig } from '@/config'
import { demoSensors } from '@/data/sensors'
import { evaluateAlerts } from '@/domain/alertEngine'

const sensor = demoSensors[0]
const now = new Date('2026-11-09T12:00:00Z')

function reading(overrides = {}) {
  return {
    device_id: sensor.deviceId,
    sensor_id: sensor.id,
    timestamp: now.toISOString(),
    distance_cm: 40,
    water_level_cm: 80,
    source: 'simulation',
    quality: 'valid',
    status: 'simulation_active',
    metadata: { simulated: true, rate_cm_per_min: 0.2 },
    ...overrides,
  }
}

function evaluate(overrides = {}, existing = []) {
  return evaluateAlerts({
    sensors: [{ ...sensor, status: 'simulation_active' }],
    readingsBySensor: { [sensor.id]: reading(overrides) },
    alerts: existing,
    config: appConfig,
    now,
  })
}

describe('alert engine', () => {
  it('creates a critical water-level alert tagged as simulated', () => {
    const result = evaluate()
    const alert = result.alerts.find((item) => item.type === 'water_level')
    expect(alert).toBeDefined()
    expect(alert.severity).toBe('critical')
    expect(alert.simulated).toBe(true)
    expect(alert.source).toBe('simulation')
    expect(alert.title).toContain('simulado')
    expect(alert.timeline[0].kind).toBe('opened')
  })

  it('applies hysteresis when the level oscillates near a threshold', () => {
    const critical = evaluate()
    const later = evaluate({ water_level_cm: 72, distance_cm: 48 }, critical.alerts)
    const held = later.alerts.find((item) => item.type === 'water_level' && item.status !== 'resolved')
    expect(held.severity).toBe('critical')

    const dropped = evaluate({ water_level_cm: 60, distance_cm: 60 }, later.alerts)
    const reduced = dropped.alerts.find((item) => item.type === 'water_level' && item.status !== 'resolved')
    expect(reduced.severity).toBe('alert')
  })

  it('resolves the alert automatically after normalisation', () => {
    const high = evaluate()
    const normal = evaluate({ water_level_cm: 8, distance_cm: 112 }, high.alerts)
    const active = normal.alerts.filter((item) => item.type === 'water_level' && item.status !== 'resolved')
    expect(active).toHaveLength(0)
    expect(normal.resolved.some((item) => item.type === 'water_level')).toBe(true)
  })

  it('separates communication and invalid-reading alerts', () => {
    const offline = evaluate({ status: 'fault_offline', quality: 'missing', water_level_cm: null, distance_cm: null })
    expect(offline.alerts.some((item) => item.type === 'communication')).toBe(true)

    const invalid = evaluate({ status: 'fault_invalid', quality: 'invalid', water_level_cm: null, distance_cm: -7 })
    expect(invalid.alerts.some((item) => item.type === 'invalid_reading')).toBe(true)
    expect(invalid.alerts.some((item) => item.type === 'water_level')).toBe(false)
  })

  it('does not raise a false communication alert for an unvalidated hardware device with no reading', () => {
    const hardware = demoSensors.find((item) => item.source === 'hardware')
    const result = evaluateAlerts({
      sensors: [hardware],
      readingsBySensor: {},
      alerts: [],
      config: appConfig,
      now,
    })
    expect(result.alerts).toHaveLength(0)
  })
})
