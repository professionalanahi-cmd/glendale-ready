'use client'

import { Check } from 'lucide-react'
import { useId } from 'react'
import { inputClass } from '@/lib/ui'
import { cn } from '@/lib/utils'

interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  hint?: string
  error?: string
  trailing?: React.ReactNode
}

export function TextField({ label, hint, error, trailing, className, ...props }: TextFieldProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="font-bold">
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
      <div className="relative flex items-center">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
          className={cn(inputClass, trailing ? 'pr-28' : undefined)}
          {...props}
        />
        {trailing ? <div className="absolute right-2">{trailing}</div> : null}
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-sm font-bold text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/** Large tappable card for radio or checkbox choices */
export function ChoiceCard({
  type,
  name,
  checked,
  onChange,
  label,
  description,
}: {
  type: 'radio' | 'checkbox'
  name: string
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
}) {
  return (
    <label
      className={cn(
        'flex min-h-14 cursor-pointer items-center gap-4 rounded-2xl border-2 bg-card px-4 py-3 transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-ring has-[:focus-visible]:outline-offset-2',
        checked ? 'border-primary bg-primary-soft' : 'border-border hover:border-input',
      )}
    >
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          'flex size-6 shrink-0 items-center justify-center border-2',
          type === 'radio' ? 'rounded-full' : 'rounded-md',
          checked ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-card',
        )}
      >
        {checked ? <Check className="size-4" strokeWidth={3} /> : null}
      </span>
      <span className="flex flex-col">
        <span className="font-bold">{label}</span>
        {description ? <span className="text-sm text-muted-foreground">{description}</span> : null}
      </span>
    </label>
  )
}

export function Fieldset({
  legend,
  help,
  error,
  children,
  className,
}: {
  legend: string
  help?: string
  error?: string
  children: React.ReactNode
  className?: string
}) {
  const id = useId()
  return (
    <fieldset
      className={cn('flex flex-col gap-3', className)}
      aria-describedby={[help ? `${id}-help` : '', error ? `${id}-err` : ''].filter(Boolean).join(' ') || undefined}
    >
      <legend className="mb-1 font-heading text-2xl font-extrabold text-balance">{legend}</legend>
      {help ? (
        <p id={`${id}-help`} className="-mt-1 text-pretty text-muted-foreground">
          {help}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-err`} role="alert" className="font-bold text-destructive">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}
