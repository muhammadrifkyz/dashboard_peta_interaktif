import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { parseParcelData } from '../src/services/parcelData.js'
import { findParcels, findCandidates, findNearby } from '../src/services/parcelSearch.js'

const source = JSON.parse(await readFile(new URL('../public/data/lebani_parcels_wgs84.geojson', import.meta.url), 'utf8'))
const data = parseParcelData(source)
const feature = source.features[0]

test('all 2656 source polygons are retained verbatim with their properties', () => {
  assert.equal(data.parcels.length, 2656)
  assert.equal(data.skipped, 0)
  assert.deepEqual(data.collection.features, source.features)
  assert.equal(data.parcels[0].properties, feature.properties)
  assert.equal(data.parcels[0].area, 320)
  assert.equal(data.parcels[0].number, '00001')
  assert.equal(data.parcels[0].locationLabel, 'Lebani (cek)')
})
test('exact ID and source number searches normalize whitespace/case without invented matches', () => {
  assert.equal(findParcels('  lbn-0001  ', data.parcels)[0].id, 'LBN-0001')
  assert.equal(findParcels(' 00001 ', data.parcels)[0].id, 'LBN-0001')
  assert.equal(findParcels('LBN- 0001', data.parcels)[0].id, 'LBN-0001')
  assert.equal(findParcels('1', data.parcels).length, 0)
  assert.equal(findParcels('', data.parcels).length, 0)
  assert.equal(findParcels('NOT-FOUND', data.parcels).length, 0)
  const repeatedNumber = data.parcels.find(p => data.parcels.filter(other => other.number === p.number).length > 1).number
  const matches = findParcels(repeatedNumber, data.parcels)
  assert.ok(matches.length > 1)
  assert.ok(matches.every(p => p.number === repeatedNumber))
})
test('malformed features are skipped individually, with holes and MultiPolygon preserved', () => {
  const outer = [[118,-2],[118.01,-2],[118.01,-2.01],[118,-2]]
  const hole = [[118.002,-2.002],[118.003,-2.002],[118.003,-2.003],[118.002,-2.002]]
  const multi = { type:'Feature', properties:{id_bidang:'MULTI',nomor:'01'}, geometry:{type:'MultiPolygon',coordinates:[[outer,hole],[outer]]} }
  const parsed = parseParcelData({type:'FeatureCollection', features:[null,{},feature,feature,{...feature,properties:{id_bidang:'INVALID'},geometry:{type:'Polygon',coordinates:[[[200,-2],[118,-2]]] }}, multi]})
  assert.equal(parsed.parcels.length, 2)
  assert.equal(parsed.skipped, 4)
  assert.deepEqual(parsed.parcels[1].feature.geometry, multi.geometry)
  assert.deepEqual(parsed.parcels[1].bounds, [[-2.01,118],[-2,118.01]])
})
test('empty/invalid collections and unsupported coordinate systems do not silently masquerade as data', () => {
  assert.equal(parseParcelData({type:'FeatureCollection',features:[]}).parcels.length,0)
  assert.throws(()=>parseParcelData({type:'Polygon'}))
  assert.throws(()=>parseParcelData({...source,crs:{properties:{name:'EPSG:3857'}}}))
  const noArea = parseParcelData({type:'FeatureCollection',features:[{...feature,properties:{...feature.properties,luas_m2:null}}]})
  assert.equal(noArea.parcels[0].area,null)
})
test('guided and nearby candidates use real loaded data, not dummy geometry', () => {
  const result = findCandidates({label:'Lebani (cek)'},320,data.parcels)
  assert.ok(result.parcels.some(p=>p.id==='LBN-0001'))
  assert.equal(findCandidates(null,320,data.parcels).kind,'empty')
  assert.ok(findNearby(data.parcels[0].center,data.parcels).some(p=>p.id==='LBN-0001'))
  assert.equal(findNearby([0,0],data.parcels).length,0)
})
