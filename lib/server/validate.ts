import 'server-only'

export interface Coords {
  lat: number
  lon: number
}

/** Accepts coordinates in and around the Glendale area only. */
export function parseCoords(value: unknown): Coords | null {
  if (!value || typeof value !== 'object') return null
  const { lat, lon } = value as Record<string, unknown>
  if (typeof lat !== 'number' || typeof lon !== 'number') return null
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
  if (lat < 33.5 || lat > 34.8 || lon < -119 || lon > -117.5) return null
  return { lat, lon }
}

export function parseAddress(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim().replace(/\s+/g, ' ')
  return trimmed.length >= 3 && trimmed.length <= 200 ? trimmed : null
}
