/**
 * BeBrave - scroll.js
 * Implements Intersection Observer scroll reveals, page scroll progress indicator,
 * and the back-to-top button toggles
 */

function initScrollEffects() {
  const progressBar = document.querySelector('.scroll-progress');
  const backToTopBtn = document.querySelector('.back-to-top');
  const revealSections = document.querySelectorAll('section, footer');

  // Check reduced motion setting
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Section entry scroll reveals via Intersection Observer
   */
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const observerOptions = {
      root: null, // viewport
      rootMargin: '0px 0px -8% 0px', // trigger slightly before entering fully
      threshold: 0.05 // trigger when 5% is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target); // Trigger only once
        }
      });
    }, observerOptions);

    revealSections.forEach(section => {
      section.classList.add('reveal-section');
      observer.observe(section);
    });
  } else {
    // If reduced motion is on or Observer is not supported, show everything immediately
    revealSections.forEach(section => {
      section.classList.add('revealed');
    });
  }

  /**
   * High performance scroll updates (progress bar & back to top visibility)
   */
  let scrollTick = false;

  const handleScroll = () => {
    if (!scrollTick) {
      requestAnimationFrame(updateScrollMetrics);
      scrollTick = true;
    }
  };

  const updateScrollMetrics = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    // 1. Scroll Progress Bar
    if (progressBar && docHeight > 0) {
      const scrollPercent = (scrollTop / docHeight) * 100;
      progressBar.style.width = `${scrollPercent}%`;
    }

    // 2. Back To Top Visibility Toggle
    if (backToTopBtn) {
      if (scrollTop > 400) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    }

    scrollTick = false;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  /**
   * Back To Top Click Action
   */
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}
