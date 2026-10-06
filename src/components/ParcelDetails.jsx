export default function ParcelDetails({ parcel, onClear }) {
  return (
    <aside className="panel details" aria-labelledby="details-title">
      <div className="panel-heading"><h2 id="details-title">Detail bidang</h2></div>
      <div className="details-body" aria-live="polite">
        {parcel ? <>
          <span className="eyebrow">ID BIDANG</span><h3>{parcel.id}</h3>
          <span className={`badge ${parcel.status === 'Terdata' ? 'success' : 'warning'}`}>{parcel.status}</span>
          <dl><dt>Luas tanah</dt><dd>{parcel.area.toLocaleString('id-ID')} m²</dd><dt>Penggunaan</dt><dd>{parcel.use}</dd><dt>Kelurahan</dt><dd>Karema</dd><dt>Sumber data</dt><dd>Data contoh prototype</dd></dl>
          <button className="clear-button" onClick={onClear}>Hapus pilihan</button>
        </> : <div className="empty"><span className="empty-icon" aria-hidden="true">⌖</span><h3>Pilih sebuah bidang</h3><p>Klik polygon pada peta atau pilih ID bidang di bawah untuk menampilkan informasi.</p></div>}
        <p className="disclaimer">Seluruh bidang dan informasi merupakan ilustrasi, bukan data resmi pertanahan.</p>
      </div>
    </aside>
  )
}
