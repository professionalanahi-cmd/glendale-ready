import 'server-only'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { DATASET_CATEGORY, DATASET_TITLES, RESULT_KEY_DATASET } from '@/lib/hazards/meta'
import type {
  HazardLayerFinding,
  LayerStatus,
  LocationHazardResult,
  Resource,
  ResourceCategory,
} from '@/lib/types'

const DEFAULT_URL = 'https://glendale-gis-mcp-1053589358088.us-west2.run.app/mcp'

export function isGisConfigured() {
  return Boolean(process.env.GLENDALE_GIS_MCP_KEY)
}

type LocationArg = { address: string } | { lat: number; lon: number }

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const transport = new StreamableHTTPClientTransport(new URL(process.env.GLENDALE_GIS_MCP_URL || DEFAULT_URL), {
    requestInit: { headers: { Authorization: `Bearer ${process.env.GLENDALE_GIS_MCP_KEY}` } },
  })
  const client = new Client({ name: 'glendale-ready', version: '1.0.0' })
  try {
    await client.connect(transport)
    const result = await client.callTool({ name, arguments: args })
    if (result.isError) throw new Error(extractText(result.content) || `${name} failed`)
    if (result.structuredContent) {
      const sc = result.structuredContent as Record<string, unknown>
      // FastMCP wraps non-object return values in { result: ... }
      return 'result' in sc && Object.keys(sc).length === 1 ? sc.result : sc
    }
    const text = extractText(result.content)
    return text ? JSON.parse(text) : null
  } finally {
    await client.close().catch(() => {})
  }
}

function extractText(content: unknown): string {
  if (!Array.isArray(content)) return ''
  return content
    .filter((c): c is { type: 'text'; text: string } => c?.type === 'text')
    .map((c) => c.text)
    .join('\n')
}

type Obj = Record<string, unknown>
const asObj = (v: unknown): Obj => (v && typeof v === 'object' ? (v as Obj) : {})

function classOf(raw: Obj): string | undefined {
  const field = typeof raw.class_field === 'string' ? raw.class_field : undefined
  const matches = Array.isArray(raw.matches) ? raw.matches.map(asObj) : []
  if (!field || !matches.length) return undefined
  const values = new Set(
    matches.map((m) => asObj(m.attributes)[field]).filter((v): v is string | number => v !== null && v !== undefined),
  )
  return values.size ? Array.from(values).join(', ') : undefined
}

function normalizeFinding(key: string, raw: Obj): HazardLayerFinding | null {
  const datasetId = (typeof raw.dataset === 'string' && raw.dataset) || RESULT_KEY_DATASET[key]
  const category = DATASET_CATEGORY[datasetId]
  if (!category) return null
  const status = (['in_zone', 'not_in_zone', 'unavailable'].includes(String(raw.status))
    ? raw.status
    : 'unavailable') as LayerStatus
  const firstRef = Array.isArray(raw.matches) ? asObj(asObj(raw.matches[0]).ref) : {}
  return {
    datasetId,
    datasetTitle: (typeof raw.title === 'string' && raw.title) || DATASET_TITLES[datasetId] || datasetId,
    category,
    status,
    sourceClass: status === 'in_zone' ? classOf(raw) : undefined,
    reason: typeof raw.reason === 'string' ? raw.reason : undefined,
    notes: Array.isArray(raw.notes) ? raw.notes.filter((n): n is string => typeof n === 'string') : [],
    disclaimer: typeof raw.disclaimer === 'string' ? raw.disclaimer : undefined,
    layerUrl: typeof firstRef.layer_url === 'string' ? firstRef.layer_url : undefined,
  }
}

export async function liveHazardsAt(location: LocationArg): Promise<LocationHazardResult> {
  const data = asObj(await callTool('hazards_at_location', { location }))
  const findings: HazardLayerFinding[] = []
  for (const key of Object.keys(RESULT_KEY_DATASET)) {
    if (!(key in data)) continue
    const finding = normalizeFinding(key, asObj(data[key]))
    if (finding) findings.push(finding)
  }
  const inCity = asObj(data.location).in_city
  return {
    mode: 'live',
    status: findings.length ? 'ok' : 'unavailable',
    findings,
    message: inCity === false ? 'outside-city' : undefined,
    fetchedAt: new Date().toISOString(),
  }
}

