import { parcels } from '../data/parcels.js'

export function parcelCenter(parcel) {
  return parcel.coordinates.reduce((center, point) => [center[0] + point[0] / parcel.coordinates.length, center[1] + point[1] / parcel.coordinates.length], [0, 0])
}
export function distanceMeters(a, b) {
  const radians = value => value * Math.PI / 180
  const lat = radians(b[0] - a[0]), lng = radians(b[1] - a[1])
  const h = Math.sin(lat / 2) ** 2 + Math.cos(radians(a[0])) * Math.cos(radians(b[0])) * Math.sin(lng / 2) ** 2
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}
export function findByNib(value) {
  const text = value.trim().toUpperCase()
  return parcels.find(parcel => parcel.nib === text || parcel.id === text) || null
}
// Adaptor pencarian: ganti layanan ini untuk menghubungkan Places/API.
// Tanpa nama jalan rekaan: pencarian saat ini menggunakan area demonstrasi.
export async function searchPlaces(query) {
  const text = query.trim().toLocaleLowerCase('id-ID')
  const labels = [...new Set(parcels.map(parcel => parcel.locationLabel))]
  return labels.filter(label => label.toLocaleLowerCase('id-ID').includes(text) || text === 'karema').map(label => ({ id: label, label }))
}
export function findCandidates(place, area) {
  const matches = parcels.filter(parcel => parcel.locationLabel === place.label && Math.abs(parcel.area - area) / area <= .3)
  if (matches.length > 5) return { kind: 'many', parcels: matches.sort((a, b) => Math.abs(a.area - area) - Math.abs(b.area - area)).slice(0, 3) }
  return { kind: matches.length ? 'found' : 'empty', parcels: matches.sort((a, b) => Math.abs(a.area - area) - Math.abs(b.area - area)).slice(0, 3) }
}
export function findNearby(position) {
  return parcels.map(parcel => ({ parcel, distance: distanceMeters(position, parcelCenter(parcel)) })).filter(item => item.distance <= 1500).sort((a, b) => a.distance - b.distance).slice(0, 3).map(item => item.parcel)
}
export function directionsUrl(parcel) {
  const center = parcelCenter(parcel).join(',')
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(center)}`
}
