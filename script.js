// --- EFEK SUARA INTERAKTIF KALEM & CERIA (KOMPATIBEL HP ANDROID & IOS) ---
let suaraAktif = localStorage.getItem("skillbridge_suara") !== "mati";
let audioCtx = null;
let audioSudahDibuka = false;

function inisialisasiAudio() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
        audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
    }

    if (!audioSudahDibuka && audioCtx) {
        try {
            const buffer = audioCtx.createBuffer(1, 1, 22050);
            const source = audioCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(audioCtx.destination);
            source.start(0);
            audioSudahDibuka = true;
        } catch (e) {}
    }
}

['touchstart', 'pointerdown', 'click'].forEach(eventName => {
    document.addEventListener(eventName, inisialisasiAudio, { once: true, passive: true });
});

function bunyikanSuara(jenis) {
    if (!suaraAktif) return;
    try {
        inisialisasiAudio();
        if (!audioCtx) return;

        const jalankanNada = () => {
            const sekarang = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);

            if (jenis === 'klik') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(520, sekarang);
                osc.frequency.exponentialRampToValueAtTime(840, sekarang + 0.065);
                gain.gain.setValueAtTime(0.12, sekarang);
                gain.gain.exponentialRampToValueAtTime(0.001, sekarang + 0.065);
                osc.start(sekarang);
                osc.stop(sekarang + 0.065);
            } else if (jenis === 'benar') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, sekarang);
                osc.frequency.setValueAtTime(659.25, sekarang + 0.09);
                osc.frequency.setValueAtTime(783.99, sekarang + 0.18);
                gain.gain.setValueAtTime(0.16, sekarang);
                gain.gain.exponentialRampToValueAtTime(0.001, sekarang + 0.38);
                osc.start(sekarang);
                osc.stop(sekarang + 0.38);
            } else if (jenis === 'salah') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(240, sekarang);
                osc.frequency.linearRampToValueAtTime(185, sekarang + 0.25);
                gain.gain.setValueAtTime(0.15, sekarang);
                gain.gain.exponentialRampToValueAtTime(0.001, sekarang + 0.28);
                osc.start(sekarang);
                osc.stop(sekarang + 0.28);
            } else if (jenis === 'pengingat') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(659.25, sekarang);
                osc.frequency.setValueAtTime(987.77, sekarang + 0.11);
                gain.gain.setValueAtTime(0.14, sekarang);
                gain.gain.exponentialRampToValueAtTime(0.001, sekarang + 0.35);
                osc.start(sekarang);
                osc.stop(sekarang + 0.35);
            }
        };

        if (audioCtx.state === 'suspended') {
            audioCtx.resume().then(jalankanNada).catch(() => {});
        } else {
            jalankanNada();
        }
    } catch (e) {}
}

function toggleSuara() {
    suaraAktif = !suaraAktif;
    localStorage.setItem("skillbridge_suara", suaraAktif ? "aktif" : "mati");
    let btn = document.getElementById("tombol-suara");
    if (btn) btn.innerText = suaraAktif ? "Efek Suara: Aktif 🔊" : "Efek Suara: Nonaktif 🔇";
    if (suaraAktif) bunyikanSuara('klik');
}

document.addEventListener("click", function(e) {
    if (e.target.closest("button") || e.target.closest(".menu-item") || e.target.closest(".card-bidang") || e.target.closest(".card-kursus")) {
        if (!e.target.closest("#wadah-opsi-kuis") && !e.target.closest("#btn-selesai-materi") && !e.target.closest("#btn-konfirmasi-ya")) {
            bunyikanSuara('klik');
        }
    }
});

window.addEventListener("DOMContentLoaded", () => {
    let btnSuara = document.getElementById("tombol-suara");
    if (btnSuara) {
        btnSuara.innerText = suaraAktif ? "Efek Suara: Aktif 🔊" : "Efek Suara: Nonaktif 🔇";
    }
});


// --- 0. SISTEM LOGIN & PENYIMPANAN BERBASIS AKUN ---
let akunAktif = localStorage.getItem("skillbridge_current_user");

function kunciAkun(namaData) {
    return `sb_${akunAktif}_${namaData}`;
}

function cekStatusLogin() {
    if (!akunAktif) {
        document.getElementById("layar-login").style.display = "flex";
    } else {
        document.getElementById("layar-login").style.display = "none";
        let elAkun = document.getElementById("label-akun-aktif");
        if (elAkun) elAkun.innerText = akunAktif;
    }
}

function prosesLogin() {
    let username = document.getElementById("input-login-username").value.trim().toLowerCase();
    let pin = document.getElementById("input-login-pin").value.trim();
    let pesanError = document.getElementById("pesan-error-login");

    if (username.length < 3 || pin.length !== 4 || isNaN(pin)) {
        pesanError.innerText = "Username minimal 3 huruf dan PIN harus 4 angka!";
        pesanError.style.display = "block";
        return;
    }

    let daftarAkun = JSON.parse(localStorage.getItem("skillbridge_accounts")) || {};

    if (daftarAkun[username]) {
        if (daftarAkun[username] !== pin) {
            pesanError.innerText = "PIN salah untuk username tersebut!";
            pesanError.style.display = "block";
            return;
        }
    } else {
        daftarAkun[username] = pin;
        localStorage.setItem("skillbridge_accounts", JSON.stringify(daftarAkun));
    }

    localStorage.setItem("skillbridge_current_user", username);
    location.reload();
}

document.getElementById("input-login-username").addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        if (this.value.trim() !== "") {
            document.getElementById("input-login-pin").focus();
        }
    }
});

document.getElementById("input-login-pin").addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        let usernameTerisi = document.getElementById("input-login-username").value.trim() !== "";
        let pinTerisi = this.value.trim() !== "";
        if (usernameTerisi && pinTerisi) {
            prosesLogin();
        } else if (!usernameTerisi) {
            document.getElementById("input-login-username").focus();
        }
    }
});

function logoutAkun() {
    localStorage.removeItem("skillbridge_current_user");
    location.reload();
}

cekStatusLogin();


// --- 1. INISIALISASI DATA, KOIN, MASKOT & LEVELING ---
let poinXP = parseInt(localStorage.getItem(kunciAkun("xp"))) || 0;
let jumlahKoin = parseInt(localStorage.getItem(kunciAkun("koin"))) || 0;
let maskotAktif = localStorage.getItem(kunciAkun("maskot")) || "🌟";
let maskotDimiliki = JSON.parse(localStorage.getItem(kunciAkun("maskot_dimiliki"))) || ["🌟"];
let jumlahStreak = parseInt(localStorage.getItem(kunciAkun("streak"))) || 0;

let kursusAktif = "html";
let topikKuisAktif = "html";

let materiSelesai = JSON.parse(localStorage.getItem(kunciAkun("materi_selesai"))) || [];
let kuisSelesai = JSON.parse(localStorage.getItem(kunciAkun("kuis_selesai"))) || [];

const katalogMaskot = [
    { emoji: "🌟", nama: "Bintang Klasik", harga: 0 },
    { emoji: "🚀", nama: "Bintang Roket", harga: 20 },
    { emoji: "🪄", nama: "Bintang Penyihir", harga: 35 },
    { emoji: "🤖", nama: "Bintang Robot", harga: 50 },
    { emoji: "🦊", nama: "Rubah Cerdik", harga: 70 },
    { emoji: "🦉", nama: "Burung Hantu", harga: 90 },
    { emoji: "🐱", nama: "Kucing Koder", harga: 110 },
    { emoji: "🐼", nama: "Panda Fokus", harga: 130 },
    { emoji: "🦄", nama: "Unicorn Kreatif", harga: 160 },
    { emoji: "👑", nama: "Bintang Raja", harga: 200 }
];

function simpanStatusMateri(idKursus) {
    if (!materiSelesai.includes(idKursus)) {
        materiSelesai.push(idKursus);
        localStorage.setItem(kunciAkun("materi_selesai"), JSON.stringify(materiSelesai));
    }
}

function simpanStatusKuis(idKursus) {
    if (!kuisSelesai.includes(idKursus)) {
        kuisSelesai.push(idKursus);
        localStorage.setItem(kunciAkun("kuis_selesai"), JSON.stringify(kuisSelesai));
    }
}

function perbaruiLevel() {
    let teksStatus = "Pemula 🌱";
    if (poinXP >= 50 && poinXP < 150) teksStatus = "Menengah 🚀";
    else if (poinXP >= 150) teksStatus = "Mahir 👑";

    let elemenStatus = document.getElementById("status-level");
    if (elemenStatus) elemenStatus.innerText = teksStatus;
    let elXP = document.getElementById("tampilan-xp");
    if (elXP) elXP.innerText = poinXP + " XP";
}
perbaruiLevel();

function perbaruiTampilanKoin() {
    localStorage.setItem(kunciAkun("koin"), jumlahKoin);
    let elBeranda = document.getElementById("tampilan-koin");
    let elToko = document.getElementById("tampilan-koin-toko");
    if (elBeranda) elBeranda.innerText = `${jumlahKoin} 🪙`;
    if (elToko) elToko.innerText = `🪙 ${jumlahKoin} Koin`;
}
perbaruiTampilanKoin();

if (localStorage.getItem("skillbridge_tema") === "gelap") {
    document.body.classList.add("dark-mode");
    let btnTema = document.getElementById("tombol-tema");
    if (btnTema) btnTema.innerText = "Beralih ke Mode Terang ☀️";
}

let namaTersimpan = localStorage.getItem(kunciAkun("nama")) || akunAktif;
if (namaTersimpan) {
    let inputNama = document.getElementById("input-nama-profil");
    if (inputNama) inputNama.value = namaTersimpan;
    let sapaanProfil = document.getElementById("sapaan-profil");
    if (sapaanProfil) sapaanProfil.innerText = "Halo, " + namaTersimpan + "! Selamat belajar.";
    let sapaanBeranda = document.getElementById("sapaan-beranda");
    if (sapaanBeranda) sapaanBeranda.innerText = `Halo ${namaTersimpan}, siap mengembangkan keahlianmu hari ini?`;
}

let maskotBeranda = document.getElementById("maskot-beranda");
if (maskotBeranda) maskotBeranda.innerText = maskotAktif;


