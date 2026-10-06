import { useState } from 'react'
import MapPanel from './components/MapPanel.jsx'
import ParcelDetails from './components/ParcelDetails.jsx'
import { parcels } from './data/parcels.js'

export default function App() {
  const [selectedId, setSelectedId] = useState(null)
  const selected = parcels.find(parcel => parcel.id === selectedId)
  const totalArea = parcels.reduce((sum, parcel) => sum + parcel.area, 0)
  return (
    <>
      <header className="topbar"><div className="brand"><span className="brand-icon" aria-hidden="true">▱</span><div><strong>Karema</strong><span>Peta Pertanahan</span></div></div><span className="topbar-label">Dashboard kelurahan</span></header>
      <main>
        <div className="intro"><div><span className="eyebrow">INFORMASI SPASIAL PERTANAHAN</span><h1>Dashboard Peta Interaktif</h1><p>Gambaran bidang tanah Kelurahan Karema dalam satu tampilan.</p></div><span className="demo-label">● Data contoh</span></div>
        <section className="stats" aria-label="Ringkasan data contoh">
          <article><span>Total bidang contoh</span><strong>{parcels.length}<small>bidang</small></strong></article>
          <article><span>Total luas contoh</span><strong>{totalArea.toLocaleString('id-ID')}<small>m²</small></strong></article>
          <article><span>Bidang terdata</span><strong>{parcels.filter(p => p.status === 'Terdata').length}<small>bidang</small></strong></article>
        </section>
        <div className="workspace"><MapPanel parcels={parcels} selectedId={selectedId} onSelect={setSelectedId} /><ParcelDetails parcel={selected} onClear={() => setSelectedId(null)} /></div>
        <section className="parcel-list" aria-label="Pilih bidang contoh"><span>Bidang contoh</span>{parcels.map(parcel => <button key={parcel.id} className={selectedId === parcel.id ? 'active' : ''} aria-pressed={selectedId === parcel.id} onClick={() => setSelectedId(parcel.id)}>{parcel.id}</button>)}</section>
        <footer>Prototype tahap pertama · Kelurahan Karema<span>Integrasi citra satelit dan data geografis tersedia pada tahap berikutnya.</span></footer>
      </main>
    </>
  )
}
