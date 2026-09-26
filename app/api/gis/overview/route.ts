import { NextResponse } from 'next/server'
import type { GisOverview } from '@/lib/gis/types'
import { gisOverview, isGisConfigured } from '@/lib/server/gis-mcp'
import { parseCoords } from '@/lib/server/validate'

export async function POST(request: Request) {
  const coords = parseCoords(await request.json().catch(() => null))
  if (!coords) return NextResponse.json({ error: 'invalid-location' }, { status: 400 })

  const empty = (status: GisOverview['status']): GisOverview => ({
    status,
    location: { ...coords, inCity: null },
    context: [],
    findings: [],
    resources: [],
    zones: [],
    failed: [],
    retrievedAt: new Date().toISOString(),
  })

  if (!isGisConfigured()) return NextResponse.json(empty('not-configured'))

  try {
    return NextResponse.json(await gisOverview(coords.lat, coords.lon), {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    console.error('[glendale-ready] GIS overview failed:', (error as Error).message)
    return NextResponse.json(empty('unavailable'))
  }
}
