'use client'

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useMemo } from 'react'
import { CircleMarker, GeoJSON, MapContainer, TileLayer, Tooltip, useMap } from 'react-leaflet'
import type { Earthquake, FireIncident, GisMapZone, GisResource } from '@/lib/gis/types'
import type { HazardCategory } from '@/lib/types'

export interface MapPalette {
  you: string
  facility: string
  quake: string
  fire: string
  zone: Record<HazardCategory, string>
}

function FitBounds({ points }: { points: Array<[number, number]> }) {
  const map = useMap()
  useEffect(() => {
    if (!points.length) return
    map.fitBounds(L.latLngBounds(points), { padding: [32, 32], maxZoom: 15 })
  }, [map, points])
  return null
}

export default function GisMap({
  center,
  zones,
  facilities,
  quakes,
  fires,
  palette,
  labels,
}: {
  center: { lat: number; lon: number }
  zones: GisMapZone[]
  facilities: GisResource[]
  quakes: Earthquake[]
  fires: FireIncident[]
  palette: MapPalette
  labels: { you: string }
}) {
  const placed = facilities.filter((f) => f.lat !== undefined && f.lon !== undefined)
  const points = useMemo<Array<[number, number]>>(
    () => [[center.lat, center.lon], ...placed.map((f) => [f.lat!, f.lon!] as [number, number])],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [center.lat, center.lon, placed.length],
  )

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
      {zones.map((z, i) => (
        <GeoJSON
          key={`${z.datasetId}-${i}`}
          data={z.geometry}
          style={{ color: palette.zone[z.category], weight: 2, fillOpacity: 0.18 }}
        >
          <Tooltip sticky>{z.label}</Tooltip>
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
      {fires.map((f) => (
        <CircleMarker key={f.id} center={[f.lat, f.lon]} radius={9} pathOptions={{ color: palette.fire, fillOpacity: 0.6 }}>
          <Tooltip>{f.name}</Tooltip>
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
      <CircleMarker
        center={[center.lat, center.lon]}
        radius={10}
        pathOptions={{ color: '#ffffff', fillColor: palette.you, fillOpacity: 1, weight: 3 }}
      >
        <Tooltip permanent direction="top" offset={[0, -10]}>
          {labels.you}
        </Tooltip>
      </CircleMarker>
    </MapContainer>
  )
}
