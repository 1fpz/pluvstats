import { alertTypeMeta, severityRank } from '@/utils/severity'

const COPY = {
  water_level: {
    attention: {
      title: 'Nível de água em atenção',
      description: 'O nível simulado se aproxima da faixa de atenção configurada.',
      recommendation: 'Acompanhar a evolução e verificar o ponto em campo antes de novas chuvas.',
    },
    alert: {
      title: 'Nível de água em alerta',
      description: 'O nível simulado ultrapassou o limite experimental de alerta.',
      recommendation: 'Priorizar vistoria do ponto e preparar sinalização preventiva.',
    },
    critical: {
      title: 'Nível de água crítico',
      description: 'O nível simulado alcançou a faixa crítica configurada para demonstração.',
      recommendation: 'Acionar procedimento de contingência e restringir circulação no entorno.',
    },
  },
  rise_rate: {
    attention: {
      title: 'Elevação acima do ritmo usual',
      description: 'A velocidade de elevação simulada ultrapassou a faixa de atenção.',
      recommendation: 'Monitorar a tendência nos próximos ciclos e checar drenagem local.',
    },
    alert: {
      title: 'Elevação acelerada',
      description: 'A velocidade de elevação simulada ultrapassou o limite de alerta.',
      recommendation: 'Verificar obstruções e reforçar o acompanhamento do ponto.',
    },
    critical: {
      title: 'Elevação crítica',
      description: 'A velocidade de elevação simulada está na faixa crítica.',
      recommendation: 'Tratar como cenário de resposta rápida e comunicar a equipe técnica.',
    },
  },
  communication: {
    attention: {
      title: 'Comunicação indisponível',
      description: 'O dispositivo deixou de enviar leituras válidas dentro da janela esperada.',
      recommendation: 'Verificar alimentação, sinal e último horário de comunicação do dispositivo.',
    },
  },
  invalid_reading: {
    attention: {
      title: 'Leitura inválida recebida',
      description: 'A leitura recebida não passou na validação de distância ou estrutura.',
      recommendation: 'Inspecionar o sensor e descartar a leitura antes de qualquer decisão.',
    },
  },
  sensor_failure: {
    alert: {
      title: 'Falha de sensor',
      description: 'O dispositivo reportou falha interna na última leitura.',
      recommendation: 'Programar manutenção e manter o ponto sob observação.',
    },
  },
}

function severityFromValue(value, limits, previousSeverity, hysteresis) {
  if (!Number.isFinite(value)) return 'normal'
  let severity = 'normal'
  if (value >= limits.critical) severity = 'critical'
  else if (value >= limits.alert) severity = 'alert'
  else if (value >= limits.attention) severity = 'attention'

  if (previousSeverity && severityRank(previousSeverity) > severityRank(severity)) {
    const holdThreshold = limits[previousSeverity] - hysteresis
    if (Number.isFinite(holdThreshold) && value >= holdThreshold) return previousSeverity
  }
  return severity
}

function buildAlert({ sensor, type, severity, sensorName, now, reading, metrics }) {
  const copy = COPY[type]?.[severity] ?? COPY[type]?.attention ?? COPY.water_level.attention
  const simulated = sensor.source === 'simulation'
  const suffix = simulated ? ' (simulado)' : ''
  return {
    id: `ALT-${sensor.id}-${type}-${new Date(now).getTime().toString(36)}`,
    sensorId: sensor.id,
    sensorName,
    deviceId: sensor.deviceId,
    type,
    severity,
    title: `${copy.title}${suffix}`,
    description: copy.description,
    recommendation: copy.recommendation,
    status: 'active',
    source: sensor.source,
    simulated,
    openedAt: now,
    lastObservedAt: now,
    acknowledgedAt: null,
    resolvedAt: null,
    resolvedAutomatically: false,
    metrics: metrics ?? {},
    reading: reading
      ? {
          waterLevelCm: reading.water_level_cm ?? null,
          rateCmPerMin: reading.metadata?.rate_cm_per_min ?? null,
          distanceCm: reading.distance_cm ?? null,
          timestamp: reading.timestamp ?? now,
        }
      : null,
    timeline: [
      {
        at: now,
        kind: 'opened',
        severity,
        message: `${alertTypeMeta[type]?.label ?? type} em ${sensorName}${suffix}.`,
      },
    ],
  }
}

