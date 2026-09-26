import { intlTag } from '@/lib/i18n'
import type { Locale } from '@/lib/types'

const tag = (locale: Locale) => intlTag[locale]

export function formatMiles(meters: number, locale: Locale) {
  const miles = meters / 1609.344
  return `${new Intl.NumberFormat(tag(locale), { maximumFractionDigits: miles < 10 ? 1 : 0 }).format(miles)} mi`
}

export const formatKm = (km: number, locale: Locale) => formatMiles(km * 1000, locale)

export function formatWhen(iso: string | undefined, locale: Locale) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat(tag(locale), { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}

export function formatDate(iso: string | undefined, locale: Locale) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat(tag(locale), { dateStyle: 'medium' }).format(d)
}

export const formatNumber = (n: number, locale: Locale) => new Intl.NumberFormat(tag(locale)).format(n)
