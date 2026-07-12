/**
 * BeBrave - mascot.js
 * Manages interactive mascot animations, mouse parallax, blinks, entry wave, and celebration jumps
 */

function initMascot() {
  const heroSection = document.getElementById('hero');
  const heroMascotWrapper = document.querySelector('.hero-mascot-wrapper');
  const heroMascotImg = document.querySelector('.hero-mascot-img');
  const heroMascotShadow = document.querySelector('.hero-mascot-shadow');
  
  if (!heroMascotImg) return;

  // Check user motion preferences and screen width
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth <= 768;

  /**
   * Play Wave animation when entering viewport
   */
  if (!prefersReducedMotion) {
    heroMascotImg.classList.add('mascot-wave');
    setTimeout(() => {
      heroMascotImg.classList.remove('mascot-wave');
    }, 1500);
  }

  /**
   * Mouse parallax & cursor follow (tilt, translation, and shadow offset)
   */
  if (heroSection && heroMascotWrapper && !prefersReducedMotion && !isMobile) {
    let requestRef = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e) => {
      const rect = heroSection.getBoundingClientRect();
      const sectionWidth = rect.width;
      const sectionHeight = rect.height;
      
      // Calculate mouse position relative to section center (range -1 to 1)
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      targetX = (mouseX - sectionWidth / 2) / (sectionWidth / 2);
      targetY = (mouseY - sectionHeight / 2) / (sectionHeight / 2);
    };

    const updateParallax = () => {
      // Smooth interpolation (easing lerp) for premium drag feel
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      // Parallax translation amounts
      const mascotTranslateX = currentX * 25; // max 25px horizontal translation
      const mascotTranslateY = currentY * 15; // max 15px vertical translation
      
      // Head tilt / rotation amount
      const mascotRotate = currentX * 6; // max 6deg rotation
      
      // Shadow moves slightly in opposite direction
      const shadowTranslateX = -currentX * 15;
      const shadowScale = 1 - Math.abs(currentY) * 0.1;

      // Apply GPU-accelerated transforms
      if (heroMascotImg) {
        heroMascotImg.style.transform = `translate3d(${mascotTranslateX}px, ${mascotTranslateY}px, 0) rotate(${mascotRotate}deg)`;
      }
      if (heroMascotShadow) {
        heroMascotShadow.style.transform = `translate3d(${shadowTranslateX}px, 0, 0) scaleX(${shadowScale})`;
      }

      requestRef = requestAnimationFrame(updateParallax);
    };

    heroSection.addEventListener('mousemove', handleMouseMove);
    
    // Start animation loop
    requestRef = requestAnimationFrame(updateParallax);

    // Cancel animation loop on window blur or page change
    window.addEventListener('blur', () => {
      if (requestRef) cancelAnimationFrame(requestRef);
    });
    window.addEventListener('focus', () => {
      requestRef = requestAnimationFrame(updateParallax);
    });
  }

  /**
   * Listens for timeline generation events to run the celebration jump
   */
  emitter.on('timeline-generated', () => {
    if (prefersReducedMotion) return;
    
    // Add celebrate class to hero mascot
    heroMascotImg.classList.add('mascot-celebrate');
    
    // Also trigger celebration on any active slider mascot if in view
    const activeSliderMascot = document.querySelector('.slider-card.active .slider-mascot-img');
    if (activeSliderMascot) {
      activeSliderMascot.classList.add('mascot-celebrate');
    }

    setTimeout(() => {
      heroMascotImg.classList.remove('mascot-celebrate');
      if (activeSliderMascot) {
        activeSliderMascot.classList.remove('mascot-celebrate');
      }
    }, 1200);
  });
}

/**
 * Restart float animation for slide change (retrigger reflow)
 * @param {HTMLElement} mascotImgElement 
 */
function animateSliderMascotChange(mascotImgElement) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || !mascotImgElement) return;

  // Simple trick to restart CSS animation: remove class, trigger layout reflow, re-add class
  mascotImgElement.style.opacity = '0';
  mascotImgElement.style.transform = 'scale(0.85)';
  
  setTimeout(() => {
    mascotImgElement.style.opacity = '1';
    mascotImgElement.style.transform = 'scale(1)';
    
    const container = mascotImgElement.closest('.mascot-float');
    if (container) {
      container.style.animation = 'none';
      container.offsetHeight; // trigger reflow
      container.style.animation = 'mascot-float-key 6s infinite ease-in-out';
    }
  }, 50);
}
