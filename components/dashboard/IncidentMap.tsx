'use client'

import React, { useEffect, useRef } from 'react'

interface Incident {
  id: string
  title: string
  severity: string
  status: string
  latitude: number | null
  longitude: number | null
  incidentType: string
  address?: string | null
}

interface Resource {
  id: string
  name: string
  category: string
  latitude?: number | null
  longitude?: number | null
}

interface IncidentMapProps {
  incidents?: Incident[]
  resources?: Resource[]
  center?: [number, number]
  zoom?: number
  height?: string
  onIncidentClick?: (incident: Incident) => void
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
}

export function IncidentMap({
  incidents = [],
  resources = [],
  center = [20.5937, 78.9629],
  zoom = 5,
  height = '400px',
  onIncidentClick,
}: IncidentMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (mapInstanceRef.current) return

    import('leaflet').then((L) => {
      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (!mapRef.current) return
      const map = L.map(mapRef.current).setView(center, zoom)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      mapInstanceRef.current = map
    })
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current) return
    import('leaflet').then((L) => {
      // Clear old markers
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      // Add incident markers
      incidents.forEach((incident) => {
        if (incident.latitude == null || incident.longitude == null) return
        const color = SEVERITY_COLORS[incident.severity] || '#94a3b8'
        const icon = L.divIcon({
          className: '',
          html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 0 6px rgba(0,0,0,0.5)"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        })
        const marker = L.marker([incident.latitude, incident.longitude], { icon })
          .addTo(mapInstanceRef.current)
          .bindPopup(
            `<div style="font-size:13px;color:#1e293b;min-width:140px">
              <strong>${incident.title}</strong><br/>
              <span style="color:${color};font-weight:600">${incident.severity}</span> · ${incident.incidentType.replace(/_/g, ' ')}<br/>
              <span style="color:#64748b;font-size:11px">${incident.address || 'No address'}</span>
            </div>`
          )
        if (onIncidentClick) {
          marker.on('click', () => onIncidentClick(incident))
        }
        markersRef.current.push(marker)
      })

      // Add resource markers (blue dots)
      resources.forEach((resource) => {
        if (resource.latitude == null || resource.longitude == null) return
        const icon = L.divIcon({
          className: '',
          html: `<div style="background:#3b82f6;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4)"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        })
        const marker = L.marker([resource.latitude, resource.longitude], { icon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`<div style="font-size:13px;color:#1e293b"><strong>${resource.name}</strong><br/>${resource.category}</div>`)
        markersRef.current.push(marker)
      })
    })
  }, [incidents, resources])

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div ref={mapRef} style={{ height, width: '100%', borderRadius: '8px' }} />
    </>
  )
}

