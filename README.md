# Dashboard Peta Pertanahan Interaktif Kelurahan Karema

Prototype tahap pertama berbasis React + Vite. Dashboard menampilkan ringkasan data contoh, ilustrasi polygon yang dapat dipilih, dan panel detail bidang. Mendukung layar desktop dan seluler serta pemilihan melalui keyboard (Tab, Enter, atau Spasi).

**Seluruh data merupakan ilustrasi.** Area peta menggunakan SVG, belum menggunakan citra satelit atau koordinat geografis resmi. Tidak memerlukan API key, backend, maupun database. Integrasi peta satelit dan polygon geografis dapat ditambahkan pada tahap berikutnya.

## Persyaratan

Node.js 20.19+ atau 22.12+ (disarankan Node.js 24 LTS), dan npm.

## Menjalankan

Dari direktori repositori:

```bash
npm ci
npm run dev
```

Buka alamat yang dicetak Vite pada lingkungan lokal Anda. Hentikan server dengan Ctrl+C.

## Build produksi

```bash
npm run build
npm run preview
```

Hasil build ada di `dist/`. Perintah preview hanya untuk memeriksa build secara lokal.

## Struktur

- `index.html`: halaman HTML dan metadata aplikasi.
- `vite.config.js`: konfigurasi Vite dengan plugin React.
- `src/main.jsx`: titik masuk React dan stylesheet.
- `src/App.jsx`: dashboard, ringkasan, dan state bidang terpilih.
- `src/components/MapPanel.jsx`: ilustrasi peta dan polygon interaktif.
- `src/components/ParcelDetails.jsx`: detail bidang dan kondisi belum ada pilihan.
- `src/data/parcels.js`: empat bidang contoh; titik SVG bukan koordinat geografis.
- `src/styles.css`: tampilan dashboard dan tata letak responsif.
- `package.json` / `package-lock.json`: perintah dan dependensi yang terkunci.
- `.gitignore`: mengecualikan dependensi, build, dan konfigurasi lokal.

Belum tersedia test suite otomatis. Validasi awal menggunakan build produksi dan pemeriksaan HTTP server pengembangan; validasi interaksi browser dilakukan terpisah.
