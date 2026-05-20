/* =============================================
   A1 FURNITURES — collection.js
   Shared JS for all collection pages
   ============================================= */

'use strict';

/* ---- Navbar scroll ---- */
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

function handleNavbarScroll() {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleNavbarScroll, { passive: true });
handleNavbarScroll();

navToggle.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
  mobileMenu.setAttribute('aria-hidden', String(!isOpen));
});

mobileNavLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
  });
});

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

/* ---- Scroll fade-in animations ---- */
function initScrollAnimations() {
  const fadeEls = document.querySelectorAll('.fade-in');
  if (!fadeEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const siblings = [...entry.target.parentElement.querySelectorAll('.fade-in:not(.is-visible)')];
          const delay = Math.min(siblings.indexOf(entry.target) * 80, 320);
          setTimeout(() => entry.target.classList.add('is-visible'), delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  fadeEls.forEach(el => observer.observe(el));
}

initScrollAnimations();

/* ---- Footer year ---- */
const yearEl = document.getElementById('currentYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---- Lightbox for photo gallery ---- */
function initLightbox() {
  const lb = document.getElementById('col-lightbox');
  if (!lb) return;

  const lbImg    = lb.querySelector('#lb-img');
  const lbClose  = lb.querySelector('.lb-close');
  const lbPrev   = lb.querySelector('.lb-prev');
  const lbNext   = lb.querySelector('.lb-next');
  const lbCount  = lb.querySelector('.lb-counter');

  const items = [...document.querySelectorAll('.col-photo-item')];
  let current = 0;

  function getHighResSrc(src) {
    return src.replace(/w=\d+/, 'w=1600').replace(/q=\d+/, 'q=90');
  }

  function open(index) {
    current = index;
    const img = items[current].querySelector('img');
    lbImg.src = getHighResSrc(img.src);
    lbImg.alt = img.alt;
    lbCount.textContent = `${current + 1} / ${items.length}`;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  function navigate(dir) {
    current = (current + dir + items.length) % items.length;
    const img = items[current].querySelector('img');
    lbImg.src = getHighResSrc(img.src);
    lbImg.alt = img.alt;
    lbCount.textContent = `${current + 1} / ${items.length}`;
  }

  items.forEach((item, i) => item.addEventListener('click', () => open(i)));

  lbClose.addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  lbPrev.addEventListener('click', (e) => { e.stopPropagation(); navigate(-1); });
  lbNext.addEventListener('click', (e) => { e.stopPropagation(); navigate(1); });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') navigate(1);
    if (e.key === 'ArrowLeft') navigate(-1);
  });

  // Touch swipe
  let startX = 0;
  lb.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) navigate(diff > 0 ? 1 : -1);
  });
}

initLightbox();
