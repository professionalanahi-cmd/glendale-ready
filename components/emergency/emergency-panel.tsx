'use client'

import { MapPinOff, RotateCw } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useMemo, useState, useSyncExternalStore } from 'react'
import { InfoNote } from '@/components/common/bits'
import { usePreferences } from '@/components/providers/preferences-provider'
import type { GisFinding, GisResourceGroup } from '@/lib/gis/types'
import { useGisOverview, useLiveEmergency } from '@/lib/hooks'
import type { UserProfile } from '@/lib/types'
import { btn, card } from '@/lib/ui'
import { cn } from '@/lib/utils'
import { formatMiles } from './format'
import type { MapPalette } from './gis-map'
import { LiveFeeds } from './live-feeds'
import { ProvenanceLine } from './provenance'

const GisMap = dynamic(() => import('./gis-map'), {
  ssr: false,
  loading: () => <div aria-hidden="true" className="size-full animate-pulse bg-muted motion-reduce:animate-none" />,
})

const EMERGENCY_KINDS = ['fire_stations', 'police_stations', 'hospitals'] as const

const subscribeNoop = () => () => {}

/** Leaflet draws SVG attributes, which cannot read CSS variables, so resolve the theme tokens once. */
function usePalette(): MapPalette | null {
  const ready = useSyncExternalStore(subscribeNoop, () => true, () => false)
  return useMemo(() => {
    if (!ready) return null
    const s = getComputedStyle(document.documentElement)
    const v = (name: string) => s.getPropertyValue(name).trim()
    return {
      you: v('--primary'),
      facility: v('--ink'),
      quake: v('--sun'),
      fire: v('--coral'),
      zone: {
        earthquake: v('--sun'),
        wildfire: v('--coral'),
        flood: v('--primary'),
        'dam-inundation': v('--primary'),
        'debris-flow': v('--coral'),
      },
    }
  }, [ready])
}

function StatusPill({ status }: { status: GisFinding['status'] }) {
  const { t } = usePreferences()
  const styles = {
    in_zone: 'bg-coral text-primary-foreground',
    not_in_zone: 'bg-primary-soft text-foreground',
    unavailable: 'bg-muted text-muted-foreground',
  }[status]
  const label = {
    in_zone: t('emergency.inZone'),
    not_in_zone: t('emergency.notInZone'),
    unavailable: t('emergency.unavailable'),
  }[status]
  return <span className={cn('shrink-0 rounded-full px-3 py-1 text-sm font-bold', styles)}>{label}</span>
}

function Findings({ findings }: { findings: GisFinding[] }) {
  const { t, locale } = usePreferences()
  return (
    <ul className="flex flex-col divide-y divide-border">
      {findings.map((f) => (
        <li key={f.datasetId} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
          <div className="flex items-start justify-between gap-3">
            <p className="font-bold">{f.title}</p>
            <StatusPill status={f.status} />
          </div>
          {f.status === 'in_zone' && f.zoneLabel && f.zoneLabel !== f.title ? (
            <p className="leading-relaxed">{f.zoneLabel}</p>
          ) : null}
          {f.status === 'in_zone' && f.sourceClass && f.sourceClass !== f.zoneLabel ? (
            <p className="text-sm text-muted-foreground">{t('emergency.sourceClass', { value: f.sourceClass })}</p>
          ) : null}
          {f.status === 'not_in_zone' && f.nearestDistanceM !== undefined ? (
            <p className="text-sm text-muted-foreground">
              {t('emergency.nearest', { distance: formatMiles(f.nearestDistanceM, locale) })}
            </p>
          ) : null}
          <ProvenanceLine {...f.provenance} />
        </li>
      ))}
    </ul>
  )
}