// --- 2. DATABASE KURIKULUM LENGKAP (PEMULA & MENENGAH) ---
const kurikulumSkillBridge = {
    html: {
        kategori: "teknologi",
        tingkat: "Pemula",
        labelKategori: "💻 Teknologi",
        judul: "Dasar-Dasar HTML",
        deskripsi: "Bangun kerangka dasar website dari nol menggunakan tag HTML.",
        tujuan: ["Memahami fungsi tag pembuka dan penutup.", "Membuat judul, paragraf, dan tombol.", "Menyusun struktur dokumen web."],
        modulSingkat: "Pengenalan Tag, Elemen, dan Struktur HTML.",
        materi: {
            judulUtama: "1.1 Mengenal Struktur Dasar HTML",
            subJudul: "Tulang Punggung Website",
            teks: "HTML (HyperText Markup Language) adalah bahasa standar untuk membuat halaman web. Bayangkan HTML seperti kerangka rumah. Setiap elemen diapit oleh tanda kurung sudut, misalnya <h1> untuk judul utama dan <p> untuk paragraf.",
            labelContoh: "Contoh Kode HTML:",
            kode: `<h1>Selamat Datang</h1>\n<p>Ini adalah paragraf pertamaku.</p>\n<button>Mulai Sekarang</button>`
        },
        kuis: [
            { pertanyaan: "Apa kepanjangan dari HTML?", opsi: ["HyperText Markup Language", "High Tech Modern Language", "Hyper Tool Multi Link", "Home Text Markup"], benar: 0, penjelasan: "HTML adalah singkatan dari HyperText Markup Language." },
            { pertanyaan: "Tag mana yang digunakan untuk membuat paragraf?", opsi: ["<h1>", "<par>", "<p>", "<text>"], benar: 2, penjelasan: "Tag <p> digunakan untuk mendefinisikan sebuah paragraf teks." },
            { pertanyaan: "Tag judul mana yang ukurannya paling besar?", opsi: ["<h6>", "<head>", "<title>", "<h1>"], benar: 3, penjelasan: "<h1> adalah heading tingkat pertama dengan ukuran paling besar." }
        ]
    },
    css: {
        kategori: "teknologi",
        tingkat: "Pemula",
        labelKategori: "💻 Teknologi",
        judul: "Dasar-Dasar CSS",
        deskripsi: "Hias dan atur tata letak websitemu agar tampak modern dan responsif.",
        tujuan: ["Mengubah warna teks dan latar belakang.", "Mengatur jarak (margin & padding).", "Memahami selektor dasar CSS."],
        modulSingkat: "Selektor, Pewarnaan, dan Box Model CSS.",
        materi: {
            judulUtama: "1.1 Mewarnai Web dengan CSS",
            subJudul: "Mempercantik Tampilan",
            teks: "CSS (Cascading Style Sheets) bertugas mengatur gaya visual dari kerangka HTML. Kamu memilih elemen HTML (selektor), lalu menentukan properti seperti warna (color) dan ukuran huruf (font-size).",
            labelContoh: "Contoh Kode CSS:",
            kode: `h1 {\n  color: #8b5cf6;\n  font-size: 32px;\n}\n\nbutton {\n  background-color: purple;\n  color: white;\n}`
        },
        kuis: [
            { pertanyaan: "Apa fungsi utama CSS dalam pembuatan web?", opsi: ["Menyimpan database", "Mengatur gaya visual dan tata letak", "Membuat logika matematika", "Menghubungkan ke server"], benar: 1, penjelasan: "CSS mengatur warna, font, dan posisi elemen HTML." },
            { pertanyaan: "Properti CSS untuk mengubah warna teks adalah?", opsi: ["bg-color", "text-style", "color", "font-color"], benar: 2, penjelasan: "Properti 'color' digunakan untuk mengatur warna tulisan." }
        ]
    },
    js: {
        kategori: "teknologi",
        tingkat: "Pemula",
        labelKategori: "💻 Teknologi",
        judul: "Dasar-Dasar JavaScript",
        deskripsi: "Buat websitemu interaktif, cerdas, dan merespons klik pengguna.",
        tujuan: ["Memahami cara kerja Variabel.", "Membuat Fungsi (Function) sederhana.", "Menampilkan pesan interaktif ke layar."],
        modulSingkat: "Variabel, Fungsi, dan Interaksi Dasar.",
        materi: {
            judulUtama: "1.1 Menghidupkan Web dengan JavaScript",
            subJudul: "Otak dari Website",
            teks: "JavaScript memungkinkan halaman web berinteraksi dengan pengguna. Misalnya mengecek jawaban kuis, menghitung poin XP, atau mengubah tema terang menjadi gelap saat tombol ditekan.",
            labelContoh: "Contoh Kode JavaScript:",
            kode: `let poin = 10;\n\nfunction tambahPoin() {\n  poin = poin + 10;\n  alert("Poin sekarang: " + poin);\n}`
        },
        kuis: [
            { pertanyaan: "Kata kunci untuk membuat variabel di JavaScript modern adalah?", opsi: ["var / let", "int", "string", "make"], benar: 0, penjelasan: "Kata kunci 'let' atau 'const' digunakan untuk mendeklarasikan variabel di JS." },
            { pertanyaan: "Perintah JS untuk memunculkan kotak pesan pop-up bawaan browser adalah?", opsi: ["popup()", "msg()", "alert()", "print()"], benar: 2, penjelasan: "Fungsi alert() menampilkan kotak dialog peringatan di browser." }
        ]
    },
    js_menengah: {
        kategori: "teknologi",
        tingkat: "Menengah",
        labelKategori: "💻 Teknologi",
        judul: "Manipulasi DOM & LocalStorage",
        deskripsi: "Pelajari cara mengubah isi HTML secara dinamis dan menyimpan data di browser.",
        tujuan: ["Mengambil elemen HTML dengan getElementById.", "Mengubah teks dan gaya CSS lewat JS.", "Menyimpan data permanen dengan localStorage."],
        modulSingkat: "DOM Manipulation & Penyimpanan Lokal Browser.",
        materi: {
            judulUtama: "2.1 Mengendalikan Halaman dengan DOM",
            subJudul: "Document Object Model (DOM)",
            teks: "DOM adalah jembatan yang menghubungkan HTML dan JavaScript. Dengan DOM, kamu bisa mengambil elemen berdasarkan ID-nya, lalu mengubah isinya secara langsung tanpa me-refresh halaman. Ditambah localStorage, data pengguna seperti skor XP tidak akan hilang meski browser ditutup.",
            labelContoh: "Contoh Manipulasi DOM & LocalStorage:",
            kode: `// Mengubah teks elemen HTML\ndocument.getElementById("judul").innerText = "Halo!";\n\n// Menyimpan data ke memori browser\nlocalStorage.setItem("namaUser", "Erifa");\nlet nama = localStorage.getItem("namaUser");`
        },
        kuis: [
            { pertanyaan: "Metode JavaScript untuk memilih elemen HTML berdasarkan atribut id-nya adalah?", opsi: ["querySelectorAll()", "getElementById()", "getElementsByClass()", "findId()"], benar: 1, penjelasan: "document.getElementById() mengambil satu elemen spesifik sesuai ID-nya." },
            { pertanyaan: "Fungsi mana yang digunakan untuk menyimpan data ke dalam localStorage?", opsi: ["localStorage.save()", "localStorage.push()", "localStorage.setItem()", "localStorage.add()"], benar: 2, penjelasan: "setItem('kunci', 'nilai') menyimpan pasangan data ke memori browser." },
            { pertanyaan: "Apa tipe data yang disimpan oleh localStorage secara bawaan?", opsi: ["String (Teks)", "Boolean", "Array murni", "Integer"], benar: 0, penjelasan: "localStorage hanya menyimpan data dalam bentuk string, sehingga array perlu diubah dengan JSON.stringify()." }
        ]
    },
    css_menengah: {
        kategori: "teknologi",
        tingkat: "Menengah",
        labelKategori: "💻 Teknologi",
        judul: "Layout Modern: Flexbox & Responsif",
        deskripsi: "Susun tata letak kartu sejajar dan pastikan websitemu rapi di layar HP.",
        tujuan: ["Mengatur posisi elemen dengan display: flex.", "Menggunakan justify-content dan align-items.", "Membuat tampilan adaptif dengan Media Queries."],
        modulSingkat: "CSS Flexbox dan Media Queries untuk Mobile.",
        materi: {
            judulUtama: "2.1 Tata Letak Fleksibel dengan Flexbox",
            subJudul: "Mengatur Baris dan Kolom dengan Mudah",
            teks: "Flexbox memudahkan penyusunan elemen agar sejajar ke samping atau ke bawah secara otomatis. Untuk menyesuaikan tampilan di layar HP yang sempit, kita menggabungkannya dengan @media (max-width: 768px) agar kartu-kartu otomatis tersusun vertikal.",
            labelContoh: "Contoh Flexbox & Media Query:",
            kode: `.wadah-kartu {\n  display: flex;\n  justify-content: space-between;\n  gap: 20px;\n}\n\n@media (max-width: 768px) {\n  .wadah-kartu { flex-direction: column; }\n}`
        },
        kuis: [
            { pertanyaan: "Properti CSS untuk mengaktifkan mode Flexbox pada sebuah wadah adalah?", opsi: ["position: flex;", "display: flex;", "layout: flex;", "flex: active;"], benar: 1, penjelasan: "display: flex mengubah wadah menjadi flex container." },
            { pertanyaan: "Aturan CSS apa yang digunakan agar tampilan berubah saat dibuka di layar HP?", opsi: ["@screen", "@mobile", "@media", "@responsive"], benar: 2, penjelasan: "@media query mendeteksi lebar layar perangkat untuk menerapkan gaya khusus." }
        ]
    },
    uiux: {
        kategori: "desain",
        tingkat: "Pemula",
        labelKategori: "🎨 Desain",
        judul: "Dasar Desain UI/UX",
        deskripsi: "Pelajari cara merancang tampilan aplikasi yang cantik dan mudah dipakai.",
        tujuan: ["Membedakan arti UI dan UX.", "Memahami prinsip hierarki visual.", "Merancang tombol yang ramah pengguna."],
        modulSingkat: "Pengenalan User Interface & User Experience.",
        materi: {
            judulUtama: "1.1 Mengenal UI dan UX",
            subJudul: "Bentuk vs Kenyamanan",
            teks: "UI (User Interface) adalah tampilan visual yang dilihat mata seperti warna dan ikon. UX (User Experience) adalah seberapa mudah dan nyaman aplikasi tersebut digunakan. Desain yang baik bukan hanya indah, tapi juga tidak membingungkan pengguna.",
            labelContoh: "Aturan Emas Desain UI:",
            kode: `1. Kontras Teks: Pastikan tulisan terbaca jelas di atas warna latar.\n2. Ukuran Tombol: Buat tombol cukup besar agar mudah ditekan jari di HP.\n3. Konsistensi: Gunakan warna utama yang seragam di seluruh halaman.`
        },
        kuis: [
            { pertanyaan: "Apa kepanjangan dari UX?", opsi: ["User X-ray", "User Experience", "Ultra Experience", "User Extension"], benar: 1, penjelasan: "UX adalah User Experience (Pengalaman Pengguna)." },
            { pertanyaan: "Mengapa kontras warna penting dalam desain UI?", opsi: ["Agar hemat baterai", "Agar tulisan mudah dibaca", "Agar file lebih kecil", "Hanya untuk gaya"], benar: 1, penjelasan: "Kontras yang baik mencegah mata lelah dan memastikan teks terbaca jelas." }
        ]
    },
    warna: {
        kategori: "desain",
        tingkat: "Pemula",
        labelKategori: "🎨 Desain",
        judul: "Teori Warna & Tipografi",
        deskripsi: "Kuasai psikologi pemilihan warna dan kombinasi huruf yang harmonis.",
        tujuan: ["Mengenal aturan warna 60-30-10.", "Memahami makna psikologis warna.", "Memilih pasangan font yang tepat."],
        modulSingkat: "Aturan 60-30-10 dan Psikologi Warna.",
        materi: {
            judulUtama: "1.1 Rahasia Komposisi Warna",
            subJudul: "Aturan 60-30-10",
            teks: "Desainer profesional menggunakan rumus 60-30-10 agar desain tidak terlihat norak: 60% warna dominan (biasanya putih/abu-abu latar), 30% warna sekunder (kartu/sidebar), dan 10% warna aksen mencolok untuk tombol utama.",
            labelContoh: "Makna Warna Populer:",
            kode: `• Biru: Kepercayaan, teknologi, ketenangan.\n• Ungu: Kreativitas, imajinasi, modern.\n• Hijau: Pertumbuhan, keberhasilan, aman.\n• Kuning/Oranye: Energi, semangat, perhatian.`
        },
        kuis: [
            { pertanyaan: "Dalam aturan warna 60-30-10, berapa persen porsi untuk warna aksen tombol?", opsi: ["60%", "30%", "10%", "50%"], benar: 2, penjelasan: "10% digunakan untuk warna aksen agar tombol penting menonjol." },
            { pertanyaan: "Warna apa yang sering melambangkan keberhasilan atau jawaban benar?", opsi: ["Merah", "Hijau", "Abu-abu", "Hitam"], benar: 1, penjelasan: "Warna hijau secara universal diasosiasikan dengan status aman atau benar." }
        ]
    },
    uiux_menengah: {
        kategori: "desain",
        tingkat: "Menengah",
        labelKategori: "🎨 Desain",
        judul: "Wireframing & Sistem Desain",
        deskripsi: "Merancang kerangka aplikasi (Wireframe) dan komponen yang konsisten.",
        tujuan: ["Membuat sketsa tata letak sebelum coding.", "Menerapkan ruang kosong (Whitespace) secara efektif.", "Membangun komponen tombol dan kartu yang seragam."],
        modulSingkat: "Low-Fidelity Wireframe & Whitespace.",
        materi: {
            judulUtama: "2.1 Merancang Kerangka dengan Wireframe",
            subJudul: "Pentingnya Ruang Kosong (Whitespace)",
            teks: "Sebelum memberi warna pada desain, desainer membuat Wireframe (sketsa kasar tata letak kotak dan teks). Kesalahan pemula adalah memenuhi layar dengan terlalu banyak elemen. Whitespace (jarak kosong antar kartu) justru membuat desain terlihat mewah dan mudah dipindai mata.",
            labelContoh: "Checklist Audit Desain Menengah:",
            kode: `• Apakah jarak antar kartu konsisten (misal: 20px)?\n• Apakah tombol utama dan tombol sekunder mudah dibedakan?\n• Apakah pengguna langsung tahu apa yang harus diklik pertama kali?`
        },
        kuis: [
            { pertanyaan: "Apa fungsi utama dari Whitespace (ruang kosong) dalam desain antarmuka?", opsi: ["Menghemat tinta", "Memberi ruang napas visual agar konten mudah dibaca", "Mempercepat loading internet", "Mengisi bagian yang belum selesai"], benar: 1, penjelasan: "Whitespace mengurangi kepadatan visual dan meningkatkan keterbacaan." },
            { pertanyaan: "Sketsa tata letak awal tanpa warna dan gambar detail disebut?", opsi: ["Mockup", "Wireframe", "Rendering", "Vector"], benar: 1, penjelasan: "Wireframe fokus pada struktur dan penempatan elemen sebelum masuk ke visual." }
        ]
    },
    publicspeaking: {
        kategori: "komunikasi",
        tingkat: "Pemula",
        labelKategori: "💬 Komunikasi",
        judul: "Dasar Public Speaking",
        deskripsi: "Atasi rasa gugup dan sampaikan idemu dengan percaya diri di depan umum.",
        tujuan: ["Menguasai teknik pernapasan anti gugup.", "Menyusun pembukaan presentasi yang memikat.", "Menggunakan bahasa tubuh yang terbuka."],
        modulSingkat: "Mengatasi Demam Panggung & Struktur Bicara.",
        materi: {
            judulUtama: "1.1 Bicara Percaya Diri di Depan Umum",
            subJudul: "Teknik Hook & Pernapasan",
            teks: "Gugup saat berbicara di depan banyak orang adalah hal manusiawi. Kuncinya adalah 30 detik pertama (Hook). Mulailah presentasi dengan pertanyaan menarik atau fakta mengejutkan, bukan sekadar membaca teks di layar.",
            labelContoh: "Struktur Pembukaan Memikat:",
            kode: `1. Tarik napas dalam selama 4 detik sebelum mulai.\n2. Berikan senyuman dan kontak mata ke audiens.\n3. Buka dengan pertanyaan: "Pernahkah kalian membayangkan...?"`
        },
        kuis: [
            { pertanyaan: "Apa istilah untuk kalimat pembuka yang memikat perhatian audiens di awal?", opsi: ["Closing", "Hook", "Buffer", "Script"], benar: 1, penjelasan: "Hook adalah 'kail' pembuka untuk menarik perhatian pendengar sejak detik pertama." },
            { pertanyaan: "Sikap mana yang sebaiknya dihindari saat presentasi?", opsi: ["Kontak mata", "Tersenyum", "Membaca seluruh teks slide tanpa menoleh", "Menggerakkan tangan sewajarnya"], benar: 2, penjelasan: "Membaca seluruh teks membuat audiens bosan dan menurunkan kredibilitas." }
        ]
    },
    copywriting: {
        kategori: "komunikasi",
        tingkat: "Pemula",
        labelKategori: "💬 Komunikasi",
        judul: "Menulis Persuasif (Copywriting)",
        deskripsi: "Pelajari seni merangkai kata yang mampu menggerakkan pembaca.",
        tujuan: ["Memahami formula AIDA.", "Menulis judul (headline) yang menarik.", "Membuat ajakan bertindak (Call to Action)."],
        modulSingkat: "Formula AIDA untuk Tulisan Memikat.",
        materi: {
            judulUtama: "1.1 Seni Merangkai Kata dengan AIDA",
            subJudul: "Formula Klasik Copywriting",
            teks: "Copywriting adalah teknik menulis untuk mengajak pembaca melakukan sesuatu (seperti mendaftar kursus atau mencoba aplikasi). Formula paling ampuh adalah AIDA: Attention (Perhatian), Interest (Minat), Desire (Keinginan), Action (Tindakan).",
            labelContoh: "Penerapan Formula AIDA:",
            kode: `• Attention: "Ingin bisa bikin website sendiri di usia 17 tahun?"\n• Interest: "Pelajari HTML & JS dari nol tanpa ribet."\n• Desire: "Dapatkan sertifikat digital dan pamerkan portofoliomu."\n• Action: "Klik Mulai Belajar Sekarang!"`
        },
        kuis: [
            { pertanyaan: "Apa kepanjangan huruf 'A' yang terakhir dalam formula AIDA?", opsi: ["Attention", "Action", "Analysis", "Audio"], benar: 1, penjelasan: "Action adalah ajakan bertindak bagi pembaca di akhir tulisan." },
            { pertanyaan: "Bagian pertama yang berfungsi mencuri perhatian pembaca disebut?", opsi: ["Attention", "Desire", "Footer", "Link"], benar: 0, penjelasan: "Attention bertugas membuat pembaca berhenti menggulir layar dan fokus." }
        ]
    },
    komunikasi_menengah: {
        kategori: "komunikasi",
        tingkat: "Menengah",
        labelKategori: "💬 Komunikasi",
        judul: "Storytelling & Presentasi Proyek",
        deskripsi: "Kemas penjelasan teknis menjadi cerita yang mudah dipahami semua orang.",
        tujuan: ["Menyusun alur Masalah - Solusi - Dampak.", "Menjelaskan fitur proyek tanpa bahasa yang terlalu rumit.", "Menjawab pertanyaan audiens dengan terstruktur."],
        modulSingkat: "Teknik Pitching Proyek & Storytelling.",
        materi: {
            judulUtama: "2.1 Mempresentasikan Karya dengan Storytelling",
            subJudul: "Kerangka Masalah → Solusi → Dampak",
            teks: "Saat memamerkan proyek seperti aplikasi web, jangan langsung membicarakan baris kodenya. Mulailah dari MASALAH yang dialami orang, tunjukkan bagaimana karyamu menjadi SOLUSI, dan jelaskan DAMPAK positifnya. Teknik ini membuat audiens non-teknis pun langsung paham nilai karyamu.",
            labelContoh: "Contoh Pitching Skill Bridge:",
            kode: `• Masalah: "Banyak pelajar bingung mulai belajar coding dari mana."\n• Solusi: "Saya membangun Skill Bridge, platform belajar interaktif dengan kuis & XP."\n• Dampak: "Belajar terasa seperti bermain game dan progres tersimpan otomatis."`
        },
        kuis: [
            { pertanyaan: "Urutan kerangka storytelling yang paling efektif saat mempresentasikan proyek adalah?", opsi: ["Kode → Harga → Penutup", "Masalah → Solusi → Dampak", "Sejarah → Teori → Daftar Pustaka", "Salam → Demo → Tanya Jawab"], benar: 1, penjelasan: "Menjelaskan masalah terlebih dahulu membuat audiens merasa relevan dengan solusi yang kamu tawarkan." },
            { pertanyaan: "Bagaimana cara terbaik menjelaskan proyek aplikasi kepada audiens umum?", opsi: ["Membacakan seluruh kode JavaScript", "Fokus pada manfaat dan kemudahan yang dirasakan pengguna", "Menggunakan istilah teknis yang rumit", "Berbicara secepat mungkin"], benar: 1, penjelasan: "Audiens umum lebih peduli pada manfaat dan solusi dibandingkan detail teknis di balik layar." }
        ]
    }
};


// --- 3. NAVIGASI & RENDER RUANG BELAJAR ---
function pindahHalaman(idHalaman) {
    document.querySelectorAll('.halaman').forEach(h => h.style.display = 'none');
    let tujuan = document.getElementById('halaman-' + idHalaman);
    if (tujuan) tujuan.style.display = 'block';

    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('aktif'));
    let menuAktif = document.getElementById('menu-' + idHalaman);
    if (menuAktif) menuAktif.classList.add('aktif');

    let wadahMenu = document.getElementById("wadah-menu-utama");
    let btnToggle = document.getElementById("btn-toggle-menu-hp");
    if (wadahMenu && wadahMenu.classList.contains("terbuka")) {
        wadahMenu.classList.remove("terbuka");
        if (btnToggle) btnToggle.innerText = "☰ Menu";
    }

    if (idHalaman === 'peta-karier') {
        hitungSkillGapOtomatis();
        tampilkanRoadmap('teknologi');
    }
    if (idHalaman === 'simulasi') perbaruiTombolSimulasi();
    if (idHalaman === 'studio') {
        let editor = document.getElementById("editor-kode-proyek");
        if (editor && editor.value.trim() === "") muatTemplateProyek('web');
    }
}

function toggleMenuHP() {
    let wadahMenu = document.getElementById("wadah-menu-utama");
    let btnToggle = document.getElementById("btn-toggle-menu-hp");
    if (!wadahMenu) return;

    wadahMenu.classList.toggle("terbuka");
    if (btnToggle) {
        btnToggle.innerText = wadahMenu.classList.contains("terbuka") ? "✕ Tutup" : "☰ Menu";
    }
}

