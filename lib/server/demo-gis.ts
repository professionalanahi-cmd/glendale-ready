import 'server-only'
import { DATASET_TITLES } from '@/lib/hazards/meta'
import type { HazardLayerFinding, LocationHazardResult, Resource } from '@/lib/types'

/**
 * Deterministic demo results used when GLENDALE_GIS_MCP_KEY is not set.
 * Rough bands loosely follow Glendale geography (northern foothills, LA River corridor)
 * but are NOT real map data. The UI labels every demo result.
 */
const GLENDALE_CENTER = { lat: 34.1425, lon: -118.2551 }

function finding(datasetId: string, category: HazardLayerFinding['category'], inZone: boolean, sourceClass?: string): HazardLayerFinding {
  return {
    datasetId,
    datasetTitle: DATASET_TITLES[datasetId],
    category,
    status: inZone ? 'in_zone' : 'not_in_zone',
    sourceClass: inZone ? sourceClass : undefined,
    notes: [],
  }
}

export function demoHazardsAt(lat: number, lon: number): LocationHazardResult {
  const foothills = lat > 34.17
  const riverCorridor = lat < 34.155 && lon < -118.26
  const basin = lat < 34.16
  return {
    mode: 'demo',
    status: 'ok',
    findings: [
      finding('calfire_fhsz_lra', 'wildfire', foothills, 'Very High'),
      finding('fema_flood_zones', 'flood', riverCorridor, 'X (shaded)'),
      finding('cgs_fault_zones', 'earthquake', false),
      finding('cgs_liquefaction_zones', 'earthquake', basin),
      finding('cgs_landslide_zones', 'earthquake', foothills),
      finding('dwr_dam_inundation', 'dam-inundation', riverCorridor),
      finding('usgs_debris_flow', 'debris-flow', false),
    ],
    fetchedAt: new Date().toISOString(),
  }
}

function hash(text: string) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return (h >>> 0) / 4294967295
}

/** Demo geocoding: places the address at a stable pseudo-random point inside Glendale. */
export function demoGeocode(address: string) {
  const a = hash(address.toLowerCase())
  const b = hash(`${address.toLowerCase()}:lon`)
  return {
    status: 'ok' as const,
    lat: 34.125 + a * 0.075,
    lon: -118.29 + b * 0.07,
    address,
    isEstimate: true,
  }
}

const DEMO_SOURCE = null

function offset(lat: number, lon: number, dLat: number, dLon: number) {
  return { lat: lat + dLat, lon: lon + dLon }
}

function meters(aLat: number, aLon: number, bLat: number, bLon: number) {
  const r = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(bLat - aLat)
  const dLon = toRad(bLon - aLon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2
  return Math.round(2 * r * Math.asin(Math.sqrt(h)))
}

export function demoResources(lat: number, lon: number): Resource[] {
  const base = Number.isFinite(lat) ? { lat, lon } : GLENDALE_CENTER
  const items: Array<Omit<Resource, 'distanceMeters' | 'lat' | 'lon' | 'isDemo' | 'source'> & { d: [number, number] }> = [
    { id: 'demo-hospital', name: 'Sample Community Hospital', category: 'hospital', address: 'Demo address', phone: '(000) 000-0000', accessibility: 'Wheelchair-accessible entrance (demo)', d: [0.009, 0.004] },
    { id: 'demo-fire', name: 'Sample Fire Station', category: 'fire-station', address: 'Demo address', d: [-0.004, 0.006] },
    { id: 'demo-police', name: 'Sample Police Station', category: 'police', address: 'Demo address', d: [-0.011, -0.003] },
    { id: 'demo-library', name: 'Sample Neighborhood Library', category: 'library', address: 'Demo address', accessibility: 'Step-free access (demo)', d: [0.003, -0.007] },
    { id: 'demo-park', name: 'Sample Neighborhood Park', category: 'park', d: [0.006, -0.002] },
    { id: 'demo-bus', name: 'Sample Beeline Bus Stop', category: 'transportation', d: [0.001, 0.001] },
  ]
  return items
    .map(({ d, ...item }) => {
      const p = offset(base.lat, base.lon, d[0], d[1])
      return { ...item, ...p, distanceMeters: meters(base.lat, base.lon, p.lat, p.lon), source: DEMO_SOURCE, isDemo: true }
    })
    .sort((x, y) => x.distanceMeters - y.distanceMeters)
}
