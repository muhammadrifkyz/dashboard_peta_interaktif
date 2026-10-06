export const landUses = [
  { name: 'Permukiman', percent: 42, color: '#ed817c' },
  { name: 'Perkebunan', percent: 24, color: '#42a878' },
  { name: 'Ladang / Tegalan', percent: 13, color: '#e9ba5d' },
  { name: 'Hutan / Vegetasi', percent: 9, color: '#28735d' },
  { name: 'Sawah', percent: 5, color: '#9ccc68' },
  { name: 'Fasilitas & Jalan', percent: 4, color: '#9b90ce' },
  { name: 'Lainnya', percent: 3, color: '#94a7b8' },
]
export const regionalAreaHa = 4120
// Titik pusat perkiraan untuk orientasi prototype, bukan batas administratif resmi.
export const initialCenter = [-2.691, 118.895]
// Semua geometri dan atribut bidang di bawah sintetis, bukan hasil survei.
export const parcels = Array.from({ length: 21 }, (_, index) => {
  const row = Math.floor(index / 7)
  const col = index % 7
  const lat = -2.697 + row * .004
  const lng = 118.885 + col * .003
  return {
    id: `KRM-${String(index + 1).padStart(4, '0')}`,
    area: 54507 + index * 1237,
    use: landUses[index % 7].name,
    status: index % 2 ? 'Perlu verifikasi' : 'Terdata',
    // Status prototype saja; bukan catatan pajak atau penerima bantuan resmi.
    taxStatus: index % 2 ? 'Belum' : 'Sudah',
    ...(landUses[index % 7].name === 'Permukiman'
      ? { bltStatus: index % 2 ? 'Bukan Penerima' : 'Penerima' }
      : {}),
    coordinates: [[lat, lng], [lat + .0023, lng + .0002], [lat + .0025, lng + .0022], [lat + .0001, lng + .002]],
  }
})
