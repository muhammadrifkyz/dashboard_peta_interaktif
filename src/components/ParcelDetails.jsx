export default function ParcelDetails({ parcel, onClear }) {
  if (!parcel) return null
  return <aside className="parcel-detail" aria-labelledby="details-title">
    <header><div><span className="eyebrow" id="details-title">DETAIL BIDANG</span><span className="dummy-tag">DATA DUMMY</span></div><button onClick={onClear} aria-label="Tutup detail bidang">×</button></header>
    <div aria-live="polite"><h2>{parcel.id}</h2><span className="status">{parcel.status}</span>
      <dl><div><dt>Luas</dt><dd>{parcel.area.toLocaleString('id-ID')} m² <small>{(parcel.area / 10000).toLocaleString('id-ID', { maximumFractionDigits: 3 })} ha</small></dd></div><div><dt>Penggunaan tanah</dt><dd>{parcel.use}</dd></div><div><dt>Kelurahan</dt><dd>Karema</dd></div><div><dt>Kecamatan</dt><dd>Mamuju</dd></div></dl>
      <section className="parcel-status-section" aria-labelledby="parcel-status-title">
        <h3 id="parcel-status-title">STATUS BIDANG</h3>
        <dl className="parcel-status-list">
          <div><dt>Pajak</dt><dd><span className={`parcel-status-dot ${parcel.taxStatus === 'Sudah' ? 'complete' : 'unpaid'}`} aria-hidden="true" />{parcel.taxStatus}</dd></div>
          {parcel.use === 'Permukiman' && <div><dt><abbr title="Bantuan Langsung Tunai">BLT</abbr></dt><dd><span className={`parcel-status-dot ${parcel.bltStatus === 'Penerima' ? 'complete' : 'neutral'}`} aria-hidden="true" />{parcel.bltStatus}</dd></div>}
        </dl>
      </section>
    </div><button className="text-button" onClick={onClear}>Hapus pilihan · kembali ke tampilan sebelumnya</button>
  </aside>
}
