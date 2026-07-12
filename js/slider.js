/**
 * BeBrave - slider.js
 * Implements the premium Apple-style storytelling slider with drag momentum,
 * horizontal wheel scroll, spring easing, and dynamic mascot assets
 */

// Slide configurations - Easy to customize!
const SLIDE_DATA = [
  {
    id: 1,
    badge: "Mengapa ini Penting?",
    title: "Kesulitan Menyusun Trauma Menjadi Cerita",
    mascot: "karakter3.png",
    theme: "dark-green", // Matches Image 1 green style
    infoBoxTitle: "Dampak Trauma Psikologis",
    infoItems: [
      { icon: "🧠", text: "Acak & Terfragmentasi (Memori tidak tersimpan ideal)" },
      { icon: "🧩", text: "Terfragmentasi (Detail kejadian terpecah)" },
      { icon: "⏳", text: "Tidak Berurutan (Sulit tentukan alur waktu)" }
    ],
    footerNote: "*Menuliskan kembali trauma bukanlah hal yang mudah. Ambil waktu sejenak, bernapaslah dengan tenang, dan ketikkan apa pun yang Anda ingat secara perlahan.*"
  },
  {
    id: 2,
    badge: "Persyaratan Hukum",
    title: "Syarat Laporan Hukum yang Valid",
    mascot: "karakter2.png",
    theme: "dark-green",
    infoBoxTitle: "Kriteria Laporan Hukum",
    infoItems: [
      { icon: "📅", text: "Kapan (Waktu dan tanggal kejadian)" },
      { icon: "📍", text: "Di mana (Tempat kejadian perkara)" },
      { icon: "👥", text: "Siapa (Pelaku dan saksi mata terlibat)" },
      { icon: "📝", text: "Bagaimana (Kronologi detil alur kejadian)" }
    ],
    footerNote: "*Informasi di atas sangat krusial untuk membantu penyelidik atau kuasa hukum memahami kasus Anda secara objektif dan akurat.*"
  },
  {
    id: 3,
    badge: "Peran BeBrave AI",
    title: "Menjembatani Celah Trauma dengan Teknologi",
    mascot: "karakter1.png",
    theme: "dark-green",
    infoBoxTitle: "Cara BeBrave AI Membantu",
    infoItems: [
      { icon: "🔒", text: "Enkripsi Aman (Data cerita dienkripsi langsung di browser)" },
      { icon: "🧠", text: "Struktur Cerdas (Merangkum ingatan acak menjadi garis waktu)" },
      { icon: "📄", text: "Format Resmi (Output draf laporan siap unduh/salin)" }
    ],
    footerNote: "*Kami hadir untuk mendampingi Anda tanpa tekanan. Cukup tuliskan memori Anda apa adanya, meskipun melompat-lompat atau penuh emosi.*"
  }
];

