'use client'

import useSWR from 'swr'
import type { GeoPoint, HazardProfile, ResourceResult, UserProfile } from '@/lib/types'

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json() as Promise<T>
}

const coords = (p: GeoPoint | null | undefined) => (p ? { lat: p.lat, lon: p.lon } : null)

export function useHazards(profile: UserProfile | null) {
  const home = coords(profile?.home)
  const current = coords(profile?.current)
  const key = home || current ? ['hazards', home?.lat, home?.lon, current?.lat, current?.lon] : null
  return useSWR<HazardProfile>(key, () => postJson('/api/hazards', { home, current }), {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  })
}

export function useResources(point: GeoPoint | null | undefined) {
  const key = point ? ['resources', point.lat, point.lon] : null
  return useSWR<ResourceResult>(key, () => postJson('/api/resources', { lat: point!.lat, lon: point!.lon }), {
    revalidateOnFocus: false,
  })
}

export type GeocodeResponse =
  | { status: 'ok'; lat: number; lon: number; address: string; isEstimate?: boolean }
  | { status: 'ambiguous' | 'not-found' | 'outside-city' | 'invalid' | 'unavailable' }

export async function geocodeAddress(address: string): Promise<GeocodeResponse> {
  const res = await fetch('/api/geocode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address }),
  })
  return (await res.json().catch(() => ({ status: 'unavailable' }))) as GeocodeResponse
}
