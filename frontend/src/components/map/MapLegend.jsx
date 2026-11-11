import { severityMeta } from '@/utils/severity'

export function MapLegend({ className = '' }) {
  return (
    <div className={`rounded-lg border border-white/10 bg-[#0B0D10]/85 px-3 py-2.5 backdrop-blur-md ${className}`}>
      <p className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-muted">Legenda</p>
      <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
        {['critical', 'alert', 'attention', 'normal'].map((severity) => (
          <li key={severity} className="flex items-center gap-1.5 text-[10px] text-muted">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: severityMeta[severity].hex }}
              aria-hidden="true"
            />
            {severityMeta[severity].label}
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-center gap-3 border-t border-white/10 pt-2 text-[9.5px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full border border-cyan-300/70 bg-cyan-300/15" aria-hidden="true" />
          Sensor
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-[2px] border border-muted/70 bg-muted/15" aria-hidden="true" />
          Ocorrência
        </span>
      </div>
    </div>
  )
}
