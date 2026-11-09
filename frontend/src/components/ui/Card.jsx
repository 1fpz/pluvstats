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
          {Icon ? (
            <span className="grid h-7 w-7 place-items-center rounded-lg border border-cyan/20 bg-cyan/10 text-cyan-300">
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          ) : null}
          {typeof title === 'string' ? <h2 className="truncate text-sm font-semibold text-mist">{title}</h2> : title}
        </div>
        {description ? <p className="mt-1.5 text-xs leading-relaxed text-muted">{description}</p> : null}
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
  return <div className={cn('flex items-center justify-between gap-3 border-t border-line px-5 py-3.5', className)}>{children}</div>
}
