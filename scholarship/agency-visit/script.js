// Progressive enhancement: the report is readable and all anchor links work without JS.
const toggle = document.getElementById('menu-toggle');
const mobileContents = document.getElementById('mobile-contents');
if (toggle && mobileContents) {
  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    mobileContents.hidden = isOpen;
  });
  mobileContents.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileContents.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}
const progress = document.getElementById('reading-progress-bar');
let ticking = false;
function updateProgress() {
  const available = document.documentElement.scrollHeight - window.innerHeight;
  const fraction = available > 0 ? Math.min(1, Math.max(0, window.scrollY / available)) : 0;
  if (progress) progress.style.width = `${fraction * 100}%`;
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
}, { passive: true });
updateProgress();
const navLinks = [...document.querySelectorAll('[data-section-link]')];
const sections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
if ('IntersectionObserver' in window && sections.length) {
  const visible = new Map();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting ? visible.set(entry.target.id, entry.boundingClientRect.top) : visible.delete(entry.target.id));
    if (visible.size) {
      const topId = [...visible.entries()].sort((a,b) => Math.abs(a[1]-110) - Math.abs(b[1]-110))[0][0];
      navLinks.forEach(link => {
        const active = link.getAttribute('href') === `#${topId}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');
      });
    }
  }, { rootMargin:'-90px 0px -60% 0px', threshold:0 });
  sections.forEach(section => observer.observe(section));
}
document.getElementById('print-report')?.addEventListener('click', () => window.print());

// Citations: fast scroll to the reference, plus a button to return to the citation.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const SCROLL_OFFSET = 95; // matches scroll-padding-top in styles.css
let scrollAnim = null;
function quickScrollTo(top, duration = 320) {
  if (scrollAnim) cancelAnimationFrame(scrollAnim);
  const start = window.scrollY;
  const distance = top - start;
  if (reduceMotion.matches || Math.abs(distance) < 2) {
    window.scrollTo({ top, behavior: 'instant' });
    return;
  }
  const startTime = performance.now();
  const step = now => {
    const t = Math.min(1, (now - startTime) / duration);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    window.scrollTo({ top: start + distance * eased, behavior: 'instant' });
    scrollAnim = t < 1 ? requestAnimationFrame(step) : null;
  };
  scrollAnim = requestAnimationFrame(step);
}
const backButton = document.createElement('button');
backButton.type = 'button';
backButton.className = 'back-to-citation';
backButton.textContent = '↑ Back to citation';
backButton.hidden = true;
let returnPoint = null;
document.querySelectorAll('a[href^="#ref-"]').forEach(link => {
  link.addEventListener('click', event => {
    const target = document.getElementById(link.getAttribute('href').slice(1));
    if (!target) return;
    event.preventDefault();
    returnPoint = { y: window.scrollY, link };
    document.querySelectorAll('.reference-list .cited').forEach(el => el.classList.remove('cited'));
    target.classList.add('cited');
    target.append(' ', backButton); // sits right after the reference the reader landed on
    history.pushState(null, '', `#${target.id}`);
    quickScrollTo(target.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET);
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    backButton.hidden = false;
  });
});
backButton.addEventListener('click', () => {
  if (!returnPoint) return;
  const { y, link } = returnPoint;
  returnPoint = null;
  backButton.hidden = true;
  quickScrollTo(y);
  link.focus({ preventScroll: true });
});

// AI Use Disclaimer: opens as a modal; the <dialog> stays closed (and prints inline) without JS.
const disclaimerModal = document.getElementById('disclaimer-modal');
const disclaimerTrigger = document.getElementById('disclaimer-trigger');
if (disclaimerModal && disclaimerTrigger) {
  disclaimerTrigger.addEventListener('click', () => {
    if (typeof disclaimerModal.showModal === 'function') disclaimerModal.showModal();
    else disclaimerModal.setAttribute('open', '');
  });
  // Click outside the panel closes it.
  disclaimerModal.addEventListener('click', event => {
    if (event.target === disclaimerModal) disclaimerModal.close();
  });
}
