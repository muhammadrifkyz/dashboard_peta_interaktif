# Karema Land Information Dashboard

Prototype WebGIS React + Vite untuk Kelurahan Karema, Kecamatan Mamuju, Kabupaten Mamuju, Sulawesi Barat. Proyek ini melanjutkan dashboard yang sudah ada.

## Menjalankan

Gunakan Node.js 24 LTS (atau Node.js 20.19+ / 22.12+) dan npm.

```bash
npm ci
npm run dev
```

Buka alamat yang dicetak Vite pada komputer lokal. Build produksi:

```bash
npm run build
npm run preview
```

## Fitur

- Peta satelit nyata Esri World Imagery melalui Leaflet, dengan pan, zoom, reset, skala, dan atribusi.
- 21 polygon sintetis, KRM-0001 sampai KRM-0021; klik atau keyboard untuk membuka detail bidang, fokus zoom dan highlight dengan bayangan halus.
- Detail mengambang menggunakan geographic popup yang tertambat pada pusat bidang. Tutup detail untuk kembali ke view sebelum pemilihan; Reset View kembali ke pusat awal dan menghapus filter.
- Pencarian ID tidak peka huruf besar/kecil. KRM-0099 hanya contoh placeholder, belum ada dalam dataset; ID yang tidak ada menampilkan pesan.
- Filter kategori dan indikator analitik terhubung ke peta. Bidang kategori lain memudar, tetap dapat dipilih.
- Toggle satelit, bidang, dan pewarnaan penggunaan tanah. Pencarian/pemilihan melalui daftar mengaktifkan kembali layer bidang yang tersembunyi.
- Tata letak desktop dan seluler, fokus keyboard dan dukungan reduced motion.

## Data dan batas penggunaan

**Semua geometri bidang, luas bidang, statistik regional, dan persentase penggunaan tanah adalah DATA DUMMY.** Tidak ada identitas pemilik atau data pribadi. Pusat peta [-2.691, 118.895] merupakan perkiraan orientasi kawasan Karema, bukan koordinat batas resmi yang telah diverifikasi.

Statistik regional memakai skenario luas 4.120 ha dan 1.248 bidang; hanya 21 bidang sintetis divisualisasikan. Persentase 42/24/13/9/5/4/3 dihitung sebagai pembagian luas wilayah dummy, bukan jumlah polygon. Dataset analitik regional terpisah dari sampel bidang: polygon sintetis tidak menggambarkan distribusi resmi.

Batas kelurahan, jalan dan sungai belum tersedia. Toggle layer tersebut dinonaktifkan dan diberi keterangan; tidak ada geometri administratif atau jalan rekaan. Tambahkan GeoJSON resmi ke `gisOverlays` di `src/config/map.js` untuk mengaktifkannya (GeoJSON memakai urutan longitude, latitude). Koordinat polygon Leaflet di `src/data/parcels.js` memakai latitude, longitude.

## Penyedia citra

Konfigurasi ada di `src/config/map.js`. Salin `.env.example` ke `.env.local` bila perlu mengganti penyedia XYZ beserta atribusinya, lalu restart Vite. Ikuti ketentuan dan atribusi penyedia; jangan memasukkan kredensial rahasia ke variabel `VITE_*` karena variabel ini dibundel ke browser.

Citra memerlukan koneksi ke `server.arcgisonline.com`. Pada validasi mesin cloud, layanan mengembalikan HTTP 403; draft allowlist sudah ditambahkan tetapi belum membuktikan citra dapat diakses. Aplikasi menampilkan pemberitahuan dan tombol coba lagi jika citra gagal. Tidak memakai gambar satelit palsu sebagai fallback.

## Struktur

- `src/App.jsx`: dashboard, pencarian, pilihan bidang dan filter kategori.
- `src/components/MapPanel.jsx`: lifecycle Leaflet, layer, navigasi dan geographic popup.
- `src/components/ParcelDetails.jsx`: panel informasi bidang tanpa data pribadi.
- `src/components/LandUseAnalytics.jsx`: donut dan filter berdasarkan kategori luas.
- `src/data/parcels.js`: statistik dummy, kategori, pusat perkiraan dan polygon sintetis.
- `src/config/map.js`: penyedia satelit dan slot GeoJSON resmi.
- `src/styles.css`: visual biru/cyan terang dan layout responsif.
- `.env.example`: konfigurasi penyedia opsional.

Build produksi serta pengujian browser Chromium berhasil: klik polygon, buka/tutup detail, pencarian ID, filter kategori, toggle layer, reset, ID tidak ditemukan, dan layout seluler tanpa overflow horizontal. Tidak ada error JavaScript runtime pada pengujian tersebut. Validasi pemuatan citra harus dilakukan lagi setelah akses penyedia tersedia; jangan menganggap citra atau batas administratif sudah diverifikasi.
