/* =============================================
   A1 FURNITURES — script.js
   Lightweight vanilla JS — no frameworks
   ============================================= */

'use strict';

/* ---- DOM References ---- */
const navbar     = document.getElementById('navbar');
const navToggle  = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
const currentYearEl = document.getElementById('currentYear');
const contactForm = document.getElementById('contactForm');

/* =============================================
   1. NAVBAR — Scroll & Mobile Menu
   ============================================= */

// Scroll behaviour: add .scrolled class for styling
function handleNavbarScroll() {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleNavbarScroll, { passive: true });
handleNavbarScroll(); // run on init

// Mobile menu toggle
navToggle.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
  mobileMenu.setAttribute('aria-hidden', String(!isOpen));
});

// Close mobile menu when a link is clicked
mobileNavLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
  });
});

// Close menu on outside click
document.addEventListener('click', (e) => {
  if (mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !navToggle.contains(e.target)) {
    mobileMenu.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
  }
});

/* =============================================
   2. HERO — Staggered Reveal Animation
   ============================================= */
function initHeroReveal() {
  const revealEls = document.querySelectorAll('.hero .reveal-up');
  revealEls.forEach((el, index) => {
    // Use computed animation-delay from element or fallback to index
    const delay = (index * 200) + 200;
    el.style.animationDelay = `${delay}ms`;
    el.classList.add('animate');
  });
}

// Run after fonts are likely loaded (or immediately if preloaded)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroReveal);
} else {
  initHeroReveal();
}

/* =============================================
   3. SCROLL ANIMATIONS — Intersection Observer
   ============================================= */
function initScrollAnimations() {
  const fadeEls = document.querySelectorAll('.fade-in');
  if (!fadeEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger siblings within the same parent
          const siblings = [...entry.target.parentElement.querySelectorAll('.fade-in:not(.is-visible)')];
          const siblingIndex = siblings.indexOf(entry.target);
          const delay = Math.min(siblingIndex * 100, 400);

          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, delay);

          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  fadeEls.forEach(el => observer.observe(el));
}

initScrollAnimations();

/* =============================================
   4. TESTIMONIALS — Carousel (Mobile)
   ============================================= */
function initTestimonials() {
  const track  = document.getElementById('testimonialsTrack');
  const dotsEl = document.getElementById('tDots');
  const prevBtn = document.getElementById('tPrev');
  const nextBtn = document.getElementById('tNext');

  if (!track) return;

  const cards = [...track.querySelectorAll('.testimonial-card')];
  let current = 0;

  // Build dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 't-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  function updateDots() {
    dotsEl.querySelectorAll('.t-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
  }

  // On mobile, show one card at a time using CSS + scroll
  function goTo(index) {
    current = (index + cards.length) % cards.length;

    // Only apply carousel on mobile; on desktop all cards are visible
    if (window.innerWidth <= 768) {
      cards.forEach((card, i) => {
        card.style.display = i === current ? 'block' : 'none';
      });
    }
    updateDots();
  }

  function handleResize() {
    if (window.innerWidth > 768) {
      cards.forEach(card => { card.style.display = ''; });
    } else {
      cards.forEach((card, i) => {
        card.style.display = i === current ? 'block' : 'none';
      });
    }
    updateDots();
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  window.addEventListener('resize', handleResize, { passive: true });

  // Auto-advance every 6s
  let autoplay = setInterval(() => goTo(current + 1), 6000);

  track.addEventListener('mouseenter', () => clearInterval(autoplay));
  track.addEventListener('mouseleave', () => {
    autoplay = setInterval(() => goTo(current + 1), 6000);
  });

  // Support touch swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
  });

  handleResize();
}

initTestimonials();

/* =============================================
   5. CONTACT FORM — Basic Validation & Submit
   ============================================= */
