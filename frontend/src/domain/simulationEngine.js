import { sensorGeometry, thresholds } from '@/config'

export const SIMULATION_VERSION = 2

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function hashUnit(seed) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return value - Math.floor(value)
}

function isoAt(now, offsetSeconds) {
  return new Date(now.getTime() + offsetSeconds * 1000).toISOString()
}

function createHistory(sensor, levelCm, now, points = 40) {
  const history = []
  for (let index = points - 1; index >= 0; index -= 1) {
    const offset = -index * 60
    const wave = Math.sin((points - index + sensor.phase) / 4.2) * 0.55
    const level = clamp(levelCm + wave, 0, sensorGeometry.channelDepthCm)
    history.push({
      t: isoAt(now, offset),
      levelCm: Number(level.toFixed(2)),
      rateCmPerMin: 0,
    })
  }
  return history
}

export function createSimulationState(sensors, config, { now = new Date(), scenario = 'normal', running = true } = {}) {
  const simulated = sensors.filter((sensor) => sensor.source === 'simulation')
  const runtime = {}

  simulated.forEach((sensor) => {
    const initialLevel = clamp(
      sensor.baselineLevelCm ?? 6,
      0,
      sensorGeometry.channelDepthCm,
    )
    runtime[sensor.id] = {
      levelCm: initialLevel,
      rateCmPerMin: 0,
      status: running ? 'simulation_active' : 'simulation_paused',
      fault: null,
      lastReadingAt: now.toISOString(),
      history: createHistory(sensor, initialLevel, now),
    }
  })

  return {
    version: SIMULATION_VERSION,
    running,
    scenario,
    startedAt: now.toISOString(),
    lastTickAt: now.toISOString(),
    elapsedSeconds: 0,
    tickCount: 0,
    sensors: runtime,
    hydrologyNote:
      'Modelo de cenário: o nível converge para um alvo por sensor, com drenagem e oscilação determinística. Não é hidráulica calibrada.',
  }
}

function buildReading(sensor, runtime, config, now, scenario) {
  const validDistance =
    sensorGeometry.sensorHeightCm - (runtime.levelCm ?? sensorGeometry.dryDistanceCm)
  const scenarioMeta = config.simulation.scenarios[scenario] ?? config.simulation.scenarios.normal
  const isValid = runtime.status !== 'fault_invalid' && runtime.fault !== 'invalid'
  const hasSignal = runtime.fault !== 'offline' && runtime.status !== 'fault_offline'

  const distance = isValid && hasSignal ? Number(validDistance.toFixed(2)) : null
  const level = isValid && hasSignal ? Number((runtime.levelCm ?? 0).toFixed(2)) : null
  const [minDistance, maxDistance] = thresholds.invalidDistanceRangeCm
  const rangeValid = distance !== null && distance >= minDistance && distance <= maxDistance

  return {
    device_id: sensor.deviceId,
    sensor_id: sensor.id,
    timestamp: hasSignal ? runtime.lastReadingAt ?? now.toISOString() : now.toISOString(),
    distance_cm: distance,
    water_level_cm: level,
    source: 'simulation',
    quality: hasSignal ? (isValid && rangeValid ? 'valid' : 'invalid') : 'missing',
    status: runtime.status,
    metadata: {
      scenario,
      simulated: true,
      rain_mm_h: scenarioMeta.rainMmH,
      rate_cm_per_min: Number((runtime.rateCmPerMin ?? 0).toFixed(2)),
      sensor_height_cm: sensorGeometry.sensorHeightCm,
      last_valid_reading_at: hasSignal ? runtime.lastReadingAt : null,
      tick: runtime.tickCount ?? 0,
    },
  }
}

/**
 * Advances the simulation by a fixed tick. The engine is pure relative to its
 * inputs: same state + same time produces the same frame.
 */
