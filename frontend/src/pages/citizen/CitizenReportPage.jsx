import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Droplets,
  MapPin,
  Send,
  ShieldAlert,
  ShieldCheck,
  Waves,
} from 'lucide-react'
import { Button, buttonClass } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { InfoNotice } from '@/components/ui/InfoNotice'
import { Input, Textarea } from '@/components/ui/Field'
import { SeverityBadge } from '@/components/ui/SeverityBadge'
import { useData } from '@/hooks'
import { territory } from '@/config'
import { occurrenceTypeMeta, severityMeta } from '@/utils/severity'
import { validateOccurrence } from '@/utils/validators'
import { toDateTimeLocal } from '@/utils/datetime'
import { cn } from '@/utils/cn'

const TYPE_OPTIONS = [
  { value: 'flooding', label: 'Alagamento', icon: Waves, hint: 'Água cobrindo ruas ou calçadas' },
  { value: 'waterlogging', label: 'Acúmulo', icon: Droplets, hint: 'Poças grandes ou água parada' },
  { value: 'drainage', label: 'Drenagem', icon: AlertTriangle, hint: 'Bueiro entupido ou esgoto lento' },
  { value: 'overflow', label: 'Transbordamento', icon: ShieldAlert, hint: 'Córrego ou canal transbordando' },
  { value: 'other', label: 'Outro', icon: MapPin, hint: 'Outra situação de drenagem' },
]

const URGENCY_OPTIONS = [
  {
    value: 'attention',
    title: 'Pequeno acúmulo',
    description: 'Água parada sem bloquear a passagem.',
  },
  {
    value: 'alert',
    title: 'Via comprometida',
    description: 'Água cobrindo parte da rua ou calçada.',
  },
  {
    value: 'critical',
    title: 'Risco imediato',
    description: 'Água alta, correnteza ou risco a pessoas.',
  },
]

function averagePosition(items) {
  const points = items.map((item) => item.position).filter(Boolean)
  if (points.length === 0) return null
  return {
    lat: points.reduce((sum, point) => sum + point.lat, 0) / points.length,
    lng: points.reduce((sum, point) => sum + point.lng, 0) / points.length,
  }
}

function emptyForm() {
  return {
    type: 'flooding',
    severity: 'attention',
    address: '',
    neighborhood: '',
    description: '',
    consent: false,
  }
}

