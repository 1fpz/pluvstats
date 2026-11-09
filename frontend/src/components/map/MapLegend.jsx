import { severityMeta } from '@/utils/severity'

export function MapLegend({ className = '' }) {
  return (
    <div className={`rounded-xl border border-line bg-navy-950/85 px-3 py-2.5 backdrop-blur-md ${className}`}>
      <p className="eyebrow mb-2 text-[9px]">Legenda</p>
      <ul className="space-y-1.5">
        {['critical', 'alert', 'attention', 'normal'].map((severity) => (
          <li key={severity} className="flex items-center gap-2 text-[10px] text-muted">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: severityMeta[severity].hex }}
              aria-hidden="true"
            />
            {severityMeta[severity].label}
          </li>
        ))}
      </ul>
      <div className="mt-2.5 border-t border-line pt-2 text-[9px] leading-relaxed text-muted">
        <p className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full border border-cyan bg-cyan/30" aria-hidden="true" />
          Sensor simulado
        </p>
        <p className="mt-1 flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rotate-45 rounded-[2px] border border-muted bg-muted/30" aria-hidden="true" />
          Ocorrência demonstrativa
        </p>
      </div>
    </div>
  )
}
