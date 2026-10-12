import { currentRegion } from '../config/regions.js'

export const landUses = [
  { name: 'Permukiman', percent: 42, color: '#ed817c' },
  { name: 'Perkebunan', percent: 24, color: '#42a878' },
  { name: 'Ladang / Tegalan', percent: 13, color: '#e9ba5d' },
  { name: 'Hutan / Vegetasi', percent: 9, color: '#28735d' },
  { name: 'Sawah', percent: 5, color: '#9ccc68' },
  { name: 'Fasilitas & Jalan', percent: 4, color: '#9b90ce' },
  { name: 'Lainnya', percent: 3, color: '#94a7b8' },
]
export const regionalAreaHa = currentRegion.areaHa
// Titik pusat perkiraan untuk orientasi prototype, bukan batas administratif resmi.
export const initialCenter = currentRegion.center
