# ✦ SkillBridge — Platform Belajar Interaktif, Simulasi Karier & Studio Proyek

## a. Judul & Deskripsi
**SkillBridge** adalah aplikasi web pembelajaran mandiri berbasis gamifikasi yang menjembatani kesenjangan antara teori di kelas dengan praktik keterampilan digital dan kesiapan karier nyata bagi pelajar.

### Latar Belakang Masalah
Banyak pelajar saat ini menghadapi tantangan nyata yang menghambat kesiapan mereka menuju dunia kuliah maupun dunia kerja:
1. **Fenomena *"Tutorial Hell"*:** Siswa sering memahami teori atau menonton materi berjam-jam, tetapi bingung saat harus menulis kode dan membangun karya nyata dari nol.
2. **Kebingungan Arah Karier & Minimnya Simulasi Dunia Kerja:** Pelajar kerap memilih bidang karier hanya karena tren tanpa pernah merasakan tantangan nyata seperti negosiasi klien, pengelolaan waktu, maupun manajemen stres/burnout.
3. **Keterbatasan Perangkat Belajar:** Tidak semua siswa memiliki laptop berspesifikasi tinggi; mayoritas belajar menggunakan ponsel pintar (*smartphone*) sehingga kesulitan menjalankan aplikasi editor kode atau desain yang berat.
4. **Sulit Konsisten Belajar Mandiri:** Tanpa sistem penghargaan langsung dan evaluasi kekurangan kemampuan (*skill gap*) yang terukur, belajar mandiri mudah terasa membosankan.

### Solusi yang Dihadirkan SkillBridge
* **Satu Ekosistem Terpadu:** Menggabungkan **Ruang Belajar** (modul & kuis interaktif), **Peta Karier** (tes minat & analisis *Skill Gap* otomatis), **Simulasi Kehidupan Nyata** (latihan pengambilan keputusan karier), serta **Studio Proyek** dalam satu aplikasi ringan.
* **Ramah Smartphone & Offline-Ready (PWA):** Antarmuka responsif dengan editor kode bernomor baris, *auto-complete* tag dasar, *template* siap pakai, serta dapat dipasang ke layar utama HP dan diekspor menjadi file `.html`.
* **Gamifikasi & Multi-Akun Lokal:** Dilengkapi sistem XP, Koin, *Streak Harian*, *Mini Game*, toko karakter maskot, serta akun lokal (`Username + PIN`) dengan fitur salin/pulihkan kode cadangan progres.

### Target Pengguna
Siswa SMP, SMA, SMK, serta pelajar pemula yang ingin menguasai keterampilan dasar hingga menengah di bidang **Teknologi Web**, **Desain UI/UX**, dan **Komunikasi Digital**.

---

## b. Teknologi yang Digunakan
* **Bahasa Pemrograman & Markup:** HTML5, CSS3 (Custom Properties, Flexbox, Grid, Media Queries), dan JavaScript (ES6+ Vanilla JS).
* **API & Fitur Bawaan Browser:**
  * `localStorage` & `JSON` untuk manajemen multi-akun lokal dan penyimpanan progres otomatis.
  * **Web Audio API** (`AudioContext` & `OscillatorNode`) untuk efek suara sintesis interaktif tanpa file audio eksternal.
  * **Blob & Object URL API** untuk mengunduh hasil kode proyek menjadi berkas `.html`.
  * **Progressive Web App (PWA)** (`manifest.json` & Service Worker `sw.js`) agar aplikasi dapat di-*install* dan diakses secara ringan di perangkat mobile maupun desktop.
* **Platform Publikasi:** GitHub Pages.

---

## c. Pemanfaatan AI (AI Usage Disclosure)
* **Alat AI yang Digunakan:** Google Gemini.
* **Contoh Perintah (Prompt) Utama yang Digunakan:**
  1. *"Bantu rancang konsep platform belajar mandiri berbasis web (HTML, CSS, JS) untuk siswa dengan sistem gamifikasi seperti XP, koin, streak harian, kuis interaktif, dan studio praktik kode langsung."*
  2. *"Buatkan struktur editor kode HTML/CSS/JS di dalam halaman web yang memiliki nomor baris otomatis, live preview menggunakan iframe, dan tombol unduh menjadi file .html."*
  3. *"Bantu analisis penyebab halaman kosong setelah pembaruan HTML dan perbaiki proporsi tampilan modal pratinjau pada layar smartphone."*
* **Penyesuaian & Perbaikan Mandiri oleh Pengembang:**
  * Menyusun dan mengintegrasikan 11 modul kurikulum beserta bank soal kuis di 3 bidang utama (**Teknologi, Desain, dan Komunikasi**).
  * Mengembangkan sistem isolasi akun lokal (`Username + PIN 4 Angka`) menggunakan awalan kunci `sb_<username>_` pada `localStorage` serta fitur ekspor/impor kode cadangan progres berbasis Base64.
  * Menambahkan 4 *template* proyek siap pakai (*Web, Kartu Profil, App Mini, dan Naskah Pitch*) serta kustomisasi pop-up modern di dalam *iframe* preview agar nyaman dipakai di layar HP.
  * Melakukan validasi pasangan tag HTML (`<section>`), memperbaiki fungsi pemilih bidang & filter portofolio pada JavaScript, serta menyesuaikan ukuran elemen CSS (navigasi dropdown mengambang, kartu beranda, dan modal pratinjau) agar sepenuhnya responsif.

---

## d. Panduan Penggunaan
1. **Buka Situs Web Aktif:** Akses tautan publikasi aplikasi melalui browser (Chrome/Safari/Edge):
   * **Tautan Live Website:** `[https://erifayfa.github.io/Skill_Bridge/]`
2. **Masuk / Buat Akun Lokal:** Ketik **Username** (minimal 3 huruf) dan **PIN 4 Angka**, lalu tekan tombol **Masuk & Mulai Belajar**.
3. **Pelajari Materi & Kerjakan Kuis:**
   * Buka menu **Ruang Belajar**, pilih bidang (**Teknologi**, **Desain**, atau **Komunikasi**), baca modul hingga selesai, lalu kerjakan kuis untuk memperoleh XP dan Koin.
   * Selesaikan **Tantangan Harian** di halaman **Beranda** untuk mempertahankan *streak* harian.
4. **Cek Peta Karier & Simulasi:** Gunakan menu **Peta Karier** untuk tes minat dan melihat analisis penguasaan skill (*Skill Gap*), lalu mainkan **Simulasi Karier** untuk melatih pengambilan keputusan dunia kerja.
5. **Berkarya di Studio Proyek:** Buka **Studio Proyek**, pilih bidang atau gunakan *template* cepat, tulis kode HTML/CSS/JS, uji hasilnya secara langsung di layar *Live Preview*, simpan ke daftar portofolio, atau unduh sebagai file `.html`.
6. **Kustomisasi & Cadangkan Progres:** Buka menu **Pengaturan** untuk menukarkan koin dengan karakter maskot baru atau menyalin kode cadangan progresmu.

---

## e. Identitas Pengembang
* Nama Lengkap: ERIFA YULITA FITRI ALDITA
* Kelas: XI-E
* Jurusan: INFORMATIKA TINGKAT LANJUT
* Asal Sekolah: SMAN 4 BLITAR
