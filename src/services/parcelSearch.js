export function parcelCenter(parcel) { return parcel.center }
export function distanceMeters(a, b) {
  const radians = value => value * Math.PI / 180
  const lat = radians(b[0] - a[0]), lng = radians(b[1] - a[1])
  const h = Math.sin(lat / 2) ** 2 + Math.cos(radians(a[0])) * Math.cos(radians(b[0])) * Math.sin(lng / 2) ** 2
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}
const normalize = value => String(value ?? '').replace(/\s+/g, '').toUpperCase()
export function findParcels(value, parcels) {
  const text = normalize(value)
  if (!text) return []
  const idMatch = parcels.find(parcel => normalize(parcel.id) === text)
  if (idMatch) return [idMatch]
  return parcels.filter(parcel => normalize(parcel.number) === text)
}
// Pencarian lokasi hanya memakai atribut wilayah sumber; belum ada layanan jalan/Places.
export async function searchPlaces(query, parcels) {
  const text = query.trim().toLocaleLowerCase('id-ID')
  if (!text) return []
  return [...new Set(parcels.map(parcel => parcel.locationLabel))].filter(label => label.toLocaleLowerCase('id-ID').includes(text)).map(label => ({ id: label, label }))
}
export function findCandidates(place, area, parcels) {
  if (!place || !Number.isFinite(area) || area <= 0) return { kind: 'empty', parcels: [] }
  const matches = parcels.filter(parcel => parcel.locationLabel === place.label && parcel.area != null && Math.abs(parcel.area - area) / area <= .3).sort((a, b) => Math.abs(a.area - area) - Math.abs(b.area - area))
  return { kind: matches.length > 5 ? 'many' : matches.length ? 'found' : 'empty', parcels: matches.slice(0, 3) }
}
export function findNearby(position, parcels) {
  return parcels.map(parcel => ({ parcel, distance: distanceMeters(position, parcelCenter(parcel)) })).filter(item => item.distance <= 1500).sort((a, b) => a.distance - b.distance).slice(0, 3).map(item => item.parcel)
}
export function directionsUrl(parcel) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(parcelCenter(parcel).join(','))}`
}