function bukaRuangBelajar(filterDipilih = 'semua') {
    pindahHalaman('ruang-belajar');
    
    document.querySelectorAll('.btn-filter').forEach(b => {
        if (!b.classList.contains('btn-filter-kuis')) b.classList.remove('aktif');
    });
    let btnFilter = document.getElementById('filter-' + filterDipilih);
    if (btnFilter) btnFilter.classList.add('aktif');

    let wadah = document.getElementById("wadah-daftar-kursus");
    wadah.innerHTML = "";

    for (let idKursus in kurikulumSkillBridge) {
        let item = kurikulumSkillBridge[idKursus];
        let cocok = false;
        if (filterDipilih === 'semua') cocok = true;
        else if (filterDipilih === 'menengah' && item.tingkat === 'Menengah') cocok = true;
        else if (item.kategori === filterDipilih) cocok = true;

        if (cocok) {
            let isMateriSelesai = materiSelesai.includes(idKursus);
            let kelasBadgeTingkat = item.tingkat === "Menengah" ? "badge-menengah" : "badge";
            
            let kartu = document.createElement("div");
            kartu.className = "card-kursus" + (isMateriSelesai ? " sudah-selesai" : "");
            kartu.onclick = () => bukaDetailKursus(idKursus);
            
            kartu.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 5px;">
                    <div style="display: flex; gap: 6px; align-items: center;">
                        <span class="badge">${item.labelKategori}</span>
                        <span class="${kelasBadgeTingkat}">${item.tingkat}</span>
                    </div>
                    ${isMateriSelesai ? '<span class="badge-selesai">Materi Sudah Dipelajari ✓</span>' : ''}
                </div>
                <h4>${item.judul}</h4>
                <p>${item.deskripsi}</p>
                <span style="font-size: 12px; color: var(--primary-color); font-weight: bold;">
                    ${isMateriSelesai ? 'Ulangi Materi atau Kuis →' : '1 Modul & Kuis Interaktif →'}
                </span>
            `;
            wadah.appendChild(kartu);
        }
    }
}

function bukaDetailKursus(idKursus) {
    kursusAktif = idKursus;
    let kursus = kurikulumSkillBridge[idKursus];
    if (!kursus) return;

    let isMateriSelesai = materiSelesai.includes(idKursus);

    document.getElementById("badge-kategori-detail").innerText = `${kursus.labelKategori} • ${kursus.tingkat}`;
    document.getElementById("judul-detail-kursus").innerHTML = kursus.judul + (isMateriSelesai ? ' <span class="badge-selesai" style="vertical-align: middle; margin-left: 8px;">Materi Sudah Dipelajari ✓</span>' : '');
    document.getElementById("deskripsi-detail-kursus").innerText = kursus.deskripsi;
    document.getElementById("materi-detail-kursus").innerText = kursus.modulSingkat;

    let wadahTujuan = document.getElementById("tujuan-detail-kursus");
    wadahTujuan.innerHTML = "";
    kursus.tujuan.forEach(t => {
        let li = document.createElement("li");
        li.innerText = t;
        wadahTujuan.appendChild(li);
    });

    pindahHalaman("detail-kursus");
}

function mulaiMateri() {
    let kursus = kurikulumSkillBridge[kursusAktif];
    if (!kursus) return;

    document.getElementById("materi-judul-utama").innerText = kursus.materi.judulUtama;
    document.getElementById("materi-subjudul").innerText = kursus.materi.subJudul;
    document.getElementById("materi-teks").innerText = kursus.materi.teks;
    document.getElementById("label-contoh-praktik").innerText = kursus.materi.labelContoh;
    document.getElementById("materi-kode").innerText = kursus.materi.kode;

    let isMateriSelesai = materiSelesai.includes(kursusAktif);
    let btnSelesai = document.getElementById("btn-selesai-materi");

    if (isMateriSelesai) {
        document.getElementById("bar-progres-materi").style.width = "100%";
        document.getElementById("teks-progres-materi").innerText = "100%";
        btnSelesai.classList.remove("btn-outline");
        btnSelesai.classList.add("btn-disabled");
        btnSelesai.innerText = "Sudah Dipelajari ✓";
        btnSelesai.disabled = true;
    } else {
        document.getElementById("bar-progres-materi").style.width = "0%";
        document.getElementById("teks-progres-materi").innerText = "0%";
        btnSelesai.classList.remove("btn-disabled");
        btnSelesai.classList.add("btn-outline");
        btnSelesai.innerText = "Tandai Selesai ✓";
        btnSelesai.disabled = false;
    }

    pindahHalaman("materi-belajar");
}

function tandaiSelesai() {
    document.getElementById("bar-progres-materi").style.width = "100%";
    document.getElementById("teks-progres-materi").innerText = "100%";
    let btnSelesai = document.getElementById("btn-selesai-materi");
    btnSelesai.classList.remove("btn-outline");
    btnSelesai.classList.add("btn-disabled");
    btnSelesai.innerText = "Sudah Dipelajari ✓";
    btnSelesai.disabled = true;

    bunyikanSuara('benar');
    simpanStatusMateri(kursusAktif);

    let bonusXP = kurikulumSkillBridge[kursusAktif].tingkat === "Menengah" ? 25 : 15;
    let dapatKoin = 10;
    jumlahKoin += dapatKoin;
    perbaruiTampilanKoin();
    tampilkanNotifikasi(`Materi selesai! +${bonusXP} XP & +${dapatKoin} Koin! 🪙`);

    poinXP += bonusXP;
    localStorage.setItem(kunciAkun("xp"), poinXP);
    perbaruiLevel();
}


// --- 4. LOBI KUIS & KUIS DINAMIS ---
function bukaLobiKuis(filterDipilih = 'semua') {
    pindahHalaman('lobi-kuis');

    document.querySelectorAll('.btn-filter-kuis').forEach(b => b.classList.remove('aktif'));
    let btnFilter = document.getElementById('filter-kuis-' + filterDipilih);
    if (btnFilter) btnFilter.classList.add('aktif');

    let wadah = document.getElementById("wadah-pilihan-kuis");
    wadah.innerHTML = "";

    for (let idKursus in kurikulumSkillBridge) {
        let item = kurikulumSkillBridge[idKursus];
        let cocok = (filterDipilih === 'semua' || item.kategori === filterDipilih);

        if (cocok) {
            let isKuisSelesai = kuisSelesai.includes(idKursus);
            let kelasBadgeTingkat = item.tingkat === "Menengah" ? "badge-menengah" : "badge";
            
            let kartu = document.createElement("div");
            kartu.className = "card";
            kartu.style.minWidth = "270px";
            if (isKuisSelesai) kartu.style.borderLeft = "5px solid #10b981";
            
            kartu.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 5px; flex-wrap: wrap;">
                    <div style="display: flex; gap: 5px;">
                        <span class="badge">${item.labelKategori}</span>
                        <span class="${kelasBadgeTingkat}">${item.tingkat}</span>
                    </div>
                    ${isKuisSelesai ? '<span class="badge-selesai">Kuis Selesai ✓</span>' : ''}
                </div>
                <h3 class="mt-10">${item.judul}</h3>
                <p style="font-size: 13px; color: var(--text-secondary); margin: 10px 0;">${item.kuis.length} Soal Pilihan Ganda</p>
                <button onclick="mulaiKuis('${idKursus}')" style="width: 100%;">
                    ${isKuisSelesai ? 'Latihan Ulang 🎯' : 'Mulai Kuis 🎯'}
                </button>
            `;
            wadah.appendChild(kartu);
        }
    }
}

let indeksSoalSaatIni = 0;
let skorKuis = 0;

function mulaiKuis(idTopik) {
    topikKuisAktif = idTopik || kursusAktif || "html";
    indeksSoalSaatIni = 0;
    skorKuis = 0;
    document.getElementById("skor-sementara").innerText = skorKuis;
    document.getElementById("badge-topik-kuis").innerText = `${kurikulumSkillBridge[topikKuisAktif].judul} (${kurikulumSkillBridge[topikKuisAktif].tingkat})`;
    
    pindahHalaman('kuis-interaktif');
    tampilkanSoal();
}

function tampilkanSoal() {
    let daftarSoal = kurikulumSkillBridge[topikKuisAktif].kuis;
    let soal = daftarSoal[indeksSoalSaatIni];

    document.getElementById("teks-pertanyaan").innerText = soal.pertanyaan;
    document.getElementById("teks-posisi-soal").innerText = `Soal ${indeksSoalSaatIni + 1} dari ${daftarSoal.length}`;
    document.getElementById("bar-progres-kuis").style.width = (((indeksSoalSaatIni + 1) / daftarSoal.length) * 100) + "%";

    let wadahOpsi = document.getElementById("wadah-opsi-kuis");
    wadahOpsi.innerHTML = "";
    document.getElementById("feedback-kuis").style.display = "none";
    document.getElementById("btn-lanjut-kuis").style.display = "none";

    soal.opsi.forEach((teksOpsi, index) => {
        let btn = document.createElement("button");
        btn.innerText = "ABCD"[index] + ". " + teksOpsi;
        btn.onclick = () => cekJawabanKuis(btn, index, soal.benar, soal.penjelasan);
        wadahOpsi.appendChild(btn);
    });
}

function cekJawabanKuis(tombolDipilih, indeksDipilih, indeksBenar, penjelasan) {
    let feedbackBox = document.getElementById("feedback-kuis");
    let teksFeedback = document.getElementById("teks-feedback");
    let btnLanjut = document.getElementById("btn-lanjut-kuis");
    let semuaOpsi = document.querySelectorAll("#wadah-opsi-kuis button");

    semuaOpsi.forEach(btn => btn.disabled = true);

    if (indeksDipilih === indeksBenar) {
        bunyikanSuara('benar');
        tombolDipilih.classList.add("benar");
        teksFeedback.innerText = "Benar! " + penjelasan;
        feedbackBox.style.borderLeftColor = "#34d399";
        skorKuis += 1;
        document.getElementById("skor-sementara").innerText = skorKuis;
    } else {
        bunyikanSuara('salah');
        tombolDipilih.classList.add("salah");
        semuaOpsi[indeksBenar].classList.add("benar");
        teksFeedback.innerText = "Kurang tepat. " + penjelasan;
        feedbackBox.style.borderLeftColor = "#f87171";
    }

    feedbackBox.style.display = "block";
    let daftarSoal = kurikulumSkillBridge[topikKuisAktif].kuis;
    btnLanjut.innerText = (indeksSoalSaatIni === daftarSoal.length - 1) ? "Selesai & Klaim XP 🏆" : "Soal Berikutnya →";
    btnLanjut.style.display = "inline-block";
}

function lanjutSoal() {
    let daftarSoal = kurikulumSkillBridge[topikKuisAktif].kuis;
    indeksSoalSaatIni++;
    if (indeksSoalSaatIni < daftarSoal.length) {
        tampilkanSoal();
    } else {
        let pengaliXP = kurikulumSkillBridge[topikKuisAktif].tingkat === "Menengah" ? 15 : 10;
        let totalXPDidapat = skorKuis * pengaliXP;
        
        simpanStatusKuis(topikKuisAktif);
        if (skorKuis === daftarSoal.length) {
            localStorage.setItem(kunciAkun("sempurna"), "true");
        }
        
        let dapatKoin = skorKuis * 5;
        jumlahKoin += dapatKoin;
        perbaruiTampilanKoin();
        
        poinXP += totalXPDidapat;
        localStorage.setItem(kunciAkun("xp"), poinXP);
        perbaruiLevel();

        let tanggalHariIni = new Date().toLocaleDateString();
        if (sedangMengerjakanTantanganHarian && localStorage.getItem(kunciAkun("daily_date")) !== tanggalHariIni) {
            localStorage.setItem(kunciAkun("daily_date"), tanggalHariIni);
            jumlahStreak += 1;
            localStorage.setItem(kunciAkun("streak"), jumlahStreak);
            sedangMengerjakanTantanganHarian = false;
            cekTantanganHarian();
            
            bunyikanSuara('benar');
            tampilkanNotifikasi(`Api Menyala! Streak ${jumlahStreak} hari! +${totalXPDidapat} XP & +${dapatKoin} Koin! 🔥🏆`, false);
        } else {
            sedangMengerjakanTantanganHarian = false;
            tampilkanNotifikasi(`Kuis Selesai! Benar ${skorKuis}/${daftarSoal.length}. +${totalXPDidapat} XP & +${dapatKoin} Koin! 🏆`);
        }

        bukaLobiKuis('semua');
    }
}


// --- 5. STUDIO PROYEK (AUTO-CODING, SMART ENTER & LIVE PREVIEW MODERN) ---
let daftarProyek = JSON.parse(localStorage.getItem(kunciAkun("proyek"))) || [];
let indeksProyekAkanDihapus = null;
let indeksProyekSedangDiedit = null;

const kamusAutocomplete = [
    { label: "<div>...</div>", sisip: "<div>\n  \n</div>", mundur: 7 },
    { label: "<h1>...</h1>", sisip: "<h1></h1>", mundur: 5 },
    { label: "<h2>...</h2>", sisip: "<h2></h2>", mundur: 5 },
    { label: "<p>...</p>", sisip: "<p></p>", mundur: 4 },
    { label: "<button>...</button>", sisip: "<button onclick=\"\"></button>", mundur: 9 },
    { label: "<input type=\"text\">", sisip: "<input type=\"text\" placeholder=\"\">", mundur: 2 },
    { label: "<input type=\"number\">", sisip: "<input type=\"number\" placeholder=\"\">", mundur: 2 },
    { label: "<a href=\"\">...</a>", sisip: "<a href=\"https://\" target=\"_blank\"></a>", mundur: 4 },
    { label: "<img src=\"\">", sisip: "<img src=\"\" alt=\"gambar\" style=\"max-width: 100%;\">", mundur: 41 },
    { label: "<ul><li>...</li></ul>", sisip: "<ul>\n  <li></li>\n</ul>", mundur: 11 },
    { label: "<style>...</style>", sisip: "<style>\n  \n</style>", mundur: 9 },
    { label: "<script>...</script>", sisip: "<script>\n  \n</script>", mundur: 10 },
    { label: "display: flex;", sisip: "display: flex; justify-content: center; align-items: center;", mundur: 0 },
    { label: "background: linear-gradient(...)", sisip: "background: linear-gradient(135deg, #8b5cf6, #6366f1);", mundur: 0 },
    { label: "border-radius: 12px;", sisip: "border-radius: 12px;", mundur: 0 },
    { label: "document.getElementById()", sisip: "document.getElementById('')", mundur: 2 }
];

function gantiTabStudio(mode) {
    document.getElementById("tab-studio-buat").classList.remove("aktif");
    document.getElementById("tab-studio-link").classList.remove("aktif");
    document.getElementById("tab-studio-" + mode).classList.add("aktif");

    document.getElementById("wadah-studio-buat").style.display = (mode === 'buat') ? "block" : "none";
    document.getElementById("wadah-studio-link").style.display = (mode === 'link') ? "block" : "none";
}

function perbaruiNomorBaris() {
    let editor = document.getElementById("editor-kode-proyek");
    let wadahNomor = document.getElementById("nomor-baris-kode");
    let infoBaris = document.getElementById("info-jumlah-baris");
    if (!editor || !wadahNomor) return;

    let teks = editor.value;
    let jumlahBaris = teks.split("\n").length;
    let daftarAngka = [];
    for (let i = 1; i <= jumlahBaris; i++) {
        daftarAngka.push(i);
    }
    wadahNomor.innerHTML = daftarAngka.join("<br>");

    if (infoBaris) {
        infoBaris.innerText = `${jumlahBaris} Baris • ${teks.length} Karakter`;
    }
}

function sinkronScrollEditor() {
    let editor = document.getElementById("editor-kode-proyek");
    let wadahNomor = document.getElementById("nomor-baris-kode");
    if (editor && wadahNomor) {
        wadahNomor.scrollTop = editor.scrollTop;
    }
}

function saatEditorDiketik() {
    perbaruiNomorBaris();
    jalankanPreviewProyek();
    tampilkanSaranAutocomplete();
}

function tampilkanSaranAutocomplete() {
    let editor = document.getElementById("editor-kode-proyek");
    let kotakSaran = document.getElementById("kotak-saran-kode");
    if (!editor || !kotakSaran) return;

    let pos = editor.selectionStart;
    let teksSebelum = editor.value.substring(0, pos);
    let kecocokanKata = teksSebelum.match(/([a-zA-Z0-9_<:-]+)$/);

    if (!kecocokanKata || kecocokanKata[1].length < 2) {
        kotakSaran.style.display = "none";
        return;
    }

    let kataKetik = kecocokanKata[1].toLowerCase();
    let hasil = kamusAutocomplete.filter(item =>
        item.label.toLowerCase().includes(kataKetik)
    ).slice(0, 5);

    if (hasil.length === 0) {
        kotakSaran.style.display = "none";
        return;
    }

    kotakSaran.innerHTML = "";
    hasil.forEach((item, idx) => {
        let btn = document.createElement("button");
        btn.type = "button";
        btn.className = "item-saran-kode" + (idx === 0 ? " aktif" : "");
        btn.innerText = item.label;
        btn.onmousedown = (e) => {
            e.preventDefault();
            terapkanAutocomplete(item, kecocokanKata[1].length);
        };
        kotakSaran.appendChild(btn);
    });
    kotakSaran.style.display = "flex";
}

function terapkanAutocomplete(item, panjangKataKetik) {
    let editor = document.getElementById("editor-kode-proyek");
    let kotakSaran = document.getElementById("kotak-saran-kode");
    let pos = editor.selectionStart;
    let awalGanti = pos - panjangKataKetik;

    editor.value = editor.value.substring(0, awalGanti) + item.sisip + editor.value.substring(pos);
    let posisiBaru = awalGanti + item.sisip.length - (item.mundur || 0);
    editor.selectionStart = editor.selectionEnd = posisiBaru;
    editor.focus();

    if (kotakSaran) kotakSaran.style.display = "none";
    perbaruiNomorBaris();
    jalankanPreviewProyek();
}

