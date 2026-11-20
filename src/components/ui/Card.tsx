import type { ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps {
  title?: string
  action?: ReactNode
  className?: string
  children: ReactNode
}

export default function Card({ title, action, className, children }: CardProps) {
  return (
    <section className={clsx('rounded-2xl border border-brand/30 bg-panel p-4', className)}>
      {(title || action) && (
        <header className="mb-3 flex items-center justify-between gap-2">
          {title && <h2 className="text-sm font-semibold text-title">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  )
}