function initStorytellingSlider() {
  const wrapper = document.querySelector('.slider-wrapper');
  const container = document.querySelector('.slider-container');
  const prevBtn = document.querySelector('.slider-btn-prev');
  const nextBtn = document.querySelector('.slider-btn-next');
  const dotsContainer = document.querySelector('.slider-dots');

  if (!container || !wrapper) return;

  let activeIndex = 0;
  let isDragging = false;
  let startX = 0;
  let dragOffset = 0;
  let lastTranslateX = 0;
  let wheelTimeout = null;
  let isTransitioning = false;

  // Constants
  const snapDuration = 700; // 700ms snapping transition
  const dragThreshold = 100; // px displacement to trigger slide change
  
  /**
   * Render slider cards dynamically from SLIDE_DATA array
   */
  function renderSlides() {
    container.innerHTML = '';
    
    SLIDE_DATA.forEach((slide) => {
      const card = document.createElement('div');
      card.className = `slider-card ${slide.theme} ${slide.id === 1 ? 'active' : ''}`;
      card.setAttribute('data-index', slide.id - 1);
      
      const itemsHtml = slide.infoItems.map(item => `
        <li class="info-item">
          <span class="info-icon">${item.icon}</span>
          <span>${item.text}</span>
        </li>
      `).join('');

      card.innerHTML = `
        <div class="slider-card-left">
          <div class="slider-mascot-container mascot-float">
            <img class="slider-mascot-img" src="assets/mascot/${slide.mascot}" alt="Mascot ${slide.badge}" loading="lazy">
          </div>
        </div>
        <div class="slider-card-content">
          <div>
            <span class="article-category" style="color: ${slide.theme === 'dark-green' ? '#B08A64' : 'var(--color-accent)'}">${slide.badge}</span>
            <h3 class="testimonial-title" style="font-size: var(--font-size-lg); margin-top: var(--space-2); margin-bottom: var(--space-4);">${slide.title}</h3>
            
            <div class="slider-info-box">
              <div class="info-box-title">${slide.infoBoxTitle}</div>
              <ul class="info-list">
                ${itemsHtml}
              </ul>
            </div>
          </div>
          <div class="slider-footer-note">
            ${slide.footerNote}
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    // Render Navigation Dots
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      SLIDE_DATA.forEach((_, idx) => {
        const dot = document.createElement('div');
        dot.className = `slider-dot ${idx === 0 ? 'active' : ''}`;
        dot.setAttribute('data-index', idx);
        dot.addEventListener('click', () => goToSlide(idx));
        dotsContainer.appendChild(dot);
      });
    }
  }

  /**
   * Main Positioning Calculation (Apple-Style Center Fit)
   */
  function getTranslateForIndex(idx) {
    const wrapperWidth = wrapper.offsetWidth;
    const cards = container.querySelectorAll('.slider-card');
    if (cards.length === 0) return 0;

    const card = cards[idx];
    const cardWidth = card.offsetWidth;
    const cardLeft = card.offsetLeft;

    // Center alignment formula: viewport center minus half of card width
    return (wrapperWidth / 2) - cardLeft - (cardWidth / 2);
  }

  /**
   * Update active classes on cards and dots
   */
  function updateActiveClasses() {
    const cards = container.querySelectorAll('.slider-card');
    cards.forEach((card, idx) => {
      if (idx === activeIndex) {
        card.classList.add('active');
        const mascotImg = card.querySelector('.slider-mascot-img');
        if (typeof animateSliderMascotChange === 'function') {
          animateSliderMascotChange(mascotImg);
        }
      } else {
        card.classList.remove('active');
      }
    });

    const dots = dotsContainer.querySelectorAll('.slider-dot');
    dots.forEach((dot, idx) => {
      if (idx === activeIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  /**
   * Slide transition helper
   */
  function goToSlide(idx, animate = true) {
    if (idx < 0) idx = 0;
    if (idx >= SLIDE_DATA.length) idx = SLIDE_DATA.length - 1;

    activeIndex = idx;
    isTransitioning = true;

    const targetX = getTranslateForIndex(activeIndex);
    lastTranslateX = targetX;

    if (animate) {
      container.style.transition = `transform ${snapDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`; // Elastic spring-like curve
    } else {
      container.style.transition = 'none';
    }

    container.style.transform = `translateX(${targetX}px)`;
    updateActiveClasses();

    setTimeout(() => {
      isTransitioning = false;
      container.style.transition = 'none';
    }, snapDuration);
  }

  /**
   * Drag & Swipe Event Listeners (Mouse & Touch)
   */
  function handleDragStart(e) {
    if (isTransitioning) return;
    isDragging = true;
    startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    container.style.transition = 'none';
    
    // Cache current translate X position
    const matrix = new WebKitCSSMatrix(window.getComputedStyle(container).transform);
    lastTranslateX = matrix.m41;
  }

  function handleDragMove(e) {
    if (!isDragging) return;
    const currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    dragOffset = currentX - startX;

    // Apply elastic resistance at slider bounds
    let targetX = lastTranslateX + dragOffset;
    const minX = getTranslateForIndex(SLIDE_DATA.length - 1);
    const maxX = getTranslateForIndex(0);

    if (targetX > maxX) {
      // Pulling beyond left edge
      const overshoot = targetX - maxX;
      targetX = maxX + overshoot * 0.35; // Resistance coefficient
    } else if (targetX < minX) {
      // Pulling beyond right edge
      const overshoot = minX - targetX;
      targetX = minX - overshoot * 0.35; // Resistance coefficient
    }

    container.style.transform = `translateX(${targetX}px)`;
  }

  function handleDragEnd() {
    if (!isDragging) return;
    isDragging = false;

    // Determine target slide based on drag displacement
    if (dragOffset < -dragThreshold && activeIndex < SLIDE_DATA.length - 1) {
      goToSlide(activeIndex + 1);
    } else if (dragOffset > dragThreshold && activeIndex > 0) {
      goToSlide(activeIndex - 1);
    } else {
      goToSlide(activeIndex); // Snap back to current
    }

    dragOffset = 0;
  }

  // Bind dragging events
  wrapper.addEventListener('mousedown', handleDragStart);
  window.addEventListener('mousemove', handleDragMove);
  window.addEventListener('mouseup', handleDragEnd);

  wrapper.addEventListener('touchstart', handleDragStart, { passive: true });
  window.addEventListener('touchmove', handleDragMove, { passive: true });
  window.addEventListener('touchend', handleDragEnd);

  /**
   * Mouse Wheel Horizontal Snapping
   */
  wrapper.addEventListener('wheel', (e) => {
    // Only capture horizontal scrolling or large vertical swipes
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    
    if (Math.abs(delta) < 25 || isTransitioning || isDragging) return;
    
    e.preventDefault(); // Prevent default vertical scroll when hovering slider
    
    if (wheelTimeout) return;
    
    if (delta > 0 && activeIndex < SLIDE_DATA.length - 1) {
      goToSlide(activeIndex + 1);
    } else if (delta < 0 && activeIndex > 0) {
      goToSlide(activeIndex - 1);
    }

    // Set lock to prevent scrolling issues
    wheelTimeout = setTimeout(() => {
      wheelTimeout = null;
    }, 850);
  }, { passive: false });

  /**
   * Keyboard Arrow Navigation
   */
  window.addEventListener('keydown', (e) => {
    // Only capture if slider section is partially in view
    const rect = wrapper.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (!inView || isTransitioning) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToSlide(activeIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToSlide(activeIndex - 1);
    }
  });

  /**
   * Button Click Navigation
   */
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToSlide(activeIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToSlide(activeIndex + 1);
    });
  }

  // Initialize Rendering
  renderSlides();
  
  // Fit alignment on initial load and debounce window resizing
  setTimeout(() => goToSlide(0, false), 100);
  window.addEventListener('resize', debounce(() => {
    goToSlide(activeIndex, false);
  }, 100));
}
