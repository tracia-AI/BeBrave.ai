/**
 * BeBrave - utils.js
 * Contains reusable utility functions and the simulated AI formatting parser
 */

/**
 * Debounce function to limit execution rate of continuous events (e.g. scroll, resize)
 * @param {Function} func - The function to execute
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Safe Local Storage wrapper to prevent errors in private browsing modes
 */
const storage = {
  /**
   * Set value in Local Storage
   * @param {string} key 
   * @param {any} value 
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('Local Storage is not available or full:', e);
      return false;
    }
  },

  /**
   * Get value from Local Storage
   * @param {string} key 
   * @param {any} defaultValue 
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn('Local Storage is not readable:', e);
      return defaultValue;
    }
  },

  /**
   * Remove item from Local Storage
   * @param {string} key 
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }
};

/**
 * Custom Event Emitter for communication between isolated vanilla modules
 */
const emitter = {
  events: {},
  
  /**
   * Subscribe to event
   * @param {string} eventName 
   * @param {Function} callback 
   */
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  },

  /**
   * Publish event
   * @param {string} eventName 
   * @param {any} data 
   */
  emit(eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(callback => callback(data));
    }
  }
};

/**
 * Simulated AI Chronology parser
 * Extracts Date, Location, People involved, Incident details, Evidence, and Impact from free text.
 * @param {string} rawText - The user's typed memories
 * @returns {Object} - Structured chronology data
 */
