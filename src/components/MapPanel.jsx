import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { initialCenter } from '../data/parcels.js'
import { satelliteProvider } from '../config/map.js'
import { parcelCenter } from '../services/parcelSearch.js'

export default function MapPanel({ parcels, selectedId, selectionExit, onSelect, candidates, userLocation, resetToken, onReset, onLocate, panelOpen, dataStatus, onRetryData }) {
  const container = useRef(null)
  const mapRef = useRef(null)
  const polygons = useRef(new Map())
  const parcelLayer = useRef(null)
  const selectedRenderer = useRef(null)
  const datasetBounds = useRef(null)
  const previous = useRef(null)
  const hovered = useRef(null)
  const styleSnapshot = useRef({ selectedId: null, candidates: null })
  const cameraVersion = useRef(0)
  const callbacks = useRef({ onSelect, selectedId, candidates, panelOpen })
  callbacks.current = { onSelect, selectedId, candidates, panelOpen }
  const [tileStatus, setTileStatus] = useState('loading')
  const tile = useRef(null)
  const [parcelVisible, setParcelVisible] = useState(true)
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [online, setOnline] = useState(navigator.onLine)
  const smooth = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : .55

  useEffect(() => {
    const map = L.map(container.current, { zoomControl: false, maxZoom: satelliteProvider.maxZoom }).setView(initialCenter, 15)
    mapRef.current = map
    if (window.innerWidth < 768) map.panBy([0, Math.round(map.getSize().y * .22)], { animate: false })
    let failed = 0
    tile.current = L.tileLayer(satelliteProvider.url, { attribution: satelliteProvider.attribution, maxNativeZoom: satelliteProvider.maxNativeZoom, maxZoom: satelliteProvider.maxZoom }).addTo(map)
    tile.current.on('loading', () => { failed = 0; setTileStatus('loading') })
    tile.current.on('tileerror', () => { failed++; setTileStatus('error') })
    tile.current.on('load', () => setTileStatus(failed ? 'error' : 'ready'))
    const pane = map.createPane('parcelPane'); pane.style.zIndex = 450
    const focusPane = map.createPane('selectedParcelPane'); focusPane.style.zIndex = 460
    selectedRenderer.current = L.svg({ pane: 'selectedParcelPane' })
    L.control.scale({ imperial: false, position: 'bottomright' }).addTo(map)
    const observer = new ResizeObserver(() => map.invalidateSize()); observer.observe(container.current)
    const connect = () => setOnline(navigator.onLine)
    window.addEventListener('online', connect); window.addEventListener('offline', connect)
    return () => { observer.disconnect(); window.removeEventListener('online', connect); window.removeEventListener('offline', connect); map.remove(); mapRef.current = null; polygons.current.clear() }
  }, [])

  function parcelStyle(feature) {
    const selected = callbacks.current.selectedId === feature.properties.id_bidang
    const candidate = callbacks.current.candidates.some(parcel => parcel.id === feature.properties.id_bidang)
    const preview = hovered.current === feature.properties.id_bidang && !selected
    return { color: selected ? '#73d7f3' : preview ? '#8acfe5' : candidate ? '#61b9de' : '#549ec0', weight: selected ? 3 : preview ? 2 : mapRef.current.getZoom() < 15 ? .65 : 1.2, fillColor: '#5aafcf', fillOpacity: selected ? .16 : preview ? .12 : candidate ? .18 : callbacks.current.selectedId ? .04 : .06, opacity: selected || preview ? 1 : callbacks.current.selectedId ? .6 : .9 }
  }
  function viewPadding() {
    const mapRect = container.current.getBoundingClientRect()
    const panel = container.current.closest('.public-workspace')?.querySelector('.context-panel')
    const panelRect = panel?.getBoundingClientRect()
    const mobile = window.matchMedia('(max-width: 767px)').matches
    // Measure the visible panel, including the collapsed mobile sheet.
    const left = !mobile && panelRect ? Math.max(30, panelRect.right - mapRect.left + 24) : 30
    const bottom = mobile && panelRect ? Math.max(30, mapRect.bottom - panelRect.top + 24) : 50
    return { paddingTopLeft: [Math.min(left, Math.max(30, mapRect.width - 110)), 40], paddingBottomRight: [30, Math.min(bottom, Math.max(30, mapRect.height - 130))] }
  }
  function focusParcel(id) {
    const polygon = polygons.current.get(id)
    if (!polygon) return
    const map = mapRef.current
    map.stop()
    map.flyToBounds(polygon.getBounds().pad(.2), { ...viewPadding(), maxZoom: Math.min(satelliteProvider.maxNativeZoom, map.getMaxZoom()), animate: smooth() > 0, duration: smooth() })
  }
  function fitToLebani(animate = true) {
    if (!datasetBounds.current?.isValid()) return
    mapRef.current.flyToBounds(datasetBounds.current, { ...viewPadding(), maxZoom: 17, animate: animate && smooth() > 0, duration: animate ? smooth() : 0 })
  }

  useEffect(() => {
    const map = mapRef.current
    polygons.current.clear()
    previous.current = null
    if (!parcels.length) { datasetBounds.current = null; return }
    // Leaflet renders the full validated GeoJSON natively, using one Canvas renderer.
    const renderer = L.canvas({ pane: 'parcelPane', padding: .2, tolerance: window.matchMedia('(pointer: coarse)').matches ? 4 : 0 })
    const layer = L.geoJSON({ type: 'FeatureCollection', features: parcels.map(parcel => parcel.feature) }, {
      renderer, pane: 'parcelPane', style: parcelStyle,
      onEachFeature(feature, polygon) {
        const id = feature.properties.id_bidang
        polygons.current.set(id, polygon)
        polygon.on('click', () => callbacks.current.onSelect(id))
        polygon.on('mouseover', () => {
          if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
          const old = hovered.current
          hovered.current = id
          if (old && old !== id) polygons.current.get(old)?.setStyle(parcelStyle(polygons.current.get(old).feature))
          polygon.setStyle(parcelStyle(feature))
        })
        polygon.on('mouseout', () => {
          if (hovered.current !== id) return
          hovered.current = null
          polygon.setStyle(parcelStyle(feature))
        })
      },
    }).addTo(map)
    parcelLayer.current = layer
    datasetBounds.current = layer.getBounds()
    fitToLebani(false)
    const updateStyle = () => layer.setStyle(parcelStyle)
    const clearHover = () => {
      const polygon = polygons.current.get(hovered.current)
      hovered.current = null
      if (polygon) polygon.setStyle(parcelStyle(polygon.feature))
    }
    map.on('zoomend', updateStyle)
    map.on('movestart', clearHover)
    return () => { map.off('zoomend', updateStyle); map.off('movestart', clearHover); layer.remove(); renderer.remove(); parcelLayer.current = null; polygons.current.clear() }
  }, [parcels])

  useEffect(() => {
    const layer = parcelLayer.current
    if (!layer) return
    const last = styleSnapshot.current
    const selectionModeChanged = Boolean(last.selectedId) !== Boolean(selectedId)
    if (selectionModeChanged || last.candidates !== candidates) layer.setStyle(parcelStyle)
    else for (const id of new Set([last.selectedId, selectedId, hovered.current])) {
      const polygon = polygons.current.get(id)
      if (polygon) polygon.setStyle(parcelStyle(polygon.feature))
    }
    styleSnapshot.current = { selectedId, candidates }
    if (parcelVisible || selectedId || candidates.length) layer.addTo(mapRef.current)
    else layer.remove()
  }, [selectedId, candidates, parcelVisible, parcels])

  useEffect(() => {
    const parcel = parcels.find(parcel => parcel.id === selectedId)
    if (!parcel) return
    // Only the selected polygon uses SVG for the existing subtle depth highlight.
    const highlight = L.geoJSON(parcel.feature, { pane: 'selectedParcelPane', interactive: false, renderer: selectedRenderer.current, style: { color: '#73d7f3', weight: 3, fillColor: '#5aafcf', fillOpacity: .08, className: 'selected-parcel' } }).addTo(mapRef.current)
    highlight.bringToFront()
    return () => highlight.remove()
  }, [selectedId, parcels])

  useEffect(() => {
    const map = mapRef.current
    cameraVersion.current++
    const version = cameraVersion.current
    map.stop()
    if (selectedId && polygons.current.has(selectedId)) {
      if (!previous.current) previous.current = { center: L.latLng(map.getCenter()), zoom: map.getZoom() }
      // Highlight is already applied; start camera motion on the next paint.
      const frame = requestAnimationFrame(() => {
        if (cameraVersion.current === version) focusParcel(selectedId)
      })
      return () => cancelAnimationFrame(frame)
    }
    if (previous.current) {
      const view = previous.current
      previous.current = null
      if (selectionExit === 'restore') map.flyTo(view.center, view.zoom, { animate: smooth() > 0, duration: smooth() })
    }
  }, [selectedId, selectionExit])

  useEffect(() => {
    if (!selectedId) return
    const panel = container.current.closest('.public-workspace')?.querySelector('.context-panel')
    if (!panel) return
    let frame
    // Ignore the initial observer delivery: selection already schedules a focus.
    const layoutSize = () => `${panel.clientWidth}:${panel.clientHeight}:${container.current.clientWidth}:${container.current.clientHeight}`
    let previousSize = layoutSize()
    const onResize = () => {
      const size = layoutSize()
      if (size === previousSize) return
      previousSize = size
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => focusParcel(callbacks.current.selectedId))
    }
    const measuredObserver = new ResizeObserver(onResize)
    measuredObserver.observe(panel)
    window.addEventListener('resize', onResize)
    return () => { measuredObserver.disconnect(); cancelAnimationFrame(frame); window.removeEventListener('resize', onResize) }
  }, [selectedId])

  useEffect(() => {
    const map = mapRef.current
    const markers = candidates.map((parcel, index) => {
      const marker = L.marker(parcelCenter(parcel), { icon: L.divIcon({ className: 'candidate-marker', html: `<span>${index + 1}</span>`, iconSize: [32, 32] }) }).addTo(map)
      marker.getElement().setAttribute('aria-label', `Lihat kandidat ${index + 1}`)
      marker.on('click', () => callbacks.current.onSelect(parcel.id))
      return marker
    })
    if (candidates.length && !selectedId) map.flyToBounds(L.latLngBounds(candidates.flatMap(p => p.bounds)), { ...viewPadding(), maxZoom: 17, animate: smooth() > 0, duration: smooth() })
    return () => markers.forEach(marker => marker.remove())
  }, [candidates])

  useEffect(() => {
    if (!userLocation) return
    const map = mapRef.current
    const circle = L.circle(userLocation.position, { radius: userLocation.accuracy, color: '#327cb0', weight: 1, fillOpacity: .08 }).addTo(map)
    const marker = L.circleMarker(userLocation.position, { radius: 7, color: '#fff', weight: 3, fillColor: '#236ca9', fillOpacity: 1 }).addTo(map)
    map.flyTo(userLocation.position, 16, { animate: smooth() > 0, duration: smooth() })
    return () => { circle.remove(); marker.remove() }
  }, [userLocation])

  useEffect(() => {
    if (!resetToken) return
    previous.current = null
    fitToLebani()
  }, [resetToken])

  return <section className="map-workspace" aria-label="Peta satelit bidang Lebani">
    <div className="leaflet-map" ref={container} data-parcel-count={parcels.length} />
    <div className="map-label">Lebani (cek) <small>Data bidang dalam verifikasi</small></div>
    <div className="map-controls"><div className="zoom-controls"><button onClick={() => mapRef.current.zoomIn()} aria-label="Perbesar peta">+</button><button onClick={() => mapRef.current.zoomOut()} aria-label="Perkecil peta">−</button></div><button onClick={onLocate}>⌖ <span>Lokasi Saya</span></button><button onClick={onReset}>↺ <span>Kembali ke Wilayah</span></button><button aria-expanded={optionsOpen} onClick={() => setOptionsOpen(v => !v)}>▱ <span>Tampilan peta</span></button></div>
    {optionsOpen && <div className="map-options"><label><input type="checkbox" checked={parcelVisible} onChange={e => setParcelVisible(e.target.checked)} /> Tampilkan bidang</label><p>Citra satelit menjadi latar peta. Batas wilayah resmi belum tersedia.</p></div>}
    {(!online || tileStatus !== 'ready' || dataStatus !== 'ready') && <div className="map-notice" role="status">
      {dataStatus === 'loading' && <div>Memuat data bidang...</div>}
      {dataStatus === 'error' && <div>Data bidang belum dapat dimuat.<button onClick={onRetryData}>Coba muat data lagi</button></div>}
      {dataStatus === 'empty' && <div>Data bidang kosong atau belum memiliki geometri yang valid.<button onClick={onRetryData}>Coba muat data lagi</button></div>}
      {!online ? <div>Koneksi internet terputus. Data yang sudah dimuat tetap dapat digunakan.</div> : tileStatus === 'loading' ? <div>Memuat peta…</div> : tileStatus === 'error' ? <div>Citra tidak tersedia pada tingkat zoom ini. Data bidang tetap dapat digunakan.</div> : null}
      {(tileStatus === 'error' || !online) && <button onClick={() => { setTileStatus('loading'); tile.current.redraw() }}>Coba muat peta lagi</button>}
    </div>}
  </section>
}
