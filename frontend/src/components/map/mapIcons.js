import L from 'leaflet'
import { severityMeta } from '@/utils/severity'

const ICONS = {
  sensor:
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c2.5-3 5-3 7.5 0s5 3 7.5 0 5-3 5 0"/><path d="M2 17c2.5-3 5-3 7.5 0s5 3 7.5 0 5-3 5 0"/></svg>',
  occurrence:
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.8c3.2 4 6.4 8.1 6.4 11.9a6.4 6.4 0 1 1-12.8 0c0-3.8 3.2-7.9 6.4-11.9Z"/><path d="M9.5 14.8c1.5.6 3.1-.5 4.2-1.2"/></svg>',
}

export function markerColor(severity, fallback = '#00A6CC') {
  return severityMeta[severity]?.hex ?? fallback
}

export function createDivIcon({ kind = 'sensor', severity = 'normal', pulse = false }) {
  const color = markerColor(severity)
  const html = `<div class="map-marker" style="color:${color};background:${color}26;border-color:${color}">
    ${pulse ? '<span class="map-marker-pulse"></span>' : ''}
    ${ICONS[kind] ?? ICONS.sensor}
  </div>`
  return L.divIcon({
    html,
    className: 'pluv-marker',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  })
}
