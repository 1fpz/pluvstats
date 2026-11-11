import { cn } from '@/utils/cn'

export function Card({ children, className, interactive = false, as: Tag = 'section', ...props }) {
  return (
    <Tag className={cn(interactive ? 'panel-interactive' : 'panel', className)} {...props}>
      {children}
    </Tag>
  )
}

export function CardHeader({ children, title, description, actions, className, icon: Icon }) {
  return (
    <div className={cn('flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {Icon ? <Icon className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" /> : null}
          {typeof title === 'string' ? (
            <h2 className="truncate text-[13.5px] font-semibold text-mist">{title}</h2>
          ) : (
            title
          )}
        </div>
        {description ? <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p> : null}
        {children}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export function CardBody({ children, className, padded = true }) {
  return <div className={cn(padded && 'p-5', className)}>{children}</div>
}

export function CardFooter({ children, className }) {
  return <div className={cn('flex items-center justify-between gap-3 border-t border-line px-5 py-3', className)}>{children}</div>
}
