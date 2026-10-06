import { useState } from 'react'
import MapPanel from './components/MapPanel.jsx'
import LandUseAnalytics from './components/LandUseAnalytics.jsx'
import { parcels, landUses, regionalAreaHa } from './data/parcels.js'

export default function App() {
  const [selectedId, setSelectedId] = useState(null)
  const [filter, setFilter] = useState('Semua')
  const [query, setQuery] = useState('')
  const [searchMessage, setSearchMessage] = useState('')
  function choose(id) { setSelectedId(id); if (id) setFilter('Semua') }
  function focusUse(value) { setSelectedId(null); setFilter(value) }
  function search(event) {
    event.preventDefault()
    const match = parcels.find(parcel => parcel.id === query.trim().toUpperCase())
    if (match) { choose(match.id); setSearchMessage(`Bidang ${match.id} ditemukan.`) }
    else setSearchMessage('ID tidak ditemukan. Data contoh tersedia: KRM-0001 sampai KRM-0021.')
  }
  return <>
    <header className="topbar"><div className="brand"><span className="brand-icon" aria-hidden="true">⌖</span><div><strong>Karema <span>Land Information</span></strong><small>Kelurahan Karema • Kecamatan Mamuju • Kabupaten Mamuju</small></div></div><form className="search" onSubmit={search}><label className="sr-only" htmlFor="parcel-search">Cari ID bidang</label><input id="parcel-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari ID bidang, contoh KRM-0099" /><button type="submit" aria-label="Cari bidang">⌕</button></form><span className="prototype">● PROTOTYPE • DATA DUMMY</span></header>
    {searchMessage && <div className="search-message" role="status">{searchMessage}<button onClick={() => setSearchMessage('')} aria-label="Tutup pesan pencarian">×</button></div>}
    <main><div className="page-heading"><div><span className="eyebrow">GEOSPATIAL INTELLIGENCE / SULAWESI BARAT</span><h1>Karema Land Information Dashboard</h1></div><span className="live-label"><i /> Eksplorasi wilayah</span></div>
      <div className="dashboard"><aside className="overview"><span className="eyebrow">REGIONAL SNAPSHOT</span><h2>Karema overview</h2><p>Informasi spasial pertanahan dan penggunaan wilayah.</p><div className="overview-stats"><div><strong>{regionalAreaHa.toLocaleString('id-ID')}<small>ha</small></strong><span>Total luas wilayah</span></div><div><strong>1.248</strong><span>Bidang tanah · statistik dummy</span><small>{parcels.length} polygon contoh interaktif</small></div><div><strong>42<small>%</small></strong><span>Penggunaan dominan</span></div><div><strong className="dominant">Permukiman</strong><span>Penggunaan tanah terbesar</span></div></div><div className="overview-note"><span>⌖</span><p>Kecamatan Mamuju<br />Kabupaten Mamuju<br />Sulawesi Barat, Indonesia</p></div><p className="data-note">Angka regional merupakan skenario prototype, bukan informasi pemerintah resmi.</p></aside>
        <div className="map-column"><div className="map-heading"><h2>Eksplorasi bidang tanah</h2><span>SATELLITE / GIS OVERLAYS</span></div><MapPanel parcels={parcels} selectedId={selectedId} onSelect={choose} filter={filter} onFilter={focusUse} /><div className="filters" aria-label="Filter penggunaan tanah">{['Semua', ...landUses.map(use => use.name)].map(name => <button key={name} className={filter === name ? 'active' : ''} aria-pressed={filter === name} onClick={() => focusUse(name)}>{name}</button>)}</div><div className="map-help"><span>↗ Pilih polygon untuk fokus dan detail bidang</span><span>Scroll untuk zoom · drag untuk pan</span></div></div>
        <LandUseAnalytics filter={filter} onFilter={focusUse} />
      </div><section className="parcel-list" aria-label="Daftar bidang contoh"><span>Akses cepat bidang</span>{parcels.map(parcel => <button key={parcel.id} aria-pressed={selectedId === parcel.id} className={selectedId === parcel.id ? 'active' : ''} onClick={() => choose(parcel.id)}>{parcel.id}</button>)}</section><footer><span>KAREMA / LAND INFORMATION SYSTEM</span><span>Citra: Esri World Imagery · Data bidang dan analitik: simulasi</span></footer>
    </main>
  </>
}
