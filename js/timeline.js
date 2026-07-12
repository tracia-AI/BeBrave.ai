/**
 * BeBrave - timeline.js
 * Manages the simulated AI timeline generator, Local Storage autosave,
 * character counter, copy/download systems, and toast notifications
 */

function initTimelineGenerator() {
  const textarea = document.getElementById('timeline-input');
  const charCounter = document.getElementById('char-counter');
  const generateBtn = document.getElementById('timeline-generate-btn');
  const outputBox = document.getElementById('timeline-output');
  const copyBtn = document.getElementById('timeline-copy-btn');
  const downloadBtn = document.getElementById('timeline-download-btn');
  
  if (!textarea || !outputBox) return;

  // Local Storage Keys
  const STORAGE_KEY = 'bebrave_draft_memory';
  
  // Load saved draft on load
  const savedDraft = storage.get(STORAGE_KEY, '');
  if (savedDraft) {
    textarea.value = savedDraft;
    updateCharCount(savedDraft.length);
  }

  /**
   * Autosave to Local Storage and update char counter
   */
  textarea.addEventListener('input', (e) => {
    const text = e.target.value;
    updateCharCount(text.length);
    storage.set(STORAGE_KEY, text);
  });

  function updateCharCount(length) {
    if (charCounter) {
      charCounter.textContent = `${length} / 5000 karakter`;
    }
  }

  /**
   * AI formatting trigger.
   * Tries the real Gemini API first (Integrasi AI). If the API key is
   * missing, quota is exhausted, or the network call fails for any
   * reason, it silently falls back to the local simulated parser so
   * the page never shows a broken/error state to the user.
   */
  generateBtn.addEventListener('click', async () => {
    const text = textarea.value.trim();
    
    if (text.length < 15) {
      showToast("Tuliskan setidaknya 15 karakter cerita untuk memulai.");
      return;
    }

    // 1. Show Loading State
    outputBox.innerHTML = `
      <div class="timeline-loading">
        <div class="spinner"></div>
        <p style="font-weight: var(--weight-medium); font-size: var(--font-size-sm); color: var(--color-primary);">Menganalisis memori...</p>
        <p style="font-size: var(--font-size-xs); color: var(--color-text-muted); text-align: center;">Mengidentifikasi rincian hukum (Waktu, Tempat, Pihak, Bukti)...</p>
      </div>
    `;

    // Disable generate button during process
    generateBtn.disabled = true;
    generateBtn.style.opacity = '0.6';

    let reportText;

    try {
      // 2a. Try the real Gemini API call first
      reportText = await callGeminiAPI(text);
    } catch (err) {
      // 2b. Fallback: local simulated parser (fully offline, never fails)
      console.warn("Gemini API tidak tersedia, memakai mode cadangan lokal:", err);
      const parsedData = parseChronology(text);
      reportText = generateReportPlainText(parsedData);
      showToast("Mode cadangan lokal digunakan (API tidak tersedia).");
    }

    // Store the final report text so copy/download can reuse it directly
    outputBox.dataset.reportText = reportText;

    // Clear loading state
    outputBox.innerHTML = '';

    // Escape HTML special characters so raw AI text renders safely,
    // then wrap in a pre-wrap div so line breaks are preserved
    const escaped = reportText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const reportHtml = `<div class="generated-report-text" style="white-space: pre-wrap;">${escaped}</div>`;

    // 3. Start typing animation
    let i = 0;
    const speed = 5; // milliseconds per letter

    function type() {
      if (i < reportHtml.length) {
        if (reportHtml.charAt(i) === '<') {
          // Find end of HTML tag
          const tagEnd = reportHtml.indexOf('>', i);
          if (tagEnd !== -1) {
            outputBox.innerHTML += reportHtml.substring(i, tagEnd + 1);
            i = tagEnd + 1;
          } else {
            outputBox.innerHTML += reportHtml.charAt(i);
            i++;
          }
        } else {
          outputBox.innerHTML += reportHtml.charAt(i);
          i++;
        }
        // Scroll down as typing proceeds
        outputBox.scrollTop = outputBox.scrollHeight;
        requestAnimationFrame(type);
      } else {
        // Typing finished!
        generateBtn.disabled = false;
        generateBtn.style.opacity = '1';

        // Emit success event to trigger mascot wave celebration
        emitter.emit('timeline-generated');
        showToast("Kronologi terstruktur berhasil disusun!");
      }
    }

    // Begin animation frame typing loop
    requestAnimationFrame(type);
  });

  /**
   * Clipboard Copy Action
   */
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const reportText = outputBox.dataset.reportText;
      if (!reportText) {
        showToast("Susun laporan terlebih dahulu sebelum menyalin.");
        return;
      }

      navigator.clipboard.writeText(reportText)
        .then(() => {
          showToast("Kronologi disalin ke papan klip!");
        })
        .catch(err => {
          console.error("Failed to copy:", err);
          showToast("Gagal menyalin kronologi.");
        });
    });
  }

  /**
   * Plain text file download action
   */
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const reportText = outputBox.dataset.reportText;
      if (!reportText) {
        showToast("Susun laporan terlebih dahulu sebelum mengunduh.");
        return;
      }

      // Create Blob and triggers click link
      const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'BeBrave_Laporan_Kronologi.txt';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast("Laporan kronologi berhasil diunduh!");
    });
  }
}

/**
 * Creates and shows a toast notification on the bottom-right of the screen
 * @param {string} message - Toast message text
 */
function showToast(message) {
  let container = document.querySelector('.toast-container');
  
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toast-icon">🛡️</span>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);

  // Trigger reflow to apply entry transition
  toast.offsetHeight;
  toast.classList.add('show');

  // Fade out and remove toast after 3.5 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast);
      }
    }, 400);
  }, 3500);
}