export type GeocodeOutcome =
  | { status: 'ok'; lat: number; lon: number; address: string }
  | { status: 'ambiguous' | 'not-found' | 'outside-city' }

export async function liveGeocode(address: string): Promise<GeocodeOutcome> {
  try {
    const data = asObj(await callTool('geocode_address', { address }))
    const candidates = (Array.isArray(data.candidates) ? data.candidates : Array.isArray(data.matches) ? data.matches : [])
      .map(asObj)
    const best = candidates[0] ?? (typeof data.lat === 'number' ? data : null)
    if (!best) return { status: 'not-found' }
    const lat = Number(best.lat ?? asObj(best.location).lat ?? asObj(best.location).y)
    const lon = Number(best.lon ?? asObj(best.location).lon ?? asObj(best.location).x)
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return { status: 'not-found' }
    const label = String(best.address ?? best.matched_address ?? address)
    return { status: 'ok', lat, lon, address: label }
  } catch (error) {
    const message = String((error as Error).message).toLowerCase()
    if (message.includes('outside')) return { status: 'outside-city' }
    if (message.includes('ambiguous') || message.includes('candidates')) return { status: 'ambiguous' }
    if (message.includes('not found') || message.includes('no match')) return { status: 'not-found' }
    throw error
  }
}

const KIND_TO_CATEGORY: Array<[RegExp, ResourceCategory]> = [
  [/fire/, 'fire-station'],
  [/police/, 'police'],
  [/hospital/, 'hospital'],
  [/librar/, 'library'],
  [/park/, 'park'],
  [/bus|stop|transit/, 'transportation'],
]

function toCategory(kind: string): ResourceCategory | null {
  const lower = kind.toLowerCase()
  return KIND_TO_CATEGORY.find(([re]) => re.test(lower))?.[1] ?? null
}

function pickString(attrs: Obj, keys: string[]) {
  for (const key of Object.keys(attrs)) {
    if (keys.includes(key.toLowerCase()) && typeof attrs[key] === 'string' && attrs[key]) return attrs[key] as string
  }
  return undefined
}

export async function liveResources(lat: number, lon: number): Promise<Resource[]> {
  const data = await callTool('nearest_resources', { location: { lat, lon }, limit: 3 })
  const groups: Array<[string, Obj[]]> = []
  const root = asObj(data)
  const source = asObj(root.resources ?? root.results ?? root)
  if (Array.isArray(data)) groups.push(['', data.map(asObj)])
  else for (const [kind, items] of Object.entries(source)) if (Array.isArray(items)) groups.push([kind, items.map(asObj)])

  const resources: Resource[] = []
  for (const [groupKind, items] of groups) {
    for (const item of items) {
      const category = toCategory(String(item.kind ?? groupKind))
      if (!category) continue
      const attrs = asObj(item.attributes)
      const point = asObj(item.location ?? item.point)
      const ref = asObj(item.ref)
      const name =
        (typeof item.name === 'string' && item.name) ||
        pickString(attrs, ['name', 'facility', 'fac_name', 'stop_name', 'park_name', 'station', 'label']) ||
        String(item.kind ?? groupKind)
      resources.push({
        id: `${ref.dataset ?? category}-${ref.object_id ?? resources.length}`,
        name,
        category,
        lat: Number(item.lat ?? point.lat ?? lat),
        lon: Number(item.lon ?? point.lon ?? lon),
        address: (typeof item.address === 'string' && item.address) || pickString(attrs, ['address', 'addr', 'site_addr', 'location']),
        phone: pickString(attrs, ['phone', 'telephone', 'phone_num']),
        distanceMeters: typeof item.distance_m === 'number' ? item.distance_m : undefined,
        source: {
          organization: 'City of Glendale GIS',
          title: typeof ref.dataset === 'string' ? ref.dataset : 'Glendale GIS',
          url: typeof ref.layer_url === 'string' ? ref.layer_url : undefined,
        },
        isDemo: false,
      })
    }
  }
  return resources
}
