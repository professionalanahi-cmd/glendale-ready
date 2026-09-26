import { NextResponse } from 'next/server'
import { liveEmergency } from '@/lib/server/live-feeds'
import { parseCoords } from '@/lib/server/validate'

export async function POST(request: Request) {
  const coords = parseCoords(await request.json().catch(() => null))
  if (!coords) return NextResponse.json({ error: 'invalid-location' }, { status: 400 })
  return NextResponse.json(await liveEmergency(coords.lat, coords.lon), {
    headers: { 'Cache-Control': 'private, no-store' },
  })
}