function initContactForm() {
  if (!contactForm) return;

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name    = contactForm.querySelector('#name');
    const email   = contactForm.querySelector('#email');
    const message = contactForm.querySelector('#message');
    let valid = true;

    // Simple inline validation
    [name, email, message].forEach(field => {
      if (!field.value.trim()) {
        setInvalid(field, 'This field is required.');
        valid = false;
      } else if (field.type === 'email' && !isValidEmail(field.value)) {
        setInvalid(field, 'Please enter a valid email address.');
        valid = false;
      } else {
        setValid(field);
      }
    });

    if (!valid) return;

    // Simulate submission
    const submitBtn = contactForm.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.textContent = 'Enquiry Sent ✓';
      submitBtn.style.background = '#4a7c59';
      contactForm.reset();

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
      }, 4000);
    }, 1200);
  });

  // Clear error on input
  contactForm.querySelectorAll('.form-input, .form-textarea').forEach(field => {
    field.addEventListener('input', () => {
      if (field.value.trim()) setValid(field);
    });
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setInvalid(field, msg) {
  field.style.borderColor = '#c0392b';
  field.style.boxShadow = '0 0 0 3px rgba(192,57,43,0.1)';

  let errorEl = field.parentElement.querySelector('.form-error');
  if (!errorEl) {
    errorEl = document.createElement('span');
    errorEl.className = 'form-error';
    errorEl.style.cssText = 'font-size:0.75rem;color:#c0392b;margin-top:0.25rem;display:block;';
    field.parentElement.appendChild(errorEl);
  }
  errorEl.textContent = msg;
}

function setValid(field) {
  field.style.borderColor = '';
  field.style.boxShadow = '';
  const errorEl = field.parentElement.querySelector('.form-error');
  if (errorEl) errorEl.remove();
}

initContactForm();

/* =============================================
   6. FOOTER — Dynamic Year
   ============================================= */
if (currentYearEl) {
  currentYearEl.textContent = new Date().getFullYear();
}

/* =============================================
   7. SMOOTH ACTIVE NAV LINK HIGHLIGHT
   ============================================= */
function initActiveNavHighlight() {
  const sections = document.querySelectorAll('section[id], .hero[id]');
  const navLinks = document.querySelectorAll('.nav-link:not(.nav-link--cta)');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle(
              'nav-link--active',
              link.getAttribute('href') === `#${id}`
            );
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(section => observer.observe(section));
}

initActiveNavHighlight();

/* --- Add active nav link style via JS --- */
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .nav-link--active {
    color: var(--color-white) !important;
  }
  .nav-link--active::after {
    width: 100% !important;
  }
  .navbar.scrolled .nav-link--active {
    color: var(--color-walnut) !important;
  }
`;
document.head.appendChild(styleSheet);

/* =============================================
   8. GALLERY — Lightbox (Minimal)
   ============================================= */
function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll('.gallery__item');
  if (!galleryItems.length) return;

  // Build lightbox DOM
  const lightbox = document.createElement('div');
  lightbox.id = 'lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Image lightbox');
  lightbox.style.cssText = `
    display:none;position:fixed;inset:0;z-index:9999;
    background:rgba(26,26,26,0.95);
    align-items:center;justify-content:center;
    cursor:zoom-out;
  `;

  const lbImg = document.createElement('img');
  lbImg.style.cssText = `
    max-width:90vw;max-height:90vh;
    object-fit:contain;
    border-radius:4px;
    box-shadow:0 20px 80px rgba(0,0,0,0.5);
    pointer-events:none;
  `;

  const lbClose = document.createElement('button');
  lbClose.innerHTML = '✕';
  lbClose.setAttribute('aria-label', 'Close lightbox');
  lbClose.style.cssText = `
    position:absolute;top:1.5rem;right:1.5rem;
    background:none;border:none;color:#fff;
    font-size:1.5rem;cursor:pointer;
    width:44px;height:44px;
    display:flex;align-items:center;justify-content:center;
    border-radius:50%;transition:background 0.2s;
  `;
  lbClose.addEventListener('mouseenter', () => lbClose.style.background = 'rgba(255,255,255,0.1)');
  lbClose.addEventListener('mouseleave', () => lbClose.style.background = 'none');

  lightbox.appendChild(lbImg);
  lightbox.appendChild(lbClose);
  document.body.appendChild(lightbox);

  function openLightbox(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt;
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
  }

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const src = img.src.replace(/w=\d+/, 'w=1400');
      openLightbox(src, img.alt);
    });
    item.style.cursor = 'zoom-in';
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  lbClose.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.style.display === 'flex') closeLightbox();
  });
}

initGalleryLightbox();

/* =============================================
   9. PERFORMANCE — Lazy load polyfill check
   ============================================= */
if (!('loading' in HTMLImageElement.prototype)) {
  // Fallback for older browsers that don't support native lazy loading
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  const lazyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
        lazyObserver.unobserve(img);
      }
    });
  });
  lazyImages.forEach(img => lazyObserver.observe(img));
}
