import { NextResponse } from 'next/server'
import { buildHazardProfile } from '@/lib/hazards/meta'
import { demoHazardsAt } from '@/lib/server/demo-gis'
import { isGisConfigured, liveHazardsAt } from '@/lib/server/gis-mcp'
import { parseCoords, type Coords } from '@/lib/server/validate'
import type { LocationHazardResult } from '@/lib/types'

async function lookup(coords: Coords | null): Promise<LocationHazardResult | null> {
  if (!coords) return null
  if (!isGisConfigured()) return demoHazardsAt(coords.lat, coords.lon)
  try {
    return await liveHazardsAt(coords)
  } catch (error) {
    console.error('[glendale-ready] hazard lookup failed', error)
    // Never fall back to demo data here: a missing source must not look like "not in zone".
    return { mode: 'live', status: 'unavailable', findings: [], message: 'service-unavailable', fetchedAt: new Date().toISOString() }
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { home?: unknown; current?: unknown } | null
  const home = parseCoords(body?.home)
  const current = parseCoords(body?.current)
  if (!home && !current) return NextResponse.json({ error: 'A valid location is required.' }, { status: 400 })

  const sameSpot = home && current && Math.abs(home.lat - current.lat) < 1e-5 && Math.abs(home.lon - current.lon) < 1e-5
  const homeResult = await lookup(home)
  const currentResult = sameSpot ? homeResult : await lookup(current)
  return NextResponse.json(buildHazardProfile(homeResult, currentResult))
}
