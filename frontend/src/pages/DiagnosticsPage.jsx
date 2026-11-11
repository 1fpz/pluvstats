import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  CircleCheck,
  CircleX,
  Clock3,
  Cpu,
  Database,
  Radio,
  ServerCrash,
  ShieldCheck,
  Siren,
  TriangleAlert,
  WifiOff,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { buttonClass } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { InfoNotice } from '@/components/ui/InfoNotice'
import { SensorStatusBadge } from '@/components/ui/SensorStatusBadge'
import { SourceBadge } from '@/components/ui/SourceBadge'
import { useData, useOperationMode, useSimulation } from '@/hooks'
import { dataSourceInfo } from '@/services/dataSource'
import { runtimeConfig } from '@/config'
import { formatDateTime, formatRelativeTime } from '@/utils/formatters'
import { cn } from '@/utils/cn'

const REQUIRED_CHECKS = [
  {
    key: 'registered',
    label: 'Identificação do dispositivo',
    detail: 'O dispositivo precisa estar registrado com ID próprio e origem de hardware.',
    test: (sensor) => Boolean(sensor.deviceId) && sensor.source === 'hardware',
  },
  {
    key: 'reading',
    label: 'Leitura recebida',
    detail: 'É necessário existir ao menos uma leitura com estrutura válida.',
    test: (sensor) => Boolean(sensor.lastReadingAt),
  },
  {
    key: 'valid',
    label: 'Estrutura e faixa válidas',
    detail: 'Distância dentro da faixa aceita e qualidade da leitura igual a valid.',
    test: (sensor) => sensor.quality === 'valid' && Number.isFinite(sensor.levelCm),
  },
  {
    key: 'fresh',
    label: 'Leitura recente',
    detail: 'A idade da leitura precisa respeitar a janela máxima de atualidade.',
    test: (sensor, maxAge) =>
      sensor.readingAgeSeconds !== null &&
      sensor.readingAgeSeconds !== undefined &&
      sensor.readingAgeSeconds <= maxAge,
  },
  {
    key: 'validated',
    label: 'Validação de origem',
    detail: 'O backend precisa confirmar que a leitura veio de hardware físico validado.',
    test: (sensor) => sensor.validated === true,
  },
]

function CheckList({ sensor, maxAge }) {
  return (
    <ul className="space-y-2.5">
      {REQUIRED_CHECKS.map((check) => {
        const passed = check.test(sensor, maxAge)
        return (
          <li key={check.key} className="flex items-start gap-2.5">
            <span
              className={cn(
                'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border',
                passed
                  ? 'border-success/30 bg-success/10 text-success'
                  : 'border-critical/30 bg-critical/10 text-critical',
              )}
            >
              {passed ? (
                <CircleCheck className="h-3 w-3" aria-hidden="true" />
              ) : (
                <CircleX className="h-3 w-3" aria-hidden="true" />
              )}
            </span>
            <div className="min-w-0">
              <p className={cn('text-[11px] font-medium', passed ? 'text-ink' : 'text-ink/80')}>{check.label}</p>
              <p className="mt-0.5 text-[9px] leading-relaxed text-muted">{check.detail}</p>
            </div>
            <Badge variant={passed ? 'success' : 'critical'} size="xs" className="ml-auto shrink-0">
              {passed ? 'ok' : 'falha'}
            </Badge>
          </li>
        )
      })}
    </ul>
  )
}

