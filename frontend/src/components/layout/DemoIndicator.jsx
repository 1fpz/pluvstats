import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

/**
 * Discreet, always-visible provenance marker.
 *
 * The large simulation banner was removed for the final visual pass, but the
 * environment must never look like real hardware or official city data. This
 * indicator keeps the disclosure honest without interrupting the layout.
 */
export function DemoIndicator({ compact = false, className }) {
  return (
    <Link
      to="/diagnostico"
      title="Ambiente demonstrativo: leituras, ocorrências e alertas simulados. Nenhum sensor físico validado."
      aria-label="Ambiente demonstrativo com dados simulados. Abrir diagnóstico."
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-md border border-line bg-white/[0.025] px-2 py-1 text-[11px] font-medium text-muted transition hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-ink',
        className,
      )}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning" aria-hidden="true" />
      {compact ? (
        <>
          <span className="hidden sm:inline">Demonstração</span>
          <span className="sm:hidden">Demo</span>
        </>
      ) : (
        'Demonstração'
      )}
    </Link>
  )
}
