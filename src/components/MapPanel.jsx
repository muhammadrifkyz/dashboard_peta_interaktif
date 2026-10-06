import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import ParcelDetails from './ParcelDetails.jsx'
import { initialCenter, landUses } from '../data/parcels.js'
import { gisOverlays, satelliteProvider } from '../config/map.js'

export default function MapPanel({ parcels, selectedId, onSelect, filter, onFilter }) {
  const container = useRef(null)
  const instance = useRef(null)
  const polygons = useRef(new Map())
  const tile = useRef(null)
  const previous = useRef(null)
  const activePopup = useRef(null)
  const callbacks = useRef({ onSelect })
  callbacks.current = { onSelect }
  const [popupHost, setPopupHost] = useState(null)
  const [layerMenu, setLayerMenu] = useState(false)
  const [layers, setLayers] = useState({ satellite: true, parcels: true, use: true, boundary: true, roads: true, rivers: true })
  const [tileStatus, setTileStatus] = useState('loading')
  const selected = parcels.find(p => p.id === selectedId)
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    const map = L.map(container.current, { zoomControl: false, scrollWheelZoom: true }).setView(initialCenter, 15)
    instance.current = map
    const imagery = L.tileLayer(satelliteProvider.url, { attribution: satelliteProvider.attribution, maxZoom: satelliteProvider.maxZoom }).addTo(map)
    tile.current = imagery
    imagery.on('tileload', () => setTileStatus('ready'))
    imagery.on('tileerror', () => setTileStatus('error'))
    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map)
    const pane = map.createPane('parcelPane')
    pane.style.zIndex = 450
    parcels.forEach(parcel => {
      const polygon = L.polygon(parcel.coordinates, { pane: 'parcelPane', weight: 1.5 }).addTo(map)
      polygon.on('click', () => callbacks.current.onSelect(parcel.id))
      polygon.on('mouseover', () => polygon.setStyle({ weight: 3 }))
      polygon.on('mouseout', () => polygon.setStyle({ weight: polygon.getElement()?.classList.contains('selected-parcel') ? 3 : 1.5 }))
      const element = polygon.getElement()
      element.setAttribute('tabindex', '0')
      element.setAttribute('role', 'button')
      element.setAttribute('aria-label', `Pilih bidang ${parcel.id}`)
      L.DomEvent.on(element, 'keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { L.DomEvent.stop(event); callbacks.current.onSelect(parcel.id) }
      })
      polygons.current.set(parcel.id, polygon)
    })
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(container.current)
    return () => { observer.disconnect(); map.remove(); instance.current = null; polygons.current.clear(); tile.current = null }
  }, [parcels])

  useEffect(() => {
    const map = instance.current
    if (!map) return
    if (layers.satellite) tile.current.addTo(map)
    else tile.current.remove()
    parcels.forEach(parcel => {
      const polygon = polygons.current.get(parcel.id)
      if (layers.parcels) polygon.addTo(map)
      else polygon.remove()
      const focused = parcel.id === selectedId
      const faded = (filter !== 'Semua' && parcel.use !== filter) || (selectedId && !focused)
      const color = layers.use ? landUses.find(use => use.name === parcel.use).color : '#54c5ef'
      polygon.setStyle({ color: focused ? '#c9f5ff' : color, fillColor: color, weight: focused ? 3 : 1.5, opacity: faded ? .25 : 1, fillOpacity: faded ? .055 : focused ? .5 : .25 })
      polygon.getElement()?.classList.toggle('selected-parcel', focused)
      polygon.getElement()?.setAttribute('aria-pressed', String(focused))
      if (focused) polygon.bringToFront()
    })
  }, [filter, selectedId, layers, parcels])

  useEffect(() => {
    const map = instance.current
    const added = gisOverlays.filter(layer => layer.data && layers[layer.key]).map(layer => L.geoJSON(layer.data, { style: layer.style }).addTo(map))
    return () => added.forEach(layer => layer.remove())
  }, [layers])

  useEffect(() => {
    const map = instance.current
    if (!map) return
    let popup
    let host
    if (selected) {
      if (!previous.current) previous.current = { center: map.getCenter(), zoom: map.getZoom() }
      const polygon = polygons.current.get(selected.id)
      map.flyToBounds(polygon.getBounds(), { maxZoom: 16, paddingTopLeft: [40, 330], paddingBottomRight: [40, 35], duration: reducedMotion() ? 0 : .45 })
      host = document.createElement('div')
      popup = L.popup({ closeButton: false, autoPan: false, maxWidth: 300, offset: [0, -12], className: 'parcel-callout', closeOnClick: false, closeOnEscapeKey: false }).setLatLng(polygon.getBounds().getCenter()).setContent(host).openOn(map)
      activePopup.current = popup
      setPopupHost(host)
    } else {
      setPopupHost(null)
      if (previous.current) { map.flyTo(previous.current.center, previous.current.zoom, { duration: reducedMotion() ? 0 : .45 }); previous.current = null }
    }
    return () => { if (popup) map.removeLayer(popup); activePopup.current = null }
  }, [selected])

  useEffect(() => {
    if (!popupHost) return
    const frame = requestAnimationFrame(() => activePopup.current?.update())
    // React portal content is populated after Leaflet first measures the popup.
    const popup = activePopup.current
    const observer = new ResizeObserver(() => popup?.update())
    observer.observe(popupHost)
    return () => { cancelAnimationFrame(frame); observer.disconnect() }
  }, [popupHost])

  function resetView() {
    previous.current = null
    onSelect(null)
    onFilter('Semua')
    instance.current.flyTo(initialCenter, 15, { duration: reducedMotion() ? 0 : .45 })
  }
  function toggle(key) {
    if (key === 'parcels' && layers.parcels) onSelect(null)
    setLayers(current => ({ ...current, [key]: !current[key] }))
  }
  // Search also restores parcel visibility after the parcel layer was hidden.
  useEffect(() => { if (selectedId) setLayers(current => current.parcels ? current : { ...current, parcels: true }) }, [selectedId])

  return <section className="map-workspace" aria-label="Peta satelit interaktif Karema">
    <div ref={container} className="leaflet-map" />
    <div className="map-location"><span className="location-dot" /><div><strong>KAREMA</strong><small>Kelurahan • Kecamatan Mamuju</small></div><span className="north">↑ N</span></div>
    <div className="map-controls"><button aria-label="Zoom in" onClick={() => instance.current.zoomIn()}>+</button><button aria-label="Zoom out" onClick={() => instance.current.zoomOut()}>−</button><button onClick={resetView} title="Kembali ke tampilan awal">↺ <span>Reset View</span></button><button aria-expanded={layerMenu} onClick={() => setLayerMenu(value => !value)}>▱ <span>Layers</span></button></div>
    {layerMenu && <div className="layer-menu"><strong>Layer peta</strong>{[{ key: 'satellite', name: 'Satellite Imagery' }, ...gisOverlays.slice(0, 1), { key: 'parcels', name: 'Bidang Tanah' }, { key: 'use', name: 'Penggunaan Tanah' }, ...gisOverlays.slice(1)].map(layer => {
      const unavailable = 'data' in layer && !layer.data
      return <label key={layer.key}><input type="checkbox" checked={!unavailable && layers[layer.key]} disabled={unavailable} onChange={() => toggle(layer.key)} /><span>{layer.name}{unavailable && <small>Menunggu GeoJSON resmi</small>}</span></label>
    })}</div>}
    {layers.satellite && tileStatus !== 'ready' && <div className="tile-notice" role="status">{tileStatus === 'error' ? 'Citra satelit gagal dimuat. Periksa koneksi atau izin akses penyedia, lalu coba lagi.' : 'Memuat citra satelit…'}{tileStatus === 'error' && <button onClick={() => { setTileStatus('loading'); tile.current.redraw() }}>Coba lagi</button>}</div>}
    <div className="map-caption">Geometri bidang sintetis · pusat peta perkiraan · batas resmi belum tersedia</div>
    {popupHost && selected && createPortal(<ParcelDetails parcel={selected} onClear={() => onSelect(null)} />, popupHost)}
  </section>
}
