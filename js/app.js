/**
 * BeBrave - app.js
 * Main entry point. Initializes all modules, button ripples, and background particle engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all modular components
  try {
    initNavigation();
    initMascot();
    initStorytellingSlider();
    initArticlesCarousel();
    initTimelineGenerator();
    initScrollEffects();
  } catch (err) {
    console.error("=== GEMINI ERROR ===", err);

    const parsedData = parseChronology(text);
    reportText = generateReportPlainText(parsedData);
    showToast("Mode cadangan lokal digunakan (API tidak tersedia).");
  }

  // Run premium micro-interactions
  initButtonRipples();
  createFloatingParticles();
});

/**
 * Creates button click ripple animations dynamically
 */
function initButtonRipples() {
  const rippleTargets = document.querySelectorAll('.btn, .btn-ai, .slider-btn, .btn-icon');

  rippleTargets.forEach(button => {
    button.addEventListener('mousedown', function (e) {
      // Create ripple element
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      
      // Calculate cursor click position relative to button boundaries
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      
      ripple.style.width = ripple.style.height = `${size}px`;
      
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      // Append ripple to button container
      this.appendChild(ripple);
      
      // Auto-destroy ripple span after completion
      setTimeout(() => {
        if (this.contains(ripple)) {
          this.removeChild(ripple);
        }
      }, 600);
    });
  });
}

/**
 * Ambient background floating particles generation
 */