function aturTombolTabEditor(e) {
    let editor = e.target;
    let mulai = editor.selectionStart;
    let akhir = editor.selectionEnd;
    let nilai = editor.value;
    let kotakSaran = document.getElementById("kotak-saran-kode");

    // 1. Jika popup autocomplete terbuka & user menekan Tab / Enter / Escape
    if (kotakSaran && kotakSaran.style.display === "flex") {
        if (e.key === "Escape") {
            e.preventDefault();
            kotakSaran.style.display = "none";
            return;
        }
        if (e.key === "Tab") {
            e.preventDefault();
            let itemPertama = kotakSaran.querySelector(".item-saran-kode");
            if (itemPertama) itemPertama.dispatchEvent(new MouseEvent("mousedown"));
            return;
        }
    }

    // 2. Indentasi dengan tombol Tab
    if (e.key === "Tab") {
        e.preventDefault();
        editor.value = nilai.substring(0, mulai) + "  " + nilai.substring(akhir);
        editor.selectionStart = editor.selectionEnd = mulai + 2;
        saatEditorDiketik();
        return;
    }

    // 3. Auto-Close Tag HTML saat mengetik '>'
    if (e.key === ">") {
        let sebelumKursor = nilai.substring(0, mulai);
        let tagMatch = sebelumKursor.match(/<([a-zA-Z][a-zA-Z0-9-]*)([^>/]*)$/);
        const voidTags = ["br", "hr", "img", "input", "meta", "link"];
        if (tagMatch && !voidTags.includes(tagMatch[1].toLowerCase())) {
            e.preventDefault();
            let namaTag = tagMatch[1];
            let sisipan = `></${namaTag}>`;
            editor.value = nilai.substring(0, mulai) + sisipan + nilai.substring(akhir);
            editor.selectionStart = editor.selectionEnd = mulai + 1;
            saatEditorDiketik();
            return;
        }
    }

    // 4. Auto-Close Kurung & Tanda Kutip: { }, ( ), [ ], " ", ' '
    const pasanganOtomatis = { "{": "}", "(": ")", "[": "]", "\"": "\"", "'": "'" };
    if (pasanganOtomatis[e.key]) {
        e.preventDefault();
        let tutup = pasanganOtomatis[e.key];
        editor.value = nilai.substring(0, mulai) + e.key + tutup + nilai.substring(akhir);
        editor.selectionStart = editor.selectionEnd = mulai + 1;
        saatEditorDiketik();
        return;
    }

    // 5. Smart Indent saat menekan Enter di antara tag atau kurung
    if (e.key === "Enter") {
        let barisSaatIni = nilai.substring(0, mulai).split("\n").pop();
        let spasiAwal = barisSaatIni.match(/^\s*/)[0];
        let karakterSebelum = nilai[mulai - 1];
        let karakterSesudah = nilai[mulai];

        if ((karakterSebelum === ">" && karakterSesudah === "<") || (karakterSebelum === "{" && karakterSesudah === "}")) {
            e.preventDefault();
            let sisipEnter = `\n${spasiAwal}  \n${spasiAwal}`;
            editor.value = nilai.substring(0, mulai) + sisipEnter + nilai.substring(akhir);
            editor.selectionStart = editor.selectionEnd = mulai + spasiAwal.length + 3;
            saatEditorDiketik();
            return;
        } else if (spasiAwal.length > 0) {
            e.preventDefault();
            editor.value = nilai.substring(0, mulai) + "\n" + spasiAwal + nilai.substring(akhir);
            editor.selectionStart = editor.selectionEnd = mulai + 1 + spasiAwal.length;
            saatEditorDiketik();
            return;
        }
    }
}

function salinKodeEditor() {
    let kode = document.getElementById("editor-kode-proyek").value;
    if (!kode.trim()) {
        tampilkanNotifikasi("Editor masih kosong! ⚠️");
        return;
    }
    navigator.clipboard.writeText(kode).then(() => {
        tampilkanNotifikasi("Kode berhasil disalin ke clipboard! 📋");
    });
}

function muatTemplateProyek(jenis) {
    const template = {
        web: `<div style="font-family: sans-serif; text-align: center; padding: 30px; background: #f3e8ff; border-radius: 12px;">\n  <h1 style="color: #7c3aed;">Halo, Ini Website Pertamaku! 🚀</h1>\n  <p style="color: #4b5563;">Dibuat langsung di Studio Proyek SkillBridge.</p>\n  <button style="background: #8b5cf6; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;" onclick="alert('Keren! Tombol berfungsi!')">Klik Saya</button>\n</div>`,
        kartu: `<div style="font-family: sans-serif; max-width: 300px; margin: 10px auto; padding: 20px; border: 2px solid #8b5cf6; border-radius: 16px; text-align: center;">\n  <div style="font-size: 40px;">🌟</div>\n  <h2 style="margin: 8px 0;">Nama Kamu</h2>\n  <p style="color: #6b7280; font-size: 13px;">Calon Web Developer & UI/UX Designer</p>\n  <span style="background: #d1fae5; color: #065f46; padding: 4px 10px; border-radius: 12px; font-size: 12px;">Siap Berkolaborasi</span>\n</div>`,
        kalkulator: `<div style="font-family: sans-serif; max-width: 280px; margin: 10px auto; padding: 20px; background: #eef2ff; border-radius: 12px; text-align: center;">\n  <h3 style="color: #3730a3;">Penghitung Target Belajar</h3>\n  <input id="jam" type="number" placeholder="Jam belajar/hari" onkeydown="if(event.key==='Enter') document.getElementById('btn-hitung').click()" style="padding: 8px; width: 80%; border-radius: 6px; border: 1px solid #ccc;">\n  <button id="btn-hitung" onclick="document.getElementById('hasil').innerText = 'Total seminggu: ' + ((Number(document.getElementById('jam').value) || 0) * 7) + ' jam!'" style="margin-top: 10px; padding: 8px 14px; background: #4f46e5; color: white; border: none; border-radius: 6px; cursor: pointer;">Hitung</button>\n  <p id="hasil" style="font-weight: bold; margin-top: 10px; color: #1e1b4b;"></p>\n</div>`,
        pitch: `<div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">\n  <h2 style="color: #7c3aed;">Konsep Proyek: Aplikasi Pengingat Belajar</h2>\n  <p><strong>Masalah:</strong> Banyak pelajar sering menunda waktu belajar karena bingung mulai dari mana.</p>\n  <p><strong>Solusi:</strong> Membuat jadwal belajar harian singkat 15 menit dengan sistem poin.</p>\n  <p><strong>Dampak:</strong> Pelajar lebih konsisten dan tidak mudah stres.</p>\n</div>`
    };
    document.getElementById("editor-kode-proyek").value = template[jenis] || "";
    perbaruiNomorBaris();
    jalankanPreviewProyek();
}

function bersihkanEditorProyek() {
    document.getElementById("editor-kode-proyek").value = "";
    let kotakSaran = document.getElementById("kotak-saran-kode");
    if (kotakSaran) kotakSaran.style.display = "none";
    perbaruiNomorBaris();
    jalankanPreviewProyek();
}

function bungkusKodePreviewModern(kodeMentah) {
    const styleResponsifPreview = `
    <style>
      @media (max-width: 480px) {
        body { zoom: 0.82; margin: 8px; }
      }
    </style>`;

    const skripBantuanPreview = `
    <script>
      window.alert = function(pesan) {
        let lama = document.getElementById('sb-custom-alert');
        if (lama) lama.remove();
        let overlay = document.createElement('div');
        overlay.id = 'sb-custom-alert';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.55);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;font-family:sans-serif;';
        overlay.innerHTML = '<div style="background:#ffffff;color:#1e293b;padding:20px 22px;border-radius:14px;max-width:320px;width:100%;text-align:center;box-shadow:0 12px 28px rgba(0,0,0,0.2);border:1px solid #e2e8f0;">' +
          '<div style="font-size:28px;margin-bottom:8px;">✨</div>' +
          '<p style="margin:0 0 16px 0;font-size:14px;line-height:1.5;font-weight:500;">' + String(pesan) + '</p>' +
          '<button id="sb-alert-ok" style="background:#8b5cf6;color:#fff;border:none;padding:9px 22px;border-radius:8px;font-weight:bold;font-size:13px;cursor:pointer;width:100%;">OK, Mengerti</button>' +
        '</div>';
        document.body.appendChild(overlay);
        let btnOk = document.getElementById('sb-alert-ok');
        btnOk.focus();
        btnOk.onclick = function() { overlay.remove(); };
        overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
      };

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target && e.target.tagName === 'INPUT') {
          let wadah = e.target.parentElement;
          let tombol = wadah ? wadah.querySelector('button') : document.querySelector('button');
          if (tombol) {
            e.preventDefault();
            tombol.click();
          }
        }
      });
    <\/script>`;
    return styleResponsifPreview + kodeMentah + skripBantuanPreview;
}

function jalankanPreviewProyek() {
    let kode = document.getElementById("editor-kode-proyek").value;
    let iframe = document.getElementById("iframe-preview-proyek");
    if (!iframe) return;
    let doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(bungkusKodePreviewModern(kode));
    doc.close();
}

function bukaPreviewLayarPenuh() {
    let judul = document.getElementById("input-judul-editor").value.trim() || "Pratinjau Proyek";
    let kode = document.getElementById("editor-kode-proyek").value;
    document.getElementById("judul-modal-karya").innerText = judul;
    document.getElementById("modal-lihat-karya").style.display = "flex";
    let iframe = document.getElementById("iframe-modal-karya");
    let doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(bungkusKodePreviewModern(kode));
    doc.close();
}

function pilihBidangProyek(bidang, muatTemplateOtomatis = false) {
    let inputHidden = document.getElementById("pilih-bidang-proyek");
    if (inputHidden) inputHidden.value = bidang;

    document.querySelectorAll(".kartu-pilih-bidang").forEach(btn => {
        btn.classList.toggle("aktif", btn.getAttribute("data-bidang") === bidang);
    });

    if (muatTemplateOtomatis) {
        let editor = document.getElementById("editor-kode-proyek");
        if (editor && editor.value.trim() === "") {
            if (bidang.includes("Desain")) muatTemplateProyek('kartu');
            else if (bidang.includes("Komunikasi")) muatTemplateProyek('pitch');
            else muatTemplateProyek('web');
        }
    }
}

let filterKaryaAktif = 'semua';

function simpanProyekDariEditor() {
    let judul = document.getElementById("input-judul-editor").value.trim();
    let bidang = document.getElementById("pilih-bidang-proyek").value;
    let kode = document.getElementById("editor-kode-proyek").value.trim();

    if (!judul || !kode) {
        tampilkanNotifikasi("Judul dan isi proyek tidak boleh kosong! ⚠️");
        return;
    }

    if (indeksProyekSedangDiedit !== null) {
        daftarProyek[indeksProyekSedangDiedit] = { nama: judul, bidang: bidang, kode: kode, tipe: "editor" };
        localStorage.setItem(kunciAkun("proyek"), JSON.stringify(daftarProyek));
        batalEditProyek();
        tampilkanProyek(filterKaryaAktif);
        bunyikanSuara('benar');
        tampilkanNotifikasi(`Perubahan pada "${judul}" berhasil disimpan! ✏️`);
        return;
    }

    daftarProyek.push({ nama: judul, bidang: bidang, kode: kode, tipe: "editor" });
    localStorage.setItem(kunciAkun("proyek"), JSON.stringify(daftarProyek));

    document.getElementById("input-judul-editor").value = "";
    tampilkanProyek('semua');

    let dapatKoin = 20;
    jumlahKoin += dapatKoin;
    poinXP += 25;
    localStorage.setItem(kunciAkun("xp"), poinXP);
    perbaruiTampilanKoin();
    perbaruiLevel();
    bunyikanSuara('benar');

    tampilkanNotifikasi(`Proyek "${judul}" terbit! +25 XP & +${dapatKoin} Koin! 🎨🪙`, false);
}

function editProyekDariPortofolio(index) {
    let proyek = daftarProyek[index];
    if (!proyek || proyek.tipe !== "editor") return;

    indeksProyekSedangDiedit = index;
    gantiTabStudio('buat');

    document.getElementById("input-judul-editor").value = proyek.nama;
    pilihBidangProyek(proyek.bidang || "💻 Teknologi", false);
    document.getElementById("editor-kode-proyek").value = proyek.kode;

    document.getElementById("judul-mode-editor").innerText = `✏️ Mengedit Proyek: ${proyek.nama}`;
    document.getElementById("btn-simpan-editor").innerText = "Simpan Perubahan 💾";
    document.getElementById("btn-batal-edit").style.display = "inline-block";

    perbaruiNomorBaris();
    jalankanPreviewProyek();
    document.getElementById("wadah-studio-buat").scrollIntoView({ behavior: "smooth" });
}

function batalEditProyek() {
    indeksProyekSedangDiedit = null;
    document.getElementById("input-judul-editor").value = "";
    document.getElementById("judul-mode-editor").innerText = "Workspace Pembuat Proyek";
    document.getElementById("btn-simpan-editor").innerText = "Simpan & Terbitkan Proyek 🚀";
    document.getElementById("btn-batal-edit").style.display = "none";
}

function unduhProyekHTML() {
    let judul = document.getElementById("input-judul-editor").value.trim() || "karya-skillbridge";
    let kode = document.getElementById("editor-kode-proyek").value;

    if (!kode.trim()) {
        tampilkanNotifikasi("Tulis kode terlebih dahulu sebelum mengunduh! ⚠️");
        return;
    }

    let isiFileLengkap = `<!DOCTYPE html>\n<html lang="id">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>${judul}</title>\n</head>\n<body>\n${kode}\n</body>\n</html>`;

    let blob = new Blob([isiFileLengkap], { type: "text/html" });
    let url = URL.createObjectURL(blob);
    let linkUnduh = document.createElement("a");
    linkUnduh.href = url;
    linkUnduh.download = judul.toLowerCase().replace(/[^a-z0-9]/g, "-") + ".html";
    linkUnduh.click();
    URL.revokeObjectURL(url);

    tampilkanNotifikasi("File .html berhasil diunduh! 📥");
}

function bukaModalKarya(index) {
    let proyek = daftarProyek[index];
    if (!proyek) return;
    document.getElementById("judul-modal-karya").innerText = proyek.nama;
    document.getElementById("modal-lihat-karya").style.display = "flex";
    let iframe = document.getElementById("iframe-modal-karya");
    let doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(bungkusKodePreviewModern(proyek.kode));
    doc.close();
}

function tutupModalKarya() {
    let modal = document.getElementById("modal-lihat-karya");
    if (modal) modal.style.display = "none";
}

function bukaModalHapus(index) {
    indeksProyekAkanDihapus = index;
    let namaProyek = daftarProyek[index].nama;
    let judulModal = document.getElementById("judul-modal");
    let btnYa = document.getElementById("btn-konfirmasi-ya");

    judulModal.innerText = "Hapus Proyek?";
    document.getElementById("pesan-modal").innerText = `Apakah kamu yakin ingin menghapus proyek "${namaProyek}"?`;
    btnYa.innerText = "Ya, Hapus 🗑️";
    btnYa.style.backgroundColor = "#ef4444";

    btnYa.onclick = () => {
        if (indeksProyekAkanDihapus !== null) {
            if (indeksProyekSedangDiedit === indeksProyekAkanDihapus) batalEditProyek();
            daftarProyek.splice(indeksProyekAkanDihapus, 1);
            localStorage.setItem(kunciAkun("proyek"), JSON.stringify(daftarProyek));
            tampilkanProyek(filterKaryaAktif);
            tutupModalKonfirmasi();
            tampilkanNotifikasi("Proyek telah dihapus. 🗑️");
        }
    };

    document.getElementById("modal-konfirmasi").style.display = "flex";
}

function tutupModalKonfirmasi() {
    indeksProyekAkanDihapus = null;
    document.getElementById("modal-konfirmasi").style.display = "none";
}

