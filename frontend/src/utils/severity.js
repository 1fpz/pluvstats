export const SEVERITY_ORDER = ['normal', 'attention', 'alert', 'critical']

export const severityMeta = {
  normal: {
    label: 'Normal',
    short: 'Normal',
    tone: 'success',
    text: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/30',
    dot: 'bg-success',
    hex: '#63A98A',
    description: 'Operação dentro da faixa esperada.',
  },
  attention: {
    label: 'Atenção',
    short: 'Atenção',
    tone: 'warning',
    text: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    dot: 'bg-warning',
    hex: '#C9A15A',
    description: 'Sinal de elevação ou condição que exige acompanhamento.',
  },
  alert: {
    label: 'Alerta',
    short: 'Alerta',
    tone: 'critical',
    text: 'text-alert',
    bg: 'bg-alert/10',
    border: 'border-alert/30',
    dot: 'bg-alert',
    hex: '#C9855A',
    description: 'Limite experimental ultrapassado. Verificar ponto e equipe.',
  },
  critical: {
    label: 'Crítico',
    short: 'Crítico',
    tone: 'critical',
    text: 'text-critical',
    bg: 'bg-critical/10',
    border: 'border-critical/30',
    dot: 'bg-critical',
    hex: '#C96A6A',
    description: 'Faixa crítica de demonstração. Ação imediata recomendada.',
  },
}

export function severityRank(severity) {
  const index = SEVERITY_ORDER.indexOf(severity)
  return index === -1 ? 0 : index
}

export function worstSeverity(values) {
  return values.reduce(
    (worst, value) => (severityRank(value) > severityRank(worst) ? value : worst),
    'normal',
  )
}

/**
 * Current situation for a public summary.
 *
 * Only live signals matter here: the severity of each sensor and of the open
 * alerts. Historical occurrence severity must not raise the current status,
 * otherwise a resolved event could keep the city "critical" forever.
 */
export function currentSituationSeverity(sensors = [], alerts = []) {
  return worstSeverity([
    ...sensors.map((sensor) => sensor?.alertSeverity ?? 'normal'),
    ...alerts.map((alert) => alert?.severity ?? 'normal'),
  ])
}

export const occurrenceStatusMeta = {
  open: { label: 'Aberta', tone: 'warning' },
  validated: { label: 'Validada', tone: 'cyan' },
  in_progress: { label: 'Em intervenção', tone: 'petrol' },
  resolved: { label: 'Resolvida', tone: 'success' },
  archived: { label: 'Arquivada', tone: 'neutral' },
}

export const occurrenceTypeMeta = {
  flooding: { label: 'Alagamento', icon: 'Waves' },
  waterlogging: { label: 'Acúmulo de água', icon: 'Droplets' },
  drainage: { label: 'Drenagem obstruída', icon: 'Construction' },
  overflow: { label: 'Transbordamento', icon: 'AlertTriangle' },
  other: { label: 'Outro', icon: 'CircleHelp' },
}

export const sensorStatusMeta = {
  simulation_active: { label: 'Simulação ativa', tone: 'cyan' },
  simulation_paused: { label: 'Simulação pausada', tone: 'neutral' },
  simulation_unavailable: { label: 'Simulação indisponível', tone: 'warning' },
  fault_offline: { label: 'Falha de comunicação', tone: 'critical' },
  fault_invalid: { label: 'Leitura inválida', tone: 'warning' },
  hardware_validated: { label: 'Hardware validado', tone: 'success' },
  hardware_unvalidated: { label: 'Hardware não validado', tone: 'warning' },
  hardware_stale: { label: 'Sem leitura recente', tone: 'warning' },
}

export const interventionStatusMeta = {
  planned: { label: 'Planejada', tone: 'neutral', text: 'text-muted', dot: 'bg-muted' },
  in_progress: { label: 'Em execução', tone: 'petrol', text: 'text-petrol-400', dot: 'bg-petrol-400' },
  completed: { label: 'Concluída', tone: 'success', text: 'text-success', dot: 'bg-success' },
}

export const alertTypeMeta = {
  water_level: { label: 'Nível de água' },
  rise_rate: { label: 'Velocidade de elevação' },
  communication: { label: 'Comunicação' },
  invalid_reading: { label: 'Leitura inválida' },
  sensor_failure: { label: 'Falha de sensor' },
}
