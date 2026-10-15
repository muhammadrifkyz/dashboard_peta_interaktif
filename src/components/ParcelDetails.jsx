import { directionsUrl } from '../services/parcelSearch.js'

export default function ParcelDetails({ parcel, onGuide }) {
  if (!parcel) return null
  return <section className="parcel-detail" aria-labelledby="detail-heading">
    <span className="section-label">DETAIL BIDANG · DATA DALAM VERIFIKASI</span>
    <h2 id="detail-heading" tabIndex={-1}>Informasi bidang</h2>
    <p>Periksa lokasi di peta dan cocokkan dengan dokumen yang Anda miliki.</p>
    <dl className="detail-list" aria-live="polite" aria-atomic="true">
      <div><dt>ID Bidang</dt><dd>{parcel.id}</dd></div>
      <div><dt>Nomor Bidang</dt><dd>{parcel.number || 'Belum tersedia'}</dd></div>
      <div><dt>Luas</dt><dd>{parcel.area == null ? 'Belum tersedia' : `${parcel.area.toLocaleString('id-ID')} m²`}</dd></div>
      <div><dt>Kelurahan</dt><dd>{parcel.locationLabel}</dd></div>
    </dl>
    <a className="button primary" href={directionsUrl(parcel)} target="_blank" rel="noopener noreferrer">↗ Petunjuk Arah</a>
    <p className="small-note">Membuka Google Maps menuju titik tengah batas bidang, bukan batas atau akses masuk resmi.</p>
    <button className="button secondary" onClick={onGuide}>Ada kendala? Lihat Panduan</button>
    <p className="small-note">Data masih dalam verifikasi, bukan penetapan kepemilikan atau hasil pengukuran resmi.</p>
  </section>
}
