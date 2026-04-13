/* ── script.js ────────────────────────────────────────────── */

// Nav scroll effect
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
}, { passive: true });

// Tab switching for screenshot showcase
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.showcase-panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.target;

    tabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    panels.forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    const panel = document.getElementById(target);
    if (panel) panel.classList.add('active');
  });
});

// Scroll reveal
const revealEls = document.querySelectorAll(
  '.feature-card, .source-card, .section-header, .panel-info, .download-content'
);

revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger sibling cards
      const siblings = [...entry.target.parentElement.querySelectorAll('.reveal')];
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, idx * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

// Smooth hover tilt on phone in hero
const phoneFront = document.querySelector('.phone-front');
if (phoneFront) {
  const heroPhones = document.querySelector('.hero-phones');
  heroPhones.addEventListener('mousemove', (e) => {
    const rect = heroPhones.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    phoneFront.style.transform = `rotate(${-3 + y * 6}deg) translateY(${-y * 10}px) rotateY(${x * 8}deg)`;
  });
  heroPhones.addEventListener('mouseleave', () => {
    phoneFront.style.transition = 'transform 0.6s ease';
    phoneFront.style.transform = 'rotate(-3deg) translateY(0)';
    setTimeout(() => { phoneFront.style.transition = ''; }, 600);
  });
}

// PWA install prompt
let deferredPrompt;
const pwaBtn = document.getElementById('download-pwa-btn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (pwaBtn) pwaBtn.style.display = 'inline-flex';
});

// Source requirement tooltips (appended to body to avoid overflow:hidden clipping)
const tooltip = document.createElement('div');
tooltip.className = 'req-tooltip';
document.body.appendChild(tooltip);

document.querySelectorAll('.source-req[data-tooltip]').forEach(el => {
  el.addEventListener('mouseenter', (e) => {
    tooltip.textContent = el.dataset.tooltip;
    tooltip.style.opacity = '1';
    positionTooltip(e);
  });
  el.addEventListener('mousemove', positionTooltip);
  el.addEventListener('mouseleave', () => {
    tooltip.style.opacity = '0';
  });
});

function positionTooltip(e) {
  const pad = 12;
  const tw = tooltip.offsetWidth;
  const th = tooltip.offsetHeight;
  let x = e.clientX - tw / 2;
  let y = e.clientY - th - pad;
  if (x < 8) x = 8;
  if (x + tw > window.innerWidth - 8) x = window.innerWidth - tw - 8;
  if (y < 8) y = e.clientY + pad;
  tooltip.style.left = x + 'px';
  tooltip.style.top  = y + 'px';
}

