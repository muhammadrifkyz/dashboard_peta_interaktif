import { useEffect, useRef, useState } from 'react'
import MapPanel from './components/MapPanel.jsx'
import ParcelDetails from './components/ParcelDetails.jsx'
import LandUseAnalytics from './components/LandUseAnalytics.jsx'
import { loadParcelData } from './services/parcelData.js'
import { guides } from './data/guides.js'
import { findParcels, findCandidates, findNearby, searchPlaces } from './services/parcelSearch.js'

const emptyCandidates = []
export default function App() {
  const [parcels, setParcels] = useState([])
  const [dataStatus, setDataStatus] = useState('loading')
  const [retryLoad, setRetryLoad] = useState(0)
  const [skipped, setSkipped] = useState(0)
  const [screen, setScreen] = useState('home')
  const [selectedId, setSelectedId] = useState(null)
  const [selectionExit, setSelectionExit] = useState('stay')
  const [returnScreen, setReturnScreen] = useState('home')
  const [collapsed, setCollapsed] = useState(false)
  const [nib, setNib] = useState('')
  const [locationText, setLocationText] = useState('')
  const [places, setPlaces] = useState([])
  const [place, setPlace] = useState(null)
  const [area, setArea] = useState('')
  const [candidates, setCandidates] = useState(emptyCandidates)
  const [resultSource, setResultSource] = useState('guided')
  const [userLocation, setUserLocation] = useState(null)
  const [resetToken, setResetToken] = useState(0)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [guideIndex, setGuideIndex] = useState(null)
  const [helpOpen, setHelpOpen] = useState(false)
  const actionVersion = useRef(0)
  const panelRef = useRef(null)
  const selected = parcels.find(p => p.id === selectedId)
  const regionName = parcels[0]?.locationLabel || 'Lebani (cek)'

  useEffect(() => {
    const controller = new AbortController()
    setDataStatus('loading')
    loadParcelData(controller.signal).then(result => {
      if (controller.signal.aborted) return
      setParcels(result.parcels); setSkipped(result.skipped)
      setDataStatus(result.parcels.length ? 'ready' : 'empty')
    }).catch(() => { if (!controller.signal.aborted) setDataStatus('error') })
    return () => controller.abort()
  }, [retryLoad])
  const panelOpen = screen !== 'manual'

  useEffect(() => {
    if (!panelOpen || collapsed) return
    panelRef.current?.scrollTo(0, 0)
    panelRef.current?.querySelector('h2')?.focus({ preventScroll: true })
  }, [screen, collapsed, guideIndex])

  function go(next, restoreView = false) {
    setSelectionExit(restoreView ? 'restore' : 'stay')
    actionVersion.current++
    setBusy(''); setError(''); setScreen(next); setCollapsed(false)
    if (next !== 'detail' && next !== 'guide') setSelectedId(null)
    if (next === 'home' || next === 'manual') { setCandidates(emptyCandidates); setUserLocation(null) }
  }
  function select(id) {
    if (!selectedId) setReturnScreen(screen)
    actionVersion.current++
    setBusy(''); setError(''); setSelectedId(id); setScreen('detail'); setCollapsed(false)
  }
  function closeDetail() { setSelectedId(null); go(returnScreen === 'detail' ? 'home' : returnScreen, true) }
  function reset() { setSelectedId(null); setCandidates(emptyCandidates); setUserLocation(null); setResetToken(v => v + 1); go('home') }
  function openGuides() { setGuideIndex(null); go('guide') }
  function findNib(event) {
    event.preventDefault()
    setError('')
    const matches = findParcels(nib, parcels)
    if (matches.length === 1) select(matches[0].id)
    else if (matches.length > 1) { setCandidates(matches); setResultSource('number'); setScreen('results') }
    else setScreen('nib-missing')
  }
  async function findPlace(event) {
    event.preventDefault()
    const version = ++actionVersion.current
    setBusy('Mencari lokasi…'); setError('')
    const found = await searchPlaces(locationText, parcels)
    if (version !== actionVersion.current) return
    setBusy(''); setPlaces(found)
    if (!found.length) setError('Lokasi belum ditemukan dalam data. Coba Lebani atau buka peta secara manual; pencarian jalan belum tersedia.')
    else if (found.length === 1) { setPlace(found[0]); setScreen('area') }
    else { setError('Ada beberapa lokasi yang mungkin sesuai. Pilih satu wilayah di bawah.'); setScreen('place') }
  }
  function findArea(event) {
    event.preventDefault()
    setError('')
    const result = findCandidates(place, Number(area), parcels)
    setCandidates(result.parcels); setResultSource('guided')
    if (result.kind === 'many') setError('Masih terlalu banyak bidang yang mungkin sesuai. Persempit perkiraan luas atau pilih lokasi lain.')
    else if (result.kind === 'empty') setError('Belum ada bidang yang sesuai. Ubah perkiraan luas, pilih lokasi lain, atau buka peta manual.')
    else setScreen('results')
  }
  function locate() {
    go('location')
    setCandidates(emptyCandidates); setUserLocation(null)
    const version = ++actionVersion.current
    if (!navigator.geolocation) { setError('Lokasi perangkat belum dapat digunakan. Coba perangkat lain atau cari tanpa NIB.'); return }
    setBusy('Mencari lokasi…')
    navigator.geolocation.getCurrentPosition(position => {
      if (version !== actionVersion.current) return
      setBusy('')
      const location = { position: [position.coords.latitude, position.coords.longitude], accuracy: position.coords.accuracy }
      setUserLocation(location)
      if (location.accuracy > 150) { setError('Lokasi perangkat masih kurang tepat. Coba lagi di tempat terbuka atau cari tanpa NIB. Lingkaran di peta menunjukkan perkiraan ketelitian lokasi.'); return }
      const found = findNearby(location.position, parcels)
      setCandidates(found); setResultSource('location')
      if (found.length) setScreen('results')
      else setError('Belum ada bidang di sekitar lokasi Anda dalam data Lebani. Coba cari tanpa NIB atau buka peta manual.')
    }, () => {
      if (version !== actionVersion.current) return
      setBusy(''); setError('Lokasi perangkat belum dapat digunakan. Izinkan akses lokasi di peramban, lalu coba lagi, atau pilih cara pencarian lain.')
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 })
  }
  function back() {
    if (screen === 'detail') closeDetail()
    else if (screen === 'area') go('place')
    else if (screen === 'results') go(resultSource === 'location' ? 'location' : resultSource === 'number' ? 'nib' : 'area')
    else if (screen === 'guide' && selectedId) go('detail')
    else go('home')
  }
  const message = error && <div className="feedback" role="alert">{error}</div>
  const manual = <button className="text-button" onClick={() => go('manual')}>Buka peta secara manual →</button>
  const loading = busy && <p className="loading-message" role="status">{busy}</p>
  const gpsNote = <p className="small-note">Lokasi perangkat hanya membantu pencarian dan bukan hasil pengukuran resmi pertanahan.</p>

  return <div className={`public-app ${panelOpen ? 'panel-open' : ''}`}>
    <header className="app-header"><a className="brand" href="#" onClick={event => { event.preventDefault(); reset() }}><span className="brand-icon" aria-hidden="true">⌖</span><span><strong>PETA DIGITAL INTERAKTIF</strong><small>Wilayah data: {regionName}</small></span></a><nav aria-label="Navigasi utama"><button className={screen === 'home' ? 'active' : ''} onClick={reset}>Beranda</button><button className={['nib','place','area','results','location'].includes(screen) ? 'active' : ''} onClick={() => go('home')}>Cari Bidang</button><button className={screen === 'guide' ? 'active' : ''} onClick={openGuides}>Panduan</button><button className={screen === 'region' ? 'active' : ''} onClick={() => go('region')}>Informasi Wilayah</button></nav><span className="prototype">PROTOTYPE • DATA DALAM VERIFIKASI</span></header>
    <main className="public-workspace">
      <MapPanel parcels={parcels} selectedId={selectedId} selectionExit={selectionExit} onSelect={select} candidates={candidates} userLocation={userLocation} resetToken={resetToken} onReset={reset} onLocate={() => go('location')} panelOpen={panelOpen} dataStatus={dataStatus} onRetryData={() => setRetryLoad(v => v + 1)} />
      {panelOpen ? <aside className={`context-panel ${collapsed ? 'collapsed' : ''}`} aria-label="Panel pencarian dan informasi bidang"><div className="panel-tools">{screen !== 'home' ? <button onClick={back}>← Kembali</button> : <span>{regionName}</span>}<div><button className="collapse-button" onClick={() => setCollapsed(v => !v)} aria-expanded={!collapsed}>{collapsed ? 'Buka panel' : 'Ringkas'}</button><button onClick={() => { setSelectedId(null); go('manual') }} aria-label="Tutup panel">Tutup ×</button></div></div><div className="panel-content" ref={panelRef} hidden={collapsed}>{skipped > 0 && <p className="small-note" role="status">{skipped} fitur tidak dapat ditampilkan; bidang valid tetap tersedia.</p>}
        {screen === 'home' && <><span className="section-label">PENCARIAN BIDANG TANAH</span><h2 tabIndex={-1}>Temukan Bidang Tanah</h2><p>Cari bidang tanah tanpa harus mencarinya satu per satu di peta.</p><div className="main-actions"><button className="choice-button" onClick={() => go('nib')}><span className="choice-icon">▤</span><span><strong>Saya punya nomor bidang</strong><small>Cari nomor atau ID bidang</small></span><span>›</span></button><button className="choice-button" onClick={() => go('location')}><span className="choice-icon">⌖</span><span><strong>Saya sedang di lokasi tanah</strong><small>Temukan bidang di sekitar Anda</small></span><span>›</span></button><button className="choice-button" onClick={() => go('place')}><span className="choice-icon">⌕</span><span><strong>Saya tidak punya nomor bidang</strong><small>Cari dengan lokasi dan perkiraan luas</small></span><span>›</span></button></div>{manual}<p className="small-note">Data bidang Lebani masih dalam verifikasi, bukan penetapan resmi pertanahan. Tidak perlu membuat akun.</p></>}
        {screen === 'nib' && <><h2 tabIndex={-1}>Cari dengan nomor bidang</h2><p>Masukkan nomor bidang atau ID bidang dari data yang tersedia.</p><form onSubmit={findNib}><label htmlFor="nib">Nomor / ID Bidang</label><input id="nib" value={nib} onChange={e => setNib(e.target.value)} required autoComplete="off" placeholder="Contoh: 00001 atau LBN-0001" /><p className="small-note">Cari nomor 00001 atau ID LBN-0001. Nomor Bidang belum diverifikasi sebagai NIB.</p><button className="button primary" disabled={!!busy || dataStatus !== 'ready'}>Cari Bidang</button></form>{loading}<button className="text-button" aria-expanded={helpOpen} onClick={() => setHelpOpen(v => !v)}>Apa yang dimaksud nomor bidang?</button>{helpOpen && <div className="help-box"><strong>Nomor Bidang pada data ini</strong><p>Pencarian memakai atribut nomor atau ID bidang dari sumber GeoJSON Lebani. Arti nomor ini belum diverifikasi sebagai NIB. Jika nomor tidak diketahui, gunakan lokasi perangkat atau peta manual.</p></div>}</>}
        {screen === 'nib-missing' && <><h2 tabIndex={-1}>Bidang belum ditemukan.</h2><p>Periksa kembali nomor bidang yang Anda masukkan.</p><p className="small-note">Pastikan nomor atau ID sesuai dengan data Lebani yang tersedia.</p><div className="stack-actions"><button className="button primary" onClick={() => go('nib')}>Coba lagi</button><button className="button secondary" onClick={() => go('place')}>Cari tanpa nomor bidang</button><button className="text-button" onClick={openGuides}>Lihat panduan</button></div></>}
        {screen === 'location' && <><h2 tabIndex={-1}>Cari menggunakan lokasi Anda</h2><p>Gunakan posisi perangkat untuk membantu menemukan bidang di sekitar Anda.</p>{message}<button className="button primary" disabled={!!busy || dataStatus !== 'ready'} onClick={locate}>{error ? 'Coba lagi' : 'Gunakan Lokasi Saya'}</button>{loading}{gpsNote}<button className="button secondary" onClick={() => go('place')}>Cari tanpa nomor bidang</button>{manual}</>}
        {screen === 'place' && <><span className="section-label">1 DARI 2</span><h2 tabIndex={-1}>Cari berdasarkan lokasi</h2><form onSubmit={findPlace}><label htmlFor="region">Kelurahan</label><input id="region" readOnly value={regionName} /><label htmlFor="place">Nama jalan atau lokasi terdekat</label><input id="place" value={locationText} onChange={e => { setLocationText(e.target.value); setPlaces([]); setError('') }} placeholder="Contoh: nama jalan atau tempat terdekat" required /><p className="small-note">Pencarian lokasi memakai atribut kelurahan sumber. Coba “Lebani”; pencarian jalan atau Google Places belum tersedia.</p><button className="button primary" disabled={!!busy || dataStatus !== 'ready'}>Lanjut</button></form>{loading}{message}{places.length > 1 && <div className="stack-actions">{places.map(option => <button key={option.id} className="button secondary" onClick={() => { setPlace(option); setError(''); setScreen('area') }}>{option.label}</button>)}</div>}{manual}</>}
        {screen === 'area' && <><span className="section-label">2 DARI 2</span><h2 tabIndex={-1}>Berapa perkiraan luas tanah?</h2><p>{place?.label}</p><form onSubmit={findArea}><label htmlFor="area">Perkiraan luas tanah (m²)</label><input id="area" type="number" min="1" max="100000000" step="any" required value={area} onChange={e => setArea(e.target.value)} placeholder="Masukkan perkiraan luas" /><p className="small-note">Tidak perlu tepat. Masukkan perkiraan jika tidak yakin. Luas dicocokkan dengan atribut sumber.</p><button className="button primary" disabled={!!busy || dataStatus !== 'ready'}>Cari Bidang</button></form>{loading}{message}{candidates.length > 0 && error && <button className="button secondary" onClick={() => { setError(''); setScreen('results') }}>Lihat 3 bidang yang paling mendekati</button>}<button className="text-button" onClick={() => go('place')}>Pilih lokasi lain</button>{manual}</>}
        {screen === 'results' && <><h2 tabIndex={-1}>Bidang yang mungkin sesuai</h2><p>{resultSource === 'number' ? 'Nomor ini digunakan oleh beberapa bidang pada sumber data. Pilih berdasarkan ID dan lokasi di peta.' : resultSource === 'location' ? 'Kami menemukan beberapa bidang di sekitar lokasi Anda. Pilih bidang yang paling sesuai dengan lokasi tanah Anda.' : 'Periksa beberapa bidang berikut dan pilih yang paling sesuai dengan lokasi yang Anda maksud.'}</p><strong className="result-count">{candidates.length} bidang mungkin sesuai</strong><ol className="candidate-list">{candidates.map((parcel,index) => <li key={parcel.id}><span className="candidate-number">{index+1}</span><div><h3>{parcel.id}</h3><p>Nomor {parcel.number || 'belum tersedia'}<br />{parcel.area == null ? 'Luas belum tersedia' : `± ${parcel.area.toLocaleString('id-ID')} m²`}<br />{parcel.locationLabel}</p><button className="button secondary" onClick={() => select(parcel.id)}>Lihat di Peta</button></div></li>)}</ol>{resultSource === 'location' ? gpsNote : <p className="small-note">Kandidat berasal dari data yang tersedia. Hasil bukan penetapan kepemilikan.</p>}</>}
        {screen === 'detail' && <ParcelDetails parcel={selected} onGuide={openGuides} />}
        {screen === 'guide' && <><span className="section-label">PANDUAN PERTANAHAN</span><h2 tabIndex={-1}>Ada yang perlu dibantu?</h2><p>Informasi sederhana untuk membantu langkah berikutnya. Tidak ada pengiriman laporan pada prototype ini.</p><div className="guide-list">{guides.map((guide,index) => <section key={guide.title}><button aria-expanded={guideIndex===index} onClick={() => setGuideIndex(guideIndex===index?null:index)}>{guide.title}<span>{guideIndex===index?'−':'+'}</span></button>{guideIndex===index && <ul>{guide.items.map(item => <li key={item}>{item}</li>)}</ul>}</section>)}</div><button className="button secondary" onClick={() => go('place')}>Cari berdasarkan lokasi</button></>}
        {screen === 'region' && <LandUseAnalytics />}
      </div></aside> : <div className="manual-banner"><span>Pilih bidang pada peta untuk melihat informasinya.</span><button className="button primary" onClick={() => go('home')}>Cari Bidang</button></div>}
    </main>
  </div>
}
