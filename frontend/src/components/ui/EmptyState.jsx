import { cn } from '@/utils/cn'

export function EmptyState({ icon: Icon, title, description, action, className, compact = false }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 text-center', compact ? 'py-8' : 'py-14', className)}>
      {Icon ? (
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-line bg-navy-800/70 text-muted">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      ) : null}
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {description ? <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
