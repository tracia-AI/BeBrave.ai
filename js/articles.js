/**
 * BeBrave - articles.js
 * Generates article cards dynamically and implements an infinite-loop draggable carousel
 */

// Centralized article metadata database
const ARTICLE_DATA = [
    {
        id: 1,
        image: "assets/images/kesehatanMental.avif",
        category: "Kesehatan Mental",
        title: "Healing from Trauma: Langkah Awal Memproses Luka",
        summary: "Langkah-langkah praktis berbasis klinis untuk memproses emosi negatif, melatih pernapasan, dan menemukan ketenangan kembali setelah mengalami perundungan.",
        source: "Mayo Clinic",
        readTime: "5 menit baca",
        url: "https://www.mayoclinic.org/diseases-conditions/post-traumatic-stress-disorder/diagnosis-treatment/drc-20355973"
    },
    {
        id: 2,
        image: "assets/images/dukunganSosial.jpg",
        category: "Dukungan Sosial",
        title: "Mengatasi Perundungan & Dampak Psikis pada Remaja",
        summary: "Panduan mendalam mengidentifikasi intimidasi terselubung di sekolah atau dunia maya serta peran krusial support system dalam pemulihan korban.",
        source: "UNICEF",
        readTime: "7 menit baca",
        url: "https://www.unicef.org/indonesia/id/topics/mental-health"
    },
    {
        id: 3,
        image: "assets/images/dukunganPsikologi.webp",
        category: "Edukasi Psikologi",
        title: "Bagaimana Otak Menyimpan Memori Traumatis",
        summary: "Ulasan neurologis mengapa korban kekerasan verbal atau fisik seringkali mengalami kesulitan mengingat kejadian secara terstruktur dan berurutan.",
        source: "World Health Organization (WHO)",
        readTime: "6 menit baca",
        url: "https://www.who.int/news-room/fact-sheets/detail/mental-health-strengthening-our-response"
    },
    {
        id: 4,
        image: "assets/images/terapiPemulihan.jpg",
        category: "Terapi Pemulihan",
        title: "Membangun Resiliensi dan Rasa Aman Pasca Kekerasan",
        summary: "Tips melatih ketahanan mental, membangun kembali rasa percaya diri yang runtuh, serta teknik grounding untuk mengatasi kepanikan mendadak.",
        source: "American Psychological Association (APA)",
        readTime: "4 menit baca",
        url: "https://www.apa.org/topics/resilience/building-your-resilience"
    },
    {
        id: 5,
        image: "assets/images/panduanKonseling.jpg",
        category: "Panduan Konseling",
        title: "Kenali Gejala PTSD dan Kapan Harus ke Psikolog",
        summary: "Informasi lengkap tentang gejala stres pasca trauma (PTSD) yang menetap dan daftar rujukan lembaga profesional di Indonesia untuk pendampingan.",
        source: "Kementerian Kesehatan Republik Indonesia",
        readTime: "8 menit baca",
        url: "https://ayosehat.kemkes.go.id/pentingnya-kesehatan-mental-bagi-remaja"
    }
];

