import { Link } from 'react-router-dom'
import { ArrowLeft, Construction, ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { InfoNotice } from '@/components/ui/InfoNotice'
import { buttonClass } from '@/components/ui/Button'

export function ComingSoonPage({ eyebrow = 'Próxima entrega', title, description, note }) {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <Card className="p-8">
        <div className="mx-auto flex max-w-lg flex-col items-center text-center">
          <div className="grid h-12 w-12 place-items-center rounded-lg border border-line bg-white/[0.04] text-muted">
            <Construction className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-[15px] font-semibold text-mist">Módulo em implementação</h2>
          <p className="mt-2 max-w-sm text-[12px] leading-relaxed text-muted">
            {note ??
              'Esta página faz parte do plano de fases e será entregue com dados conectados, estados completos e testes.'}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Link to="/" className={buttonClass({ variant: 'secondary' })}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Voltar à visão geral
            </Link>
            <Link to="/diagnostico" className={buttonClass({ variant: 'ghost' })}>
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Ver diagnóstico
            </Link>
          </div>
        </div>
      </Card>
      <InfoNotice variant="warning" title="Transparência de escopo">
        Nenhuma funcionalidade é marcada como concluída sem evidência de funcionamento. Consulte o README e a
        documentação de fases para o estado exato da entrega.
      </InfoNotice>
    </div>
  )
}

export function NotFoundPage() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Card className="w-full max-w-md p-8 text-center">
        <p className="text-[36px] font-semibold tracking-[-0.03em] tabular-nums text-muted">404</p>
        <h1 className="mt-3 text-[18px] font-semibold text-mist">Página não encontrada</h1>
        <p className="mt-2 text-[12px] leading-relaxed text-muted">
          O endereço informado não existe neste protótipo. Volte para a visão geral ou para a área do cidadão.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link to="/" className={buttonClass({ variant: 'secondary' })}>
            Visão geral
          </Link>
          <Link to="/cidadao" className={buttonClass()}>
            Área do cidadão
          </Link>
        </div>
      </Card>
    </div>
  )
}