function parseChronology(rawText) {
  if (!rawText || rawText.trim().length === 0) {
    return null;
  }

  const text = rawText.toLowerCase();
  
  // 1. Extract Dates
  let dates = [];
  const datePatterns = [
    /(\d{1,2}\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*\d{0,4})/g,
    /(kemarin|yesterday|hari ini|today|lusa|dua hari lalu|last week|minggu lalu|bulan lalu|last month)/g,
    /(senin|selasa|rabu|kamis|jumat|sabtu|minggu|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/g,
    /(jam|pukul|at)\s*(\d{1,2}[:.]\d{2}|\d{1,2}\s*(siang|malam|pagi|sore|am|pm))/g
  ];

  datePatterns.forEach(pattern => {
    const matches = rawText.match(pattern);
    if (matches) {
      matches.forEach(m => {
        if (!dates.includes(m)) dates.push(m);
      });
    }
  });

  if (dates.length === 0) {
    dates.push("Waktu tidak dispesifikasikan (perlu dilengkapi)");
  }

  // 2. Extract Locations
  let locations = [];
  const locationKeywords = [
    /di\s+([A-Za-z0-9\s]+?)(?=\s+(dan|atau|adalah|yang|kemarin|pukul|jam|saya|dia|mereka|,|\.))/g,
    /dekat\s+([A-Za-z0-9\s]+?)(?=\s+(dan|atau|adalah|yang|kemarin|pukul|jam|saya|dia|mereka|,|\.))/g,
    /at\s+([A-Za-z0-9\s]+?)(?=\s+(and|or|is|which|yesterday|at|he|she|they|,|\.))/g,
    /in\s+([A-Za-z0-9\s]+?)(?=\s+(and|or|is|which|yesterday|at|he|she|they|,|\.))/g
  ];

  // Look for specific common locations
  const specificLocations = ['kantin', 'toilet', 'kelas', 'sekolah', 'kantor', 'ruang', 'jalan', 'parkiran', 'school', 'office', 'bathroom', 'canteen', 'classroom'];
  specificLocations.forEach(loc => {
    if (text.includes(loc)) {
      const regex = new RegExp(`([^\\s]+\\s+${loc}|${loc}\\s+[^\\s]+)`, 'i');
      const match = rawText.match(regex);
      locations.push(match ? match[0] : loc);
    }
  });

  locationKeywords.forEach(pattern => {
    const matches = rawText.matchAll(pattern);
    for (const match of matches) {
      const loc = match[1].trim();
      if (loc && loc.length > 2 && !locations.includes(loc)) {
        locations.push(loc);
      }
    }
  });

  if (locations.length === 0) {
    locations.push("Lokasi tidak disebutkan secara eksplisit");
  }

  // 3. Extract People Involved
  let people = [];
  const roles = [
    'kakak kelas', 'adik kelas', 'teman sekelas', 'guru', 'dosen', 'atasan', 'bos', 'rekan kerja',
    'pelaku', 'supervisor', 'manager', 'classmate', 'senior', 'junior', 'teacher', 'boss', 'coworker'
  ];

  roles.forEach(role => {
    if (text.includes(role)) {
      people.push(role.charAt(0).toUpperCase() + role.slice(1));
    }
  });

  // Extract capitalized words that could be names (excluding sentence starters)
  const namePattern = /\b([A-Z][a-z]+)\b/g;
  const sentences = rawText.split(/[.!?]+/);
  sentences.forEach(sentence => {
    const trimmed = sentence.trim();
    if (!trimmed) return;
    const matches = trimmed.matchAll(namePattern);
    let index = 0;
    for (const match of matches) {
      // Avoid the very first word of a sentence unless it's repeated or clearly a name
      if (match.index > 0 && !people.includes(match[1])) {
        people.push(match[1]);
      }
      index++;
    }
  });

  if (people.length === 0) {
    people.push("Pihak eksternal (belum teridentifikasi namanya)");
  }

  // 4. Extract Evidences
  let evidence = [];
  const evidenceKeywords = [
    { word: 'cctv', label: 'Rekaman Kamera CCTV' },
    { word: 'chat', label: 'Tangkapan Layar Chat / Percakapan' },
    { word: 'screenshot', label: 'Screenshot / Tangkapan Layar' },
    { word: 'foto', label: 'Dokumentasi Foto Kejadian' },
    { word: 'video', label: 'Rekaman Video' },
    { word: 'rekaman', label: 'Rekaman Suara / Audio' },
    { word: 'saksi', label: 'Saksi Mata di Tempat Kejadian' },
    { word: 'pesan', label: 'Pesan Tulis / WhatsApp' },
    { word: 'email', label: 'Korespondensi Surat Elektronik (Email)' },
    { word: 'witness', label: 'Witness testimony' },
    { word: 'photo', label: 'Photographic evidence' }
  ];

  evidenceKeywords.forEach(item => {
    if (text.includes(item.word)) {
      evidence.push(item.label);
    }
  });

  if (evidence.length === 0) {
    evidence.push("Belum ada bukti fisik yang disebutkan (CCTV, Screenshot, Saksi)");
  }

  // 5. Extract Impact
  let impacts = [];
  const impactKeywords = [
    { word: 'takut', label: 'Kecemasan / Rasa Takut' },
    { word: 'trauma', label: 'Dampak Trauma Psikologis' },
    { word: 'sedih', label: 'Tekanan Emosional / Kesedihan' },
    { word: 'malu', label: 'Rasa Malu / Isolasi Sosial' },
    { word: 'cemas', label: 'Anxiety / Gangguan Kecemasan' },
    { word: 'bingung', label: 'Keadaan Bingung / Disorientasi' },
    { word: 'pusing', label: 'Sakit Kepala / Reaksi Psikosomatis' },
    { word: 'sakit', label: 'Rasa Sakit Fisik / Cedera' },
    { word: 'scared', label: 'Fear / Anxiety' },
    { word: 'anxious', label: 'Anxiety and distress' },
    { word: 'hurt', label: 'Physical pain / Emotional injury' }
  ];

  impactKeywords.forEach(item => {
    if (text.includes(item.word)) {
      impacts.push(item.label);
    }
  });

  if (impacts.length === 0) {
    impacts.push("Tekanan psikologis ringan (butuh pendampingan)");
  }

  // 6. Incidents Chronology parsing
  // Split input into sentences as incidents events
  let incidents = [];
  const cleanSentences = sentences
    .map(s => s.trim())
    .filter(s => s.length > 10);
  
  if (cleanSentences.length > 0) {
    incidents = cleanSentences.map((s, idx) => `Kejadian ${idx + 1}: ${s.charAt(0).toUpperCase() + s.slice(1)}.`);
  } else {
    incidents.push(`Peristiwa Utama: ${rawText}`);
  }

  return {
    dates: dates,
    locations: locations,
    people: people,
    incidents: incidents,
    evidence: evidence,
    impact: impacts
  };
}

/**
 * Formats parsed chronology object into safe markdown/HTML string representation
 * @param {Object} parsed - Parsed chronology fields
 * @returns {string} - Styled HTML template content
 */
function generateReportHTML(parsed) {
  if (!parsed) return '';

  return `
<div class="generated-report">
  <h4>1. Waktu & Tanggal Kejadian (Date)</h4>
  <ul>
    ${parsed.dates.map(d => `<li>${d}</li>`).join('')}
  </ul>

  <h4>2. Tempat Kejadian Perkara (Location)</h4>
  <ul>
    ${parsed.locations.map(l => `<li>${l}</li>`).join('')}
  </ul>

  <h4>3. Pihak Terlibat (People Involved)</h4>
  <ul>
    ${parsed.people.map(p => `<li>${p}</li>`).join('')}
  </ul>

  <h4>4. Rincian Kronologi Kejadian (Incident)</h4>
  <ul>
    ${parsed.incidents.map(i => `<li>${i}</li>`).join('')}
  </ul>

  <h4>5. Indikasi Bukti Pendukung (Evidence)</h4>
  <ul>
    ${parsed.evidence.map(e => `<li>${e}</li>`).join('')}
  </ul>

  <h4>6. Dampak Psikis / Fisik (Impact)</h4>
  <ul>
    ${parsed.impact.map(im => `<li>${im}</li>`).join('')}
  </ul>
</div>
  `.trim();
}

/**
 * Strips HTML tags to output a clean txt formatting for download
 * @param {Object} parsed 
 * @returns {string} - Clean plain text
 */
function generateReportPlainText(parsed) {
  if (!parsed) return '';
  
  let txt = `=========================================\n`;
  txt += `       DRAF LAPORAN KRONOLOGI BEBRAVE    \n`;
  txt += `=========================================\n\n`;
  
  txt += `1. WAKTU & TANGGAL KEJADIAN\n`;
  parsed.dates.forEach(d => txt += ` - ${d}\n`);
  txt += `\n`;
  
  txt += `2. TEMPAT KEJADIAN PERKARA\n`;
  parsed.locations.forEach(l => txt += ` - ${l}\n`);
  txt += `\n`;
  
  txt += `3. PIHAK TERLIBAT\n`;
  parsed.people.forEach(p => txt += ` - ${p}\n`);
  txt += `\n`;
  
  txt += `4. RINCIAN KRONOLOGI KEJADIAN\n`;
  parsed.incidents.forEach(i => txt += ` - ${i}\n`);
  txt += `\n`;
  
  txt += `5. INDIKASI BUKTI PENDUKUNG\n`;
  parsed.evidence.forEach(e => txt += ` - ${e}\n`);
  txt += `\n`;
  
  txt += `6. DAMPAK PSIKIS / FISIK\n`;
  parsed.impact.forEach(im => txt += ` - ${im}\n`);
  txt += `\n`;
  
  txt += `-----------------------------------------\n`;
  txt += `PENTING: Draf ini dibuat secara otomatis dengan format bantu BeBrave.\n`;
  txt += `Silakan periksa kembali detail keakuratan data sebelum diajukan ke pihak berwenang.\n`;
  
  return txt;
}
