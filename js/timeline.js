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
   * Simulated AI formatting trigger
   */
  generateBtn.addEventListener('click', () => {
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

    // 2. Parse Chronology after simulated delay of 2000ms
    setTimeout(() => {
      const parsedData = parseChronology(text);
      const reportHtml = generateReportHTML(parsedData);
      
      // Store current parsed data globally on elements to allow copy/download
      outputBox.setAttribute('data-parsed', JSON.stringify(parsedData));

      // Clear loading state
      outputBox.innerHTML = '';

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

    }, 2000);
  });

  /**
   * Clipboard Copy Action
   */
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const parsedAttr = outputBox.getAttribute('data-parsed');
      if (!parsedAttr) {
        showToast("Susun laporan terlebih dahulu sebelum menyalin.");
        return;
      }

      const parsed = JSON.parse(parsedAttr);
      const plainText = generateReportPlainText(parsed);

      navigator.clipboard.writeText(plainText)
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
      const parsedAttr = outputBox.getAttribute('data-parsed');
      if (!parsedAttr) {
        showToast("Susun laporan terlebih dahulu sebelum mengunduh.");
        return;
      }

      const parsed = JSON.parse(parsedAttr);
      const plainText = generateReportPlainText(parsed);

      // Create Blob and triggers click link
      const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
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