function tampilkanProyek(filterBidang = 'semua') {
    filterKaryaAktif = filterBidang;

    document.querySelectorAll('#halaman-studio .filter-container .btn-filter').forEach(btn => {
        if (btn.id && btn.id.startsWith('filter-karya-')) {
            btn.classList.remove('aktif');
        }
    });

    if (filterBidang === 'semua') document.getElementById('filter-karya-semua')?.classList.add('aktif');
    else if (filterBidang.includes('Teknologi')) document.getElementById('filter-karya-teknologi')?.classList.add('aktif');
    else if (filterBidang.includes('Desain')) document.getElementById('filter-karya-desain')?.classList.add('aktif');
    else if (filterBidang.includes('Komunikasi')) document.getElementById('filter-karya-komunikasi')?.classList.add('aktif');

    let wadah = document.getElementById("koleksi-proyek");
    if (!wadah) return;
    wadah.innerHTML = "";

    let hasilFilter = daftarProyek
        .map((p, idx) => ({ ...p, indexAsli: idx }))
        .filter(p => {
            if (filterBidang === 'semua') return true;
            let bidangProyek = p.bidang || "💻 Teknologi";
            return bidangProyek === filterBidang;
        });

    if (hasilFilter.length === 0) {
        wadah.innerHTML = `<div class="content-box" style="text-align: center; color: var(--text-secondary); font-size: 13.5px;">
            Belum ada proyek pada kategori <strong>${filterBidang === 'semua' ? 'Semua' : filterBidang}</strong>.
        </div>`;
        return;
    }

    hasilFilter.forEach((proyek) => {
        let kartu = document.createElement("div");
        kartu.className = "card";
        kartu.style.minWidth = "260px";

        let labelBidang = proyek.bidang
            ? `<span class="badge">${proyek.bidang}</span>`
            : `<span class="badge">🔗 Tautan Luar</span>`;

        let tombolAksi = proyek.tipe === "editor"
            ? `<div style="display: flex; gap: 6px;">
                <button type="button" onclick="bukaModalKarya(${proyek.indexAsli})" style="padding: 6px 10px; font-size: 12px;">👁️ Lihat</button>
                <button type="button" class="btn-outline" onclick="editProyekDariPortofolio(${proyek.indexAsli})" style="padding: 6px 10px; font-size: 12px;">✏️ Edit</button>
               </div>`
            : `<a href="${proyek.link.startsWith('http') ? proyek.link : 'https://' + proyek.link}" target="_blank" style="background: var(--primary-color); color: white; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: bold; text-decoration: none;">🔗 Buka Tautan</a>`;

        kartu.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px;">
                ${labelBidang}
                <span style="font-size: 11px; color: var(--text-secondary);">${proyek.tipe === 'editor' ? 'Kode Studio' : 'Link Eksternal'}</span>
            </div>
            <h4 class="mt-10">${proyek.nama}</h4>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; gap: 8px;">
                ${tombolAksi}
                <button type="button" onclick="bukaModalHapus(${proyek.indexAsli})" style="background-color: #ef4444; padding: 6px 10px; font-size: 12px;">🗑️</button>
            </div>
        `;
        wadah.appendChild(kartu);
    });
}

function simpanProyek() {
    let namaEl = document.getElementById("input-nama-proyek");
    let linkEl = document.getElementById("input-link-proyek");
    let bidangEl = document.getElementById("pilih-bidang-link");

    let nama = namaEl ? namaEl.value.trim() : "";
    let link = linkEl ? linkEl.value.trim() : "";
    let bidang = bidangEl ? bidangEl.value : "💻 Teknologi";

    if (!nama || !link) {
        tampilkanNotifikasi("Pengingat: Nama dan Link proyek wajib diisi! ⚠️");
        return;
    }

    daftarProyek.push({ nama, link, bidang, tipe: "link" });
    localStorage.setItem(kunciAkun("proyek"), JSON.stringify(daftarProyek));

    if (namaEl) namaEl.value = "";
    if (linkEl) linkEl.value = "";

    tampilkanProyek('semua');

    let dapatKoin = 15;
    jumlahKoin += dapatKoin;
    poinXP += 20;
    localStorage.setItem(kunciAkun("xp"), poinXP);
    perbaruiTampilanKoin();
    perbaruiLevel();
    bunyikanSuara('benar');

    tampilkanNotifikasi(`Tautan "${nama}" berhasil disimpan! +20 XP & +${dapatKoin} Koin! 🚀🪙`, false);
}

tampilkanProyek('semua');

// --- 6. TANTANGAN HARIAN & STREAK ---
let sedangMengerjakanTantanganHarian = false;

function cekTantanganHarian() {
    let tanggalTerakhir = localStorage.getItem(kunciAkun("daily_date"));
    let hariIni = new Date();
    let tanggalHariIni = hariIni.toLocaleDateString();
    let kemarin = new Date();
    kemarin.setDate(hariIni.getDate() - 1);
    let tanggalKemarin = kemarin.toLocaleDateString();

    if (tanggalTerakhir && tanggalTerakhir !== tanggalHariIni && tanggalTerakhir !== tanggalKemarin) {
        jumlahStreak = 0;
        localStorage.setItem(kunciAkun("streak"), 0);
    }

    let sudahSelesaiHariIni = (tanggalTerakhir === tanggalHariIni);
    let elStreak = document.getElementById("tampilan-streak");
    let btnMulai = document.getElementById("btn-mulai-harian");
    let kartuTantangan = document.getElementById("kartu-tantangan");

    if (elStreak) {
        elStreak.classList.remove("streak-padam", "streak-menyala");
        if (sudahSelesaiHariIni && jumlahStreak > 0) {
            elStreak.classList.add("streak-menyala");
            elStreak.innerText = `🔥 ${jumlahStreak} Hari Beruntun`;
        } else {
            elStreak.classList.add("streak-padam");
            elStreak.innerText = jumlahStreak > 0 
                ? `🕯️ ${jumlahStreak} Hari (Belum Nyala Hari Ini)` 
                : `🕯️ 0 Hari (Api Padam)`;
        }
    }

    if (btnMulai) {
        if (sudahSelesaiHariIni) {
            btnMulai.innerText = "Tugas Hari Ini Selesai ✓";
            btnMulai.classList.add("selesai");
            btnMulai.disabled = true;
            if (kartuTantangan) kartuTantangan.style.opacity = "0.75";
        } else {
            btnMulai.innerText = "Kerjakan Tantangan →";
            btnMulai.classList.remove("selesai");
            btnMulai.disabled = false;
            if (kartuTantangan) kartuTantangan.style.opacity = "1";
        }
    }
}

function mulaiTantanganHarian() {
    sedangMengerjakanTantanganHarian = true;
    tampilkanNotifikasi("Selesaikan 1 kuis hingga tuntas untuk menyalakan api streak hari ini! 🕯️→🔥");
    
    let daftarIdKursus = Object.keys(kurikulumSkillBridge);
    let topikAcak = daftarIdKursus[Math.floor(Math.random() * daftarIdKursus.length)];
    mulaiKuis(topikAcak);
}
cekTantanganHarian();

if (akunAktif && localStorage.getItem(kunciAkun("daily_date")) !== new Date().toLocaleDateString()) {
    setTimeout(() => {
        tampilkanNotifikasi("Api harianmu masih padam! Selesaikan tantangan hari ini untuk menyalakannya! 🕯️");
    }, 1200);
}


// --- 7. PENGATURAN (TOKO MASKOT, PROFIL, TEMA, BACKUP) ---
function renderTokoMaskot() {
    let wadah = document.getElementById("wadah-pilihan-maskot");
    if (!wadah) return;
    wadah.innerHTML = "";
    perbaruiTampilanKoin();

    katalogMaskot.forEach(item => {
        let sudahPunya = maskotDimiliki.includes(item.emoji);
        let sedangDipakai = (maskotAktif === item.emoji);

        let kartu = document.createElement("div");
        kartu.className = "card-maskot";
        if (sedangDipakai) kartu.classList.add("dipakai");
        else if (!sudahPunya) kartu.classList.add("terkunci");

        let labelStatus = "";
        if (sedangDipakai) {
            labelStatus = `<span class="status-maskot-tag tag-dipakai">✓ Sedang Dipakai</span>`;
        } else if (sudahPunya) {
            labelStatus = `<span class="status-maskot-tag tag-milik">Dimiliki (Pakai)</span>`;
        } else {
            labelStatus = `<span class="status-maskot-tag tag-harga">🔒 ${item.harga} 🪙</span>`;
        }

        kartu.innerHTML = `
            <div style="font-size: 36px;">${item.emoji}</div>
            <strong style="font-size: 13px;">${item.nama}</strong>
            ${labelStatus}
        `;

        kartu.onclick = () => klikKartuMaskot(item);
        wadah.appendChild(kartu);
    });
}

function klikKartuMaskot(item) {
    let sudahPunya = maskotDimiliki.includes(item.emoji);

    if (sudahPunya) {
        maskotAktif = item.emoji;
        localStorage.setItem(kunciAkun("maskot"), maskotAktif);
        let elMaskot = document.getElementById("maskot-beranda");
        if (elMaskot) elMaskot.innerText = maskotAktif;
        renderTokoMaskot();
        tampilkanNotifikasi(`Karakter diubah menjadi ${item.nama} ${item.emoji}!`, false);
    } else {
        if (jumlahKoin >= item.harga) {
            let modal = document.getElementById("modal-konfirmasi");
            let judulModal = document.getElementById("judul-modal");
            let pesanModal = document.getElementById("pesan-modal");
            let btnYa = document.getElementById("btn-konfirmasi-ya");

            judulModal.innerText = `Beli ${item.nama} ${item.emoji}?`;
            pesanModal.innerText = `Harga karakter ini adalah ${item.harga} 🪙 (Sisa koinmu nanti: ${jumlahKoin - item.harga} 🪙). Lanjutkan pembelian?`;
            btnYa.innerText = `Ya, Beli (${item.harga} 🪙)`;
            btnYa.style.backgroundColor = "#10b981";

            modal.style.display = "flex";

            btnYa.onclick = () => {
                jumlahKoin -= item.harga;
                maskotDimiliki.push(item.emoji);
                maskotAktif = item.emoji;

                localStorage.setItem(kunciAkun("maskot_dimiliki"), JSON.stringify(maskotDimiliki));
                localStorage.setItem(kunciAkun("maskot"), maskotAktif);
                let elMaskot = document.getElementById("maskot-beranda");
                if (elMaskot) elMaskot.innerText = maskotAktif;

                judulModal.innerText = "Hapus Proyek?";
                btnYa.innerText = "Ya, Hapus 🗑️";
                btnYa.style.backgroundColor = "#ef4444";
                tutupModalKonfirmasi();

                bunyikanSuara('benar');
                renderTokoMaskot();
                tampilkanNotifikasi(`Berhasil membeli & memakai ${item.nama} ${item.emoji}! 🎉`, false);
            };
        } else {
            bunyikanSuara('salah');
            let kurang = item.harga - jumlahKoin;
            tampilkanNotifikasi(`Koin belum cukup! Butuh ${kurang} 🪙 lagi. Selesaikan materi atau kuis!`, false);
        }
    }
}
renderTokoMaskot();

function simpanProfil() {
    let nama = document.getElementById("input-nama-profil").value.trim();
    if (!nama) {
        tampilkanNotifikasi("Nama tidak boleh kosong! ⚠️");
        return;
    }
    localStorage.setItem(kunciAkun("nama"), nama);
    document.getElementById("sapaan-profil").innerText = "Halo, " + nama + "! Selamat belajar.";
    document.getElementById("sapaan-beranda").innerText = `Halo ${nama}, siap mengembangkan keahlianmu hari ini?`;
    tampilkanNotifikasi("Profil berhasil disimpan! 💾");
}

document.getElementById("input-nama-profil").addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        simpanProfil();
    }
});

function toggleTema() {
    document.body.classList.toggle("dark-mode");
    let isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("skillbridge_tema", isDark ? "gelap" : "terang");
    document.getElementById("tombol-tema").innerText = isDark ? "Beralih ke Mode Terang ☀️" : "Beralih ke Mode Gelap 🌙";
}

function tampilkanNotifikasi(pesan, putarSuaraPengingat = true) {
    let wadah = document.getElementById("wadah-notifikasi");
    if (!wadah) return;
    
    if (putarSuaraPengingat) {
        bunyikanSuara('pengingat');
    }
    
    let notif = document.createElement("div");
    notif.className = "notifikasi";
    notif.setAttribute("role", "button");
    notif.setAttribute("tabindex", "0");
    notif.title = "Klik untuk menutup notifikasi";
    notif.innerHTML = `<span style="flex: 1;">${pesan}</span><span class="tutup-notif">✕</span>`;
    
    notif.onclick = () => {
        notif.style.opacity = "0";
        notif.style.transform = "translateY(10px)";
        setTimeout(() => notif.remove(), 180);
    };

    wadah.appendChild(notif);
    setTimeout(() => {
        if (notif.parentElement) {
            notif.style.opacity = "0";
            setTimeout(() => notif.remove(), 250);
        }
    }, 3500);
}

function salinKodeBackup() {
    let paketData = {
        user: akunAktif,
        xp: poinXP,
        koin: jumlahKoin,
        streak: jumlahStreak,
        materi: materiSelesai,
        kuis: kuisSelesai,
        proyek: daftarProyek,
        maskot: maskotAktif,
        koleksiMaskot: maskotDimiliki
    };
    let kodeTeks = btoa(JSON.stringify(paketData));
    navigator.clipboard.writeText(kodeTeks).then(() => {
        tampilkanNotifikasi("Kode cadangan disalin! Simpan di catatan HP-mu. 📋");
    });
}

function bukaModalPulihkan() {
    let kodeInput = prompt("Tempelkan (Paste) Kode Cadangan Progresmu di sini:");
    if (!kodeInput) return;
    try {
        let dataPulih = JSON.parse(atob(kodeInput.trim()));
        localStorage.setItem(kunciAkun("xp"), dataPulih.xp || 0);
        localStorage.setItem(kunciAkun("koin"), dataPulih.koin || 0);
        localStorage.setItem(kunciAkun("streak"), dataPulih.streak || 0);
        localStorage.setItem(kunciAkun("materi_selesai"), JSON.stringify(dataPulih.materi || []));
        localStorage.setItem(kunciAkun("kuis_selesai"), JSON.stringify(dataPulih.kuis || []));
        localStorage.setItem(kunciAkun("proyek"), JSON.stringify(dataPulih.proyek || []));
        localStorage.setItem(kunciAkun("maskot"), dataPulih.maskot || "🌟");
        localStorage.setItem(kunciAkun("maskot_dimiliki"), JSON.stringify(dataPulih.koleksiMaskot || ["🌟"]));
        tampilkanNotifikasi("Progres berhasil dipulihkan! Memuat ulang... 🔄");
        setTimeout(() => location.reload(), 1000);
    } catch (e) {
        tampilkanNotifikasi("Kode cadangan tidak valid! ⚠️");
    }
}


// --- 8. FITUR INSTALL APLIKASI KE HP (PWA) ---
let promptInstallPWA;

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    promptInstallPWA = e;
});

function installAplikasi() {
    if (promptInstallPWA) {
        promptInstallPWA.prompt();
        promptInstallPWA.userChoice.then((choice) => {
            if (choice.outcome === 'accepted') {
                tampilkanNotifikasi("Skill Bridge sedang di-install ke perangkatmu! 📲");
            }
            promptInstallPWA = null;
        });
    } else {
        tampilkanNotifikasi("Buka lewat Chrome HP setelah di-upload ke GitHub, lalu pilih 'Install App' di menu titik tiga (⋮). 📲");
    }
}


// --- 9. FITUR PROGRES SAYA & PENCAPAIAN (ACHIEVEMENTS) ---
function bukaHalamanProgres() {
    pindahHalaman('progres');

    let namaUser = localStorage.getItem(kunciAkun("nama")) || akunAktif || "Pengguna SkillBridge";
    document.getElementById("progres-nama-pengguna").innerText = namaUser;
    document.getElementById("progres-avatar").innerText = maskotAktif;

    let levelText = "Pelajar Pemula (Level 1)";
    if (poinXP >= 50 && poinXP < 150) levelText = "Pelajar Menengah (Level 2)";
    else if (poinXP >= 150 && poinXP < 300) levelText = "Pelajar Mahir (Level 3)";
    else if (poinXP >= 300) levelText = "Master SkillBridge (Level 4)";
    document.getElementById("progres-badge-level").innerText = levelText;

    let totalKursus = Object.keys(kurikulumSkillBridge).length;
    document.getElementById("stat-materi-selesai").innerText = `${materiSelesai.length} / ${totalKursus}`;
    document.getElementById("stat-kuis-selesai").innerText = `${kuisSelesai.length} / ${totalKursus}`;
    document.getElementById("stat-total-xp").innerText = `${poinXP} XP`;

    let wadahRiwayat = document.getElementById("wadah-riwayat-selesai");
    if (materiSelesai.length === 0 && kuisSelesai.length === 0) {
        wadahRiwayat.innerHTML = `<p style="color: var(--text-secondary); font-size: 14px;">Belum ada materi atau kuis yang diselesaikan. Yuk mulai belajar!</p>`;
    } else {
        let htmlRiwayat = "";
        materiSelesai.forEach(id => {
            if (kurikulumSkillBridge[id]) {
                htmlRiwayat += `<span class="chip-riwayat">📖 Materi: ${kurikulumSkillBridge[id].judul} ✓</span>`;
            }
        });
        kuisSelesai.forEach(id => {
            if (kurikulumSkillBridge[id]) {
                htmlRiwayat += `<span class="chip-riwayat" style="background-color: #e0e7ff; color: #3730a3;">🎯 Kuis: ${kurikulumSkillBridge[id].judul} ✓</span>`;
            }
        });
        wadahRiwayat.innerHTML = htmlRiwayat;
    }

    let pernahSempurna = localStorage.getItem(kunciAkun("sempurna")) === "true";
    let sudahBikinProyek = daftarProyek.length >= 1;

    const daftarPencapaian = [
        { judul: "Langkah Pertama", deskripsi: "Selesaikan 1 materi pembelajaran.", ikon: "🌱", terbuka: materiSelesai.length >= 1 },
        { judul: "Pelajar Rajin", deskripsi: "Selesaikan 5 materi pembelajaran.", ikon: "📘", terbuka: materiSelesai.length >= 5 },
        { judul: "Mulai Eksplorasi", deskripsi: "Selesaikan setidaknya 1 kuis latihan.", ikon: "🎒", terbuka: kuisSelesai.length >= 1 },
        { judul: "Sempurna!", deskripsi: "Dapatkan nilai 100% (benar semua) di kuis.", ikon: "🏆", terbuka: pernahSempurna },
        { judul: "Si Ratusan", deskripsi: "Kumpulkan total 100 XP.", ikon: "⭐", terbuka: poinXP >= 100 },
        { judul: "Si Pemburu XP", deskripsi: "Kumpulkan total 300 XP.", ikon: "👑", terbuka: poinXP >= 300 },
        { judul: "Api Konsisten (3 Hari)", deskripsi: "Pertahankan streak harian 3 hari tanpa padam.", ikon: "🔥", terbuka: jumlahStreak >= 3 },
        { judul: "Api Abadi (7 Hari)", deskripsi: "Pertahankan streak harian 7 hari tanpa padam.", ikon: "☄️", terbuka: jumlahStreak >= 7 },
        { judul: "Kreator Muda", deskripsi: "Simpan minimal 1 karya di Studio Proyek.", ikon: "🎨", terbuka: sudahBikinProyek },
        { judul: "Kolektor Karakter", deskripsi: "Miliki minimal 3 karakter maskot.", ikon: "🎭", terbuka: maskotDimiliki.length >= 3 }
    ];

    let wadahAchievement = document.getElementById("wadah-achievement");
    wadahAchievement.innerHTML = "";

    daftarPencapaian.forEach(item => {
        let kartu = document.createElement("div");
        kartu.className = "card-achievement " + (item.terbuka ? "terbuka" : "terkunci");
        kartu.innerHTML = `
            <div class="ikon-achievement">${item.terbuka ? item.ikon : "🔒"}</div>
            <div>
                <h4 style="margin-bottom: 4px; font-size: 15px;">${item.judul}</h4>
                <p style="font-size: 12px; color: var(--text-secondary);">${item.deskripsi}</p>
            </div>
        `;
        wadahAchievement.appendChild(kartu);
    });
}


// --- 10. FITUR MINI GAME ---
let timerGameTangkap = null;

function bukaHalamanGame() {
    pindahHalaman('game');
    kembaliKeLobiGame();
}

function kembaliKeLobiGame() {
    if (timerGameTangkap) {
        clearInterval(timerGameTangkap);
        timerGameTangkap = null;
    }
    document.getElementById("lobi-mini-game").style.display = "block";
    document.getElementById("arena-mini-game").style.display = "none";
}

function bukaArenaGame(mode) {
    document.getElementById("lobi-mini-game").style.display = "none";
    document.getElementById("arena-mini-game").style.display = "block";

    document.getElementById("wadah-game-maze").style.display = "none";
    document.getElementById("wadah-game-pola").style.display = "none";
    document.getElementById("wadah-game-tangkap").style.display = "none";

    if (mode === 'maze') {
        document.getElementById("wadah-game-maze").style.display = "block";
        renderMaze();
    } else if (mode === 'pola') {
        document.getElementById("wadah-game-pola").style.display = "block";
        muatSoalPola();
    } else if (mode === 'tangkap') {
        document.getElementById("wadah-game-tangkap").style.display = "block";
        siapkanArenaTangkap();
    }
}

function beriHadiahGame(tambahXP, tambahKoin, pesanNotif) {
    poinXP += tambahXP;
    jumlahKoin += tambahKoin;
    
    localStorage.setItem(kunciAkun("xp"), poinXP);
    localStorage.setItem(kunciAkun("koin"), jumlahKoin);
    
    perbaruiLevel();
    perbaruiTampilanKoin();
    
    if (typeof renderTokoMaskot === "function") {
        renderTokoMaskot();
    }
    
    bunyikanSuara('benar');
    tampilkanNotifikasi(pesanNotif, false);
}

// === GAME 1: LABIRIN LOGIKA ===
const petaMaze = [
    [
        [0, 0, 1, 0, 0, 0, 1, 0],
        [1, 0, 1, 0, 1, 0, 1, 0],
        [1, 0, 0, 0, 1, 0, 0, 0],
        [1, 1, 1, 0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 1, 0],
        [0, 1, 1, 1, 1, 0, 1, 0],
        [0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 2]
    ],
    [
        [0, 1, 0, 0, 0, 1, 0, 0],
        [0, 1, 0, 1, 0, 1, 0, 1],
        [0, 0, 0, 1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0, 1, 1, 1],
        [0, 0, 0, 1, 0, 0, 0, 1],
        [1, 1, 0, 0, 0, 1, 0, 2]
    ],
    [
        [0, 0, 0, 1, 0, 0, 0, 0],
        [1, 1, 0, 1, 0, 1, 1, 0],
        [0, 0, 0, 0, 0, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 0, 1],
        [0, 1, 0, 0, 0, 0, 0, 1],
        [0, 1, 0, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 2]
    ],
    [
        [0, 1, 0, 0, 0, 1, 0, 0],
        [0, 1, 0, 1, 0, 1, 0, 1],
        [0, 1, 0, 1, 0, 1, 0, 1],
        [0, 1, 0, 1, 0, 1, 0, 1],
        [0, 1, 0, 1, 0, 1, 0, 1],
        [0, 1, 0, 1, 0, 1, 0, 1],
        [0, 0, 0, 1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 0, 2]
    ],
    [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 1, 0],
        [0, 1, 1, 1, 1, 0, 1, 0],
        [0, 1, 2, 0, 1, 0, 1, 0],
        [0, 1, 1, 0, 1, 0, 1, 0],
        [0, 0, 0, 0, 1, 0, 1, 0],
        [1, 1, 1, 1, 1, 0, 0, 0]
    ],
    [
        [0, 0, 0, 0, 1, 0, 0, 0],
        [0, 1, 1, 0, 1, 0, 1, 0],
        [0, 1, 0, 0, 0, 0, 1, 0],
        [0, 1, 0, 1, 1, 1, 1, 0],
        [0, 0, 0, 1, 0, 0, 0, 0],
        [1, 1, 1, 1, 0, 1, 1, 1],
        [0, 0, 0, 0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0, 0, 0, 2]
    ]
];

let levelMazeSaatIni = 0;
let posisiPemain = { x: 0, y: 0 };
let langkahMaze = 0;

function renderMaze() {
    let papan = document.getElementById("papan-maze");
    if (!papan) return;
    papan.innerHTML = "";

    let peta = petaMaze[levelMazeSaatIni];
    document.getElementById("label-level-maze").innerText = `Level ${levelMazeSaatIni + 1} dari ${petaMaze.length}`;
    document.getElementById("jumlah-langkah-maze").innerText = langkahMaze;

    for (let y = 0; y < peta.length; y++) {
        for (let x = 0; x < peta[y].length; x++) {
            let sel = document.createElement("div");
            sel.className = "sel-maze";

            if (peta[y][x] === 1) sel.classList.add("sel-tembok");
            else if (peta[y][x] === 2) {
                sel.classList.add("sel-finis");
                sel.innerText = "🏆";
            } else sel.classList.add("sel-jalan");

            if (posisiPemain.x === x && posisiPemain.y === y) {
                sel.innerText = maskotAktif;
            }

            papan.appendChild(sel);
        }
    }
}

function gerakMaze(dx, dy) {
    let targetX = posisiPemain.x + dx;
    let targetY = posisiPemain.y + dy;
    let peta = petaMaze[levelMazeSaatIni];

    if (targetY >= 0 && targetY < peta.length && targetX >= 0 && targetX < peta[0].length) {
        if (peta[targetY][targetX] !== 1) {
            posisiPemain.x = targetX;
            posisiPemain.y = targetY;
            langkahMaze++;
            renderMaze();

            if (peta[targetY][targetX] === 2) {
                beriHadiahGame(15, 10, `Level ${levelMazeSaatIni + 1} selesai! +15 XP & +10 Koin! 🏆🪙`);

                setTimeout(() => {
                    levelMazeSaatIni = (levelMazeSaatIni + 1) % petaMaze.length;
                    resetMaze();
                }, 700);
            }
        }
    }
}

function resetMaze() {
    posisiPemain = { x: 0, y: 0 };
    langkahMaze = 0;
    renderMaze();
}

document.addEventListener("keydown", function(e) {
    let halamanGame = document.getElementById("halaman-game");
    let arenaGame = document.getElementById("arena-mini-game");
    let gameMazeAktif = document.getElementById("wadah-game-maze").style.display !== "none";
    
    if (halamanGame && halamanGame.style.display === "block" && arenaGame && arenaGame.style.display === "block" && gameMazeAktif) {
        if (e.key === "ArrowUp") { e.preventDefault(); gerakMaze(0, -1); }
        else if (e.key === "ArrowDown") { e.preventDefault(); gerakMaze(0, 1); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); gerakMaze(-1, 0); }
        else if (e.key === "ArrowRight") { e.preventDefault(); gerakMaze(1, 0); }
    }
});


// === GAME 2: TEBAK POLA ANGKA ===
const bankSoalPola = [
    { deret: [2, 4, 6, 8], jawaban: 10, petunjuk: "Setiap langkah ditambah 2." },
    { deret: [3, 6, 12, 24], jawaban: 48, petunjuk: "Setiap angka dikalikan 2 dari angka sebelumnya." },
    { deret: [1, 4, 9, 16], jawaban: 25, petunjuk: "Pola bilangan kuadrat (1×1, 2×2, 3×3, 4×4...)." },
    { deret: [50, 45, 40, 35], jawaban: 30, petunjuk: "Pola menurun, dikurangi 5 setiap langkah." },
    { deret: [1, 1, 2, 3, 5], jawaban: 8, petunjuk: "Deret Fibonacci: jumlahkan dua angka sebelumnya." },
    { deret: [5, 10, 20, 40], jawaban: 80, petunjuk: "Kelipatan dua dari angka sebelumnya." },
    { deret: [10, 13, 16, 19], jawaban: 22, petunjuk: "Setiap langkah ditambah 3." },
    { deret: [100, 90, 81, 73], jawaban: 66, petunjuk: "Pengurangannya mengecil: -10, -9, -8, lalu -7." },
    { deret: [2, 6, 18, 54], jawaban: 162, petunjuk: "Setiap angka dikalikan 3." },
    { deret: [4, 5, 7, 10, 14], jawaban: 19, petunjuk: "Penambahannya naik bertahap: +1, +2, +3, +4, lalu +5." },
    { deret: [64, 32, 16, 8], jawaban: 4, petunjuk: "Setiap langkah dibagi 2." },
    { deret: [1, 8, 27, 64], jawaban: 125, petunjuk: "Pola bilangan pangkat tiga (1³, 2³, 3³, 4³, 5³)." }
];

let indeksPolaSaatIni = 0;

function muatSoalPola() {
    let soal = bankSoalPola[indeksPolaSaatIni];
    document.getElementById("label-soal-pola").innerText = `Soal ${indeksPolaSaatIni + 1} dari ${bankSoalPola.length}`;
    
    let wadahDeret = document.getElementById("deret-angka-box");
    wadahDeret.innerHTML = "";

    soal.deret.forEach(angka => {
        let kotak = document.createElement("div");
        kotak.className = "kotak-angka";
        kotak.innerText = angka;
        wadahDeret.appendChild(kotak);
    });

    let kotakTanya = document.createElement("div");
    kotakTanya.className = "kotak-angka tanda-tanya";
    kotakTanya.innerText = "?";
    wadahDeret.appendChild(kotakTanya);

    let inputEl = document.getElementById("input-jawaban-pola");
    inputEl.value = "";
    inputEl.focus();
    document.getElementById("petunjuk-pola").innerText = "";
}

function cekJawabanPola() {
    let inputUser = parseInt(document.getElementById("input-jawaban-pola").value);
    let soal = bankSoalPola[indeksPolaSaatIni];

    if (isNaN(inputUser)) {
        tampilkanNotifikasi("Masukkan angka jawabanmu terlebih dahulu! ⚠️");
        return;
    }

    if (inputUser === soal.jawaban) {
        beriHadiahGame(10, 5, "Tepat sekali! +10 XP & +5 Koin! 🧠🪙");

        indeksPolaSaatIni = (indeksPolaSaatIni + 1) % bankSoalPola.length;
        muatSoalPola();
    } else {
        bunyikanSuara('salah');
        document.getElementById("petunjuk-pola").innerText = "💡 Petunjuk: " + soal.petunjuk;
        tampilkanNotifikasi("Kurang tepat, coba perhatikan petunjuknya! 🔍", false);
    }
}

document.getElementById("input-jawaban-pola").addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        cekJawabanPola();
    }
});


// === GAME 3: TANGKAP BINTANG ===
let skorTangkap = 0;
let sisaWaktuTangkap = 15;

function siapkanArenaTangkap() {
    skorTangkap = 0;
    sisaWaktuTangkap = 15;
    document.getElementById("skor-tangkap").innerText = "0";
    document.getElementById("waktu-tangkap").innerText = "15";
    document.getElementById("target-tangkap").style.display = "none";
    document.getElementById("overlay-mulai-tangkap").style.display = "flex";
}

function mulaiGameTangkap() {
    skorTangkap = 0;
    sisaWaktuTangkap = 15;
    document.getElementById("skor-tangkap").innerText = skorTangkap;
    document.getElementById("waktu-tangkap").innerText = sisaWaktuTangkap;
    document.getElementById("overlay-mulai-tangkap").style.display = "none";

    let target = document.getElementById("target-tangkap");
    target.innerText = maskotAktif;
    target.style.display = "flex";
    pindahkanTargetAcak();

    if (timerGameTangkap) clearInterval(timerGameTangkap);
    timerGameTangkap = setInterval(() => {
        sisaWaktuTangkap--;
        document.getElementById("waktu-tangkap").innerText = sisaWaktuTangkap;

        if (sisaWaktuTangkap <= 0) {
            clearInterval(timerGameTangkap);
            timerGameTangkap = null;
            target.style.display = "none";
            document.getElementById("overlay-mulai-tangkap").style.display = "flex";

            let bonusXP = Math.max(5, skorTangkap);
            let bonusKoin = skorTangkap > 0 ? Math.max(2, Math.floor(skorTangkap / 2)) : 1;
            
            beriHadiahGame(bonusXP, bonusKoin, `Waktu habis! Tertangkap ${skorTangkap}x. +${bonusXP} XP & +${bonusKoin} Koin! ⚡🪙`);
        }
    }, 1000);
}

function pindahkanTargetAcak() {
    let arena = document.getElementById("arena-tangkap");
    let target = document.getElementById("target-tangkap");
    let maksX = arena.clientWidth - 65;
    let maksY = arena.clientHeight - 65;

    let acakX = Math.floor(Math.random() * Math.max(10, maksX));
    let acakY = Math.floor(Math.random() * Math.max(10, maksY));

    target.style.left = acakX + "px";
    target.style.top = acakY + "px";
}

function klikTargetTangkap() {
    if (sisaWaktuTangkap > 0) {
        bunyikanSuara('klik');
        skorTangkap++;
        document.getElementById("skor-tangkap").innerText = skorTangkap;
        pindahkanTargetAcak();
    }
}
// --- 11. FITUR PETA KARIER, TES MINAT & ROADMAP INTERAKTIF ---
const soalTesMinat = [
    {
        tanya: "1. Saat melihat aplikasi atau website keren, bagian mana yang paling membuatmu penasaran?",
        opsi: [
            { teks: "Bagaimana kode di balik layar bekerja dan memproses data.", bidang: "teknologi" },
            { teks: "Perpaduan warna, tata letak tombol, dan estetika tampilannya.", bidang: "desain" },
            { teks: "Bagaimana cara mereka menjelaskan produknya hingga orang tertarik.", bidang: "komunikasi" }
        ]
    },
    {
        tanya: "2. Dalam sebuah kerja kelompok proyek sekolah, peran apa yang paling kamu sukai?",
        opsi: [
            { teks: "Merakit sistem, mengatur logika teknis, atau memperbaiki error.", bidang: "teknologi" },
            { teks: "Membuat poster, slide presentasi estetik, atau sketsa tampilan.", bidang: "desain" },
            { teks: "Menjadi juru bicara saat presentasi dan menyusun naskah.", bidang: "komunikasi" }
        ]
    },
    {
        tanya: "3. Aktivitas mana yang paling betah kamu lakukan berjam-jam?",
        opsi: [
            { teks: "Memecahkan teka-teki logika dan menyusun baris kode.", bidang: "teknologi" },
            { teks: "Menggambar, mengedit foto/UI, dan bereksperimen dengan warna.", bidang: "desain" },
            { teks: "Menulis cerita, berdiskusi, atau membuat konten edukasi.", bidang: "komunikasi" }
        ]
    },
    {
        tanya: "4. Tantangan apa yang paling ingin kamu taklukkan bulan ini?",
        opsi: [
            { teks: "Membangun website interaktif dari nol.", bidang: "teknologi" },
            { teks: "Merancang desain antarmuka aplikasi yang ramah pengguna.", bidang: "desain" },
            { teks: "Berani tampil percaya diri berbicara di depan banyak orang.", bidang: "komunikasi" }
        ]
    },
    {
        tanya: "5. Jika suatu hari kamu membuat startup sendiri, posisi apa yang akan kamu pegang?",
        opsi: [
            { teks: "CTO (Kepala Teknologi & Pengembang Produk).", bidang: "teknologi" },
            { teks: "Head of Design (Pengarah Tampilan & Pengalaman Pengguna).", bidang: "desain" },
            { teks: "CEO / Marketing Lead (Negosiasi Klien & Strategi Komunikasi).", bidang: "komunikasi" }
        ]
    }
];

let indeksMinat = 0;
let skorMinat = { teknologi: 0, desain: 0, komunikasi: 0 };

function mulaiTesMinat() {
    indeksMinat = 0;
    skorMinat = { teknologi: 0, desain: 0, komunikasi: 0 };
    document.getElementById("box-intro-tes-minat").style.display = "none";
    document.getElementById("box-hasil-tes-minat").style.display = "none";
    document.getElementById("box-soal-tes-minat").style.display = "block";
    tampilkanSoalMinat();
}

function tampilkanSoalMinat() {
    let data = soalTesMinat[indeksMinat];
    document.getElementById("label-progres-minat").innerText = `Pertanyaan ${indeksMinat + 1} dari ${soalTesMinat.length}`;
    document.getElementById("teks-soal-minat").innerText = data.tanya;

    let wadah = document.getElementById("opsi-tes-minat");
    wadah.innerHTML = "";

    data.opsi.forEach(item => {
        let btn = document.createElement("button");
        btn.className = "btn-outline";
        btn.style.textAlign = "left";
        btn.innerText = item.teks;
        btn.onclick = () => {
            skorMinat[item.bidang]++;
            indeksMinat++;
            if (indeksMinat < soalTesMinat.length) {
                tampilkanSoalMinat();
            } else {
                tampilkanHasilMinat();
            }
        };
        wadah.appendChild(btn);
    });
}

function tampilkanHasilMinat() {
    document.getElementById("box-soal-tes-minat").style.display = "none";
    document.getElementById("box-hasil-tes-minat").style.display = "block";

    let pemenang = "teknologi";
    if (skorMinat.desain > skorMinat[pemenang]) pemenang = "desain";
    if (skorMinat.komunikasi > skorMinat[pemenang]) pemenang = "komunikasi";

    const infoKarier = {
        teknologi: {
            judul: "💻 Web Developer & Software Engineer",
            desc: "Kamu memiliki pola pikir logis dan analitis! Kamu sangat cocok membangun aplikasi web, mengelola data, dan memecahkan masalah teknis dengan kode.",
            kategori: "teknologi"
        },
        desain: {
            judul: "🎨 UI/UX & Product Designer",
            desc: "Kamu memiliki kepekaan visual dan empati tinggi terhadap kenyamanan pengguna! Kamu cocok merancang tampilan aplikasi yang estetik dan mudah digunakan.",
            kategori: "desain"
        },
        komunikasi: {
            judul: "💬 Digital Communicator & Public Speaker",
            desc: "Kamu pandai merangkai ide dan menyampaikan pesan secara persuasif! Kamu cocok di bidang presentasi proyek, copywriting, dan negosiasi klien.",
            kategori: "komunikasi"
        }
    };

    let hasil = infoKarier[pemenang];
    document.getElementById("judul-hasil-minat").innerText = hasil.judul;
    document.getElementById("deskripsi-hasil-minat").innerText = hasil.desc;
    document.getElementById("btn-arah-belajar-minat").onclick = () => bukaRuangBelajar(hasil.kategori);
    tampilkanRoadmap(hasil.kategori);
    bunyikanSuara('benar');
}

function hitungSkillGapOtomatis() {
    const hitungKategori = (kat) => {
        let daftarId = Object.keys(kurikulumSkillBridge).filter(id => kurikulumSkillBridge[id].kategori === kat);
        let totalPoinMaks = daftarId.length * 2;
        let poinTercapai = 0;
        let belumSelesai = [];

        daftarId.forEach(id => {
            if (materiSelesai.includes(id)) poinTercapai++;
            if (kuisSelesai.includes(id)) poinTercapai++;
            if (!materiSelesai.includes(id) || !kuisSelesai.includes(id)) {
                belumSelesai.push(kurikulumSkillBridge[id].judul);
            }
        });

        let persen = totalPoinMaks > 0 ? Math.round((poinTercapai / totalPoinMaks) * 100) : 0;
        return { persen, belumSelesai };
    };

    let tech = hitungKategori("teknologi");
    document.getElementById("persen-skill-tech").innerText = tech.persen + "%";
    document.getElementById("bar-skill-tech").style.width = tech.persen + "%";
    document.getElementById("saran-skill-tech").innerText = tech.belumSelesai.length > 0
        ? "Kekurangan: " + tech.belumSelesai.slice(0, 2).join(", ")
        : "Semua materi & kuis Web Developer sudah dikuasai! 🎉";

    let desain = hitungKategori("desain");
    document.getElementById("persen-skill-desain").innerText = desain.persen + "%";
    document.getElementById("bar-skill-desain").style.width = desain.persen + "%";
    document.getElementById("saran-skill-desain").innerText = desain.belumSelesai.length > 0
        ? "Kekurangan: " + desain.belumSelesai.slice(0, 2).join(", ")
        : "Semua materi & kuis UI/UX Designer sudah dikuasai! 🎉";

    let kom = hitungKategori("komunikasi");
    document.getElementById("persen-skill-kom").innerText = kom.persen + "%";
    document.getElementById("bar-skill-kom").style.width = kom.persen + "%";
    document.getElementById("saran-skill-kom").innerText = kom.belumSelesai.length > 0
        ? "Kekurangan: " + kom.belumSelesai.slice(0, 2).join(", ")
        : "Semua materi & kuis Komunikasi sudah dikuasai! 🎉";
}

const detailPetaKarier = {
    teknologi: {
        judulProfesi: "💻 Web Developer & Software Engineer",
        ringkasan: "Merancang, membangun, dan memelihara situs web maupun aplikasi interaktif dari sisi tampilan (Front-End) hingga logika pemrosesan data.",
        toolsUtama: ["HTML5", "CSS3 & Flexbox", "JavaScript (ES6+)", "DOM & LocalStorage", "Git / GitHub"],
        keterampilanInti: [
            "Menyusun struktur semantik halaman web yang rapi dan aksesibel.",
            "Membangun tata letak responsif untuk layar HP dan Desktop.",
            "Mengelola interaksi pengguna, validasi input, dan penyimpanan data lokal."
        ],
        proyekWajib: "Bangun aplikasi web mini (seperti kalkulator target atau halaman portofolio interaktif) di Studio Proyek.",
        simulasiTerkait: "freelancer"
    },
    desain: {
        judulProfesi: "🎨 UI/UX & Product Designer",
        ringkasan: "Menciptakan pengalaman digital yang intuitif, estetis, dan mudah dipahami pengguna melalui riset alur, kerangka wireframe, dan sistem desain.",
        toolsUtama: ["Wireframing", "Color Theory (60-30-10)", "Typography", "Design System", "Usability Testing"],
        keterampilanInti: [
            "Menerapkan hierarki visual dan ruang kosong (Whitespace) agar layar tidak padat.",
            "Memilih kontras warna yang nyaman dibaca di berbagai ukuran layar.",
            "Merancang alur pengguna (User Flow) sebelum masuk ke tahap pengkodean."
        ],
        proyekWajib: "Rancang kartu profil visual atau komponen antarmuka modern di Studio Proyek.",
        simulasiTerkait: "desainer"
    },
    komunikasi: {
        judulProfesi: "💬 Digital Communicator & Public Speaker",
        ringkasan: "Menjembatani ide teknis maupun produk kepada audiens melalui teknik bercerita (storytelling), tulisan persuasif, dan presentasi yang memikat.",
        toolsUtama: ["Formula AIDA", "Hook 30 Detik", "Storytelling (Masalah-Solusi-Dampak)", "Pitch Deck", "Negosiasi Klien"],
        keterampilanInti: [
            "Menyusun kalimat pembuka (Hook) yang langsung menarik perhatian.",
            "Mengubah fitur teknis yang rumit menjadi manfaat yang mudah dipahami.",
            "Mempresentasikan proyek dan melakukan negosiasi secara profesional."
        ],
        proyekWajib: "Tulis naskah presentasi (pitching) solusi produk menggunakan kerangka Masalah-Solusi-Dampak di Studio Proyek.",
        simulasiTerkait: "kreator"
    }
};

function tampilkanRoadmap(kategori) {
    ['teknologi', 'desain', 'komunikasi'].forEach(k => {
        let btn = document.getElementById('btn-roadmap-' + k);
        if (btn) btn.classList.remove('aktif');
    });
    let btnAktif = document.getElementById('btn-roadmap-' + kategori);
    if (btnAktif) btnAktif.classList.add('aktif');

    let wadah = document.getElementById("wadah-roadmap-karier");
    if (!wadah) return;

    let info = detailPetaKarier[kategori];
    let daftarKursus = Object.keys(kurikulumSkillBridge).filter(id => kurikulumSkillBridge[id].kategori === kategori);

    // Hitung progres jalur ini
    let totalLangkah = daftarKursus.length * 2;
    let langkahSelesai = 0;
    daftarKursus.forEach(id => {
        if (materiSelesai.includes(id)) langkahSelesai++;
        if (kuisSelesai.includes(id)) langkahSelesai++;
    });
    let persenJalur = totalLangkah > 0 ? Math.round((langkahSelesai / totalLangkah) * 100) : 0;

    let html = `
        <div class="kartu-info-profesi">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
                <div>
                    <span class="badge">Profil Jalur Karier</span>
                    <h3 class="mt-10">${info.judulProfesi}</h3>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 12px; color: var(--text-secondary);">Kesiapan Jalur Ini</span>
                    <div style="font-size: 20px; font-weight: bold; color: var(--primary-color);">${persenJalur}%</div>
                </div>
            </div>
            <p style="font-size: 13.5px; color: var(--text-secondary); margin: 10px 0 14px 0; line-height: 1.6;">
                ${info.ringkasan}
            </p>

            <div style="margin-bottom: 12px;">
                <strong style="font-size: 12.5px;">🛠️ Tools & Konsep Utama:</strong>
                <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px;">
                    ${info.toolsUtama.map(t => `<span class="chip-tool-karier">${t}</span>`).join("")}
                </div>
            </div>

            <div>
                <strong style="font-size: 12.5px;">🎯 Kompetensi yang Harus Dikuasai:</strong>
                <ul style="margin: 6px 0 0 18px; font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
                    ${info.keterampilanInti.map(k => `<li>${k}</li>`).join("")}
                </ul>
            </div>
        </div>

        <h4 style="margin: 18px 0 12px 0;">📍 Tahapan Pembelajaran & Evaluasi Kompetensi</h4>
        <div class="timeline-roadmap">
    `;

    daftarKursus.forEach((id, urutan) => {
        let item = kurikulumSkillBridge[id];
        let sudahMateri = materiSelesai.includes(id);
        let sudahKuis = kuisSelesai.includes(id);
        let tuntas = sudahMateri && sudahKuis;
        let estimasiWaktu = item.tingkat === "Menengah" ? "20–25 Menit" : "10–15 Menit";

        html += `
            <div class="item-roadmap ${tuntas ? 'tuntas' : ''}">
                <div class="titik-roadmap">${tuntas ? '✓' : (urutan + 1)}</div>
                <div class="konten-roadmap">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
                        <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                            <span class="badge">${tuntas ? 'Tahap ' + (urutan + 1) + ' Tuntas' : 'Tahap ' + (urutan + 1)}</span>
                            <span class="${item.tingkat === 'Menengah' ? 'badge-menengah' : 'badge'}">${item.tingkat}</span>
                            <span style="font-size: 11.5px; color: var(--text-secondary);">⏱️ ${estimasiWaktu}</span>
                        </div>
                        <span style="font-size: 12px; font-weight: bold; color: ${tuntas ? '#10b981' : '#f59e0b'};">
                            ${tuntas ? 'Kompetensi Tercapai' : (sudahMateri || sudahKuis ? 'Sedang Dipelajari' : 'Belum Dimulai')}
                        </span>
                    </div>

                    <h4 class="mt-10">${item.judul}</h4>
                    <p style="font-size: 13px; color: var(--text-secondary); margin: 4px 0 10px 0;">${item.deskripsi}</p>

                    <div style="background: var(--bg-card); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 12px;">
                        <strong style="font-size: 12px;">Target Penguasaan Modul:</strong>
                        <ul style="margin: 5px 0 0 16px; font-size: 12.5px; color: var(--text-secondary); line-height: 1.5;">
                            ${item.tujuan.map(t => `<li>${t}</li>`).join("")}
                        </ul>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                        <div style="display: flex; gap: 8px; font-size: 12px;">
                            <span class="status-cek ${sudahMateri ? 'oke' : ''}">${sudahMateri ? '✅' : '⬜'} Baca Materi</span>
                            <span class="status-cek ${sudahKuis ? 'oke' : ''}">${sudahKuis ? '✅' : '⬜'} Lulus Kuis (${item.kuis.length} Soal)</span>
                        </div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button class="${sudahMateri ? 'btn-outline' : ''}" style="padding: 7px 12px; font-size: 12.5px;" onclick="bukaDetailKursus('${id}')">
                                ${sudahMateri ? 'Ulangi Materi' : '1. Pelajari Materi →'}
                            </button>
                            <button class="${sudahKuis ? 'btn-outline' : ''}" style="padding: 7px 12px; font-size: 12.5px;" onclick="mulaiKuis('${id}')">
                                ${sudahKuis ? 'Latihan Kuis Ulang' : '2. Kerjakan Kuis 🎯'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    // Tahap Praktik Proyek & Simulasi Karier di bagian akhir roadmap
    html += `
            <div class="item-roadmap">
                <div class="titik-roadmap">🛠️</div>
                <div class="konten-roadmap" style="border: 1.5px dashed var(--primary-color);">
                    <span class="badge">Tahap Akhir 1 • Pembuktian Portofolio</span>
                    <h4 class="mt-10">Praktik Pembuatan Karya Nyata</h4>
                    <p style="font-size: 13px; color: var(--text-secondary); margin: 6px 0 12px 0;">
                        ${info.proyekWajib}
                    </p>
                    <button style="padding: 8px 14px; font-size: 12.5px;" onclick="pindahHalaman('studio')">Buka Studio Proyek 🛠️</button>
                </div>
            </div>

            <div class="item-roadmap">
                <div class="titik-roadmap">🌍</div>
                <div class="konten-roadmap" style="border: 1.5px dashed #10b981;">
                    <span class="badge" style="background: #d1fae5; color: #065f46;">Tahap Akhir 2 • Uji Dunia Kerja</span>
                    <h4 class="mt-10">Simulasi Pengambilan Keputusan Karier</h4>
                    <p style="font-size: 13px; color: var(--text-secondary); margin: 6px 0 12px 0;">
                        Uji kesiapan mental, manajemen waktu, dan negosiasi klien pada jalur ${info.judulProfesi}.
                    </p>
                    <button style="background-color: #10b981; padding: 8px 14px; font-size: 12.5px;" onclick="pindahHalaman('simulasi'); mulaiSimulasi('${info.simulasiTerkait}')">
                        Mulai Simulasi Karier Ini →
                    </button>
                </div>
            </div>
        </div>
    `;

    wadah.innerHTML = html;
}


// --- 12. FITUR SIMULASI KARIER LENGKAP (3 JALUR, UPGRADE ALAT & GELAR KARIER) ---
let uangPemain = 500000;
let stressPemain = 10;
let reputasiPemain = 50;
let alatSudahUpgrade = false;
let jenisSimulasiAktif = "freelancer";
let skenarioAktif = [];
let gelarKarierDimiliki = JSON.parse(localStorage.getItem(kunciAkun("gelar_karier"))) || [];

const skenarioFreelancer = [
    {
        id: 0,
        babak: "Minggu 1 • Proyek Pertama",
        teks: "Bulan pertamamu sebagai Freelancer Web dimulai! Tabunganmu Rp 500.000. Ada klien minta dibuatkan website toko online lengkap, tapi menawar harga sangat murah: Rp 300.000. Apa keputusanmu?",
        pilihan: [
            { teks: "A. Terima saja hitung-hitung untuk portofolio.", efekUang: 300000, efekStress: 35, efekRep: 5, lanjutKe: 1 },
            { teks: "B. Tolak dengan halus dan cari klien lain yang lebih menghargai.", efekUang: -50000, efekStress: -5, efekRep: 0, lanjutKe: 2 },
            { teks: "C. Negosiasi profesional & jelaskan manfaat fitur agar dibayar Rp 1.200.000.", efekUang: 0, efekStress: 15, efekRep: 15, lanjutKe: 3 }
        ]
    },
    {
        id: 1,
        babak: "Minggu 2 • Drama Revisi",
        teks: "Klien murah itu ternyata minta revisi berkali-kali di tengah malam tanpa tambahan biaya. Kamu kurang tidur dan stres meningkat!",
        pilihan: [{ teks: "Selesaikan sesuai janji & lanjut ke Minggu 3 →", efekUang: 0, efekStress: 10, efekRep: 10, lanjutKe: 4 }]
    },
    {
        id: 2,
        babak: "Minggu 2 • Peluang Baru",
        teks: "Kamu menolak proyek murah itu. Meski keluar Rp 50.000 untuk kuota internet saat mencari klien, minggu depannya kamu mendapat klien bisnis yang membayar Rp 2.500.000!",
        pilihan: [{ teks: "Kerjakan proyek dengan fokus →", efekUang: 2500000, efekStress: 15, efekRep: 20, lanjutKe: 4 }]
    },
    {
        id: 3,
        babak: "Minggu 2 • Kesepakatan Profesional",
        teks: "Klien menghargai cara komunikasimu dan setuju menaikkan bayaran menjadi Rp 1.200.000! Proyek berjalan tertib sesuai kontrak.",
        pilihan: [{ teks: "Selesaikan proyek & lanjut ke Minggu 3 →", efekUang: 1200000, efekStress: 10, efekRep: 20, lanjutKe: 4 }]
    },
    {
        id: 4,
        babak: "Minggu 3 • Tawaran Proyek Kilat",
        teks: "Reputasimu mulai dikenal! Tiba-tiba ada klien darurat menawarkan Rp 2.000.000 jika kamu bisa menyelesaikan landing page dalam 24 jam nonstop. Perhatikan tingkat stresmu sebelum memilih!",
        pilihan: [
            { teks: "A. Ambil tantangan! Lembur semalaman demi uang tambahan.", efekUang: 2000000, efekStress: 45, efekRep: 15, lanjutKe: 5 },
            { teks: "B. Tolak dengan sopan demi menjaga kesehatan & kualitas tidur.", efekUang: 0, efekStress: -20, efekRep: 0, lanjutKe: 5 }
        ]
    },
    {
        id: 5,
        babak: "Minggu 4 • Evaluasi Akhir Bulan",
        teks: "Akhir bulan tiba! Kamu harus membayar biaya internet & kebutuhan bulanan sebesar Rp 400.000, lalu menentukan langkah berikutnya.",
        pilihan: [
            { teks: "Bayar tagihan & ikuti pelatihan upgrade skill (-Rp 600.000, Stres -15%)", efekUang: -600000, efekStress: -15, efekRep: 10, lanjutKe: 99 },
            { teks: "Bayar tagihan & tabung sisa penghasilan (-Rp 400.000)", efekUang: -400000, efekStress: -5, efekRep: 5, lanjutKe: 99 }
        ]
    },
    {
        id: 99,
        babak: "🎉 SIMULASI BERHASIL DISELESAIKAN!",
        teks: "Luar biasa! Kamu berhasil melewati bulan pertamamu sebagai freelancer dengan selamat dan meraih gelar '💼 Freelancer Tangguh'!",
        pilihan: [{ teks: "Klaim Gelar, +30 XP & +20 Koin 🏆", efekUang: 0, efekStress: 0, efekRep: 0, lanjutKe: -1 }]
    }
];

const skenarioDesainer = [
    {
        id: 0,
        babak: "Minggu 1 • Audit Desain Aplikasi",
        teks: "Kamu bergabung sebagai UI/UX Designer dengan modal Rp 600.000. Tim developer meminta desain halaman pembayaran selesai dalam 2 hari tanpa riset pengguna terlebih dahulu. Apa keputusanmu?",
        pilihan: [
            { teks: "A. Langsung menggambar tampilan warna-warni tanpa memikirkan alur pengguna.", efekUang: 800000, efekStress: 15, efekRep: -20, lanjutKe: 1 },
            { teks: "B. Buat Wireframe sederhana & uji ke 3 teman terlebih dahulu sebelum memberi warna.", efekUang: 1200000, efekStress: 20, efekRep: 25, lanjutKe: 1 }
        ]
    },
    {
        id: 1,
        babak: "Minggu 2 • Revisi Kontras & Aksesibilitas",
        teks: "Klien meminta tulisan tombol dibuat berwarna kuning muda di atas latar putih karena terlihat 'lucu', padahal tulisan tersebut sulit dibaca pengguna.",
        pilihan: [
            { teks: "A. Edukasi klien tentang pentingnya kontras UI & tawarkan alternatif warna yang tetap estetik.", efekUang: 1500000, efekStress: 15, efekRep: 25, lanjutKe: 99 },
            { teks: "B. Ikuti saja kemauan klien tanpa memberi saran.", efekUang: 1000000, efekStress: 10, efekRep: -15, lanjutKe: 99 }
        ]
    },
    {
        id: 99,
        babak: "🎉 SIMULASI UI/UX DESIGNER SELESAI!",
        teks: "Keren! Kamu berhasil menyeimbangkan estetika dan kenyamanan pengguna. Kamu meraih gelar '🎨 Desainer Empatik'!",
        pilihan: [{ teks: "Klaim Gelar, +30 XP & +20 Koin 🏆", efekUang: 0, efekStress: 0, efekRep: 0, lanjutKe: -1 }]
    }
];

const skenarioKreator = [
    {
        id: 0,
        babak: "Bulan 1 • Membangun Audiens",
        teks: "Kamu memulai karier sebagai Kreator Konten Edukasi & Pembicara dengan tabungan Rp 400.000. Konten pertamamu mulai ramai, lalu sebuah merek aplikasi belajar menawarkan endorse Rp 1.500.000, tapi aplikasinya punya ulasan buruk dari pengguna. Apa keputusanmu?",
        pilihan: [
            { teks: "A. Terima langsung demi uang cepat Rp 1.500.000.", efekUang: 1500000, efekStress: 15, efekRep: -30, lanjutKe: 1 },
            { teks: "B. Tolak demi menjaga kepercayaan pengikutmu.", efekUang: 0, efekStress: 5, efekRep: 20, lanjutKe: 1 }
        ]
    },
    {
        id: 1,
        babak: "Bulan 2 • Undangan Seminar Nasional",
        teks: "Kamu diundang menjadi pembicara utama di acara seminar pelajar dengan bayaran Rp 2.000.000! Namun kamu merasa sedikit demam panggung.",
        pilihan: [
            { teks: "A. Latihan teknik Hook & storytelling 3 hari penuh sebelum tampil.", efekUang: 2000000, efekStress: 20, efekRep: 25, lanjutKe: 99 },
            { teks: "B. Datang tanpa persiapan dan hanya membaca slide teks.", efekUang: 1000000, efekStress: 35, efekRep: -25, lanjutKe: 99 }
        ]
    },
    {
        id: 99,
        babak: "🎉 SIMULASI KREATOR SELESAI!",
        teks: "Hebat! Kamu membuktikan bahwa integritas dan persiapan komunikasi adalah kunci sukses. Kamu meraih gelar '🎙️ Komunikator Andal'!",
        pilihan: [{ teks: "Klaim Gelar, +30 XP & +20 Koin 🏆", efekUang: 0, efekStress: 0, efekRep: 0, lanjutKe: -1 }]
    }
];

const skenarioAgensi = [
    {
        id: 0,
        babak: "Bulan 1 • Pendirian Agensi",
        teks: "Kamu memimpin Agensi Digital dengan modal Rp 5.000.000. Sebuah perusahaan meminta pembuatan aplikasi & branding dalam 1 minggu. Bagaimana strategimu?",
        pilihan: [
            { teks: "A. Kerjakan sendiri semua bagian demi menghemat modal.", efekUang: 3000000, efekStress: 55, efekRep: -10, lanjutKe: 1 },
            { teks: "B. Rekrut 1 desainer & 1 developer lepas (Biaya Rp 2.000.000).", efekUang: 2500000, efekStress: 15, efekRep: 25, lanjutKe: 1 }
        ]
    },
    {
        id: 1,
        babak: "Bulan 2 • Krisis Server Klien",
        teks: "Tiba-tiba website klien mengalami gangguan saat acara peluncuran mereka! Klien panik dan meneleponmu.",
        pilihan: [
            { teks: "A. Segera minta maaf, perbaiki bug secepatnya & beri kompensasi gratis.", efekUang: -500000, efekStress: 25, efekRep: 20, lanjutKe: 99 },
            { teks: "B. Menyalahkan klien karena salah mengoperasikan sistem.", efekUang: 0, efekStress: 20, efekRep: -45, lanjutKe: 99 }
        ]
    },
    {
        id: 99,
        babak: "🎉 SIMULASI AGENSI SELESAI!",
        teks: "Luar biasa! Kepemimpinanmu menyelamatkan perusahaan dari krisis. Kamu meraih gelar '🚀 CEO Agensi Muda'!",
        pilihan: [{ teks: "Klaim Gelar, +30 XP & +20 Koin 🏆", efekUang: 0, efekStress: 0, efekRep: 0, lanjutKe: -1 }]
    }
];

function perbaruiTombolSimulasi() {
    let btnAgensi = document.getElementById("btn-simulasi-agensi");
    if (btnAgensi) {
        if (poinXP >= 50) {
            btnAgensi.classList.remove("btn-disabled");
            btnAgensi.disabled = false;
            btnAgensi.innerText = "Mulai Simulasi →";
        } else {
            btnAgensi.classList.add("btn-disabled");
            btnAgensi.disabled = true;
            btnAgensi.innerText = `Terkunci (Butuh 50 XP, kamu: ${poinXP} XP) 🔒`;
        }
    }

    let wadahGelar = document.getElementById("wadah-gelar-karier");
    if (wadahGelar) {
        if (gelarKarierDimiliki.length === 0) {
            wadahGelar.innerHTML = `<span style="font-size: 13px; color: var(--text-secondary); font-style: italic;">Belum ada gelar karier. Selesaikan salah satu simulasi di bawah untuk mendapatkannya!</span>`;
        } else {
            wadahGelar.innerHTML = gelarKarierDimiliki.map(g => `<span class="chip-riwayat">${g}</span>`).join("");
        }
    }
}

function mulaiSimulasi(jenis) {
    if (jenis === 'agensi' && poinXP < 50) {
        tampilkanNotifikasi("Kumpulkan minimal 50 XP untuk membuka Simulasi Agensi! 🔒");
        return;
    }

    jenisSimulasiAktif = jenis;
    alatSudahUpgrade = false;
    let btnUpgrade = document.getElementById("btn-upgrade-alat");
    if (btnUpgrade) {
        btnUpgrade.disabled = false;
        btnUpgrade.innerText = "⚡ Upgrade Peralatan Pro (-Rp 800.000 | Bonus Bayaran +25%)";
    }

    document.getElementById('daftar-pilihan-simulasi').style.display = 'none';
    document.getElementById('layar-game').style.display = 'block';

    if (jenis === 'agensi') {
        uangPemain = 5000000;
        stressPemain = 15;
        reputasiPemain = 60;
        skenarioAktif = skenarioAgensi;
    } else if (jenis === 'desainer') {
        uangPemain = 600000;
        stressPemain = 10;
        reputasiPemain = 55;
        skenarioAktif = skenarioDesainer;
    } else if (jenis === 'kreator') {
        uangPemain = 400000;
        stressPemain = 10;
        reputasiPemain = 55;
        skenarioAktif = skenarioKreator;
    } else {
        uangPemain = 500000;
        stressPemain = 10;
        reputasiPemain = 50;
        skenarioAktif = skenarioFreelancer;
    }
    muatCerita(0);
}

function aksiCepatSimulasi(jenisAksi) {
    if (jenisAksi === 'kopi') {
        if (uangPemain < 50000) {
            tampilkanNotifikasi("Saldo tidak cukup untuk membeli kopi! ⚠️");
            return;
        }
        uangPemain -= 50000;
        stressPemain = Math.max(0, stressPemain - 15);
        bunyikanSuara('klik');
        tampilkanNotifikasi("Istirahat sejenak! Stres berkurang 15% ☕", false);
    } else if (jenisAksi === 'upgrade') {
        if (alatSudahUpgrade) return;
        if (uangPemain < 800000) {
            tampilkanNotifikasi("Butuh saldo minimal Rp 800.000 untuk upgrade peralatan! ⚠️");
            return;
        }
        uangPemain -= 800000;
        alatSudahUpgrade = true;
        let btnUpgrade = document.getElementById("btn-upgrade-alat");
        if (btnUpgrade) {
            btnUpgrade.disabled = true;
            btnUpgrade.innerText = "✓ Peralatan Pro Aktif (+25% Bayaran)";
        }
        bunyikanSuara('benar');
        tampilkanNotifikasi("Peralatan di-upgrade ke versi Pro! Penghasilan proyek naik 25% ⚡", false);
    }
    perbaruiHeaderSimulasi();
}

function perbaruiHeaderSimulasi() {
    document.getElementById('status-uang').innerText = `💰 Saldo: Rp ${uangPemain.toLocaleString('id-ID')}`;
    document.getElementById('status-reputasi').innerText = `⭐ Reputasi: ${reputasiPemain}%`;
    document.getElementById('status-stress').innerText = `🤯 Stres: ${stressPemain}%`;
    document.getElementById('status-alat').innerText = alatSudahUpgrade ? `⚡ Alat: Pro (+25%)` : `💻 Alat: Standar`;
}

function tutupLayarSimulasi() {
    document.getElementById('layar-game').style.display = 'none';
    document.getElementById('daftar-pilihan-simulasi').style.display = 'flex';
    perbaruiTombolSimulasi();
}

function muatCerita(idCerita) {
    if (idCerita === -1) {
        const petaGelar = {
            freelancer: "💼 Freelancer Tangguh",
            desainer: "🎨 Desainer Empatik",
            kreator: "🎙️ Komunikator Andal",
            agensi: "🚀 CEO Agensi Muda"
        };
        let gelarBaru = petaGelar[jenisSimulasiAktif];
        if (gelarBaru && !gelarKarierDimiliki.includes(gelarBaru)) {
            gelarKarierDimiliki.push(gelarBaru);
            localStorage.setItem(kunciAkun("gelar_karier"), JSON.stringify(gelarKarierDimiliki));
        }

        tutupLayarSimulasi();
        beriHadiahGame(30, 20, `Simulasi selesai! Gelar ${gelarBaru} diraih (+30 XP & +20 Koin)! 🏆`);
        return;
    }

    perbaruiHeaderSimulasi();
    const tempatTombol = document.getElementById('tombol-opsi');
    tempatTombol.innerHTML = '';

    // Cek Kondisi Game Over
    if (stressPemain >= 100 || uangPemain < 0 || reputasiPemain <= 0) {
        bunyikanSuara('salah');
        document.getElementById('badge-babak-simulasi').innerText = "❌ SIMULASI GAGAL (GAME OVER)";
        let alasan = stressPemain >= 100
            ? "Tingkat stresmu mencapai 100% (Burnout)! Gunakan fitur istirahat atau hindari beban kerja berlebihan."
            : uangPemain < 0
            ? "Saldomu habis (Bangkrut)! Kelola arus kas dan pengeluaran dengan lebih cermat."
            : "Reputasimu jatuh ke 0%! Kepercayaan klien dan audiens adalah kunci utama dalam berkarier.";

        document.getElementById('teks-cerita').innerText = alasan;
        let btnUlang = document.createElement('button');
        btnUlang.innerText = "Coba Lagi dari Awal 🔄";
        btnUlang.onclick = () => tutupLayarSimulasi();
        tempatTombol.appendChild(btnUlang);
        return;
    }

    const cerita = skenarioAktif.find(c => c.id === idCerita);
    document.getElementById('badge-babak-simulasi').innerText = cerita.babak || "Simulasi";
    document.getElementById('teks-cerita').innerText = cerita.teks;

    cerita.pilihan.forEach(opsi => {
        const btn = document.createElement('button');
        btn.innerText = opsi.teks;
        btn.style.textAlign = 'left';
        btn.onclick = () => {
            let perubahanUang = opsi.efekUang || 0;
            if (perubahanUang > 0 && alatSudahUpgrade) {
                perubahanUang = Math.round(perubahanUang * 1.25);
            }

            uangPemain += perubahanUang;
            stressPemain += (opsi.efekStress || 0);
            reputasiPemain += (opsi.efekRep || 0);

            if (stressPemain > 100) stressPemain = 100;
            if (stressPemain < 0) stressPemain = 0;
            if (reputasiPemain > 100) reputasiPemain = 100;
            if (reputasiPemain < 0) reputasiPemain = 0;

            muatCerita(opsi.lanjutKe);
        };
        tempatTombol.appendChild(btn);
    });
}