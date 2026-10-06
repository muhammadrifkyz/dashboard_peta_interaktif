import { landUses, regionalAreaHa } from '../data/parcels.js'
export default function LandUseAnalytics({ filter, onFilter }) {
  let cursor = 0
  const gradient = landUses.map(use => { const from = cursor; cursor += use.percent; return `${use.color} ${from}% ${cursor}%` }).join(', ')
  return <aside className="analytics"><span className="eyebrow">AREA DISTRIBUTION</span><h2>Penggunaan tanah</h2><p>Persentase luas penggunaan tanah terhadap total luas wilayah Kelurahan Karema.</p>
    <div className="donut" style={{ background: `conic-gradient(${gradient})` }} role="img" aria-label="Diagram penggunaan tanah berdasarkan luas: total 100 persen"><div><strong>100<span>%</span></strong><small>Total luas</small></div></div>
    <div className="use-list">{landUses.map(use => <button key={use.name} className={filter === use.name ? 'active' : ''} aria-pressed={filter === use.name} onClick={() => onFilter(filter === use.name ? 'Semua' : use.name)}><div><i style={{ background: use.color }} /><span>{use.name}</span><strong>{use.percent}%</strong></div><div className="use-track"><span style={{ width: `${use.percent}%`, background: use.color }} /></div></button>)}</div>
    <div className="analytics-note">Basis luas: {regionalAreaHa.toLocaleString('id-ID')} ha (dummy), bukan jumlah bidang. Statistik regional tidak dihitung dari polygon contoh.</div>
  </aside>
}
