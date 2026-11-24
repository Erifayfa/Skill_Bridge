# Logbook Pemanfaatan Kecerdasan Artifisial (AI) — SkillBridge

Dokumen ini mencatat riwayat interaksi dengan alat AI generatif (**Google Gemini**) selama proses perancangan, pengembangan kode, debugging, dan penyempurnaan platform **SkillBridge**.

---

## Tahap 1: Eksplorasi Ide & Perancangan Solusi

* **Tujuan:** Menentukan konsep aplikasi web edukasi yang interaktif, ramah pengguna di berbagai ukuran layar (HP & Desktop), dan mampu menyimpan progres belajar secara mandiri.
* **Prompt Utama ke AI:**
  > *"Bantu rancang konsep platform belajar mandiri berbasis web (HTML, CSS, JS) untuk siswa dengan sistem gamifikasi seperti XP, koin, streak harian, kuis interaktif, dan studio praktik kode langsung."*
* **Ringkasan Saran AI:**
  AI menyarankan arsitektur Single Page Application (SPA) menggunakan manipulasi DOM (`display: block/none` per `<section>`) serta penyimpanan sisi klien (`localStorage`) agar progres tidak hilang tanpa memerlukan server backend.
* **Validasi & Modifikasi Mandiri:**
  * Saya menyesuaikan struktur kurikulum menjadi 3 bidang spesifik yang relevan dengan kebutuhan siswa saat ini: **Teknologi (HTML, CSS, JS)**, **Desain (UI/UX, Warna)**, dan **Komunikasi (Public Speaking, Copywriting)**.
  * Saya menambahkan sistem **Akun Lokal (Username + PIN 4 Angka)** dengan awalan kunci `sb_<username>_` pada `localStorage` serta fitur **Salin & Pulihkan Kode Cadangan (Base64)** agar beberapa siswa dapat memakai perangkat yang sama secara bergantian.

---

## Tahap 2: Penyusunan Kerangka Kode (Scaffolding)

* **Tujuan:** Membangun kerangka struktur halaman (`index.html`), sistem variabel tema terang/gelap (`style.css`), dan logika kuis, mini game, simulasi karier, serta editor kode (`script.js`).
* **Prompt Utama ke AI:**
  > *"Buatkan struktur editor kode HTML/CSS/JS di dalam halaman web yang memiliki nomor baris otomatis, live preview menggunakan iframe, dan tombol unduh menjadi file .html."*
* **Ringkasan Saran AI:**
  AI memberikan kerangka kombinasi `<textarea>` yang disejajarkan dengan elemen `<div>` nomor baris menggunakan `onscroll` sinkronisasi, serta penggunaan `Blob` dan `URL.createObjectURL()` untuk mengunduh hasil kode menjadi berkas `.html`.
* **Validasi & Modifikasi Mandiri:**
  * Saya menambahkan **4 template proyek siap pakai** (*Web, Kartu Profil, App Mini, dan Naskah Pitch*) serta **Pemilih Bidang Interaktif** agar siswa bidang Desain maupun Komunikasi juga bisa langsung mencoba.
  * Saya memodifikasi perilaku `alert()` di dalam `iframe` preview (`bungkusKodePreviewModern`) menjadi pop-up modal modern yang responsif di layar HP, sekaligus menambahkan dukungan tekan tombol `Enter` pada elemen `<input>` di dalam hasil karya siswa.
  * Saya merancang sistem **Simulasi Kehidupan Nyata (4 jalur karier)** lengkap dengan indikator Saldo, Reputasi, Stres, dan fitur upgrade peralatan.

---

## Tahap 3: Pemecahan Masalah & Penanganan Galat (Debugging)

* **Tujuan:** Memperbaiki bug tata letak di layar HP dan kesalahan struktur kode yang menyebabkan halaman kosong atau tombol tidak merespons.
* **Prompt Utama ke AI:**
  > *"Setelah mengedit bagian Studio Proyek, halaman Peta Karier, Simulasi Karier, Progres Saya, Mini Game, dan Pengaturan menjadi putih kosong, serta tombol tutup modal pratinjau melebar keluar garis di layar HP."*
* **Ringkasan Saran AI:**
  AI mendeteksi adanya tag `<section id="halaman-studio">` yang belum ditutup dengan `</section>` sebelum `<section id="halaman-progres">`, kesalahan penempatan kurung kurawal di fungsi `pilihBidangProyek()`, serta aturan CSS `.modal-box button { width: 100%; }` yang menimpa tombol tutup modal di media query mobile.
* **Validasi & Modifikasi Mandiri:**
  * Saya memeriksa ulang seluruh pasangan tag `<section>` dan `<div>` di `index.html`, menutup `halaman-studio` dengan benar, dan menghapus tag penutup berlebih di bagian akhir `<main>`.
  * Saya memisahkan fungsi `pilihBidangProyek()` dan `tampilkanProyek()` pada `script.js` agar seluruh tombol simpan, edit, unduh, filter bidang, dan modal pratinjau berjalan normal.
  * Saya menambahkan aturan khusus `#modal-lihat-karya .btn-tutup-modal` serta menyesuaikan tinggi `iframe` preview (`175px` di editor dan `240px` di modal) agar proporsional saat dibuka lewat smartphone.

---

## Tahap 4: Refleksi & Penjelasan Kode

* **Pemahaman Arsitektur & Alur Data Program:**
  1. **Sistem Navigasi (`pindahHalaman`):** Seluruh halaman berada dalam satu berkas `index.html` dengan class `.halaman`. Saat menu diklik, JavaScript menyembunyikan semua section (`display = 'none'`) dan hanya menampilkan section tujuan (`display = 'block'`), sehingga perpindahan halaman instan tanpa memuat ulang browser.
  2. **Penyimpanan & Isolasi Akun (`kunciAkun`):** Data progres (XP, Koin, Streak, Materi Selesai, Kuis Selesai, Proyek Portofolio, dan Gelar Karier) disimpan ke `localStorage` dengan format JSON menggunakan prefix username aktif agar data antar pengguna tidak saling menimpa.
  3. **Audio Sintesis Tanpa File Eksternal (`bunyikanSuara`):** Efek suara interaksi (`klik`, `benar`, `salah`, `pengingat`) dibangkitkan secara langsung menggunakan **Web Audio API (`AudioContext` & `OscillatorNode`)**, sehingga aplikasi tetap ringan, cepat dimuat, dan tidak bergantung pada aset audio eksternal.
  4. **Sandboxing Live Preview (`bungkusKodePreviewModern`):** Kode HTML/CSS/JS yang ditulis pengguna di Studio Proyek dirender ke dalam elemen `<iframe>` terisolasi menggunakan `doc.write()`, mencegah kode pengguna merusak tampilan utama aplikasi SkillBridge.