import 'server-only'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import type { Geometry } from 'geojson'
import type {
  GisContextItem,
  GisFinding,
  GisMapZone,
  GisOverview,
  GisResource,
  GisResourceGroup,
  GisResourceKind,
  Provenance,
} from '@/lib/gis/types'
import { DATASET_CATEGORY, DATASET_TITLES, RESULT_KEY_DATASET } from '@/lib/hazards/meta'
import type { HazardLayerFinding, LayerStatus, LocationHazardResult, Resource, ResourceCategory } from '@/lib/types'

const DEFAULT_URL = 'https://glendale-gis-mcp-1053589358088.us-west2.run.app/mcp'
const CACHE_TTL_MS = 15 * 60_000
const CALL_TIMEOUT_MS = 20_000

export function isGisConfigured() {
  return Boolean(process.env.GLENDALE_GIS_MCP_KEY)
}

export class GisToolError extends Error {
  constructor(
    message: string,
    public payload: Record<string, unknown> = {},
  ) {
    super(message)
  }
}

type Obj = Record<string, unknown>
const asObj = (v: unknown): Obj => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Obj) : {})
const asArr = (v: unknown): Obj[] => (Array.isArray(v) ? v.map(asObj) : [])
const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined)
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined)

interface CallResult {
  data: Obj
  retrievedAt: string
}
type Call = (name: string, args: Obj) => Promise<CallResult>

// Server memory only; keyed by tool + arguments. Short TTL so freshness labels stay honest.
const cache = new Map<string, { expires: number; value: CallResult }>()

function extractText(content: unknown): string {
  return asArr(content)
    .filter((c) => c.type === 'text' && typeof c.text === 'string')
    .map((c) => c.text as string)
    .join('\n')
}

/** Runs `fn` with a single MCP session that is opened lazily and closed afterwards. */
export async function withGis<T>(fn: (call: Call) => Promise<T>): Promise<T> {
  let client: Client | null = null
  let connecting: Promise<Client> | null = null
  const connect = () =>
    (connecting ??= (async () => {
      const transport = new StreamableHTTPClientTransport(new URL(process.env.GLENDALE_GIS_MCP_URL || DEFAULT_URL), {
        requestInit: { headers: { Authorization: `Bearer ${process.env.GLENDALE_GIS_MCP_KEY}` } },
      })
      const c = new Client({ name: 'glendale-ready', version: '1.0.0' })
      await c.connect(transport)
      client = c
      return c
    })())

  const call: Call = async (name, args) => {
    const key = `${name}:${JSON.stringify(args)}`
    const hit = cache.get(key)
    if (hit && hit.expires > Date.now()) return hit.value
    const c = await connect()
    const result = await c.callTool({ name, arguments: args }, undefined, { timeout: CALL_TIMEOUT_MS })
    const text = extractText(result.content)
    if (result.isError) {
      let payload: Obj = {}
      try {
        payload = asObj(JSON.parse(text))
      } catch {}
      throw new GisToolError(str(payload.error) ?? (text || `${name} failed`), payload)
    }
    const sc = asObj(result.structuredContent)
    const data = Object.keys(sc).length ? sc : asObj(text ? JSON.parse(text) : null)
    const value = { data, retrievedAt: new Date().toISOString() }
    if (cache.size > 500) cache.clear()
    cache.set(key, { value, expires: Date.now() + CACHE_TTL_MS })
    return value
  }

  try {
    return await fn(call)
  } finally {
    await (client as Client | null)?.close().catch(() => {})
  }
}

// ---------- Provenance ----------

const DATASET_AGENCY: Record<string, string> = {
  calfire_fhsz_lra: 'CAL FIRE',
  fema_flood_zones: 'FEMA',
  cgs_fault_zones: 'California Geological Survey',
  cgs_liquefaction_zones: 'California Geological Survey',
  cgs_landslide_zones: 'California Geological Survey',
  dwr_dam_inundation: 'California Department of Water Resources',
  usgs_debris_flow: 'U.S. Geological Survey',
}

function provenanceOf(meta: unknown, retrievedAt: string, fallback: { agency: string; title?: string; url?: string }): Provenance {
  const m = asObj(meta)
  return {
    agency: fallback.agency,
    title: fallback.title,
    url: str(m.url) ?? fallback.url,
    retrievedAt,
    sourceFetchedAt: str(m.as_of),
    sourceLastEdit: str(m.source_last_edit),
    stale: m.stale === true || undefined,
  }
}

// ---------- Hazards ----------

const UNZONED_CLASSES = new Set(['NonWildland', 'X', 'AREA NOT INCLUDED'])

