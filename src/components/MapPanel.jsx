import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { initialCenter } from '../data/parcels.js'
import { satelliteProvider } from '../config/map.js'
import { parcelCenter } from '../services/parcelSearch.js'

export default function MapPanel({ parcels, selectedId, onSelect, candidates, userLocation, resetToken, onReset, onLocate, panelOpen }) {
  const container = useRef(null)
  const mapRef = useRef(null)
  const polygons = useRef(new Map())
  const previous = useRef(null)
  const callbacks = useRef({ onSelect })
  callbacks.current = { onSelect }
  const [tileStatus, setTileStatus] = useState('loading')
  const tile = useRef(null)
  const [parcelVisible, setParcelVisible] = useState(true)
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [online, setOnline] = useState(navigator.onLine)
  const smooth = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : .45

  useEffect(() => {
    const map = L.map(container.current, { zoomControl: false }).setView(initialCenter, 15)
    mapRef.current = map
    if (window.innerWidth < 768) map.panBy([0, Math.round(map.getSize().y * .22)], { animate: false })
    let loaded = 0
    tile.current = L.tileLayer(satelliteProvider.url, { attribution: satelliteProvider.attribution, maxZoom: satelliteProvider.maxZoom }).addTo(map)
    tile.current.on('loading', () => { loaded = 0; setTileStatus('loading') })
    tile.current.on('tileload', () => { loaded++; setTileStatus('ready') })
    tile.current.on('load', () => setTileStatus(loaded ? 'ready' : 'error'))
    const pane = map.createPane('parcelPane'); pane.style.zIndex = 450
    L.control.scale({ imperial: false, position: 'bottomright' }).addTo(map)
    parcels.forEach(parcel => {
      const polygon = L.polygon(parcel.coordinates, { pane: 'parcelPane', color: '#3f719a', weight: 1.5, fillColor: '#9bc3df', fillOpacity: .1 }).addTo(map)
      polygon.on('click', () => callbacks.current.onSelect(parcel.id))
      const element = polygon.getElement()
      element.setAttribute('tabindex', '0'); element.setAttribute('role', 'button'); element.setAttribute('aria-label', `Lihat informasi bidang ${parcel.id}`)
      L.DomEvent.on(element, 'keydown', event => { if (event.key === 'Enter' || event.key === ' ') { L.DomEvent.stop(event); callbacks.current.onSelect(parcel.id) } })
      polygons.current.set(parcel.id, polygon)
    })
    const observer = new ResizeObserver(() => map.invalidateSize()); observer.observe(container.current)
    const connect = () => setOnline(navigator.onLine)
    window.addEventListener('online', connect); window.addEventListener('offline', connect)
    return () => { observer.disconnect(); window.removeEventListener('online', connect); window.removeEventListener('offline', connect); map.remove(); mapRef.current = null; polygons.current.clear() }
  }, [parcels])

  useEffect(() => {
    const map = mapRef.current
    parcels.forEach(parcel => {
      const polygon = polygons.current.get(parcel.id)
      if (parcelVisible || selectedId === parcel.id || candidates.some(p => p.id === parcel.id)) polygon.addTo(map)
      else polygon.remove()
      const selected = selectedId === parcel.id
      const candidate = candidates.some(p => p.id === parcel.id)
      polygon.setStyle({ color: selected ? '#185d9d' : candidate ? '#296eac' : '#527b9c', weight: selected ? 3 : 1.5, fillColor: '#7bb5df', fillOpacity: selected ? .25 : candidate ? .18 : .06, opacity: selectedId && !selected ? .3 : 1 })
      polygon.getElement()?.classList.toggle('selected-parcel', selected)
      polygon.getElement()?.setAttribute('aria-pressed', String(selected))
      if (selected) polygon.bringToFront()
    })
  }, [selectedId, candidates, parcelVisible, parcels])

  useEffect(() => {
    const map = mapRef.current
    if (selectedId) {
      if (!previous.current) previous.current = { center: map.getCenter(), zoom: map.getZoom() }
      const bounds = polygons.current.get(selectedId).getBounds()
      const mobile = window.matchMedia('(max-width: 767px)').matches
      map.flyToBounds(bounds, { maxZoom: 16, paddingTopLeft: mobile ? [35, 40] : [panelOpen ? 420 : 40, 65], paddingBottomRight: mobile ? [35, 320] : [60, 60], duration: smooth() })
    } else if (previous.current) {
      map.flyTo(previous.current.center, previous.current.zoom, { duration: smooth() }); previous.current = null
    }
  }, [selectedId])

  useEffect(() => {
    const map = mapRef.current
    const markers = candidates.map((parcel, index) => {
      const marker = L.marker(parcelCenter(parcel), { icon: L.divIcon({ className: 'candidate-marker', html: `<span>${index + 1}</span>`, iconSize: [32, 32] }) }).addTo(map)
      marker.getElement().setAttribute('aria-label', `Lihat kandidat ${index + 1}`)
      marker.on('click', () => callbacks.current.onSelect(parcel.id))
      return marker
    })
    if (candidates.length && !selectedId) map.flyToBounds(L.latLngBounds(candidates.flatMap(p => p.coordinates)), { paddingTopLeft: window.innerWidth >= 768 ? [420, 60] : [30, 50], paddingBottomRight: window.innerWidth >= 768 ? [60, 60] : [30, 300], maxZoom: 16, duration: smooth() })
    return () => markers.forEach(marker => marker.remove())
  }, [candidates])

  useEffect(() => {
    if (!userLocation) return
    const map = mapRef.current
    const circle = L.circle(userLocation.position, { radius: userLocation.accuracy, color: '#327cb0', weight: 1, fillOpacity: .08 }).addTo(map)
    const marker = L.circleMarker(userLocation.position, { radius: 7, color: '#fff', weight: 3, fillColor: '#236ca9', fillOpacity: 1 }).addTo(map)
    map.flyTo(userLocation.position, 16, { duration: smooth() })
    return () => { circle.remove(); marker.remove() }
  }, [userLocation])

  useEffect(() => {
    if (!resetToken) return
    previous.current = null
    mapRef.current.flyTo(initialCenter, 15, { duration: smooth() })
  }, [resetToken])

  return <section className="map-workspace" aria-label="Peta satelit Kelurahan Karema">
    <div className="leaflet-map" ref={container} />
    <div className="map-label">Kelurahan Karema <small>Pusat peta perkiraan · bidang contoh</small></div>
    <div className="map-controls"><div className="zoom-controls"><button onClick={() => mapRef.current.zoomIn()} aria-label="Perbesar peta">+</button><button onClick={() => mapRef.current.zoomOut()} aria-label="Perkecil peta">−</button></div><button onClick={onLocate}>⌖ <span>Lokasi Saya</span></button><button onClick={onReset}>↺ <span>Kembali ke Karema</span></button><button aria-expanded={optionsOpen} onClick={() => setOptionsOpen(v => !v)}>▱ <span>Tampilan peta</span></button></div>
    {optionsOpen && <div className="map-options"><label><input type="checkbox" checked={parcelVisible} onChange={e => setParcelVisible(e.target.checked)} /> Tampilkan bidang contoh</label><p>Citra satelit menjadi latar peta. Batas wilayah resmi belum tersedia.</p></div>}
    {(!online || tileStatus !== 'ready') && <div className="map-notice" role="status">{!online ? 'Koneksi internet terputus. Pencarian contoh tetap tersedia. Sambungkan kembali untuk memuat peta.' : tileStatus === 'loading' ? 'Memuat peta…' : 'Peta sementara belum dapat dimuat. Anda tetap bisa mencari bidang contoh.'}{tileStatus === 'error' || !online ? <button onClick={() => { setTileStatus('loading'); tile.current.redraw() }}>Coba muat peta lagi</button> : null}</div>}
  </section>
}
