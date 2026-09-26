import 'server-only'
import type { Earthquake, FireIncident, LiveEmergency, LiveFeed, LiveSource, WeatherAlert } from '@/lib/gis/types'

const USER_AGENT = 'GlendaleReady/1.0 (community preparedness app)'
const TIMEOUT_MS = 12_000
const EARTHQUAKE_RADIUS_KM = 150
const FIRE_RADIUS_KM = 80
// Fixed regional box around Glendale so the user's exact location is never sent to the fire feed.
const FIRE_ENVELOPE = '-119.1,33.6,-117.4,34.9'

const SOURCES = {
  nws: { agency: 'National Weather Service', title: 'Active alerts', url: 'https://www.weather.gov/lox/' },
  usgs: {
    agency: 'U.S. Geological Survey',
    title: 'Earthquakes M2.5+ in the past 7 days',
    url: 'https://earthquake.usgs.gov/earthquakes/map/',
  },
  wfigs: {
    agency: 'National Interagency Fire Center (WFIGS)',
    title: 'Current wildfire incidents',
    url: 'https://data-nifc.opendata.arcgis.com/',
  },
} satisfies Record<string, LiveSource>

type Obj = Record<string, unknown>
const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined)
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined)
const iso = (v: unknown) => {
  const n = num(v)
  if (n !== undefined) return new Date(n).toISOString()
  return str(v)
}

function km(aLat: number, aLon: number, bLat: number, bLon: number) {
  const r = (d: number) => (d * Math.PI) / 180
  const h = Math.sin(r(bLat - aLat) / 2) ** 2 + Math.cos(r(aLat)) * Math.cos(r(bLat)) * Math.sin(r(bLon - aLon) / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}

async function getJson(url: string, revalidate: number): Promise<Obj> {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/geo+json, application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    next: { revalidate },
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return (await res.json()) as Obj
}

async function feed<T>(id: LiveFeed<T>['id'], load: () => Promise<T[]>): Promise<LiveFeed<T>> {
  const retrievedAt = new Date().toISOString()
  try {
    return { id, status: 'ok', items: await load(), retrievedAt, source: SOURCES[id] }
  } catch (error) {
    console.error(`[glendale-ready] live feed ${id} failed:`, (error as Error).message)
    return { id, status: 'unavailable', items: [], retrievedAt, source: SOURCES[id] }
  }
}

const SEVERITY_ORDER = ['Extreme', 'Severe', 'Moderate', 'Minor', 'Unknown']

async function weatherAlerts(lat: number, lon: number): Promise<WeatherAlert[]> {
  // Two decimals (~1 km) is enough to pick the forecast zone.
  const data = await getJson(`https://api.weather.gov/alerts/active?point=${lat.toFixed(2)},${lon.toFixed(2)}`, 120)
  const features = Array.isArray(data.features) ? (data.features as Obj[]) : []
  return features
    .map((f) => {
      const p = (f.properties ?? {}) as Obj
      return {
        id: str(p.id) ?? str(f.id) ?? crypto.randomUUID(),
        event: str(p.event) ?? 'Weather alert',
        severity: str(p.severity) ?? 'Unknown',
        headline: str(p.headline) ?? str(p.event) ?? '',
        area: str(p.areaDesc) ?? '',
        effective: str(p.effective),
        expires: str(p.ends) ?? str(p.expires),
        instruction: str(p.instruction),
      }
    })
    .sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity))
}

async function earthquakes(lat: number, lon: number): Promise<Earthquake[]> {
  const data = await getJson('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson', 300)
  const features = Array.isArray(data.features) ? (data.features as Obj[]) : []
  return features
    .flatMap((f) => {
      const p = (f.properties ?? {}) as Obj
      const coords = ((f.geometry ?? {}) as Obj).coordinates as number[] | undefined
      const mag = num(p.mag)
      if (!coords || mag === undefined) return []
      const [qLon, qLat] = coords
      const distanceKm = km(lat, lon, qLat, qLon)
      if (distanceKm > EARTHQUAKE_RADIUS_KM) return []
      return [
        {
          id: str(f.id) ?? `${qLat},${qLon}`,
          magnitude: mag,
          place: str(p.place) ?? '',
          time: iso(p.time) ?? '',
          distanceKm,
          url: str(p.url) ?? SOURCES.usgs.url,
          lat: qLat,
          lon: qLon,
        },
      ]
    })
    .sort((a, b) => b.time.localeCompare(a.time))
    .slice(0, 5)
}

async function fires(lat: number, lon: number): Promise<FireIncident[]> {
  const params = new URLSearchParams({
    where: "IncidentTypeCategory='WF'",
    geometry: FIRE_ENVELOPE,
    geometryType: 'esriGeometryEnvelope',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: 'IncidentName,IncidentSize,PercentContained,FireDiscoveryDateTime,ModifiedOnDateTime_dt,UniqueFireIdentifier',
    outSR: '4326',
    f: 'json',
    resultRecordCount: '50',
  })
  const data = await getJson(
    `https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Incident_Locations_Current/FeatureServer/0/query?${params}`,
    300,
  )
  if (data.error) throw new Error('WFIGS query error')
  const features = Array.isArray(data.features) ? (data.features as Obj[]) : []
  return features
    .flatMap((f) => {
      const a = (f.attributes ?? {}) as Obj
      const g = (f.geometry ?? {}) as Obj
      const fLat = num(g.y)
      const fLon = num(g.x)
      if (fLat === undefined || fLon === undefined) return []
      const distanceKm = km(lat, lon, fLat, fLon)
      if (distanceKm > FIRE_RADIUS_KM) return []
      return [
        {
          id: str(a.UniqueFireIdentifier) ?? `${fLat},${fLon}`,
          name: str(a.IncidentName) ?? 'Wildfire',
          acres: num(a.IncidentSize),
          containment: num(a.PercentContained),
          discoveredAt: iso(a.FireDiscoveryDateTime),
          updatedAt: iso(a.ModifiedOnDateTime_dt),
          distanceKm,
          lat: fLat,
          lon: fLon,
        },
      ]
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 5)
}

export async function liveEmergency(lat: number, lon: number): Promise<LiveEmergency> {
  const [weather, quakes, wildfires] = await Promise.all([
    feed('nws', () => weatherAlerts(lat, lon)),
    feed('usgs', () => earthquakes(lat, lon)),
    feed('wfigs', () => fires(lat, lon)),
  ])
  return { weather, earthquakes: quakes, fires: wildfires }
}
