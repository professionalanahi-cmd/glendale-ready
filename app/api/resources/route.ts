import { NextResponse } from 'next/server'
import { isGisConfigured, liveResources } from '@/lib/server/gis-mcp'
import { parseCoords } from '@/lib/server/validate'
import type { ResourceCategory, ResourceResult } from '@/lib/types'

/** Categories the Glendale GIS server does not cover yet */
const NOT_CONNECTED: ResourceCategory[] = [
  'urgent-care',
  'pharmacy',
  'shelter',
  'cooling-center',
  'supplies',
  'food',
  'veterinary',
]

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const coords = parseCoords(body)
  if (!coords) return NextResponse.json({ error: 'A valid location is required.' }, { status: 400 })

  const empty = (message: string): ResourceResult => ({
    mode: 'live',
    status: 'unavailable',
    resources: [],
    notConnected: NOT_CONNECTED,
    message,
  })

  if (!isGisConfigured()) return NextResponse.json(empty('not-configured'))

  try {
    const resources = await liveResources(coords.lat, coords.lon)
    const result: ResourceResult = { mode: 'live', status: 'ok', resources, notConnected: NOT_CONNECTED }
    return NextResponse.json(result)
  } catch (error) {
    console.error('[glendale-ready] resource lookup failed:', (error as Error).message)
    return NextResponse.json(empty('service-unavailable'))
  }
}