function zoneLabelFor(datasetId: string, matches: Obj[]): { label?: string; raw?: string } {
  if (datasetId === 'calfire_fhsz_lra') {
    const classes = unique(matches.map((m) => str(asObj(m.attributes).FHSZ_Description)))
    const zoned = classes.filter((c) => c !== 'NonWildland')
    return { raw: classes.join(', ') || undefined, label: zoned.length ? `${zoned.join(' / ')} Fire Hazard Severity Zone` : undefined }
  }
  if (datasetId === 'fema_flood_zones') {
    const labels: string[] = []
    const raw: string[] = []
    for (const m of matches) {
      const a = asObj(m.attributes)
      const zone = str(a.FLD_ZONE)
      const subtype = str(a.ZONE_SUBTY) ?? ''
      if (!zone) continue
      raw.push(subtype ? `${zone} (${subtype})` : zone)
      if (/^[AV]/.test(zone)) labels.push(`High-risk flood area, FEMA Zone ${zone} (1% annual chance)`)
      else if (zone === 'X' && subtype.includes('0.2')) labels.push('Moderate flood hazard, FEMA Zone X shaded (0.2% annual chance)')
      else if (zone === 'D') labels.push('Possible but undetermined flood hazard, FEMA Zone D')
    }
    return { raw: unique(raw).join(', ') || undefined, label: unique(labels).join('; ') || undefined }
  }
  return {}
}

function unique(values: Array<string | undefined>): string[] {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v))))
}

function nearestZoneDistance(raw: Obj): number | undefined {
  const byClass = asObj(raw.nearest_by_class)
  const classDistances = Object.entries(byClass)
    .filter(([cls]) => !UNZONED_CLASSES.has(cls))
    .map(([, v]) => num(asObj(v).distance_m))
    .filter((d): d is number => d !== undefined)
  if (classDistances.length) return Math.min(...classDistances)
  return num(asObj(raw.nearest).distance_m)
}

function toFinding(key: string, raw: Obj, retrievedAt: string): GisFinding | null {
  const datasetId = str(raw.dataset) ?? RESULT_KEY_DATASET[key]
  const category = DATASET_CATEGORY[datasetId]
  if (!category) return null
  const status: LayerStatus = raw.status === 'in_zone' || raw.status === 'not_in_zone' ? raw.status : 'unavailable'
  const matches = asArr(raw.matches)
  const { label, raw: sourceClass } = zoneLabelFor(datasetId, matches)
  const title = str(raw.title) ?? DATASET_TITLES[datasetId] ?? datasetId
  return {
    datasetId,
    title,
    category,
    status,
    zoneLabel: status === 'in_zone' ? label ?? title : undefined,
    sourceClass,
    nearestDistanceM: status === 'not_in_zone' ? nearestZoneDistance(raw) : undefined,
    reason: str(raw.reason),
    disclaimer: str(raw.disclaimer),
    provenance: provenanceOf(raw._meta, retrievedAt, {
      agency: DATASET_AGENCY[datasetId] ?? 'Glendale GIS',
      title,
      url: str(asObj(asObj(matches[0]).ref).layer_url),
    }),
  }
}

function findingsFrom(res: CallResult): GisFinding[] {
  const out: GisFinding[] = []
  for (const key of Object.keys(RESULT_KEY_DATASET)) {
    if (!(key in res.data)) continue
    const f = toFinding(key, asObj(res.data[key]), res.retrievedAt)
    if (f) out.push(f)
  }
  return out
}

/** Legacy shape used by the preparedness screens. */
export async function liveHazardsAt(location: { lat: number; lon: number }): Promise<LocationHazardResult> {
  return withGis(async (call) => {
    const res = await call('hazards_at_location', { location })
    const findings: HazardLayerFinding[] = findingsFrom(res).map((f) => ({
      datasetId: f.datasetId,
      datasetTitle: f.title,
      category: f.category,
      status: f.status,
      sourceClass: f.status === 'in_zone' ? f.zoneLabel : undefined,
      reason: f.reason,
      notes: [],
      disclaimer: f.disclaimer,
      layerUrl: f.provenance.url,
    }))
    return {
      mode: 'live',
      status: findings.length ? 'ok' : 'unavailable',
      findings,
      message: asObj(res.data.location).in_city === false ? 'outside-city' : undefined,
      fetchedAt: res.retrievedAt,
    }
  })
}

// ---------- Geocoding ----------

export type GeocodeOutcome =
  | { status: 'ok'; lat: number; lon: number; address: string }
  | { status: 'ambiguous'; candidates: Array<{ address: string; lat: number; lon: number }> }
  | { status: 'not-found' | 'outside-city' }

