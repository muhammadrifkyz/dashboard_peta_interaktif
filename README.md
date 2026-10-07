# Peta Digital Interaktif — Karema

Prototype layanan informasi bidang tanah untuk masyarakat Kelurahan Karema, Kecamatan Mamuju, Kabupaten Mamuju, Sulawesi Barat. Melanjutkan proyek React + Vite yang sama dengan peta satelit Leaflet.

## Menjalankan

Gunakan Node.js 24 LTS (atau 20.19+ / 22.12+) dan npm.

```bash
npm ci
npm run dev
```

Buka alamat yang dicetak Vite pada komputer lokal. Build produksi:

```bash
npm run build
npm run preview
```

## Alur prototype

- Beranda: pilih pencarian NIB, lokasi perangkat, atau lokasi + perkiraan luas. Peta manual adalah pilihan sekunder.
- NIB: gunakan nomor demo `02003`–`02023` atau ID `KRM-0001`–`KRM-0021`. Nomor demo bukan NIB resmi. Kesalahan memberikan pilihan coba lagi, pencarian lokasi, dan panduan.
- Tanpa NIB: pencarian tempat masih simulasi, menggunakan `Area contoh Selatan`, `Area contoh Tengah`, dan `Area contoh Utara`. `Karema` menampilkan pilihan ketiga area. Masukkan perkiraan luas bidang (bidang contoh sekitar 54.000–80.000 m²). Pencarian memakai toleransi ±30%; jika terlalu banyak, persempit pencarian atau pilih tiga bidang terdekat berdasarkan luas. Tidak ada klaim kandidat merupakan tanah pengguna.
- Lokasi perangkat: akses GPS hanya setelah tombol ditekan, tidak disimpan dan tidak dikirim ke server aplikasi. Lingkaran menunjukkan ketelitian GPS. Jika ketelitian lebih dari 150 m, tawarkan coba lagi atau pencarian lokasi. Pilih maksimal tiga bidang contoh dalam radius 1,5 km dari titik tengah bidang.
- Detail: NIB contoh, ID, luas, penggunaan tanah, kelurahan, kecamatan. Tidak ada informasi Pajak/BLT, identitas pemilik atau data pribadi.
- Petunjuk Arah: membuka Google Maps menuju titik tengah polygon dummy. Koordinat tujuan dikirim ke Google hanya ketika pengguna membuka tautan tersebut. Tidak ada perencana rute internal.
- Panduan: empat topik pertanahan dengan bahasa sederhana, tanpa pelaporan atau kesimpulan hukum.
- Informasi Wilayah: luas dummy 4.120 ha dan distribusi penggunaan tanah 42/24/13/9/5/4/3%. Statistik berbasis luas wilayah, bukan jumlah bidang. Statistik tidak tampil pada beranda.

## Tampilan

Satu panel kontekstual di kiri untuk desktop/tablet, atau bottom sheet yang dapat diringkas pada ponsel. Peta tetap menjadi latar utama. Ketuk bidang untuk fokus otomatis. Tombol kembali/tutup menghapus pilihan dan mengembalikan view sebelumnya. “Kembali ke Karema” memulai ulang pencarian dan view.

## Data dan integrasi

Seluruh geometri, NIB, luas bidang, label lokasi contoh dan statistik adalah **DATA DUMMY**, bukan informasi resmi. Pusat peta [-2.691, 118.895] hanya perkiraan orientasi wilayah. Batas administratif resmi belum disediakan. GPS bukan pengukuran pertanahan dan peta bukan bukti kepemilikan.

Citra satelit nyata menggunakan Esri World Imagery dan memerlukan akses ke `server.arcgisonline.com`. Cloud ini pernah mengembalikan HTTP 403; aplikasi memberikan pemberitahuan dan tombol muat ulang, tanpa citra palsu pengganti. Gunakan `.env.example` sebagai konfigurasi penyedia XYZ alternatif dan atribusinya. Jangan menyimpan rahasia dalam `VITE_*` karena dibundel ke browser.

`src/services/parcelSearch.js` menjadi batas integrasi untuk pencarian tempat dan bidang. Ganti `searchPlaces` dengan adapter layanan tempat bila tersedia; saat ini tidak ada Google Places, API key atau pencarian jalan nyata. `directionsUrl` menggunakan URL Google Maps publik. `src/config/regions.js` menyiapkan struktur wilayah agar wilayah lain dapat ditambahkan setelah datanya tersedia; prototype hanya Karema.

Lokasi perangkat memerlukan HTTPS atau localhost dan izin browser. Penolakan, ketelitian rendah, lokasi di luar data, NIB tidak ada, tempat tidak ada, hasil terlalu banyak, hasil kosong, koneksi terputus dan kegagalan citra mempunyai pesan serta langkah berikutnya.

## Struktur

- `src/App.jsx`: navigasi dan alur panel publik, form, hasil, status loading/error.
- `src/components/MapPanel.jsx`: peta Leaflet, pemilihan bidang, kandidat bernomor, GPS dan kontrol sederhana.
- `src/components/ParcelDetails.jsx`: informasi publik dan tautan arah/panduan.
- `src/components/LandUseAnalytics.jsx`: statistik ringan khusus Informasi Wilayah.
- `src/data/parcels.js`: bidang dan statistik dummy.
- `src/data/guides.js`: isi panduan umum.
- `src/services/parcelSearch.js`: pencarian NIB, kandidat, jarak, adapter tempat dan URL arah.
- `src/config/regions.js`: definisi wilayah prototype.
- `src/config/map.js`: penyedia satelit dan slot data GIS resmi untuk pengembangan berikutnya.
- `src/styles.css`: tampilan layanan publik mobile-first.
