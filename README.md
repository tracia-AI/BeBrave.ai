# 🕊️ BeBrave AI

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Gemini](https://img.shields.io/badge/Google-Gemini%202.5%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)
![License](https://img.shields.io/badge/License-Educational-green?style=for-the-badge)

**BeBrave AI** adalah aplikasi web yang membantu pengguna menyusun kronologi kejadian secara otomatis menggunakan Google Gemini AI. Proyek ini dirancang untuk membantu pengguna merapikan cerita menjadi draf laporan kronologi yang lebih terstruktur, sehingga dapat digunakan sebagai dokumentasi awal sebelum berkonsultasi dengan pihak yang berwenang atau tenaga profesional.

> ⚠️ **Disclaimer:** BeBrave AI bukan pengganti pendamping hukum maupun psikolog. Hasil yang dihasilkan AI merupakan draf awal dan tetap perlu diperiksa kembali oleh pengguna.

---

## 🌐 Demo

**Website:**
https://bebraveaimarkoding.netlify.app/

> Catatan: Website di-hosting di Netlify (bukan GitHub Pages), karena fitur AI membutuhkan Netlify Functions sebagai backend serverless.

---

## ✨ Fitur

- 🤖 AI menyusun kronologi secara otomatis menggunakan Google Gemini API (model `gemini-2.5-flash`)
- 📝 Mengubah cerita bebas menjadi kronologi yang terstruktur (Waktu, Tempat, Pihak Terlibat, Kronologi, Bukti, Dampak)
- 📄 Menghasilkan draf laporan dalam format TXT (unduh) dan salin ke papan klip
- 🛟 Mode cadangan lokal otomatis jika Gemini API sedang tidak tersedia, sehingga pengguna tetap mendapat draf kronologi
- 📱 Responsive Design (Desktop & Mobile)
- 🎥 Hero Section menggunakan video
- 🎨 Modern UI dengan HTML, CSS, dan JavaScript murni (tanpa framework)
- 🔒 API key Gemini tersimpan aman di server (Netlify environment variable), tidak pernah terekspos ke browser atau kode publik di GitHub

---

## 📷 Tampilan

Tambahkan screenshot website di sini.
<img width="1920" height="947" alt="image" src="https://github.com/user-attachments/assets/0dff23cd-1782-485f-af75-1f572c0efbea" />
<img width="1918" height="945" alt="image" src="https://github.com/user-attachments/assets/2aec5b8a-d54e-430a-a791-6fe1325da734" />

Contoh:
```
assets/screenshot-home.png
```
atau gunakan gambar GitHub.

---

## 🛠️ Teknologi

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Google Gemini API (`gemini-2.5-flash`)
- Netlify Functions (serverless backend, proxy aman untuk API key)
- Netlify Hosting (Continuous Deployment dari GitHub)

---

## 📂 Struktur Project

```
BeBrave.ai
│
├── index.html
├── netlify.toml
├── README.md
│
├── css/
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   ├── animations.css
│   ├── responsive.css
│   └── variables.css
│
├── js/
│   ├── app.js            # Entry point, inisialisasi modul, integrasi Gemini API
│   ├── timeline.js       # Logika generator kronologi, autosave, copy/download
│   ├── utils.js          # Utilitas umum + parser kronologi mode cadangan lokal
│   ├── navigation.js
│   ├── mascot.js
│   ├── slider.js
│   ├── scroll.js
│   └── articles.js
│
├── netlify/
│   └── functions/
│       └── gemini.js     # Serverless function: proxy aman ke Google Gemini API
│
└── assets/
    ├── images/
    └── mascot/
```

---

## 🚀 Cara Menjalankan (Lokal)

Clone repository
```bash
git clone https://github.com/tracia-AI/BeBrave.ai.git
```

Masuk ke folder project
```bash
cd BeBrave.ai
```

> ⚠️ **Penting:** Membuka `index.html` langsung lewat Live Server / browser biasa **tidak akan mengaktifkan fitur AI**, karena fitur ini bergantung pada Netlify Function (`/.netlify/functions/gemini`) yang hanya berjalan di lingkungan Netlify. Untuk menjalankan fitur AI secara lokal, gunakan [Netlify CLI](https://docs.netlify.com/cli/get-started/):
> ```bash
> npm install -g netlify-cli
> netlify dev
> ```
> Tanpa Netlify CLI, website tetap bisa dibuka dan digunakan, namun akan otomatis memakai mode cadangan lokal (parser sederhana) alih-alih Gemini AI.

---

## 🔑 Konfigurasi API

Project ini menggunakan **Google Gemini API**, diakses lewat Netlify Function agar API key tidak pernah terekspos di kode frontend maupun repository publik.

1. Buka [Google AI Studio](https://aistudio.google.com/app/apikey) dan buat API Key baru.
2. Masuk ke dashboard **Netlify** → project ini → **Site configuration → Environment variables**.
3. Tambahkan environment variable baru:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** API key kamu dari Google AI Studio
4. Simpan, lalu redeploy situs (Deploys → Trigger deploy → Deploy site).

Key ini hanya dibaca oleh `netlify/functions/gemini.js` di sisi server, dan tidak pernah dikirim ke browser pengguna.

---

## 🧠 Cara Kerja

1. Pengguna menuliskan cerita kronologi di halaman utama.
2. Cerita dikirim ke `netlify/functions/gemini.js` (backend serverless milik BeBrave).
3. Function tersebut meneruskan permintaan ke Google Gemini API menggunakan API key yang tersimpan aman di server.
4. Gemini menyusun kronologi secara objektif dan terstruktur berdasarkan aturan ketat (tanpa menambah informasi, tanpa membuat diagnosis, tanpa menyalahkan korban).
5. Hasil ditampilkan pada website dengan animasi mengetik.
6. Jika Gemini API gagal dihubungi, sistem otomatis beralih ke parser lokal sebagai cadangan.
7. Pengguna dapat menyalin hasil ke papan klip atau mengunduhnya dalam format TXT.

---

## 🎯 Tujuan Project

BeBrave AI dibuat sebagai media bantu untuk membantu pengguna:
- Menyusun kronologi secara runtut
- Mendokumentasikan kejadian
- Membantu proses pelaporan
- Mengurangi kesulitan dalam menyusun cerita yang panjang

---

## ⚠️ Batasan

- Membutuhkan koneksi internet.
- Membutuhkan Google Gemini API Key yang valid dan aktif di server Netlify.
- AI dapat menghasilkan kesalahan sehingga hasil tetap harus diperiksa kembali oleh pengguna.
- Fitur AI tidak berfungsi jika dijalankan lokal tanpa Netlify CLI (lihat bagian "Cara Menjalankan").

---

## 👩‍💻 Developer

**Tiara**
Information Systems Student
GitHub: https://github.com/tracia-AI

---

## 📄 Lisensi

Project ini dibuat untuk keperluan pembelajaran dan seleksi **Markoding Web Development Dasar**.
Silakan gunakan sebagai referensi belajar, namun jangan melakukan plagiarisme terhadap keseluruhan proyek.

---

## ❤️ Acknowledgement

Terima kasih kepada:
- Google Gemini API
- Netlify
- Markoding
- Seluruh pihak yang mendukung pengembangan BeBrave AI