function updateAlert(existing, severity, now, reading, metrics) {
  const escalated = severityRank(severity) > severityRank(existing.severity)
  const changed = existing.severity !== severity
  if (!changed) {
    return { ...existing, lastObservedAt: now, metrics: metrics ?? existing.metrics }
  }
  const copy = COPY[existing.type]?.[severity] ?? COPY[existing.type]?.attention ?? COPY.water_level.attention
  const suffix = existing.simulated ? ' (simulado)' : ''
  return {
    ...existing,
    severity,
    title: `${copy.title}${suffix}`,
    description: copy.description,
    recommendation: copy.recommendation,
    lastObservedAt: now,
    metrics: metrics ?? existing.metrics,
    reading: reading
      ? {
          waterLevelCm: reading.water_level_cm ?? null,
          rateCmPerMin: reading.metadata?.rate_cm_per_min ?? null,
          distanceCm: reading.distance_cm ?? null,
          timestamp: reading.timestamp ?? now,
        }
      : existing.reading,
    timeline: [
      ...(existing.timeline ?? []).slice(-10),
      {
        at: now,
        kind: escalated ? 'escalated' : 'updated',
        severity,
        message: escalated ? 'Severidade elevada pelo motor de regras.' : 'Severidade reavaliada.',
      },
    ],
  }
}

function resolveAlert(existing, now) {
  return {
    ...existing,
    status: 'resolved',
    resolvedAt: now,
    lastObservedAt: now,
    resolvedAutomatically: true,
    timeline: [
      ...(existing.timeline ?? []).slice(-10),
      { at: now, kind: 'resolved', severity: existing.severity, message: 'Condição normalizada; alerta encerrado automaticamente.' },
    ],
  }
}

function conditionCopy(type, severity) {
  return COPY[type]?.[severity] ?? null
}

/**
 * Evaluates every sensor and reconciles the active alert set.
 * Pure function: receives current alerts and returns a new collection.
 */
