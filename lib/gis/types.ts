import type { Geometry } from 'geojson'
import type { HazardCategory, LayerStatus } from '@/lib/types'

/** Where a piece of information came from and how fresh it is. */
export interface Provenance {
  agency: string
  title?: string
  url?: string
  /** When this app fetched it from the Glendale GIS server */
  retrievedAt: string
  /** When the GIS server last fetched it from the upstream agency (`_meta.as_of`) */
  sourceFetchedAt?: string
  /** When the upstream agency last edited the layer (`_meta.source_last_edit`) */
  sourceLastEdit?: string
  stale?: boolean
}

export type OverviewStatus = 'ok' | 'partial' | 'unavailable' | 'not-configured' | 'outside-city'

export interface GisFinding {
  datasetId: string
  title: string
  category: HazardCategory
  status: LayerStatus
  /** Plain-language description of the matching zone, if any */
  zoneLabel?: string
  /** Raw class value(s) exactly as reported by the source (e.g. "AE", "Very High") */
  sourceClass?: string
  /** Distance to the nearest mapped zone when the location is outside every zone */
  nearestDistanceM?: number
  reason?: string
  disclaimer?: string
  provenance: Provenance
}

export interface GisContextItem {
  key: 'neighborhood' | 'zip' | 'fireDistrict'
  value: string
  provenance: Provenance
}

export type GisResourceKind =
  | 'fire_stations'
  | 'police_stations'
  | 'hospitals'
  | 'schools'
  | 'libraries'
  | 'parks'
  | 'bus_stops'

export interface GisResource {
  id: string
  kind: GisResourceKind
  name: string
  address?: string
  distanceMeters?: number
  lat?: number
  lon?: number
}

export interface GisResourceGroup {
  kind: GisResourceKind
  status: 'ok' | 'unavailable'
  items: GisResource[]
  provenance: Provenance
}

export interface GisMapZone {
  datasetId: string
  category: HazardCategory
  label: string
  geometry: Geometry
}

export interface GisOverview {
  status: OverviewStatus
  location: { lat: number; lon: number; inCity: boolean | null }
  context: GisContextItem[]
  findings: GisFinding[]
  resources: GisResourceGroup[]
  zones: GisMapZone[]
  /** Layers or groups that could not be retrieved */
  failed: string[]
  retrievedAt: string
}

// ---------- Live emergency information (official feeds, not the GIS server) ----------

export type LiveFeedId = 'nws' | 'usgs' | 'wfigs'

export interface LiveSource {
  agency: string
  title: string
  url: string
}

export interface LiveFeed<T> {
  id: LiveFeedId
  status: 'ok' | 'unavailable'
  items: T[]
  retrievedAt: string
  source: LiveSource
}

export interface WeatherAlert {
  id: string
  event: string
  severity: string
  headline: string
  area: string
  effective?: string
  expires?: string
  instruction?: string
}

export interface Earthquake {
  id: string
  magnitude: number
  place: string
  time: string
  distanceKm: number
  url: string
  lat: number
  lon: number
}

export interface FireIncident {
  id: string
  name: string
  acres?: number
  containment?: number
  discoveredAt?: string
  updatedAt?: string
  distanceKm: number
  lat: number
  lon: number
}

export interface LiveEmergency {
  weather: LiveFeed<WeatherAlert>
  earthquakes: LiveFeed<Earthquake>
  fires: LiveFeed<FireIncident>
}