function candidatesOf(value: unknown) {
  return asArr(value)
    .filter((c) => c.in_city !== false)
    .map((c) => ({ address: str(c.address) ?? '', lat: num(c.lat), lon: num(c.lon) }))
    .filter((c): c is { address: string; lat: number; lon: number } => Boolean(c.address && c.lat !== undefined && c.lon !== undefined))
    .slice(0, 5)
}

export async function liveGeocode(address: string): Promise<GeocodeOutcome> {
  return withGis(async (call) => {
    try {
      const { data } = await call('geocode_address', { address })
      const loc = asObj(data.location)
      if (data.status === 'ambiguous') {
        const candidates = candidatesOf(data.candidates)
        return candidates.length ? { status: 'ambiguous' as const, candidates } : { status: 'not-found' as const }
      }
      const lat = num(loc.lat)
      const lon = num(loc.lon)
      if (lat === undefined || lon === undefined) return { status: 'not-found' as const }
      if (loc.in_city === false) return { status: 'outside-city' as const }
      return { status: 'ok' as const, lat, lon, address: str(loc.matched_address) ?? address }
    } catch (error) {
      if (!(error instanceof GisToolError)) throw error
      const message = error.message.toLowerCase()
      if (message.includes('outside')) return { status: 'outside-city' as const }
      const candidates = candidatesOf(error.payload.candidates)
      if (candidates.length) return { status: 'ambiguous' as const, candidates }
      return { status: 'not-found' as const }
    }
  })
}

// ---------- Resources ----------

const KIND_CATEGORY: Partial<Record<GisResourceKind, ResourceCategory>> = {
  fire_stations: 'fire-station',
  police_stations: 'police',
  hospitals: 'hospital',
  libraries: 'library',
  parks: 'park',
  bus_stops: 'transportation',
}
const RESOURCE_KINDS: GisResourceKind[] = [
  'fire_stations',
  'police_stations',
  'hospitals',
  'schools',
  'libraries',
  'parks',
  'bus_stops',
]
const MAPPED_KINDS: GisResourceKind[] = ['fire_stations', 'police_stations', 'hospitals']

function groupsFrom(res: CallResult): GisResourceGroup[] {
  return asArr(res.data.groups)
    .filter((g) => RESOURCE_KINDS.includes(g.kind as GisResourceKind))
    .map((g) => {
      const kind = g.kind as GisResourceKind
      const items: GisResource[] = asArr(g.results).map((r, i) => {
        const ref = asObj(r.ref)
        return {
          id: `${kind}-${num(ref.object_id) ?? i}`,
          kind,
          name: str(r.name) ?? str(g.title) ?? kind,
          address: str(r.address),
          distanceMeters: num(r.distance_m),
        }
      })
      const firstRef = asObj(asObj(asArr(g.results)[0]).ref)
      return {
        kind,
        status: g.status === 'ok' ? ('ok' as const) : ('unavailable' as const),
        items,
        provenance: provenanceOf(g._meta, res.retrievedAt, {
          agency: 'City of Glendale',
          title: str(g.title),
          url: str(firstRef.layer_url),
        }),
      }
    })
}

/** Representative point for a point, multipoint or polygon geometry. */
function pointOf(geometry: unknown): { lat: number; lon: number } | null {
  const g = asObj(geometry)
  const coords: number[][] = []
  const walk = (v: unknown) => {
    if (Array.isArray(v) && typeof v[0] === 'number' && typeof v[1] === 'number') coords.push(v as number[])
    else if (Array.isArray(v)) v.forEach(walk)
  }
  walk(g.coordinates)
  if (!coords.length) return null
  const lon = coords.reduce((s, c) => s + c[0], 0) / coords.length
  const lat = coords.reduce((s, c) => s + c[1], 0) / coords.length
  return { lat, lon }
}

export async function liveResources(lat: number, lon: number): Promise<Resource[]> {
  return withGis(async (call) => {
    const res = await call('nearest_resources', { location: { lat, lon }, limit: 3 })
    const resources: Resource[] = []
    for (const group of groupsFrom(res)) {
      const category = KIND_CATEGORY[group.kind]
      if (!category) continue
      for (const item of group.items) {
        resources.push({
          id: item.id,
          name: item.name,
          category,
          lat,
          lon,
          address: item.address,
          distanceMeters: item.distanceMeters,
          source: { organization: 'City of Glendale GIS', title: group.provenance.title ?? group.kind, url: group.provenance.url },
          isDemo: false,
        })
      }
    }
    return resources
  })
}

// ---------- Combined overview for the emergency panel ----------