function initArticlesCarousel() {
  const wrapper = document.querySelector('.articles-carousel-wrapper');
  const track = document.querySelector('.articles-carousel');
  const prevBtn = document.querySelector('.articles-btn-prev');
  const nextBtn = document.querySelector('.articles-btn-next');

  if (!track || !wrapper) return;

  let activeIndex = 0; // Index of the central visible card (local actual coordinates)
  let isDragging = false;
  let startX = 0;
  let dragOffset = 0;
  let currentTranslate = 0;
  let slideWidth = 0;
  let gapWidth = 24; // var(--space-6) = 24px
  let cardsToShow = 3;
  let itemsCount = ARTICLE_DATA.length;
  let isTransitioning = false;

  // Track the cloned setup for infinite loop
  let clonesCountBefore = 0;
  let clonesCountAfter = 0;

  /**
   * Determine number of visible cards based on responsive viewport widths
   */
  function updateResponsiveConfig() {
    const width = window.innerWidth;
    if (width > 992) {
      cardsToShow = 3;
    } else if (width > 576) {
      cardsToShow = 2;
    } else {
      cardsToShow = 1;
    }
  }

  /**
   * Render original cards and setup infinite loop clones
   */
  function renderArticles() {
    track.innerHTML = '';
    
    // We clone 3 items at the start and 3 items at the end to cover all responsive cardsToShow states
    const clonesToCreate = 3;
    clonesCountBefore = clonesToCreate;
    clonesCountAfter = clonesToCreate;

    const itemsToRender = [
      ...ARTICLE_DATA.slice(-clonesToCreate), // Prepend clones
      ...ARTICLE_DATA,                        // Actual items
      ...ARTICLE_DATA.slice(0, clonesToCreate)  // Append clones
    ];

    itemsToRender.forEach((article, index) => {
      const card = document.createElement('article');
      card.className = 'article-card';
      
      // Assign specific metadata tag for styling identification
      card.setAttribute('data-id', article.id);
      
      // Premium colors for article card thumbnail backgrounds (using primary forest gradients)
      const gradColors = [
        'linear-gradient(135deg, #425344 0%, #B08A64 100%)',
        'linear-gradient(135deg, #384239 0%, #425344 100%)',
        'linear-gradient(135deg, #B08A64 0%, #EFE3D8 100%)',
        'linear-gradient(135deg, #425344 0%, #EFE3D8 100%)',
        'linear-gradient(135deg, #354337 0%, #B08A64 100%)'
      ];
      
      const backgroundGrad = gradColors[(article.id - 1) % gradColors.length];

      card.innerHTML = `
    <div class="article-thumbnail-wrapper" style="background: ${backgroundGrad}; position: relative; overflow: hidden;">
        <img src="${article.image}" alt="${article.title}" style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0;">
        <!-- Ambient lighting blur indicator inside thumbnail -->
        <div style="position: absolute; top:0; left:0; width:100%; height:100%; background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.4) 100%);"></div>
    </div>
    <div class="article-content">
        <div class="article-content">
          <div>
            <span class="article-category">${article.category}</span>
            <h3 class="article-title">${article.title}</h3>
            <p class="article-summary">${article.summary}</p>
          </div>
          <div class="article-meta">
            <span>${article.source}</span>
            <span>•</span>
            <span>${article.readTime}</span>
            <span>•</span>
            <a class="article-link" href="${article.url}" target="_blank" rel="noopener noreferrer">
              Baca <span style="font-size: 11px;">↗</span>
            </a>
          </div>
        </div>
      `;
      track.appendChild(card);
    });
  }

  /**
   * Position calculation for slider elements
   */
  function calculateDimensions() {
    updateResponsiveConfig();
    const wrapperWidth = wrapper.offsetWidth;
    
    // Calculate size of a card based on space and gap counts
    slideWidth = (wrapperWidth - (gapWidth * (cardsToShow - 1))) / cardsToShow;

    const cards = track.querySelectorAll('.article-card');
    cards.forEach(card => {
      card.style.width = `${slideWidth}px`;
    });
    
    // Position track at actual first item index
    jumpToActualIndex(activeIndex);
  }

  function getTranslateForIndex(idx) {
    // Total index in the tracks list
    const actualListIdx = idx + clonesCountBefore;
    return -(actualListIdx * (slideWidth + gapWidth));
  }

  function jumpToActualIndex(idx) {
    activeIndex = idx;
    currentTranslate = getTranslateForIndex(activeIndex);
    track.style.transition = 'none';
    track.style.transform = `translateX(${currentTranslate}px)`;
  }

  function slideTo(idx, animate = true) {
    if (isTransitioning) return;
    isTransitioning = true;
    
    activeIndex = idx;
    currentTranslate = getTranslateForIndex(activeIndex);
    
    if (animate) {
      track.style.transition = 'transform 600ms cubic-bezier(0.16, 1, 0.3, 1)';
    } else {
      track.style.transition = 'none';
    }
    
    track.style.transform = `translateX(${currentTranslate}px)`;

    // Handle Infinite Loop jump after transition completes
    setTimeout(() => {
      // If we slide past elements (reached pre-cloned ones)
      if (activeIndex >= itemsCount) {
        jumpToActualIndex(0); // Instantly jump back to first actual
      } else if (activeIndex < 0) {
        jumpToActualIndex(itemsCount - 1); // Instantly jump to last actual
      }
      isTransitioning = false;
    }, 600);
  }

  /**
   * Drag Handling
   * A small movement threshold is used so that natural mouse jitter
   * during a click doesn't get treated as a drag - this was causing
   * the "Baca" links inside cards to become unclickable, since the
   * card would shift out from under the cursor before mouseup.
   */
  let hasDragged = false;
  const DRAG_THRESHOLD = 5; // pixels

  function handleDragStart(e) {
    if (isTransitioning) return;
    isDragging = true;
    hasDragged = false;
    startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    track.style.transition = 'none';
    
    // Cache exact translation
    const matrix = new WebKitCSSMatrix(window.getComputedStyle(track).transform);
    currentTranslate = matrix.m41;
  }

  function handleDragMove(e) {
    if (!isDragging) return;
    const currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    dragOffset = currentX - startX;

    // Only visually drag once movement passes the threshold, so a plain
    // click never shifts the card out from under the cursor
    if (Math.abs(dragOffset) > DRAG_THRESHOLD) {
      hasDragged = true;
      track.style.transform = `translateX(${currentTranslate + dragOffset}px)`;
    }
  }

  function handleDragEnd() {
    if (!isDragging) return;
    isDragging = false;

    if (!hasDragged) {
      // Movement never passed the threshold - this was a click/tap,
      // not a drag. Don't move the carousel, let the click go through.
      dragOffset = 0;
      return;
    }
    
    // Snap threshold: 25% of slide width
    const threshold = slideWidth * 0.25;

    if (dragOffset < -threshold) {
      slideTo(activeIndex + 1); // Slide Next
    } else if (dragOffset > threshold) {
      slideTo(activeIndex - 1); // Slide Prev
    } else {
      slideTo(activeIndex); // Snap Back
    }
    
    dragOffset = 0;
  }

  // Bind carousel events
  wrapper.addEventListener('mousedown', handleDragStart);
  window.addEventListener('mousemove', handleDragMove);
  window.addEventListener('mouseup', handleDragEnd);

  wrapper.addEventListener('touchstart', handleDragStart, { passive: true });
  window.addEventListener('touchmove', handleDragMove, { passive: true });
  window.addEventListener('touchend', handleDragEnd);

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      slideTo(activeIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      slideTo(activeIndex + 1);
    });
  }

  // Initialize
  renderArticles();
  
  // Wait minor timeout for layout calculations to settle
  setTimeout(calculateDimensions, 50);

  // Responsive adjustments on resize
  window.addEventListener('resize', debounce(() => {
    calculateDimensions();
  }, 100));
}