export function tickSimulation(state, sensors, config, { now = new Date() } = {}) {
  if (!state) return { state, readings: [] }
  if (!state.running) {
    const readings = sensors
      .filter((sensor) => sensor.source === 'simulation')
      .map((sensor) => {
        const runtime = state.sensors[sensor.id]
        return runtime ? buildReading(sensor, runtime, config, now, state.scenario) : null
      })
      .filter(Boolean)
    return { state, readings }
  }

  const tickSeconds = config.simulation.tickSeconds
  const scenario = config.simulation.scenarios[state.scenario] ?? config.simulation.scenarios.normal
  const elapsed = state.elapsedSeconds + tickSeconds
  const tickCount = state.tickCount + 1
  const nextSensors = {}
  const readings = []

  sensors
    .filter((sensor) => sensor.source === 'simulation')
    .forEach((sensor, index) => {
      const previous = state.sensors[sensor.id]
      if (!previous) return

      const runtime = { ...previous, tickCount }

      if (runtime.fault === 'offline') {
        runtime.status = 'fault_offline'
        nextSensors[sensor.id] = runtime
        readings.push(buildReading(sensor, runtime, config, now, state.scenario))
        return
      }

      if (runtime.fault === 'invalid') {
        runtime.status = 'fault_invalid'
        nextSensors[sensor.id] = runtime
        const reading = buildReading(sensor, runtime, config, now, state.scenario)
        reading.distance_cm = -7
        reading.water_level_cm = null
        reading.quality = 'invalid'
        readings.push(reading)
        return
      }

      const target = scenario.targetLevelCm * (sensor.targetFactor ?? 1)
      const tau = Math.max(45, scenario.approachSeconds / (sensor.responseFactor ?? 1))
      const k = 1 - Math.exp(-tickSeconds / tau)
      const oscillation =
        Math.sin((elapsed + sensor.phase * 10) / 17) * 0.3 +
        Math.sin((elapsed + sensor.phase * 3) / 6.5) * 0.1
      const jitter = (hashUnit(tickCount + index * 17 + sensor.phase * 10) - 0.5) * 0.12
      const delta = (target - runtime.levelCm) * k + oscillation * 0.1 + jitter
      const nextLevel = clamp(runtime.levelCm + delta, 0, sensorGeometry.channelDepthCm * 0.98)
      const instantRate = (nextLevel - runtime.levelCm) / (tickSeconds / 60)
      const smoothedRate = runtime.rateCmPerMin * 0.55 + instantRate * 0.45

      runtime.levelCm = nextLevel
      runtime.rateCmPerMin = clamp(smoothedRate, -25, 25)
      runtime.status = 'simulation_active'
      runtime.lastReadingAt = now.toISOString()
      runtime.tickCount = tickCount
      runtime.history = [
        ...runtime.history.slice(-(config.simulation.seriesPoints - 1)),
        {
          t: now.toISOString(),
          levelCm: Number(nextLevel.toFixed(2)),
          rateCmPerMin: Number(runtime.rateCmPerMin.toFixed(2)),
        },
      ]

      nextSensors[sensor.id] = runtime
      readings.push(buildReading(sensor, runtime, config, now, state.scenario))
    })

  return {
    state: {
      ...state,
      sensors: nextSensors,
      elapsedSeconds: elapsed,
      tickCount,
      lastTickAt: now.toISOString(),
    },
    readings,
  }
}

function touchRuntime(runtime, level, now, rateCmPerMin) {
  const nextLevel = clamp(level, 0, sensorGeometry.channelDepthCm * 0.98)
  return {
    ...runtime,
    levelCm: nextLevel,
    rateCmPerMin,
    status: 'simulation_active',
    lastReadingAt: now.toISOString(),
    history: [
      ...runtime.history.slice(-59),
      { t: now.toISOString(), levelCm: Number(nextLevel.toFixed(2)), rateCmPerMin },
    ],
  }
}

export function applySimulationCommand(state, command, sensors, config, { now = new Date() } = {}) {
  if (!state || !command?.action) return state
  const action = command.action
  const targetId = command.sensorId
  const nextSensors = { ...state.sensors }

  if (action === 'start') {
    return {
      ...state,
      running: true,
      lastTickAt: now.toISOString(),
      sensors: Object.fromEntries(
        Object.entries(nextSensors).map(([id, runtime]) => [
          id,
          { ...runtime, status: runtime.fault ? runtime.status : 'simulation_active' },
        ]),
      ),
    }
  }

  if (action === 'pause') {
    return {
      ...state,
      running: false,
      sensors: Object.fromEntries(
        Object.entries(nextSensors).map(([id, runtime]) => [
          id,
          runtime.fault ? runtime : { ...runtime, status: 'simulation_paused' },
        ]),
      ),
    }
  }

  if (action === 'reset') {
    return createSimulationState(sensors, config, { now, scenario: 'normal', running: true })
  }

  if (action === 'set_scenario') {
    const scenarioKey = config.simulation.scenarios[command.scenario] ? command.scenario : state.scenario
    return { ...state, scenario: scenarioKey, running: state.running }
  }

  if (['raise', 'lower', 'drain', 'set_level'].includes(action)) {
    const amount = Number(command.amountCm ?? 0)
    Object.entries(nextSensors).forEach(([id, runtime]) => {
      if (targetId && id !== targetId) return
      let nextLevel = runtime.levelCm
      let rate = runtime.rateCmPerMin
      if (action === 'raise') {
        nextLevel += amount || 7
        rate = Math.max(rate, 2.4)
      } else if (action === 'lower') {
        nextLevel -= amount || 7
        rate = Math.min(rate, -1.2)
      } else if (action === 'drain') {
        nextLevel -= amount || 12
        rate = -3.4
      } else if (action === 'set_level') {
        nextLevel = amount
        rate = nextLevel > runtime.levelCm ? 2 : -2
      }
      nextSensors[id] = touchRuntime(runtime, nextLevel, now, Number(rate.toFixed(2)))
    })
    return { ...state, sensors: nextSensors, lastTickAt: now.toISOString() }
  }

  if (action === 'inject_fault') {
    const fault = command.fault === 'invalid' ? 'invalid' : 'offline'
    Object.entries(nextSensors).forEach(([id, runtime]) => {
      if (targetId && id !== targetId) return
      nextSensors[id] = {
        ...runtime,
        fault,
        status: fault === 'offline' ? 'fault_offline' : 'fault_invalid',
      }
    })
    return { ...state, sensors: nextSensors, lastTickAt: now.toISOString() }
  }

  if (action === 'recover') {
    Object.entries(nextSensors).forEach(([id, runtime]) => {
      if (targetId && id !== targetId) return
      nextSensors[id] = {
        ...runtime,
        fault: null,
        status: state.running ? 'simulation_active' : 'simulation_paused',
        lastReadingAt: now.toISOString(),
        rateCmPerMin: 0,
      }
    })
    return { ...state, sensors: nextSensors, lastTickAt: now.toISOString() }
  }

  return state
}

