import { currentRegion } from '../config/regions.js'
import { directionsUrl } from '../services/parcelSearch.js'

export default function ParcelDetails({ parcel, onGuide }) {
  if (!parcel) return null
  return <section className="parcel-detail" aria-labelledby="detail-heading">
    <span className="section-label">DETAIL BIDANG · DATA DUMMY</span>
    <h2 id="detail-heading" tabIndex={-1}>Informasi bidang</h2>
    <p>Periksa lokasi di peta dan cocokkan dengan dokumen yang Anda miliki.</p>
    <dl className="detail-list">
      <div><dt>NIB contoh</dt><dd>{parcel.nib}</dd></div>
      <div><dt>ID bidang</dt><dd>{parcel.id}</dd></div>
      <div><dt>Luas</dt><dd>{parcel.area.toLocaleString('id-ID')} m²<small>{(parcel.area / 10000).toLocaleString('id-ID', { maximumFractionDigits: 3 })} ha</small></dd></div>
      <div><dt>Penggunaan tanah</dt><dd>{parcel.use}</dd></div>
      <div><dt>Kelurahan</dt><dd>{currentRegion.name}</dd></div>
      <div><dt>Kecamatan</dt><dd>{currentRegion.district}</dd></div>
    </dl>
    <a className="button primary" href={directionsUrl(parcel)} target="_blank" rel="noopener noreferrer">↗ Petunjuk Arah</a>
    <p className="small-note">Membuka Google Maps menuju titik tengah bidang contoh, bukan batas atau akses masuk resmi.</p>
    <button className="button secondary" onClick={onGuide}>Ada kendala? Lihat Panduan</button>
    <p className="small-note">Informasi prototype bukan bukti kepemilikan atau hasil pengukuran resmi.</p>
  </section>
}
