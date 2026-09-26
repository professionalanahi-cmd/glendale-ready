'use client'

import { Home, Loader2, LocateFixed, MapPin, Search } from 'lucide-react'
import { useState } from 'react'
import { TextField } from '@/components/common/fields'
import { useT } from '@/components/providers/preferences-provider'
import { geocodeAddress } from '@/lib/hooks'
import type { GeoPoint } from '@/lib/types'
import { btn } from '@/lib/ui'
import { cn } from '@/lib/utils'

type Status = { tone: 'info' | 'error'; key: string } | null

export function LocationPicker({
  value,
  onChange,
  homePoint,
  headingLevel = 'h3',
  title,
  help,
}: {
  value: GeoPoint | null
  onChange: (point: GeoPoint | null) => void
  /** When provided, offers a "Same as home" shortcut */
  homePoint?: GeoPoint | null
  headingLevel?: 'h2' | 'h3'
  title: string
  help?: string
}) {
  const t = useT()
  const [editing, setEditing] = useState(!value)
  const [address, setAddress] = useState('')
  const [addressError, setAddressError] = useState<string>()
  const [busy, setBusy] = useState<'device' | 'address' | null>(null)
  const [status, setStatus] = useState<Status>(null)
  const Heading = headingLevel

  function commit(point: GeoPoint) {
    onChange(point)
    setEditing(false)
    setStatus(null)
  }

  function useDevice() {
    setStatus(null)
    if (!('geolocation' in navigator)) {
      setStatus({ tone: 'error', key: 'location.unsupported' })
      return
    }
    setBusy('device')
    setStatus({ tone: 'info', key: 'location.locating' })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBusy(null)
        commit({
          label: t('location.deviceLabel'),
          lat: Number(pos.coords.latitude.toFixed(5)),
          lon: Number(pos.coords.longitude.toFixed(5)),
          method: 'device',
          updatedAt: new Date().toISOString(),
        })
      },
      (err) => {
        setBusy(null)
        setStatus({ tone: 'error', key: err.code === err.PERMISSION_DENIED ? 'location.denied' : 'location.unavailable' })
      },
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 300_000 },
    )
  }

  async function findAddress(e: React.FormEvent | React.MouseEvent) {
    e.preventDefault()
    setStatus(null)
    if (address.trim().length < 3) {
      setAddressError(t('location.addressError'))
      return
    }
    setAddressError(undefined)
    setBusy('address')
    const res = await geocodeAddress(address.trim())
    setBusy(null)
    if (res.status === 'ok') {
      commit({
        label: res.address,
        address: res.address,
        lat: res.lat,
        lon: res.lon,
        method: 'address',
        isEstimate: res.isEstimate,
        updatedAt: new Date().toISOString(),
      })
      setAddress('')
    } else if (res.status === 'ambiguous') {
      setStatus({ tone: 'error', key: 'location.ambiguous' })
    } else {
      setStatus({ tone: 'error', key: 'location.geocodeFailed' })
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Heading className="text-2xl font-extrabold">{title}</Heading>
        {help ? <p className="text-pretty text-muted-foreground">{help}</p> : null}
      </div>

      {value && !editing ? (
        <div className="flex flex-col gap-3 rounded-2xl border-2 border-primary bg-primary-soft p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-3">
            <MapPin aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary" />
            <span className="flex flex-col">
              <span className="text-sm font-bold text-primary">{t('location.set')}</span>
              <span className="font-bold">{value.label}</span>
              {value.isEstimate ? <span className="text-sm text-muted-foreground">{t('location.estimate')}</span> : null}
            </span>
          </p>
          <button type="button" className={btn.outline} onClick={() => setEditing(true)}>
            {t('location.change')}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button type="button" className={btn.primary} onClick={useDevice} disabled={busy !== null}>
              {busy === 'device' ? <Loader2 aria-hidden="true" className="animate-spin" /> : <LocateFixed aria-hidden="true" />}
              {t('location.useMyLocation')}
            </button>
            {homePoint ? (
              <button
                type="button"
                className={btn.outline}
                disabled={busy !== null}
                onClick={() => commit({ ...homePoint, method: 'home', updatedAt: new Date().toISOString() })}
              >
                <Home aria-hidden="true" />
                {t('location.sameAsHome')}
              </button>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 rounded-2xl bg-muted/60 p-4">
            <TextField
              label={t('location.addressLabel')}
              placeholder={t('location.addressPlaceholder')}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter' || e.nativeEvent.isComposing || e.keyCode === 229) return
                findAddress(e as unknown as React.FormEvent)
              }}
              error={addressError}
              autoComplete="street-address"
            />
            <button type="button" className={cn(btn.outline, 'sm:w-fit')} onClick={findAddress} disabled={busy !== null}>
              {busy === 'address' ? <Loader2 aria-hidden="true" className="animate-spin" /> : <Search aria-hidden="true" />}
              {t('location.findAddress')}
            </button>
          </div>

          {value ? (
            <button type="button" className={cn(btn.ghost, 'sm:w-fit')} onClick={() => setEditing(false)}>
              {t('common.cancel')}
            </button>
          ) : null}
        </div>
      )}

      <div aria-live="polite">
        {status ? (
          <p
            role={status.tone === 'error' ? 'alert' : undefined}
            className={cn(
              'rounded-2xl p-4 font-bold',
              status.tone === 'error' ? 'bg-coral-soft text-destructive' : 'bg-muted text-foreground',
            )}
          >
            {t(status.key)}
          </p>
        ) : null}
      </div>
    </section>
  )
}
