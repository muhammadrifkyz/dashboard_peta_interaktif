export default function MapPanel({ parcels, selectedId, onSelect }) {
  return (
    <section className="panel map-panel" aria-labelledby="map-title">
      <div className="panel-heading">
        <div><h2 id="map-title">Peta bidang tanah</h2><p>Kelurahan Karema · Tampilan ilustrasi</p></div>
        <span className="badge">Prototype</span>
      </div>
      <div className="map-canvas">
        <svg viewBox="0 0 800 540" role="group" aria-label="Ilustrasi bidang tanah. Pilih polygon untuk melihat detail.">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeOpacity=".06" /></pattern>
          </defs>
          <rect width="800" height="540" fill="#284d40" />
          <path d="M0 65 Q180 180 290 50 T800 90 V0 H0Z" fill="#395d46" />
          <path d="M0 400 Q180 330 290 460 T800 440 V540 H0Z" fill="#3e604b" />
          <path d="M660 0 Q570 170 680 320 T720 540" fill="none" stroke="#548083" strokeWidth="38" />
          <path d="M90 0 L175 540 M0 310 L620 210" fill="none" stroke="#859085" strokeWidth="18" />
          <rect width="800" height="540" fill="url(#grid)" />
          {parcels.map(parcel => (
            <polygon key={parcel.id} points={parcel.points}
              className={`parcel ${parcel.status === 'Terdata' ? 'verified' : 'pending'} ${selectedId === parcel.id ? 'selected' : ''}`}
              tabIndex={0} role="button" aria-label={`Pilih bidang ${parcel.id}`} aria-pressed={selectedId === parcel.id}
              onClick={() => onSelect(parcel.id)}
              onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(parcel.id) } }}>
              <title>{parcel.id} · {parcel.use}</title>
            </polygon>
          ))}
          <text x="278" y="218">001</text><text x="457" y="180">002</text>
          <text x="295" y="365">003</text><text x="493" y="345">004</text>
        </svg>
        <span className="north" aria-label="Arah utara ilustrasi">↑ N</span>
        <div className="map-note">Ilustrasi polygon · Citra satelit belum terhubung</div>
      </div>
      <div className="legend"><span><i className="dot green" />Terdata</span><span><i className="dot amber" />Perlu verifikasi</span><span>Klik bidang untuk melihat detail</span></div>
    </section>
  )
}
