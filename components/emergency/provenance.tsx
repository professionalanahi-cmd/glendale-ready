'use client'

import { AlertTriangle } from 'lucide-react'
import { ExternalA } from '@/components/common/bits'
import { usePreferences } from '@/components/providers/preferences-provider'
import type { Provenance } from '@/lib/gis/types'
import { cn } from '@/lib/utils'
import { formatDate, formatWhen } from './format'

export function ProvenanceLine({
  agency,
  url,
  retrievedAt,
  sourceLastEdit,
  stale,
  className,
}: Pick<Provenance, 'agency' | 'url' | 'retrievedAt' | 'sourceLastEdit' | 'stale'> & { className?: string }) {
  const { t, locale } = usePreferences()
  const updated = formatDate(sourceLastEdit, locale)
  return (
    <p className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-relaxed text-muted-foreground', className)}>
      <span>{t('emergency.source', { agency })}</span>
      {updated ? (
        <>
          <span aria-hidden="true">·</span>
          <span>{t('emergency.sourceUpdated', { date: updated })}</span>
        </>
      ) : null}
      <span aria-hidden="true">·</span>
      <span>{t('emergency.retrieved', { time: formatWhen(retrievedAt, locale) })}</span>
      {stale ? (
        <span className="inline-flex items-center gap-1 font-bold text-destructive">
          <AlertTriangle aria-hidden="true" className="size-4" />
          {t('emergency.stale')}
        </span>
      ) : null}
      {url ? (
        <ExternalA href={url} className="font-bold text-primary underline underline-offset-4">
          {t('emergency.viewSource')}
        </ExternalA>
      ) : null}
    </p>
  )
}