function createFloatingParticles() {
  const container = document.querySelector('.particles-container');
  if (!container) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth <= 768;

  // Do not run on reduced-motion setups
  if (prefersReducedMotion) return;

  // Decrease density on mobile devices
  const particleCount = isMobile ? 8 : 22;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Randomize initial positions, sizes, and delays
    const size = Math.random() * 5 + 3; // 3px to 8px
    const startLeft = Math.random() * 100; // 0% to 100% of viewport
    const startTop = Math.random() * 100; // start scattered across screen height
    const delay = Math.random() * 15; // 0s to 15s delay
    const duration = Math.random() * 20 + 20; // 20s to 40s duration
    
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${startLeft}%`;
    particle.style.top = `${startTop}%`;
    particle.style.animation = `float-particle ${duration}s infinite linear`;
    particle.style.animationDelay = `${delay}s`;
    
    // Assign random subtle opacity variations
    particle.style.opacity = (Math.random() * 0.15 + 0.05).toString();

    container.appendChild(particle);
  }
}

// ============================================================
// AI Integration - Google Gemini API
// ============================================================
//
// PENTING (KEAMANAN API KEY):
// Karena repo ini public dan website ini static (tanpa backend),
// API key TIDAK BISA disembunyikan sepenuhnya dari source code.
// Untuk tetap aman dipublikasikan di GitHub, key ini WAJIB dibatasi
// (restricted) dulu di Google AI Studio / Google Cloud Console:
//   1. Buka https://aistudio.google.com/app/apikey (atau Cloud Console
//      -> APIs & Services -> Credentials)
//   2. Pilih API key yang dipakai di sini
//   3. "Application restrictions" -> "Websites" -> tambahkan URL
//      domain GitHub Pages kamu, contoh: https://tracia-ai.github.io/*
//   4. "API restrictions" -> batasi hanya ke "Generative Language API"
// Dengan begini, walaupun key ini kelihatan di source code publik,
// key HANYA bisa dipanggil dari domain BeBrave sendiri, jadi orang
// lain tidak bisa mencuri dan memakainya dari tempat lain.

/**
 * Memanggil Google Gemini API untuk menyusun cerita bebas pengguna
 * menjadi draf laporan kronologi yang terstruktur.
 * Melempar error (throw) jika gagal, supaya pemanggilnya (timeline.js)
 * bisa fallback otomatis ke parser lokal tanpa membuat halaman error.
 * @param {string} teksCerita - cerita mentah dari pengguna
 * @returns {Promise<string>} - teks laporan kronologi dari AI
 */
async function callGeminiAPI(teksCerita) {
  const prompt = `
  ...
  ${teksCerita}
  `;

  const response = await fetch("/.netlify/functions/gemini", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(errorText);
    throw new Error(`Netlify Function Error: ${response.status}`);
  }

  const data = await response.json();

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    console.error(data);
    throw new Error("Gemini tidak mengembalikan teks.");
  }

  return text.trim();
}

  const prompt = `
Kamu adalah AI Assistant BeBrave.

Tugasmu adalah mengubah cerita pengguna menjadi draf laporan kronologi.

ATURAN PALING PENTING

- Seluruh isi laporan HARUS berasal dari cerita pengguna.
- DILARANG menambahkan informasi baru.
- DILARANG menebak informasi.
- DILARANG mengubah urutan kejadian.
- DILARANG membuat kesimpulan.
- DILARANG membuat diagnosis psikologis atau medis.
- DILARANG memberi saran hukum.
- DILARANG menyalahkan korban.
- Jika informasi tidak tersedia, tulis:
  Tidak disebutkan.

==========================================
A. WAKTU & TANGGAL KEJADIAN
==========================================

Ambil HANYA informasi waktu yang benar-benar disebutkan.

Yang termasuk waktu:

- hari
- tanggal
- bulan
- tahun
- jam
- pukul
- rentang waktu

Contoh:

Senin
12 Januari 2025
jam 09.30
pukul 14.00
sekitar pukul 16.15

PENTING:

JANGAN MEMECAH FORMAT JAM.

BENAR

09.30
11.00
15.30

SALAH

09.
30

11.
00

15.
30

Jika tidak disebutkan:

Tidak disebutkan.

==========================================
B. TEMPAT KEJADIAN
==========================================

Tuliskan HANYA lokasi fisik atau media tempat kejadian berlangsung.

Contoh BENAR

kantin sekolah
ruang kelas
rumah
kantor
Instagram
WhatsApp
Telegram

Yang termasuk TEMPAT:

- lokasi fisik
- media komunikasi

JANGAN memasukkan:

- nama orang
- hari
- waktu
- hubungan

SALAH

Teman kelas
Guru
Senin

==========================================
C. PIHAK TERLIBAT
==========================================

Tuliskan HANYA manusia atau pihak yang terlibat.

Contoh BENAR

Korban
Pelaku
Guru
Teman kelas
Orang tua
Kepala sekolah

JANGAN memasukkan:

hari
tanggal
bulan
waktu
tempat
media sosial
aplikasi

SALAH

Senin
WhatsApp
Instagram
Rumah
09.30

Jika identitas tidak diketahui gunakan:

Korban
Pelaku

==========================================
D. KRONOLOGI
==========================================

Susun kronologi sesuai urutan cerita.

JANGAN mengubah urutan.

JANGAN menghilangkan informasi penting.

JANGAN menambahkan cerita.

JANGAN memecah kalimat karena tanda titik pada format jam.

Misalnya:

Hari Senin sekitar jam 09.30 saya berada di kantin sekolah.

TETAP menjadi SATU kalimat.

Bukan

Hari Senin sekitar jam 09.

30 saya berada di kantin sekolah.

Gunakan format:

- Kejadian 1:
- Kejadian 2:
- Kejadian 3:

==========================================
E. BUKTI PENDUKUNG
==========================================

Tuliskan HANYA bukti yang benar-benar disebutkan.

Contoh

Screenshot percakapan
Foto
Video
Rekaman suara
Email
Chat WhatsApp

Jika tidak ada:

Tidak disebutkan.

==========================================
F. DAMPAK
==========================================

Tuliskan HANYA dampak yang benar-benar disebutkan.

Contoh

Merasa takut
Merasa cemas
Sulit tidur
Menangis
Tidak fokus belajar

JANGAN mengubah menjadi istilah medis.

SALAH

PTSD
Depresi
Gangguan kecemasan

==========================================
FORMAT OUTPUT
==========================================

1. WAKTU & TANGGAL KEJADIAN

2. TEMPAT KEJADIAN PERKARA

3. PIHAK TERLIBAT

4. RINCIAN KRONOLOGI KEJADIAN

5. INDIKASI BUKTI PENDUKUNG

6. DAMPAK YANG DISEBUTKAN PENGGUNA

==========================================

Sebelum mengirim jawaban lakukan pemeriksaan berikut:

✓ Tidak ada informasi tambahan.
✓ Tidak ada tebakan.
✓ Tidak ada diagnosis.
✓ Jam seperti 09.30 TIDAK terpecah menjadi 09. dan 30.
✓ Hari seperti Senin masuk ke WAKTU, bukan PIHAK.
✓ Teman kelas masuk ke PIHAK, bukan TEMPAT.
✓ WhatsApp masuk ke TEMPAT/MEDIA bila disebut sebagai lokasi kejadian.
✓ Seluruh isi laporan berasal dari cerita pengguna.

Cerita pengguna:

${teksCerita}
`;

const response = await fetch("/.netlify/functions/gemini", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    prompt,
  }),
});

if (!response.ok) {
  const errorText = await response.text();
  console.error("NETLIFY FUNCTION ERROR:", errorText);

  throw new Error(
    `Netlify Function merespons dengan error ${response.status}\n${errorText}`
  );
}

const data = await response.json();

console.log("===== RESPONSE GEMINI =====");
console.log(data);

const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

if (!text) {
  console.error("Gemini tidak mengembalikan teks:", data);
  throw new Error("Gemini API tidak mengembalikan hasil teks.");
}

return text.trim();