export function evaluateAlerts({ sensors, readingsBySensor = {}, alerts = [], config, now = new Date() }) {
  const thresholds = config.thresholds
  const maxAge = thresholds.staleReadingSeconds
  const next = [...alerts]
  const created = []
  const updated = []
  const resolved = []
  const nowIso = now.toISOString()

  sensors.forEach((sensor) => {
    const reading = readingsBySensor[sensor.id]
    const source = sensor.source
    const simulated = source === 'simulation'
    const existingForSensor = (type) =>
      next.find(
        (alert) => alert.sensorId === sensor.id && alert.type === type && alert.status !== 'resolved',
      )

    const states = {}
    const status = reading?.status ?? sensor.status
    const quality = reading?.quality ?? sensor.quality
    const level = reading?.water_level_cm ?? sensor.levelCm
    const rate = reading?.metadata?.rate_cm_per_min ?? sensor.rateCmPerMin
    const ageSeconds = reading?.timestamp
      ? Math.max(0, (now.getTime() - new Date(reading.timestamp).getTime()) / 1000)
      : sensor.lastReadingAt
        ? Math.max(0, (now.getTime() - new Date(sensor.lastReadingAt).getTime()) / 1000)
        : Infinity

    const paused = status === 'simulation_paused'
    const offline = status === 'fault_offline' || quality === 'missing' || (!reading && source === 'simulation')
    const invalid = status === 'fault_invalid' || quality === 'invalid'
    const neverSeenHardware = source === 'hardware' && !sensor.lastReadingAt && !reading
    const staleHardware =
      source === 'hardware' && Boolean(sensor.lastReadingAt) && ageSeconds > maxAge

    if (!paused && !neverSeenHardware && (offline || staleHardware)) {
      states.communication = {
        severity: ageSeconds > maxAge * 2 ? 'attention' : 'attention',
        metrics: { readingAgeSeconds: Number.isFinite(ageSeconds) ? Math.round(ageSeconds) : null },
      }
    }

    if (invalid) {
      states.invalid_reading = {
        severity: 'attention',
        metrics: { distanceCm: reading?.distance_cm ?? null },
      }
    }

    if (!offline && !invalid && Number.isFinite(level)) {
      const previous = existingForSensor('water_level')?.severity
      states.water_level = {
        severity: severityFromValue(
          level,
          thresholds.waterLevelCm,
          previous,
          thresholds.hysteresisCm,
        ),
        metrics: { waterLevelCm: Number(level.toFixed(1)) },
      }
    }

    if (!offline && !invalid && Number.isFinite(rate)) {
      const previous = existingForSensor('rise_rate')?.severity
      states.rise_rate = {
        severity: severityFromValue(
          Math.max(0, rate),
          thresholds.riseRateCmPerMin,
          previous,
          thresholds.hysteresisRateCmPerMin,
        ),
        metrics: { rateCmPerMin: Number(rate.toFixed(2)) },
      }
    }

    const allTypes = new Set([
      'water_level',
      'rise_rate',
      'communication',
      'invalid_reading',
      ...next.filter((alert) => alert.sensorId === sensor.id && alert.status !== 'resolved').map((alert) => alert.type),
    ])

    allTypes.forEach((type) => {
      const desired = states[type]
      const existing = next.find(
        (alert) => alert.sensorId === sensor.id && alert.type === type && alert.status !== 'resolved',
      )
      const severity = desired?.severity ?? 'normal'

      if (severity === 'normal') {
        if (existing) {
          const index = next.indexOf(existing)
          const resolvedAlert = resolveAlert(existing, nowIso)
          next[index] = resolvedAlert
          resolved.push(resolvedAlert)
        }
        return
      }

      if (!conditionCopy(type, severity)) return

      if (existing) {
        if (existing.severity === severity) {
          const index = next.indexOf(existing)
          next[index] = {
            ...existing,
            lastObservedAt: nowIso,
            metrics: desired.metrics,
            reading: reading
              ? {
                  waterLevelCm: reading.water_level_cm ?? null,
                  rateCmPerMin: reading.metadata?.rate_cm_per_min ?? null,
                  distanceCm: reading.distance_cm ?? null,
                  timestamp: reading.timestamp ?? nowIso,
                }
              : existing.reading,
          }
        } else {
          const index = next.indexOf(existing)
          const updatedAlert = updateAlert(existing, severity, nowIso, reading, desired.metrics)
          next[index] = updatedAlert
          updated.push(updatedAlert)
        }
      } else {
        const alert = buildAlert({
          sensor,
          type,
          severity,
          sensorName: sensor.shortName ?? sensor.name,
          now: nowIso,
          reading,
          metrics: desired.metrics,
        })
        next.unshift(alert)
        created.push(alert)
      }
    })
  })

  return {
    alerts: next.sort((a, b) => new Date(b.openedAt) - new Date(a.openedAt)),
    created,
    updated,
    resolved,
  }
}

export function acknowledgeAlertRecord(alert, now = new Date()) {
  if (!alert || alert.status === 'resolved') return alert
  return {
    ...alert,
    status: 'acknowledged',
    acknowledgedAt: now.toISOString(),
    timeline: [
      ...(alert.timeline ?? []).slice(-10),
      { at: now.toISOString(), kind: 'acknowledged', severity: alert.severity, message: 'Alerta reconhecido pela equipe.' },
    ],
  }
}

export function resolveAlertRecord(alert, now = new Date()) {
  if (!alert || alert.status === 'resolved') return alert
  return {
    ...alert,
    status: 'resolved',
    resolvedAt: now.toISOString(),
    resolvedAutomatically: false,
    timeline: [
      ...(alert.timeline ?? []).slice(-10),
      { at: now.toISOString(), kind: 'resolved', severity: alert.severity, message: 'Alerta resolvido manualmente pela equipe.' },
    ],
  }
}
