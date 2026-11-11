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
    hex: '#22C55E',
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
    hex: '#F59E0B',
    description: 'Sinal de elevação ou condição que exige acompanhamento.',
  },
  alert: {
    label: 'Alerta',
    short: 'Alerta',
    tone: 'critical',
    text: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/30',
    dot: 'bg-orange-400',
    hex: '#FB923C',
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
    hex: '#EF4444',
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
