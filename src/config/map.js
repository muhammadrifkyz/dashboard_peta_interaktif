export const satelliteProvider = {
  url: import.meta.env.VITE_SATELLITE_TILE_URL || 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  attribution: import.meta.env.VITE_SATELLITE_ATTRIBUTION || 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  maxZoom: 19,
}
// Isi dengan GeoJSON resmi saat tersedia. Jangan membuat batas/jalan/sungai rekaan.
export const gisOverlays = [
  { key: 'boundary', name: 'Batas Kelurahan', data: null, style: { color: '#28c3ed', weight: 3, fillOpacity: 0 } },
  { key: 'roads', name: 'Jalan', data: null, style: { color: '#e6d9ff', weight: 2 } },
  { key: 'rivers', name: 'Sungai', data: null, style: { color: '#65c9ff', weight: 2 } },
]
