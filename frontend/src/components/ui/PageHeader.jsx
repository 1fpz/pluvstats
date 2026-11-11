import { cn } from '@/utils/cn'

export function PageHeader({ eyebrow, title, description, actions, meta, className }) {
  return (
    <header
      className={cn(
        'flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-end lg:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="mt-1.5 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-mist sm:text-[30px]">
          {title}
        </h1>
        {description ? <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted">{description}</p> : null}
        {meta ? <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}