const CONTEXT_LAYERS: Array<{ key: GisContextItem['key']; dataset: string; field: string; title: string }> = [
  { key: 'neighborhood', dataset: 'neighborhood_zones', field: 'NAME', title: 'Neighborhood Zones' },
  { key: 'zip', dataset: 'zip_codes', field: 'ZIPCODE', title: 'ZIP Codes' },
  { key: 'fireDistrict', dataset: 'fire_station_districts', field: 'Fire_Distr', title: 'Fire Station Districts' },
]

export async function gisOverview(lat: number, lon: number): Promise<GisOverview> {
  const location = { lat, lon }
  return withGis(async (call) => {
    const failed: string[] = []
    const settle = async <T>(label: string, p: Promise<T>): Promise<T | null> => {
      try {
        return await p
      } catch (error) {
        console.error(`[glendale-ready] GIS ${label} failed:`, (error as Error).message)
        failed.push(label)
        return null
      }
    }

    const [hazardsRes, resourcesRes, ...contextRes] = await Promise.all([
      settle('hazards', call('hazards_at_location', { location })),
      settle('resources', call('nearest_resources', { location, limit: 3 })),
      ...CONTEXT_LAYERS.map((layer) =>
        settle(layer.key, call('query_dataset', { dataset: layer.dataset, near: { ...location, radius_m: 0 }, limit: 1 })),
      ),
    ])

    const retrievedAt = hazardsRes?.retrievedAt ?? resourcesRes?.retrievedAt ?? new Date().toISOString()
    const inCityRaw = asObj((hazardsRes ?? resourcesRes)?.data.location).in_city
    const inCity = typeof inCityRaw === 'boolean' ? inCityRaw : null

    const context: GisContextItem[] = []
    CONTEXT_LAYERS.forEach((layer, i) => {
      const res = contextRes[i]
      const feature = asArr(res?.data.features)[0]
      const raw = asObj(feature?.attributes)[layer.field]
      const value = typeof raw === 'number' ? String(raw) : str(raw)
      if (res && value) {
        context.push({
          key: layer.key,
          value,
          provenance: provenanceOf(res.data._meta, res.retrievedAt, {
            agency: 'City of Glendale',
            title: layer.title,
            url: str(asObj(feature?.ref).layer_url),
          }),
        })
      }
    })

    const findings = hazardsRes ? findingsFrom(hazardsRes) : []
    const resources = resourcesRes ? groupsFrom(resourcesRes) : []

    // Map geometry: only the zones that contain this point, plus positions for emergency facilities.
    const zoneTargets = findings.filter((f) => f.status === 'in_zone')
    const [zoneRes, placeRes] = await Promise.all([
      Promise.all(
        zoneTargets.map((f) =>
          settle(
            `zone:${f.datasetId}`,
            call('query_dataset', { dataset: f.datasetId, near: { ...location, radius_m: 0 }, limit: 3, include_geometry: true }),
          ),
        ),
      ),
      Promise.all(
        MAPPED_KINDS.map((kind) =>
          settle(
            `places:${kind}`,
            call('query_dataset', { dataset: kind, near: { ...location, radius_m: 5000 }, limit: 3, include_geometry: true }),
          ),
        ),
      ),
    ])

    const zones: GisMapZone[] = []
    zoneTargets.forEach((f, i) => {
      for (const feature of asArr(zoneRes[i]?.data.features)) {
        const attrs = asObj(feature.attributes)
        const cls = str(attrs.FHSZ_Description) ?? str(attrs.FLD_ZONE)
        if (cls && UNZONED_CLASSES.has(cls)) continue
        const geometry = asObj(feature.geometry)
        if (!geometry.type) continue
        zones.push({ datasetId: f.datasetId, category: f.category, label: f.zoneLabel ?? f.title, geometry: geometry as unknown as Geometry })
      }
    })

    MAPPED_KINDS.forEach((kind, i) => {
      const group = resources.find((g) => g.kind === kind)
      if (!group) return
      for (const feature of asArr(placeRes[i]?.data.features)) {
        const id = `${kind}-${num(asObj(feature.ref).object_id) ?? ''}`
        const item = group.items.find((it) => it.id === id)
        const point = pointOf(feature.geometry)
        if (item && point) Object.assign(item, point)
      }
    })

    const status: GisOverview['status'] =
      !hazardsRes && !resourcesRes
        ? 'unavailable'
        : inCity === false
          ? 'outside-city'
          : failed.some((f) => f === 'hazards' || f === 'resources') || findings.some((f) => f.status === 'unavailable')
            ? 'partial'
            : 'ok'

    return { status, location: { ...location, inCity }, context, findings, resources, zones, failed, retrievedAt }
  })
}