export function DiagnosticsPage() {
  const { snapshot, loading } = useData()
  const { isRunning, tickSeconds, lastTickAt, scenarioMeta } = useSimulation()
  const { hardware, connection, hardwareAbsenceMessage, mode, readingMaxAgeSeconds } = useOperationMode()

  const sensors = useMemo(() => snapshot?.sensors ?? [], [snapshot])
  const alerts = useMemo(() => snapshot?.alerts ?? [], [snapshot])
  const hardwareSensors = useMemo(() => sensors.filter((sensor) => sensor.source === 'hardware'), [sensors])
  const simulatedSensors = useMemo(() => sensors.filter((sensor) => sensor.source === 'simulation'), [sensors])
  const openAlerts = alerts.filter((alert) => alert.status !== 'resolved')
  const faultySensors = sensors.filter((sensor) =>
    ['fault_offline', 'fault_invalid', 'hardware_stale'].includes(sensor.status),
  )

  const issues = useMemo(() => {
    const list = []
    if (!runtimeConfig.isConfiguredApi) {
      list.push({
        severity: 'warning',
        title: 'API não configurada',
        detail: 'Nenhuma base VITE_API_BASE_URL foi definida. O frontend opera somente com o repositório demonstrativo local.',
      })
    }
    if (hardwareSensors.length === 0) {
      list.push({
        severity: 'warning',
        title: 'Nenhum dispositivo de hardware registrado',
        detail: 'Não há dispositivo físico cadastrado nesta build. Nada é inferido ou simulado como hardware.',
      })
    }
    hardwareSensors
      .filter((sensor) => !sensor.validated)
      .forEach((sensor) => {
        list.push({
          severity: 'critical',
          title: `${sensor.deviceId} sem validação`,
          detail: sensor.connectivityProof,
        })
      })
    if (!isRunning) {
      list.push({
        severity: 'warning',
        title: 'Simulador pausado',
        detail: 'As séries não avançam enquanto a simulação estiver pausada.',
      })
    }
    faultySensors.forEach((sensor) => {
      list.push({
        severity: 'warning',
        title: `${sensor.id} em estado de falha`,
        detail: `Status atual: ${sensor.status}. Origem: ${sensor.source}.`,
      })
    })
    return list
  }, [faultySensors, hardwareSensors, isRunning])

  if (loading && !snapshot) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-9 w-64" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-24" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-64" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Sistema · integridade e conectividade"
        title="Diagnóstico"
        description="Verifique a origem dos dados, a validação de hardware e o estado do simulador. Este painel não declara conexão física sem evidência de leitura validada."
        meta={
          <>
            <Badge variant={mode === 'demo' ? 'cyan' : 'success'} size="sm" dot>
              {mode === 'demo' ? 'modo demonstração' : 'modo hardware'}
            </Badge>
            <Badge variant={connection.apiReachable ? 'success' : 'warning'} size="sm">
              {connection.apiReachable ? 'API acessível' : 'API não conectada'}
            </Badge>
            <span className="font-mono text-[10px] text-muted">atualizado {formatRelativeTime(snapshot?.updatedAt)}</span>
          </>
        }
        actions={
          <Link to="/configuracoes#simulador" className={buttonClass({ variant: 'secondary' })}>
            <Activity className="h-4 w-4" aria-hidden="true" />
            Controles
          </Link>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores de diagnóstico">
        <StatCard label="Hardware registrado" value={hardware.total} icon={Cpu} tone={hardware.total > 0 ? 'cyan' : 'neutral'} hint={`${hardware.validated} validado(s)`} />
        <StatCard label="API de operação" value={connection.apiReachable ? 'Conectada' : 'Ausente'} icon={ServerCrash} tone={connection.apiReachable ? 'success' : 'warning'} hint={runtimeConfig.isConfiguredApi ? runtimeConfig.apiBaseUrl : 'VITE_API_BASE_URL não definida'} />
        <StatCard label="Sensores em falha" value={faultySensors.length} icon={WifiOff} tone={faultySensors.length > 0 ? 'critical' : 'success'} hint={`${simulatedSensors.length} simulados monitorados`} />
        <StatCard label="Alertas abertos" value={openAlerts.length} icon={Siren} tone={openAlerts.length > 0 ? 'warning' : 'success'} hint="Motor demonstrativo local" />
      </section>

      <InfoNotice variant="warning" title="Nenhum hardware validado neste ambiente">
        {hardwareAbsenceMessage} A ausência é um estado explícito, não uma falha silenciosa. Leituras simuladas nunca são
        promovidas a hardware.
      </InfoNotice>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <Card>
            <CardHeader
              icon={ShieldCheck}
              title="Prova de conectividade física"
              description={`Critérios aplicados antes de habilitar o modo hardware. Janela de atualidade: ${readingMaxAgeSeconds} s.`}
            />
            <CardBody className="pt-4">
              {hardwareSensors.length === 0 ? (
                <EmptyState
                  icon={Radio}
                  compact
                  title="Nenhum dispositivo físico registrado"
                  description="Cadastre um dispositivo ESP32 e envie uma leitura válida pelo backend antes de solicitar o modo hardware."
                />
              ) : (
                <div className="space-y-4">
                  {hardwareSensors.map((sensor) => (
                    <div key={sensor.id} className="rounded-xl border border-line bg-navy-950/30 p-3">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-medium text-ink">
                            {sensor.id} · {sensor.shortName ?? sensor.name}
                          </p>
                          <p className="mt-0.5 font-mono text-[9px] text-muted">{sensor.deviceId}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <SourceBadge source={sensor.source} />
                          <SensorStatusBadge status={sensor.status} />
                          <Badge variant={sensor.validated ? 'success' : 'warning'} size="xs">
                            {sensor.validated ? 'validado' : 'não validado'}
                          </Badge>
                        </div>
                      </div>
                      <CheckList sensor={sensor} maxAge={readingMaxAgeSeconds} />
                      <p className="mt-3 border-t border-line pt-2 text-[10px] leading-relaxed text-muted">
                        {sensor.connectivityProof}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
            <CardFooter>
              <span className="text-[10px] text-muted">Validação executada no snapshot mais recente.</span>
              <span className="font-mono text-[9px] text-muted">{hardwareSensors.length} dispositivo(s)</span>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader icon={Database} title="Inventário e idade das leituras" description="Todos os pontos conhecidos, com origem explícita." />
            <CardBody className="pt-3">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-line text-[9px] uppercase tracking-[0.08em] text-muted">
                      <th scope="col" className="py-2 pr-3 font-medium">Sensor</th>
                      <th scope="col" className="py-2 pr-3 font-medium">Origem</th>
                      <th scope="col" className="py-2 pr-3 font-medium">Status</th>
                      <th scope="col" className="py-2 pr-3 font-medium">Validação</th>
                      <th scope="col" className="py-2 pr-3 font-medium">Qualidade</th>
                      <th scope="col" className="py-2 pr-3 text-right font-medium">Idade</th>
                      <th scope="col" className="py-2 text-right font-medium">Última leitura</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {sensors.map((sensor) => (
                      <tr key={sensor.id}>
                        <td className="py-2.5 pr-3">
                          <Link to={`/sensores?selected=${sensor.id}`} className="font-medium text-ink hover:text-cyan-300">
                            {sensor.id}
                          </Link>
                          <span className="mt-0.5 block font-mono text-[9px] text-muted">{sensor.deviceId}</span>
                        </td>
                        <td className="py-2.5 pr-3"><SourceBadge source={sensor.source} size="xs" showIcon={false} /></td>
                        <td className="py-2.5 pr-3"><SensorStatusBadge status={sensor.status} /></td>
                        <td className="py-2.5 pr-3">
                          {sensor.source === 'hardware' ? (
                            <Badge variant={sensor.validated ? 'success' : 'warning'} size="xs">
                              {sensor.validated ? 'validado' : 'pendente'}
                            </Badge>
                          ) : (
                            <span className="font-mono text-[9px] text-muted">n/a</span>
                          )}
                        </td>
                        <td className="py-2.5 pr-3 font-mono text-[10px] text-muted">{sensor.quality ?? '—'}</td>
                        <td className="py-2.5 pr-3 text-right font-mono text-[10px] text-muted">
                          {sensor.readingAgeSeconds !== null && sensor.readingAgeSeconds !== undefined
                            ? `${Math.round(sensor.readingAgeSeconds)} s`
                            : '—'}
                        </td>
                        <td className="py-2.5 text-right font-mono text-[9px] text-muted">
                          {sensor.lastReadingAt ? formatDateTime(sensor.lastReadingAt) : 'nunca'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
            <CardFooter>
              <span className="text-[10px] text-muted">Sem mascaramento: simulação e hardware aparecem separados.</span>
              <span className="font-mono text-[9px] text-muted">{sensors.length} pontos</span>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader icon={TriangleAlert} title="Condições observadas" description="Itens derivados do estado atual. Nenhum erro é inventado." />
            <CardBody className="space-y-2 pt-4">
              {issues.length === 0 ? (
                <EmptyState icon={ShieldCheck} compact title="Nenhuma condição de atenção" description="Origem, simulador e dispositivos estão consistentes." />
              ) : (
                issues.map((issue, index) => (
                  <div
                    key={`${issue.title}-${index}`}
                    className={cn(
                      'rounded-lg border p-3',
                      issue.severity === 'critical'
                        ? 'border-critical/25 bg-critical/[0.04]'
                        : 'border-warning/25 bg-warning/[0.04]',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant={issue.severity === 'critical' ? 'critical' : 'warning'} size="xs">
                        {issue.severity === 'critical' ? 'crítico' : 'atenção'}
                      </Badge>
                      <p className="text-[11px] font-medium text-ink">{issue.title}</p>
                    </div>
                    <p className="mt-1 text-[10px] leading-relaxed text-muted">{issue.detail}</p>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader icon={Activity} title="Simulador" description="Runtime demonstrativo local." />
            <CardBody className="space-y-1.5 pt-4 text-[10px]">
              {[
                ['Estado', isRunning ? 'em execução' : 'pausado'],
                ['Cenário', scenarioMeta.label],
                ['Ciclo', `${tickSeconds} s`],
                ['Último ciclo', lastTickAt ? formatRelativeTime(lastTickAt) : '—'],
                ['Sensores simulados', simulatedSensors.length],
                ['Sensores em falha', faultySensors.length],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-2 border-b border-line pb-1.5 last:border-0">
                  <span className="text-muted">{label}</span>
                  <span className="font-mono text-ink">{value}</span>
                </div>
              ))}
            </CardBody>
            <CardFooter>
              <span className="text-[10px] text-muted">Origem</span>
              <span className="font-mono text-[9px] text-muted">{dataSourceInfo.label}</span>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader icon={Clock3} title="Fonte e ambiente" description="Configuração efetiva desta execução." />
            <CardBody className="space-y-1.5 pt-4 text-[10px]">
              {[
                ['Tipo de fonte', snapshot?.sourceKind ?? dataSourceInfo.kind],
                ['Demonstração', snapshot?.isDemo ? 'sim' : 'não'],
                ['API configurada', runtimeConfig.isConfiguredApi ? 'sim' : 'não'],
                ['Base da API', runtimeConfig.apiBaseUrl || 'não definida'],
                ['Última verificação', connection.checkedAt ? formatDateTime(connection.checkedAt) : '—'],
                ['Mensagem', connection.message],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3 border-b border-line pb-1.5 last:border-0">
                  <span className="text-muted">{label}</span>
                  <span className="max-w-[62%] break-words text-right font-mono text-ink">{value}</span>
                </div>
              ))}
            </CardBody>
            <CardFooter>
              <span className="text-[10px] text-muted">Nenhuma credencial no cliente</span>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader icon={Siren} title="Próximo passo operacional" description="Para sair da demonstração com segurança." />
            <CardBody className="space-y-2 pt-4 text-[10px] leading-relaxed text-muted">
              <p>1. Publicar o backend FastAPI com banco SQLite e endpoint de ingestão.</p>
              <p>2. Conectar o ESP32 e registrar o dispositivo com ID único.</p>
              <p>3. Enviar uma leitura física válida e confirmar a validação de atualidade.</p>
              <p>4. Só então habilitar o modo hardware.</p>
              <Link to="/sensores" className={buttonClass({ variant: 'secondary', size: 'sm', className: 'mt-1 w-full' })}>
                Inspecionar sensores
              </Link>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  )
}
