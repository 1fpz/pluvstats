import { cn } from '@/utils/cn'

export function EmptyState({ icon: Icon, title, description, action, className, compact = false }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 text-center', compact ? 'py-7' : 'py-12', className)}>
      {Icon ? (
        <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg border border-line bg-white/[0.03] text-muted">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      ) : null}
      <h3 className="text-[13px] font-semibold text-ink">{title}</h3>
      {description ? <p className="mt-1.5 max-w-sm text-[11.5px] leading-relaxed text-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