function Services({ groups }: { groups: GisResourceGroup[] }) {
  const { t, locale } = usePreferences()
  const shown = groups.filter((g) => (EMERGENCY_KINDS as readonly string[]).includes(g.kind))
  if (!shown.length) return null
  return (
    <section aria-labelledby="services" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 id="services" className="font-heading text-xl font-extrabold">
          {t('emergency.servicesTitle')}
        </h3>
        <p className="leading-relaxed text-muted-foreground">{t('emergency.servicesNote')}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {shown.map((g) => (
          <article key={g.kind} className={cn(card, 'flex flex-col gap-3 p-5')}>
            <h4 className="font-heading text-lg font-extrabold">{t(`emergency.kinds.${g.kind}`)}</h4>
            {g.status === 'unavailable' ? (
              <p>{t('emergency.unavailable')}</p>
            ) : g.items.length ? (
              <ul className="flex flex-col gap-2">
                {g.items.slice(0, 3).map((r) => (
                  <li key={r.id} className="flex items-start justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="font-bold">{r.name}</span>
                      {r.address ? <span className="text-sm text-muted-foreground">{r.address}</span> : null}
                    </div>
                    {r.distanceMeters !== undefined ? (
                      <span className="shrink-0 text-sm font-bold">{formatMiles(r.distanceMeters, locale)}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">{t('emergency.noServices')}</p>
            )}
            <ProvenanceLine className="mt-auto" {...g.provenance} />
          </article>
        ))}
      </div>
    </section>
  )
}

function Legend({ palette }: { palette: MapPalette }) {
  const { t } = usePreferences()
  const items = [
    { color: palette.you, label: t('emergency.legend.you') },
    { color: palette.zone.wildfire, label: t('emergency.legend.zone'), square: true },
    { color: palette.facility, label: t('emergency.legend.facility') },
    { color: palette.quake, label: t('emergency.legend.quake') },
    { color: palette.fire, label: t('emergency.legend.fire') },
  ]
  return (
    <ul aria-hidden="true" className="flex flex-wrap gap-x-4 gap-y-1 px-4 py-3 text-sm">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-2">
          <span className={cn('size-3', i.square ? 'rounded-sm' : 'rounded-full')} style={{ backgroundColor: i.color }} />
          {i.label}
        </li>
      ))}
    </ul>
  )
}

export function EmergencyPanel({ profile }: { profile: UserProfile }) {
  const { t } = usePreferences()
  const options = [
    profile.home ? { id: 'home' as const, point: profile.home, label: t('emergency.home') } : null,
    profile.current ? { id: 'current' as const, point: profile.current, label: t('emergency.current') } : null,
  ].filter((o) => o !== null)
  const [selected, setSelected] = useState<'home' | 'current'>(options[0]?.id ?? 'home')
  const active = options.find((o) => o.id === selected) ?? options[0]
  const point = active?.point

  const overview = useGisOverview(point)
  const live = useLiveEmergency(point)
  const palette = usePalette()
  const data = overview.data

  if (!point) {
    return (
      <div className={cn(card, 'flex flex-col items-start gap-4 p-6')}>
        <MapPinOff aria-hidden="true" className="size-8 text-primary" />
        <p className="text-lg">{t('emergency.needLocation')}</p>
        <Link href="/settings/profile?section=location" className={btn.primary}>
          {t('preparedness.editLocations')}
        </Link>
      </div>
    )
  }

  const notice =
    overview.error || data?.status === 'unavailable'
      ? t('emergency.unavailableMsg')
      : data?.status === 'not-configured'
        ? t('emergency.notConfigured')
        : data?.status === 'outside-city'
          ? t('emergency.outside')
          : data?.status === 'partial'
            ? t('emergency.partial')
            : null

  return (
    <section aria-labelledby="emergency-map" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="emergency-map" className="font-heading text-2xl font-extrabold sm:text-3xl">
            {t('emergency.title')}
          </h2>
          <p className="max-w-2xl leading-relaxed text-muted-foreground">{t('emergency.help')}</p>
        </div>
        {options.length > 1 ? (
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">{t('emergency.viewing')}</legend>
            <div className="flex rounded-full bg-muted p-1">
              {options.map((o) => (
                <label
                  key={o.id}
                  className={cn(
                    'inline-flex min-h-11 cursor-pointer items-center rounded-full px-4 font-bold has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                    selected === o.id ? 'bg-card shadow-sm' : 'text-muted-foreground',
                  )}
                >
                  <input
                    type="radio"
                    name="emergency-location"
                    value={o.id}
                    checked={selected === o.id}
                    onChange={() => setSelected(o.id)}
                    className="sr-only"
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}
      </div>

      {notice ? (
        <div className="flex flex-wrap items-center gap-3">
          <InfoNote className="flex-1">{notice}</InfoNote>
          {overview.error || data?.status === 'unavailable' ? (
            <button type="button" className={btn.outline} onClick={() => overview.mutate()}>
              <RotateCw aria-hidden="true" />
              {t('common.retry')}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className={cn(card, 'flex flex-col overflow-hidden lg:col-span-3 lg:self-start')}>
          <div role="region" aria-label={t('emergency.mapLabel', { place: point.label })} className="relative z-0 h-80 lg:h-[28rem]">
            {palette ? (
              <GisMap
                center={point}
                zones={data?.zones ?? []}
                facilities={(data?.resources ?? [])
                  .filter((g) => (EMERGENCY_KINDS as readonly string[]).includes(g.kind))
                  .flatMap((g) => g.items.slice(0, 3))}
                quakes={live.data?.earthquakes.items ?? []}
                fires={live.data?.fires.items ?? []}
                palette={palette}
                labels={{ you: t('emergency.you') }}
              />
            ) : null}
          </div>
          {palette ? <Legend palette={palette} /> : null}
        </div>

        <div className={cn(card, 'flex flex-col gap-5 p-5 lg:col-span-2')}>
          <div className="flex flex-col gap-1">
            <h3 className="font-heading text-xl font-extrabold">{t('emergency.atLocation')}</h3>
            <p className="text-muted-foreground">{point.label}</p>
          </div>
          {overview.isLoading ? (
            <div role="status" className="flex flex-col gap-3">
              <span className="sr-only">{t('common.loading')}</span>
              {[0, 1, 2].map((i) => (
                <div key={i} aria-hidden="true" className="h-12 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />
              ))}
            </div>
          ) : (
            <>
              {data?.context.length ? (
                <dl className="grid grid-cols-2 gap-3">
                  {data.context.map((c) => (
                    <div key={c.key} className="flex flex-col rounded-2xl bg-muted p-3">
                      <dt className="text-sm text-muted-foreground">{t(`emergency.context.${c.key}`)}</dt>
                      <dd className="font-bold">{c.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {data?.findings.length ? (
                <div className="flex flex-col gap-3">
                  <h4 className="font-heading text-lg font-extrabold">{t('emergency.zonesTitle')}</h4>
                  <Findings findings={data.findings} />
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <LiveFeeds data={live.data} />
      {data?.resources.length ? <Services groups={data.resources} /> : null}
    </section>
  )
}
