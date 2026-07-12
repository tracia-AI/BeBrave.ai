/**
 * BeBrave - navigation.js
 * Controls navigation transitions, mobile menu drawer, and smart scroll show/hide
 */

function initNavigation() {
  const header = document.querySelector('.header');
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.nav-mobile-menu');
  const mobileLinks = mobileMenu.querySelectorAll('.nav-link');
  const desktopLinks = document.querySelectorAll('.nav-links-desktop .nav-link');
  
  let lastScrollY = window.scrollY;
  let headerHidden = false;

  /**
   * Hide/Show header on scroll up/down
   */
  const handleScroll = debounce(() => {
    const currentScrollY = window.scrollY;
    
    // Don't hide header if mobile menu is open or we are near the top of the page
    if (mobileMenu.classList.contains('open') || currentScrollY < 100) {
      header.classList.remove('hidden');
      headerHidden = false;
      lastScrollY = currentScrollY;
      return;
    }
    
    if (currentScrollY > lastScrollY && !headerHidden) {
      // Scrolling down - hide
      header.classList.add('hidden');
      headerHidden = true;
    } else if (currentScrollY < lastScrollY && headerHidden) {
      // Scrolling up - show
      header.classList.remove('hidden');
      headerHidden = false;
    }
    
    lastScrollY = currentScrollY;
  }, 10);

  window.addEventListener('scroll', handleScroll, { passive: true });

  /**
   * Hamburger Menu Toggle
   */
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('open');
      
      // Animate hamburger icon lines
      const lines = hamburger.querySelectorAll('.hamburger-line');
      if (lines.length === 3) {
        if (!isOpen) {
          lines[0].style.transform = 'translateY(8px) rotate(45deg)';
          lines[1].style.opacity = '0';
          lines[2].style.transform = 'translateY(-8px) rotate(-45deg)';
        } else {
          lines[0].style.transform = 'none';
          lines[1].style.opacity = '1';
          lines[2].style.transform = 'none';
        }
      }
      
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = isOpen ? 'auto' : 'hidden'; // Disable page scrolling when menu is open
    });
  }

  /**
   * Close Mobile Menu when links are clicked and handle active states
   */
  const allLinks = [...desktopLinks, ...mobileLinks];
  
  allLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Close mobile menu if open
      if (mobileMenu.classList.contains('open')) {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = 'auto';
        
        // Reset hamburger icon lines
        const lines = hamburger.querySelectorAll('.hamburger-line');
        if (lines.length === 3) {
          lines[0].style.transform = 'none';
          lines[1].style.opacity = '1';
          lines[2].style.transform = 'none';
        }
      }

      // Smooth scroll to destination section
      const targetId = link.getAttribute('data-target');
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        const offset = 80; // Offset for sticky navbar height
        const bodyRect = document.body.getBoundingClientRect().top;
        const targetRect = targetSection.getBoundingClientRect().top;
        const targetPosition = targetRect - bodyRect;
        const offsetPosition = targetPosition - offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }

      // Update active state in UI
      updateActiveLink(link.getAttribute('data-target'));
    });
  });

  /**
   * Sync active class to links based on current section viewport
   */
  function updateActiveLink(targetId) {
    allLinks.forEach(link => {
      if (link.getAttribute('data-target') === targetId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Monitor scroll viewport to automatically update active nav item
  const sections = document.querySelectorAll('section[id], footer[id]');
  const handleScrollActiveNav = debounce(() => {
    const scrollPos = window.scrollY + 120; // Offset buffer for triggers
    
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      
      if (scrollPos >= top && scrollPos < top + height) {
        updateActiveLink(id);
      }
    });
  }, 100);

  window.addEventListener('scroll', handleScrollActiveNav, { passive: true });
}
