import { NextResponse } from 'next/server'
import { isGisConfigured, liveGeocode } from '@/lib/server/gis-mcp'
import { parseAddress } from '@/lib/server/validate'

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { address?: unknown } | null
  const address = parseAddress(body?.address)
  if (!address) return NextResponse.json({ status: 'invalid' }, { status: 400 })

  if (!isGisConfigured()) return NextResponse.json({ status: 'not-configured' }, { status: 503 })

  try {
    return NextResponse.json(await liveGeocode(address))
  } catch (error) {
    console.error('[glendale-ready] geocode failed:', (error as Error).message)
    return NextResponse.json({ status: 'unavailable' }, { status: 503 })
  }
}
