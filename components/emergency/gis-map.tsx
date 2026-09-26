'use client'

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useMemo } from 'react'
import { CircleMarker, GeoJSON, MapContainer, Marker, Pane, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet'
import type { Earthquake, FireIncident, GisMapZone, GisResource, LiveSource } from '@/lib/gis/types'
import type { HazardCategory } from '@/lib/types'

export interface MapPalette {
  you: string
  youRing: string
  facility: string
  quake: string
  activeFire: string
  wildfireZone: string
  zone: Record<Exclude<HazardCategory, 'wildfire'>, string>
}

export interface MapLabels {
  you: string
  locale: string
  hoverNote: string
  wildfireZoneNote: string
  zoneNote: string
  activeFire: string
  status: string
  statusUnknown: string
  contained: (pct: number) => string
  size: string
  acres: (acres: string) => string
  location: string
  away: (km: number) => string
  updated: string
  source: string
  notReported: string
}

/** Mapped (static GIS) hazard polygons. Never used to represent a current fire. */
const wildfireZoneStyle = (color: string): L.PathOptions => ({
  color,
  weight: 2,
  dashArray: '6 5',
  fillColor: color,
  fillOpacity: 0.12,
})

const FLAME_PATH =
  'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'

function activeFireIcon(color: string) {
  return L.divIcon({
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -16],
    html: `<span style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:9999px;background:${color};border:3px solid #fff;box-shadow:0 0 0 3px ${color}55,0 2px 6px #0006"><svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" stroke="#fff" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="${FLAME_PATH}"/></svg></span>`,
  })
}

function FitBounds({ points }: { points: Array<[number, number]> }) {
  const map = useMap()
  useEffect(() => {
    if (!points.length) return
    map.fitBounds(L.latLngBounds(points), { padding: [32, 32], maxZoom: 15 })
  }, [map, points])
  return null
}

function PopupRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
      <dt style={{ color: 'var(--muted-foreground)' }}>{label}</dt>
      <dd style={{ margin: 0, fontWeight: 700, textAlign: 'right' }}>{value}</dd>
    </div>
  )
}

export default function GisMap({
  center,
  wildfireHazardZones,
  otherHazardZones,
  activeWildfires,
  fireSource,
  facilities,
  quakes,
  palette,
  labels,
}: {
  center: { lat: number; lon: number }
  wildfireHazardZones: GisMapZone[]
  otherHazardZones: GisMapZone[]
  activeWildfires: FireIncident[]
  fireSource?: LiveSource
  facilities: GisResource[]
  quakes: Earthquake[]
  palette: MapPalette
  labels: MapLabels
}) {
  const placed = facilities.filter((f) => f.lat !== undefined && f.lon !== undefined)
  const points = useMemo<Array<[number, number]>>(
    () => [
      [center.lat, center.lon],
      ...placed.map((f) => [f.lat!, f.lon!] as [number, number]),
      ...activeWildfires.map((f) => [f.lat, f.lon] as [number, number]),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [center.lat, center.lon, placed.length, activeWildfires.length],
  )
  const fireIcon = useMemo(() => activeFireIcon(palette.activeFire), [palette.activeFire])
  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(labels.locale, { dateStyle: 'medium', timeStyle: 'short' }),
    [labels.locale],
  )
  const numFmt = useMemo(() => new Intl.NumberFormat(labels.locale, { maximumFractionDigits: 0 }), [labels.locale])

  return (
    <MapContainer
      center={[center.lat, center.lon]}
      zoom={14}
      scrollWheelZoom={false}
      className="size-full"
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points} />

      {otherHazardZones.map((z, i) => (
        <GeoJSON
          key={`${z.datasetId}-${i}`}
          data={z.geometry}
          style={{ color: palette.zone[z.category as keyof MapPalette['zone']], weight: 2, fillOpacity: 0.14 }}
        >
          <Tooltip sticky>{`${z.label} · ${labels.hoverNote}`}</Tooltip>
          <Popup>
            <p style={{ margin: 0, fontWeight: 700 }}>{z.label}</p>
            <p style={{ margin: '4px 0 0' }}>{labels.zoneNote}</p>
          </Popup>
        </GeoJSON>
      ))}

      {wildfireHazardZones.map((z, i) => (
        <GeoJSON key={`${z.datasetId}-${i}`} data={z.geometry} style={wildfireZoneStyle(palette.wildfireZone)}>
          <Tooltip sticky>{`${z.label} · ${labels.hoverNote}`}</Tooltip>
          <Popup>
            <p style={{ margin: 0, fontWeight: 700 }}>{z.label}</p>
            <p style={{ margin: '4px 0 0' }}>{labels.wildfireZoneNote}</p>
          </Popup>
        </GeoJSON>
      ))}

      {quakes.map((q) => (
        <CircleMarker
          key={q.id}
          center={[q.lat, q.lon]}
          radius={4 + q.magnitude * 2}
          pathOptions={{ color: palette.quake, fillOpacity: 0.5 }}
        >
          <Tooltip>{`M${q.magnitude.toFixed(1)} · ${q.place}`}</Tooltip>
        </CircleMarker>
      ))}

      {placed.map((f) => (
        <CircleMarker
          key={f.id}
          center={[f.lat!, f.lon!]}
          radius={7}
          pathOptions={{ color: palette.facility, fillColor: palette.facility, fillOpacity: 0.9, weight: 2 }}
        >
          <Tooltip>{f.name}</Tooltip>
        </CircleMarker>
      ))}

      {/* Only the live incident feed may produce active-fire markers. */}
      {activeWildfires.map((f) => {
        const updated = f.updatedAt ?? f.discoveredAt
        return (
          <Marker key={f.id} position={[f.lat, f.lon]} icon={fireIcon} title={`${labels.activeFire}: ${f.name}`}>
            <Tooltip direction="top" offset={[0, -16]}>{`${labels.activeFire}: ${f.name}`}</Tooltip>
            <Popup>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: palette.activeFire, textTransform: 'uppercase' }}>
                {labels.activeFire}
              </p>
              <p style={{ margin: '2px 0 8px', fontSize: 15, fontWeight: 700 }}>{f.name}</p>
              <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 200 }}>
                <PopupRow
                  label={labels.status}
                  value={f.containment !== undefined ? labels.contained(f.containment) : labels.statusUnknown}
                />
                <PopupRow
                  label={labels.size}
                  value={f.acres !== undefined ? labels.acres(numFmt.format(f.acres)) : labels.notReported}
                />
                <PopupRow
                  label={labels.location}
                  value={`${f.lat.toFixed(3)}, ${f.lon.toFixed(3)} · ${labels.away(f.distanceKm)}`}
                />
                <PopupRow label={labels.updated} value={updated ? dateFmt.format(new Date(updated)) : labels.notReported} />
                {fireSource ? <PopupRow label={labels.source} value={fireSource.agency} /> : null}
              </dl>
            </Popup>
          </Marker>
        )
      })}

      <Pane name="you" style={{ zIndex: 650 }}>
        <CircleMarker
          center={[center.lat, center.lon]}
          radius={10}
          pathOptions={{ color: palette.youRing, fillColor: palette.you, fillOpacity: 1, weight: 3 }}
        >
          <Tooltip permanent direction="top" offset={[0, -10]}>
            {labels.you}
          </Tooltip>
        </CircleMarker>
      </Pane>
    </MapContainer>
  )
}
