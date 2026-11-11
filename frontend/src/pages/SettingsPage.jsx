import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  Cpu,
  Database,
  Gauge,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Waves,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button, buttonClass } from '@/components/ui/Button'
import { InfoNotice } from '@/components/ui/InfoNotice'
import { Modal } from '@/components/ui/Modal'
import { useData, useOperationMode, useSimulation, useToast } from '@/hooks'
import { dataSourceInfo } from '@/services/dataSource'
import { operationConfig, runtimeConfig, sensorGeometry, territory, thresholds } from '@/config'
import { formatDuration, formatRelativeTime } from '@/utils/formatters'
import { cn } from '@/utils/cn'

function ThresholdTable() {
  return (
    <div className="space-y-4">
      <div>
        <p className="eyebrow mb-2">Nível de água</p>
        <div className="space-y-1.5 text-[10px]">
          {[
            ['Atenção', thresholds.waterLevelCm.attention, 'bg-warning'],
            ['Alerta', thresholds.waterLevelCm.alert, 'bg-orange-400'],
            ['Crítico', thresholds.waterLevelCm.critical, 'bg-critical'],
          ].map(([label, value, dot]) => (
            <div key={label} className="flex items-center justify-between gap-2 border-b border-line pb-1.5 last:border-0">
              <span className="flex items-center gap-1.5 text-muted">
                <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />
                {label}
              </span>
              <span className="font-mono text-ink">{value} cm</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="eyebrow mb-2">Taxa de elevação</p>
        <div className="space-y-1.5 text-[10px]">
          {[
            ['Atenção', thresholds.riseRateCmPerMin.attention],
            ['Alerta', thresholds.riseRateCmPerMin.alert],
            ['Crítico', thresholds.riseRateCmPerMin.critical],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-2 border-b border-line pb-1.5 last:border-0">
              <span className="text-muted">{label}</span>
              <span className="font-mono text-ink">{value} cm/min</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-1.5 border-t border-line pt-3 text-[10px]">
        {[
          ['Histerese de nível', `${thresholds.hysteresisCm} cm`],
          ['Histerese de taxa', `${thresholds.hysteresisRateCmPerMin} cm/min`],
          ['Leitura obsoleta após', `${thresholds.staleReadingSeconds} s`],
          ['Faixa de distância válida', `${thresholds.invalidDistanceRangeCm[0]}–${thresholds.invalidDistanceRangeCm[1]} cm`],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-2">
            <span className="text-muted">{label}</span>
            <span className="font-mono text-ink">{value}</span>
          </div>
        ))}
      </div>
      <p className="border-t border-line pt-3 text-[9px] leading-relaxed text-muted">
        Limiares experimentais definidos em <span className="font-mono text-ink">shared/pluvstats.config.json</span>.
        A interface é somente leitura nesta versão; qualquer alteração exige revisão do arquivo compartilhado.
      </p>
    </div>
  )
}

export function SettingsPage() {
  const { snapshot, actions } = useData()
  const { isRunning, scenario, scenarioMeta, scenarios, controls, busy, tickSeconds, elapsedSeconds, lastTickAt } = useSimulation()
  const { mode, requestedMode, requestMode, hardware, hardwareAbsenceMessage, readingMaxAgeSeconds } = useOperationMode()
  const { showToast } = useToast()
  const [resetOpen, setResetOpen] = useState(false)
  const [resetting, setResetting] = useState(false)

  const sensors = snapshot?.sensors ?? []

  const handleMode = (nextMode) => {
    if (nextMode === mode) return
    const result = requestMode(nextMode)
    showToast({
      variant: result.ok ? 'success' : 'warning',
      title: result.ok ? 'Modo atualizado' : 'Modo hardware indisponível',
      description: result.message,
    })
  }

  const handleReset = async () => {
    setResetting(true)
    try {
      await actions.resetDemo()
      setResetOpen(false)
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Sistema · configuração e limites"
        title="Configurações"
        description="Controle o modo de operação, o simulador e consulte os limites experimentais. Alterações de limiares são feitas apenas no arquivo compartilhado e exigem nova build."
        meta={
          <>
            <Badge variant={mode === 'demo' ? 'cyan' : 'success'} size="sm" dot pulse={isRunning}>
              {mode === 'demo' ? 'modo demonstração' : 'modo hardware'}
            </Badge>
            <Badge variant="neutral" size="sm">{territory.name}</Badge>
          </>
        }
        actions={
          <Link to="/diagnostico" className={buttonClass({ variant: 'secondary' })}>
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Diagnóstico
          </Link>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <Card>
            <CardHeader
              icon={Settings2}
              title="Modo de operação"
              description="A autoridade de modo é centralizada. Nenhuma página infere hardware por conta própria."
            />
            <CardBody className="space-y-3 pt-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleMode('demo')}
                  aria-pressed={mode === 'demo'}
                  className={cn(
                    'rounded-xl border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40',
                    mode === 'demo'
                      ? 'border-cyan/40 bg-cyan/[0.06]'
                      : 'border-line bg-navy-950/40 hover:border-cyan/25',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-xs font-semibold text-ink">
                      <Database className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                      Demonstração
                    </span>
                    {mode === 'demo' ? <Badge variant="cyan" size="xs">ativo</Badge> : null}
                  </div>
                  <p className="mt-2 text-[10px] leading-relaxed text-muted">
                    Dados simulados no navegador, com séries, alertas e ocorrências fictícias. Padrão seguro do protótipo.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleMode('hardware')}
                  aria-pressed={mode === 'hardware'}
                  className={cn(
                    'rounded-xl border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40',
                    mode === 'hardware'
                      ? 'border-success/40 bg-success/[0.06]'
                      : 'border-line bg-navy-950/40 hover:border-cyan/25',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-xs font-semibold text-ink">
                      <Cpu className="h-4 w-4 text-muted" aria-hidden="true" />
                      Hardware
                    </span>
                    <Badge variant={hardware.validated > 0 ? 'success' : 'warning'} size="xs">
                      {hardware.validated > 0 ? 'disponível' : 'bloqueado'}
                    </Badge>
                  </div>
                  <p className="mt-2 text-[10px] leading-relaxed text-muted">
                    Exige sensor físico validado e ingestão via API. Não há dispositivo validado neste ambiente.
                  </p>
                </button>
              </div>

              <InfoNotice variant="warning" title="Requisitos para operação física">
                {hardwareAbsenceMessage} São exigidos: identificação do dispositivo, leitura recente
                (máx. {readingMaxAgeSeconds} s), estrutura válida, timestamp, origem de hardware e validação de atualidade.
              </InfoNotice>

              <dl className="grid gap-2 text-[10px] sm:grid-cols-2">
                {[
                  ['Modo solicitado', requestedMode],
                  ['Modo ativo', mode],
                  ['Dispositivos de hardware', hardware.total],
                  ['Hardware validado', hardware.validated],
                  ['Última leitura física', hardware.lastReadingAt ? formatRelativeTime(hardware.lastReadingAt) : 'nenhuma'],
                  ['Fonte de dados', dataSourceInfo.label],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-2 rounded-lg border border-line bg-navy-950/40 px-2.5 py-2">
                    <dt className="text-muted">{label}</dt>
                    <dd className="font-mono text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardBody>
          </Card>

          <Card id="simulador">
            <CardHeader
              icon={Activity}
              title="Simulador demonstrativo"
              description={`Ciclo de ${tickSeconds} s. Cada leitura gerada é marcada como simulação em todos os níveis.`}
              actions={
                <Badge variant={isRunning ? 'cyan' : 'warning'} size="xs" dot pulse={isRunning}>
                  {isRunning ? 'em execução' : 'pausado'}
                </Badge>
              }
            />
            <CardBody className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  ['Cenário', scenarioMeta.label],
                  ['Sensores simulados', sensors.filter((sensor) => sensor.source === 'simulation').length],
                  ['Tempo decorrido', formatDuration(elapsedSeconds)],
                  ['Último ciclo', lastTickAt ? formatRelativeTime(lastTickAt) : '—'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-line bg-navy-950/40 p-2.5">
                    <p className="eyebrow text-[9px]">{label}</p>
                    <p className="mt-1 font-mono text-sm text-ink">{value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  icon={isRunning ? Pause : Play}
                  variant={isRunning ? 'secondary' : 'primary'}
                  onClick={isRunning ? controls.pause : controls.start}
                  disabled={busy}
                >
                  {isRunning ? 'Pausar simulação' : 'Iniciar simulação'}
                </Button>
                <Button variant="subtle" icon={RefreshCw} onClick={controls.tickNow} disabled={busy || !isRunning}>
                  Gerar ciclo agora
                </Button>
                <Button variant="ghost" icon={RotateCcw} onClick={controls.reset} disabled={busy}>
                  Reiniciar séries
                </Button>
              </div>

              <div>
                <p className="eyebrow mb-2">Cenários</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {Object.entries(scenarios).map(([key, definition]) => {
                    const active = key === scenario
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => controls.setScenario(key)}
                        aria-pressed={active}
                        disabled={busy}
                        className={cn(
                          'rounded-xl border p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40 disabled:opacity-60',
                          active
                            ? 'border-cyan/40 bg-cyan/[0.06]'
                            : 'border-line bg-navy-950/40 hover:border-cyan/25',
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-[11px] font-medium text-ink">
                            <Waves className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
                            {definition.label}
                          </span>
                          <span className="font-mono text-[9px] text-muted">{definition.rainMmH} mm/h</span>
                        </div>
                        <p className="mt-1.5 text-[9px] leading-relaxed text-muted">{definition.description}</p>
                        <p className="mt-1.5 font-mono text-[9px] text-cyan-300/80">
                          alvo {definition.targetLevelCm} cm · {definition.approachSeconds}s
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-line bg-navy-950/40 p-3 text-[10px] leading-relaxed text-muted">
                {snapshot?.simulation?.hydrologyNote ??
                  'Modelo de cenário demonstrativo: o nível converge para um alvo por sensor, não é hidráulica calibrada.'}
              </div>

              <Link to="/sensores" className={buttonClass({ variant: 'ghost', size: 'sm' })}>
                Ajustes por sensor na página Sensores
              </Link>
            </CardBody>
            <CardFooter>
              <span className="text-[10px] text-muted">As ações afetam apenas a simulação local.</span>
              <span className="font-mono text-[9px] text-muted">tick {tickSeconds}s</span>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader icon={Trash2} title="Dados da demonstração" description="Reinicia séries, ocorrências, intervenções e alertas para o estado inicial." />
            <CardBody className="pt-4">
              <div className="flex flex-col gap-3 rounded-lg border border-critical/20 bg-critical/[0.04] p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-medium text-ink">Restaurar demonstração</p>
                  <p className="mt-1 text-[10px] leading-relaxed text-muted">
                    Remove alterações salvas no navegador. Não afeta nenhum sistema externo.
                  </p>
                </div>
                <Button variant="danger" icon={Trash2} onClick={() => setResetOpen(true)}>
                  Reiniciar dados
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader icon={Gauge} title="Limiares experimentais" description="Aplicados pelo motor de alertas e pela classificação local." />
            <CardBody className="pt-4">
              <ThresholdTable />
            </CardBody>
          </Card>

          <Card>
            <CardHeader icon={SlidersHorizontal} title="Geometria do sensor" description="Parâmetros usados em h(t) = H − d(t)." />
            <CardBody className="space-y-1.5 pt-4 text-[10px]">
              {[
                ['Altura do sensor (H)', `${sensorGeometry.sensorHeightCm} cm`],
                ['Distância a seco', `${sensorGeometry.dryDistanceCm} cm`],
                ['Profundidade do canal', `${sensorGeometry.channelDepthCm} cm`],
                ['Centro do território', `${territory.center[0]}, ${territory.center[1]}`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-2 border-b border-line pb-1.5 last:border-0">
                  <span className="text-muted">{label}</span>
                  <span className="font-mono text-ink">{value}</span>
                </div>
              ))}
              <p className="pt-2 text-[9px] leading-relaxed text-muted">
                Distância medida pelo HC-SR04 é convertida em nível; valores fora da faixa válida são rejeitados.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader icon={ShieldAlert} title="Ambiente" description="Configuração efetiva desta build." />
            <CardBody className="space-y-1.5 pt-4 text-[10px]">
              {[
                ['Fonte de dados', dataSourceInfo.kind],
                ['API configurada', runtimeConfig.isConfiguredApi ? 'sim' : 'não'],
                ['Base da API', runtimeConfig.apiBaseUrl || 'não definida'],
                ['Idade máxima de leitura', `${operationConfig.readingMaxAgeSeconds} s`],
                ['Modo padrão', operationConfig.defaultMode],
                ['Versão', snapshot?.version ?? '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3 border-b border-line pb-1.5 last:border-0">
                  <span className="text-muted">{label}</span>
                  <span className="max-w-[60%] break-all text-right font-mono text-ink">{value}</span>
                </div>
              ))}
              <p className="pt-2 text-[9px] leading-relaxed text-muted">
                Nenhuma credencial é embutida no frontend. O modo hardware permanece bloqueado até existir leitura
                física validada pelo backend.
              </p>
            </CardBody>
          </Card>
        </aside>
      </div>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reiniciar demonstração"
        description="Esta ação restaura o estado inicial salvo no navegador."
        size="sm"
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button variant="ghost" onClick={() => setResetOpen(false)} disabled={resetting}>
              Cancelar
            </Button>
            <Button variant="danger" icon={RotateCcw} onClick={handleReset} loading={resetting}>
              Confirmar reinício
            </Button>
          </div>
        }
      >
        <p className="text-xs leading-relaxed text-muted">
          Ocorrências, intervenções, alertas e séries simuladas voltarão ao estado demonstrativo original. Registros
          criados nesta sessão serão removidos. Nenhum dado externo será alterado.
        </p>
      </Modal>
    </div>
  )
}
