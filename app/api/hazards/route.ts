import { NextResponse } from 'next/server'
import { buildHazardProfile } from '@/lib/hazards/meta'
import { isGisConfigured, liveHazardsAt } from '@/lib/server/gis-mcp'
import { parseCoords, type Coords } from '@/lib/server/validate'
import type { LocationHazardResult } from '@/lib/types'

const unavailable = (message: string): LocationHazardResult => ({
  mode: 'live',
  status: 'unavailable',
  findings: [],
  message,
  fetchedAt: new Date().toISOString(),
})

async function lookup(coords: Coords | null): Promise<LocationHazardResult | null> {
  if (!coords) return null
  // No demo fallback: a missing source must never look like "not in a zone".
  if (!isGisConfigured()) return unavailable('not-configured')
  try {
    return await liveHazardsAt(coords)
  } catch (error) {
    console.error('[glendale-ready] hazard lookup failed:', (error as Error).message)
    return unavailable('service-unavailable')
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { home?: unknown; current?: unknown } | null
  const home = parseCoords(body?.home)
  const current = parseCoords(body?.current)
  if (!home && !current) return NextResponse.json({ error: 'A valid location is required.' }, { status: 400 })

  const sameSpot = home && current && Math.abs(home.lat - current.lat) < 1e-5 && Math.abs(home.lon - current.lon) < 1e-5
  const [homeResult, currentResult] = await Promise.all([lookup(home), sameSpot ? null : lookup(current)])
  return NextResponse.json(buildHazardProfile(homeResult, sameSpot ? homeResult : currentResult))
}
