# Peta Digital Interaktif — data bidang Lebani

Prototype layanan peta publik React + Vite + Leaflet. Integrasi ini mempertahankan desain, navigasi, panel samping desktop dan bottom sheet seluler dari prototype sebelumnya. Geometri dummy diganti dengan GeoJSON yang diunggah.

## Menjalankan

Node.js 24 LTS (atau 20.19+ / 22.12+) dan npm:

```bash
npm ci
npm run dev
```

Build dan pengujian data:

```bash
npm run build
node --test tests/parcelData.test.mjs
npm run preview
```

## Sumber data

`public/data/lebani_parcels_wgs84.geojson` merupakan salinan persis file yang diunggah, dilayani di `/data/lebani_parcels_wgs84.geojson` (mengikuti `BASE_URL` Vite bila memakai subpath).

- 2.656 fitur Polygon; seluruhnya lolos pemeriksaan struktur dasar, tanpa pemotongan jumlah bidang.
- CRS84 longitude–latitude; tidak ada reproyeksi atau geometri rekaan.
- ID bidang unik, tetapi beberapa nomor bidang berulang (28 entri tambahan di luar nomor unik).
- Kelurahan seluruh fitur: `Lebani (cek)`; label ini dipertahankan, bukan diganti menjadi Karema atau dianggap sudah resmi.
- Ada 413 fitur dengan tanda pemeriksaan kualitas sumber, termasuk tumpang tindih, perbedaan luas, atau teks luas tidak tersedia. Integrasi ini tidak memvalidasi ulang topologi atau menyelesaikan masalah kualitas tersebut.
- Luas publik memakai `luas_m2` sesuai file, tidak diganti dengan perhitungan geometri. Nilai yang tidak tersedia ditampilkan sebagai “Belum tersedia”.

Status aplikasi: **PROTOTYPE • DATA DALAM VERIFIKASI**. Data dan peta bukan penetapan batas atau kepemilikan resmi.

## Pemuatan dan rendering

`src/services/parcelData.js` fetch file saat aplikasi dibuka dan memeriksa FeatureCollection, Feature, properties, ID unik, Polygon/MultiPolygon, koordinat WGS84 valid, serta ring tertutup. Fitur tidak valid dilewati secara individual. Root rusak, HTTP gagal, atau koleksi kosong mempunyai pesan dan tombol muat ulang; peta dan navigasi tetap tersedia.

`MapPanel` menggunakan satu lapisan GeoJSON native Leaflet dengan Canvas untuk seluruh bidang. Ketebalan garis menyesuaikan zoom. Ring/hole asli dipertahankan. Highlight bidang terpilih memakai satu lapisan SVG agar efek kedalaman halus tetap tersedia. Tidak membuat ribuan komponen React.

Saat data selesai dimuat, map fit ke bounds dataset. “Kembali ke Wilayah” menghapus pilihan dan fit ulang ke data Lebani; tidak memakai pusat Karema untuk dataset ini.

## Pemilihan dan pencarian

- Klik/tap bidang → event layer dengan `id_bidang` → fokus bounds polygon → highlight → detail dalam panel yang sama.
- Tombol Kembali/Tutup menghapus highlight dan kembali ke view sebelumnya.
- Cari `LBN-0001` atau `00001` untuk bidang pertama. Huruf besar/kecil dan whitespace ditoleransi; tidak ada kecocokan parsial atau nomor rekaan.
- ID exact diprioritaskan. Nomor duplikat menampilkan beberapa kandidat dengan ID terpisah, bukan memilih salah satu secara sembarang.
- Nomor ditampilkan sebagai **Nomor Bidang**, bukan NIB; arti nomor belum diverifikasi sebagai NIB.
- Detail hanya menampilkan ID Bidang, Nomor Bidang, Luas (`luas_m2`) dan Kelurahan dari sumber. `kode_m`, `surat_ukur`, `luas_geom_m2`, `selisih_pct`, dan `masalah` dipertahankan secara internal pada feature/properties, tetapi tidak ditampilkan di kartu detail publik.
- Pencarian lokasi terbatas pada atribut kelurahan (`Lebani`), belum terhubung ke pencarian jalan/Google Places. Pencarian luas ±30% dan GPS memakai fitur sumber yang benar. GPS tetap bantuan pencarian, bukan pengukuran resmi.
- Petunjuk Arah membuka Google Maps menuju pusat bounding box bidang; titik ini tidak selalu titik di dalam polygon, akses masuk, atau batas resmi.

Informasi Wilayah tetap menyimpan statistik **dummy Karema** dari prototype sebelumnya, dengan penjelasan bahwa statistik tersebut terpisah dari data bidang Lebani. Tidak ada penggunaan tanah pada atribut GeoJSON, sehingga integrasi tidak mengarang penggunaan tanah untuk tiap bidang.

## Citra satelit

Penyedia Esri World Imagery tidak diganti. Konfigurasi ada di `src/config/map.js`, dengan override opsional melalui `.env.example`. Jangan memasukkan rahasia ke `VITE_*`.

Akses citra memerlukan `server.arcgisonline.com`. Pemeriksaan HTTP dari mesin cloud pada integrasi ini berhasil (200). Chromium pengujian menolak sertifikat proxy (`ERR_CERT_AUTHORITY_INVALID`), sehingga citra di browser cloud belum terverifikasi; verifikasi TLS tidak dinonaktifkan. Aplikasi tetap merender geometri dan menyediakan tombol muat ulang. Tidak memakai satelit palsu sebagai fallback.

## Validasi

Lima pengujian data Node mencakup sumber penuh, pencarian, nomor duplikat, geometri/ring/MultiPolygon, fitur rusak, root/CRS tidak valid, koleksi kosong, serta kandidat berdasarkan fitur sumber.

Pengujian Chromium memverifikasi seluruh 2.656 fitur pada Canvas, klik native polygon, pencarian ID/nomor, detail empat atribut, highlight/close, reset, pilihan nomor duplikat, tablet/desktop/bottom sheet seluler, kegagalan file, root rusak, koleksi kosong, fitur campuran invalid-valid, dan retry. Tidak ada error JavaScript runtime yang terdeteksi. Pemuatan citra browser masih mempunyai keterbatasan sertifikat di atas.

## File utama

- `public/data/lebani_parcels_wgs84.geojson`: data sumber yang diunggah.
- `src/services/parcelData.js`: pemuatan dan validasi.
- `src/services/parcelSearch.js`: pencarian ID/nomor, kandidat dan lokasi.
- `src/App.jsx`: state pemuatan dan alur panel yang dipertahankan.
- `src/components/MapPanel.jsx`: GeoJSON Canvas, highlight SVG, fit dataset dan status peta.
- `src/components/ParcelDetails.jsx`: informasi sumber yang diizinkan tampil.
- `src/data/parcels.js`: statistik prototype saja; generator polygon dummy dihapus.
- `tests/parcelData.test.mjs`: pengujian data yang dapat diulang.
