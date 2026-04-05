/* ========== MAIN.JS - Tapicascos Barranquilla ========== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  lucide.createIcons();

  // ========== NAVBAR SCROLL EFFECT ==========
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  });

  // ========== MOBILE MENU ==========
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });

  // Close mobile menu on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  });

  // ========== SMOOTH SCROLL ==========
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ========== GSAP ANIMATIONS ==========
  gsap.registerPlugin(ScrollTrigger);

  // Hero animations
  gsap.from('.hero-anim', {
    y: 60,
    opacity: 0,
    duration: 1,
    stagger: 0.15,
    ease: 'power3.out',
    delay: 0.3
  });

  // Product cards
  gsap.utils.toArray('.product-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      y: 60,
      opacity: 0,
      duration: 0.8,
      delay: i * 0.15,
      ease: 'power3.out'
    });
  });

  // Service cards
  gsap.utils.toArray('.service-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      x: i % 2 === 0 ? -40 : 40,
      opacity: 0,
      duration: 0.8,
      delay: i * 0.1,
      ease: 'power3.out'
    });
  });

  // Testimonial cards
  gsap.utils.toArray('.testimonial-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      y: 40,
      opacity: 0,
      duration: 0.7,
      delay: i * 0.15,
      ease: 'power2.out'
    });
  });

  // Section headers
  gsap.utils.toArray('section h2').forEach(h2 => {
    gsap.from(h2, {
      scrollTrigger: {
        trigger: h2,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out'
    });
  });

  // ========== COUNT-UP ANIMATION ==========
  const countElements = document.querySelectorAll('[data-count]');

  countElements.forEach(el => {
    const target = parseInt(el.dataset.count);

    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      onEnter: () => {
        gsap.to(el, {
          duration: 2,
          ease: 'power2.out',
          onUpdate: function () {
            el.textContent = Math.round(this.progress() * target).toLocaleString();
          }
        });
      },
      once: true
    });
  });
});
