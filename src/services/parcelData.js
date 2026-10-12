export const parcelDataUrl = `${(import.meta.env?.BASE_URL ?? '/')}data/lebani_parcels_wgs84.geojson`

function validRing(ring) {
  if (!Array.isArray(ring) || ring.length < 4) return false
  if (!ring.every(point => Array.isArray(point) && point.length >= 2 && Number.isFinite(point[0]) && Number.isFinite(point[1]) && Math.abs(point[0]) <= 180 && Math.abs(point[1]) <= 90)) return false
  const first = ring[0], last = ring.at(-1)
  return first[0] === last[0] && first[1] === last[1]
}
function validGeometry(geometry) {
  if (!geometry || !['Polygon', 'MultiPolygon'].includes(geometry.type)) return false
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
  return Array.isArray(polygons) && polygons.length > 0 && polygons.every(polygon => Array.isArray(polygon) && polygon.length > 0 && polygon.every(validRing))
}
export function parseParcelData(data) {
  if (data?.type !== 'FeatureCollection' || !Array.isArray(data.features)) throw new Error('Invalid FeatureCollection')
  const crs = data.crs?.properties?.name
  if (crs && !/CRS84|4326$/i.test(crs)) throw new Error('Unsupported coordinate system')
  const ids = new Set(), parcels = []
  let skipped = 0
  for (const feature of data.features) {
    const properties = feature?.properties
    const id = properties?.id_bidang
    if (feature?.type !== 'Feature' || !properties || typeof properties !== 'object' || typeof id !== 'string' || !id.trim() || ids.has(id) || !validGeometry(feature.geometry)) { skipped++; continue }
    ids.add(id)
    const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates
    const points = polygons.flat(2)
    const [west, south, east, north] = points.reduce((bounds, point) => [Math.min(bounds[0], point[0]), Math.min(bounds[1], point[1]), Math.max(bounds[2], point[0]), Math.max(bounds[3], point[1])], [Infinity, Infinity, -Infinity, -Infinity])
    parcels.push({
      id, number: properties.nomor == null ? '' : String(properties.nomor),
      area: typeof properties.luas_m2 === 'number' && Number.isFinite(properties.luas_m2) && properties.luas_m2 > 0 ? properties.luas_m2 : null,
      locationLabel: typeof properties.kelurahan === 'string' ? properties.kelurahan : 'Belum tersedia',
      properties, feature, bounds: [[south, west], [north, east]], center: [(south + north) / 2, (west + east) / 2],
    })
  }
  return { parcels, skipped, collection: { type: 'FeatureCollection', features: parcels.map(parcel => parcel.feature) } }
}
export async function loadParcelData(signal) {
  const response = await fetch(parcelDataUrl, { signal })
  if (!response.ok) throw new Error('Parcel request failed')
  return parseParcelData(await response.json())
}