/**
 * Produces the read model of a sensor: always states provenance and whether a
 * hardware device has been validated with a recent, well-formed reading.
 */
export function deriveSensorView(sensor, simulation, { now = new Date() } = {}) {
  if (sensor.source === 'hardware') {
    const ageSeconds = sensor.lastReadingAt
      ? Math.max(0, (now.getTime() - new Date(sensor.lastReadingAt).getTime()) / 1000)
      : null
    const ageLimit = thresholds.staleReadingSeconds
    const validated =
      Boolean(sensor.lastReadingAt) &&
      sensor.lastReadingSource === 'hardware' &&
      sensor.lastReadingQuality === 'valid' &&
      ageSeconds !== null &&
      ageSeconds <= ageLimit
    const status = validated
      ? 'hardware_validated'
      : sensor.lastReadingAt
        ? 'hardware_stale'
        : 'hardware_unvalidated'
    return {
      ...sensor,
      levelCm: sensor.lastReadingLevelCm ?? null,
      rateCmPerMin: null,
      distanceCm: sensor.lastReadingDistanceCm ?? null,
      quality: sensor.lastReadingQuality ?? 'unknown',
      status,
      validated,
      connectivityProof: validated
        ? 'Leitura física recente, estrutura válida e origem confirmada.'
        : 'Não há leitura física recente e válida que comprove conectividade.',
      readingAgeSeconds: ageSeconds,
      history: sensor.history ?? [],
      lastReadingAt: sensor.lastReadingAt ?? null,
    }
  }

  const runtime = simulation?.sensors?.[sensor.id]
  if (!runtime) {
    return {
      ...sensor,
      levelCm: null,
      rateCmPerMin: null,
      distanceCm: null,
      quality: 'unknown',
      status: 'simulation_unavailable',
      validated: false,
      connectivityProof: 'Simulação ainda não inicializada.',
      readingAgeSeconds: null,
      history: [],
      lastReadingAt: null,
    }
  }

  const paused = !simulation.running
  const status = runtime.fault
    ? runtime.fault === 'offline'
      ? 'fault_offline'
      : 'fault_invalid'
    : paused
      ? 'simulation_paused'
      : 'simulation_active'

  const ageSeconds = runtime.lastReadingAt
    ? Math.max(0, (now.getTime() - new Date(runtime.lastReadingAt).getTime()) / 1000)
    : null

  return {
    ...sensor,
    levelCm: runtime.fault ? null : Number(runtime.levelCm?.toFixed(2)),
    rateCmPerMin: runtime.fault ? null : Number(runtime.rateCmPerMin?.toFixed(2)),
    distanceCm: runtime.fault
      ? null
      : Number((sensorGeometry.sensorHeightCm - (runtime.levelCm ?? 0)).toFixed(2)),
    quality: runtime.fault === 'invalid' ? 'invalid' : runtime.fault === 'offline' ? 'missing' : 'valid',
    status,
    validated: false,
    connectivityProof:
      'Leitura gerada pelo simulador. Não comprova conectividade de hardware físico.',
    readingAgeSeconds: ageSeconds,
    history: runtime.history ?? [],
    lastReadingAt: runtime.lastReadingAt ?? null,
  }
}

export function latestReadingFor(sensor, simulation, { now = new Date() } = {}) {
  const view = deriveSensorView(sensor, simulation, { now })
  const valid = view.source === 'simulation' && view.quality === 'valid' && view.levelCm !== null
  return {
    device_id: sensor.deviceId,
    sensor_id: sensor.id,
    timestamp: view.lastReadingAt ?? now.toISOString(),
    distance_cm: view.distanceCm,
    water_level_cm: view.levelCm,
    source: sensor.source,
    quality: view.quality,
    status: view.status,
    metadata: {
      simulated: sensor.source === 'simulation',
      rate_cm_per_min: view.rateCmPerMin,
      sensor_height_cm: sensorGeometry.sensorHeightCm,
      last_valid_reading_at: valid ? view.lastReadingAt : null,
    },
  }
}