export function CitizenReportPage() {
  const { snapshot, actions } = useData()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState(null)

  const knownNeighborhoods = useMemo(() => {
    const names = [...(snapshot?.sensors ?? []), ...(snapshot?.occurrences ?? [])]
      .map((item) => item.neighborhood)
      .filter(Boolean)
    return [...new Set(names)].sort()
  }, [snapshot])

  const neighborhoodPositions = useMemo(() => {
    const groups = new Map()
    ;[...(snapshot?.sensors ?? []), ...(snapshot?.occurrences ?? [])].forEach((item) => {
      if (!item.neighborhood || !item.position) return
      const current = groups.get(item.neighborhood) ?? []
      current.push(item)
      groups.set(item.neighborhood, current)
    })
    return new Map(
      [...groups.entries()].map(([neighborhood, items]) => [neighborhood, averagePosition(items)]),
    )
  }, [snapshot])

  const update = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((current) => ({ ...current, [field]: value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const address = form.address.trim()
    const neighborhood = form.neighborhood.trim()
    const description = form.description.trim()
    const position = neighborhoodPositions.get(neighborhood) ?? {
      lat: territory.center[0],
      lng: territory.center[1],
    }
    const payload = {
      title: `${occurrenceTypeMeta[form.type]?.label ?? 'Ocorrência'} em ${address}`.slice(0, 140),
      type: form.type,
      status: 'open',
      severity: form.severity,
      address,
      neighborhood,
      description,
      lat: String(position.lat),
      lng: String(position.lng),
      reportedAt: toDateTimeLocal(new Date()),
      recurrenceCount: 1,
      sensorId: '',
      affectedPeopleEstimate: 0,
      reporter: 'Canal do cidadão (demonstração)',
    }

    const nextErrors = validateOccurrence(payload)
    if (address.length < 3) nextErrors.address = 'Informe uma rua, número ou ponto de referência.'
    if (neighborhood.length < 2) nextErrors.neighborhood = 'Informe o bairro do ponto observado.'
    if (!form.consent) {
      nextErrors.consent = 'Confirme que entendeu as limitações deste canal demonstrativo.'
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setBusy(true)
    try {
      const record = await actions.createOccurrence(payload)
      setSuccess(record)
      setForm(emptyForm())
      setErrors({})
    } catch (error) {
      if (error?.fieldErrors) setErrors(error.fieldErrors)
    } finally {
      setBusy(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-success/30 bg-success/[0.06] p-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl border border-success/30 bg-success/10 text-success">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="mt-3 text-xl font-semibold tracking-tight text-mist">Registro recebido</h1>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
            A ocorrência demonstrativa foi criada e já aparece no mapa do cidadão e na visão do gestor deste navegador.
          </p>
          <div className="mt-4 rounded-xl border border-line bg-navy-950/50 p-3">
            <p className="eyebrow text-[9px]">Protocolo demonstrativo</p>
            <p className="mt-1 font-mono text-lg font-semibold text-cyan-300">{success.id}</p>
            <p className="mt-1 text-[10px] leading-relaxed text-muted">
              Guarde este número para acompanhar o registro. Ele é local ao navegador e não é um protocolo oficial.
            </p>
          </div>
          <dl className="mt-3 space-y-2 text-[11px]">
            <div className="flex items-start justify-between gap-3 border-b border-line pb-2">
              <dt className="text-muted">Situação</dt>
              <dd className="text-right text-ink">{success.title}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-line pb-2">
              <dt className="text-muted">Classificação</dt>
              <dd><SeverityBadge severity={success.severity} size="xs" /></dd>
            </div>
            <div className="flex items-start justify-between gap-3 border-b border-line pb-2">
              <dt className="text-muted">Local</dt>
              <dd className="text-right text-ink">{success.address}, {success.neighborhood}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">Tipo</dt>
              <dd className="text-ink">{occurrenceTypeMeta[success.type]?.label ?? success.type}</dd>
            </div>
          </dl>
        </div>

        <InfoNotice variant="warning" title="Este canal não aciona equipes">
          O PLUVSTATS é um protótipo acadêmico com dados simulados. Nenhuma equipe da prefeitura é notificada e nenhum
          atendimento é aberto. Em caso de risco imediato, procure um local seguro e ligue para os canais oficiais de
          emergência.
        </InfoNotice>

        <div className="grid gap-2">
          <Link to={`/cidadao/mapa?selected=${encodeURIComponent(success.id)}`} className={buttonClass({ className: 'w-full' })}>
            Ver no mapa
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Button
            variant="secondary"
            onClick={() => {
              setSuccess(null)
              setForm(emptyForm())
            }}
          >
            Registrar outra ocorrência
          </Button>
          <Link to="/cidadao" className={buttonClass({ variant: 'ghost', className: 'w-full' })}>
            Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

  const errorCount = Object.values(errors).filter(Boolean).length

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <header>
        <p className="eyebrow text-cyan-300">Canal do cidadão</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-mist">Registrar ocorrência</h1>
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
          Descreva o ponto de drenagem que você observou em {territory.name}. Não inclua nomes, documentos, telefones
          ou outros dados pessoais.
        </p>
      </header>

      <InfoNotice variant="critical" title="Não é um canal de emergência">
        Se houver risco imediato à vida, saia da área alagada e acione os canais oficiais do seu município. Este
        formulário é apenas uma demonstração acadêmica.
      </InfoNotice>

      {errorCount > 0 ? (
        <div
          className="flex items-start gap-2 rounded-xl border border-critical/30 bg-critical/[0.06] px-3 py-2 text-[11px] text-critical"
          role="alert"
        >
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Revise {errorCount} campo(s) destacado(s) antes de enviar.
        </div>
      ) : null}

      <Card>
        <CardHeader icon={Waves} title="O que você observou?" description="Escolha a opção mais próxima da situação." />
        <CardBody className="p-4 pt-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label="Tipo de ocorrência">
            {TYPE_OPTIONS.map((option) => {
              const active = form.type === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setForm((current) => ({ ...current, type: option.value }))
                    if (errors.type) setErrors((current) => ({ ...current, type: undefined }))
                  }}
                  className={cn(
                    'rounded-xl border p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40',
                    active
                      ? 'border-cyan/45 bg-cyan/10 text-ink'
                      : 'border-line bg-navy-950/40 text-muted hover:border-cyan/25 hover:text-ink',
                  )}
                >
                  <option.icon className={cn('h-4 w-4', active ? 'text-cyan-300' : 'text-muted')} aria-hidden="true" />
                  <span className="mt-2 block text-[11px] font-medium">{option.label}</span>
                  <span className="mt-0.5 block text-[9px] leading-snug text-muted">{option.hint}</span>
                </button>
              )
            })}
          </div>
          {errors.type ? <p className="mt-2 text-[11px] text-critical" role="alert">{errors.type}</p> : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon={MapPin} title="Onde está o ponto?" description="Use um endereço de referência. Não informe dados pessoais." />
        <CardBody className="space-y-4 p-4 pt-3">
          <Input
            label="Endereço ou ponto de referência"
            required
            value={form.address}
            onChange={update('address')}
            error={errors.address}
            placeholder="Ex.: Rua Oratório, perto do córrego"
          />
          <div>
            <Input
              label="Bairro"
              required
              list="citizen-neighborhoods"
              value={form.neighborhood}
              onChange={update('neighborhood')}
              error={errors.neighborhood}
              placeholder="Digite ou selecione o bairro"
              autoComplete="off"
            />
            <datalist id="citizen-neighborhoods">
              {knownNeighborhoods.map((neighborhood) => (
                <option key={neighborhood} value={neighborhood} />
              ))}
            </datalist>
          </div>
          <p className="text-[9px] leading-relaxed text-muted">
            A posição no mapa é aproximada a partir do bairro informado. Este protótipo não solicita sua localização
            exata.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon={ShieldAlert} title="Como está a situação?" description="A classificação é experimental e não substitui uma vistoria." />
        <CardBody className="space-y-2 p-4 pt-3">
          {URGENCY_OPTIONS.map((option) => {
            const active = form.severity === option.value
            const meta = severityMeta[option.value]
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setForm((current) => ({ ...current, severity: option.value }))
                  if (errors.severity) setErrors((current) => ({ ...current, severity: undefined }))
                }}
                className={cn(
                  'flex w-full items-start justify-between gap-3 rounded-xl border p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40',
                  active ? cn(meta.border, meta.bg) : 'border-line bg-navy-950/40 hover:border-cyan/25',
                )}
              >
                <span className="min-w-0">
                  <span className={cn('block text-[11px] font-medium', active ? meta.text : 'text-ink')}>{option.title}</span>
                  <span className="mt-0.5 block text-[10px] leading-relaxed text-muted">{option.description}</span>
                </span>
                <span className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', meta.dot)} aria-hidden="true" />
              </button>
            )
          })}
          {form.severity === 'critical' ? (
            <div className="rounded-xl border border-critical/30 bg-critical/[0.06] p-3 text-[10px] leading-relaxed text-muted">
              <span className="font-medium text-critical">Risco imediato:</span> não se aproxime da água e acione os
              canais oficiais de emergência antes de concluir este registro.
            </div>
          ) : null}
          {errors.severity ? <p className="text-[11px] text-critical" role="alert">{errors.severity}</p> : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon={Droplets} title="Descreva o que você viu" description="Detalhes ajudam a tornar a demonstração mais realista." />
        <CardBody className="space-y-3 p-4 pt-3">
          <Textarea
            label="Descrição"
            required
            rows={4}
            value={form.description}
            onChange={update('description')}
            error={errors.description}
            hint={`${form.description.length}/800 caracteres · mínimo de 20`}
            placeholder="Ex.: água acumulada na esquina após a chuva, cobrindo a faixa de pedestres."
            maxLength={800}
          />
        </CardBody>
      </Card>

      <div className="rounded-xl border border-line bg-navy-950/40 p-3">
        <label className="flex items-start gap-3 text-[10px] leading-relaxed text-muted">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={update('consent')}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-line bg-navy-950 text-cyan focus:ring-cyan/40"
            aria-invalid={Boolean(errors.consent)}
          />
          <span>
            Entendo que este é um protótipo acadêmico com dados simulados, que não substitui os canais oficiais e que
            meu registro não aciona equipes de atendimento.
          </span>
        </label>
        {errors.consent ? <p className="mt-1.5 text-[11px] text-critical" role="alert">{errors.consent}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <Button type="submit" icon={Send} loading={busy} className="w-full">
          Enviar registro demonstrativo
        </Button>
        <Link to="/cidadao" className={buttonClass({ variant: 'ghost', className: 'w-full' })}>
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Cancelar e voltar
        </Link>
      </div>

      <p className="pb-2 text-center text-[9px] leading-relaxed text-muted">
        Nenhum dado pessoal é solicitado ou armazenado. O registro fica apenas neste navegador.
      </p>
    </form>
  )
}
