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
    console.error("Module initialization error:", err);
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
const GEMINI_API_KEY = "";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Memanggil Google Gemini API untuk menyusun cerita bebas pengguna
 * menjadi draf laporan kronologi yang terstruktur.
 * Melempar error (throw) jika gagal, supaya pemanggilnya (timeline.js)
 * bisa fallback otomatis ke parser lokal tanpa membuat halaman error.
 * @param {string} teksCerita - cerita mentah dari pengguna
 * @returns {Promise<string>} - teks laporan kronologi dari AI
 */
async function callGeminiAPI(teksCerita) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.startsWith("PASTE_")) {
    throw new Error("Gemini API key belum di-set di app.js.");
  }

  const prompt = `
Kamu adalah AI Assistant BeBrave.

Tugasmu adalah membantu pengguna menyusun Draf Laporan Kronologi berdasarkan cerita yang diberikan.

====================================================
ATURAN WAJIB
====================================================

1. Gunakan HANYA informasi yang diberikan pengguna.
2. Jangan pernah menambahkan informasi baru.
3. Jangan menebak informasi yang tidak disebutkan.
4. Jika suatu informasi tidak tersedia, tulis:
   "Tidak disebutkan."
5. Jangan membuat diagnosis psikologis maupun medis.
6. Jangan menambahkan bukti yang tidak disebutkan pengguna.
7. Jangan mengubah urutan kejadian.
8. Gunakan bahasa Indonesia yang formal, netral, objektif, dan mudah dipahami.
9. Jangan memberikan opini pribadi.
10. Jangan memberikan saran hukum.
11. Jangan menyalahkan korban.
12. Fokus hanya menyusun kronologi berdasarkan fakta.

====================================================
ATURAN EKSTRAKSI
====================================================

A. WAKTU
- Ambil tanggal, bulan, tahun, jam, atau rentang waktu yang benar-benar disebutkan.
- Jika tidak ada, tulis:
Tidak disebutkan.

B. TEMPAT
- Ambil lokasi yang benar-benar disebutkan.
- Jangan menebak.
- Jika tidak ada:
Tidak disebutkan.

C. PIHAK TERLIBAT
- Hanya tuliskan manusia atau pihak yang benar-benar terlibat.

Contoh BENAR:
- Korban
- Pelaku
- Mantan pacar
- Guru
- Rekan kerja
- Teman

Contoh SALAH:
- Februari
- Instagram
- WhatsApp
- Senin
- Rumah
- Mobil

Jika identitas tidak diketahui, gunakan:
- Korban
- Pelaku

D. KRONOLOGI
- Pecah menjadi poin-poin berdasarkan urutan waktu.
- Jangan mengurangi informasi penting.
- Jangan menambahkan cerita baru.
- Gunakan format:

- Kejadian 1:
- Kejadian 2:
- Kejadian 3:

E. BUKTI PENDUKUNG
Hanya tampilkan bukti yang disebutkan pengguna.

Contoh:
- Screenshot percakapan
- Foto
- Video
- Rekaman suara
- Riwayat panggilan
- Email

Jika tidak disebutkan:
Tidak disebutkan.

F. DAMPAK
Hanya tuliskan dampak yang benar-benar disebutkan pengguna.

Contoh:
- Merasa takut
- Merasa cemas
- Sulit tidur
- Merasa tertekan

JANGAN mengubah menjadi:
- Anxiety
- PTSD
- Depresi
- Gangguan mental

====================================================
FORMAT OUTPUT
====================================================

=========================================
       DRAF LAPORAN KRONOLOGI BEBRAVE
=========================================

1. WAKTU & TANGGAL KEJADIAN

2. TEMPAT KEJADIAN PERKARA

3. PIHAK TERLIBAT

4. RINCIAN KRONOLOGI KEJADIAN

5. INDIKASI BUKTI PENDUKUNG

6. DAMPAK YANG DISEBUTKAN PENGGUNA

-----------------------------------------
PENTING:
Draf ini dibuat secara otomatis oleh AI BeBrave berdasarkan informasi yang diberikan pengguna.
Silakan periksa kembali seluruh isi sebelum digunakan sebagai dokumen resmi.

====================================================
CERITA PENGGUNA
====================================================

${teksCerita}

====================================================
PEMERIKSAAN TERAKHIR
====================================================

Sebelum memberikan jawaban:

- Pastikan tidak ada informasi yang kamu tambahkan sendiri.
- Jika suatu informasi tidak ada dalam cerita, tulis "Tidak disebutkan."
- Pastikan seluruh isi laporan hanya berasal dari cerita pengguna.
`;

  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API merespons dengan error: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini API tidak mengembalikan hasil teks.");
  }

  return text.trim();
}