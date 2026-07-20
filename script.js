/* =========================================================
   Rao Adil Javeed — Portfolio
   Interaction logic ported from kenzo-studio.webflow.io
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. Scroll-triggered reveal (slide-up + fade) ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- 2. Odometer digit-roll counters ---------- */
  const odometers = document.querySelectorAll('[data-odometer]');
  const odoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = String(el.dataset.target);
      const digits = el.querySelectorAll('.odo-digit');
      const padded = target.padStart(digits.length, '0');
      digits.forEach((digitEl, i) => {
        const val = padded[i] !== undefined ? padded[i] : '0';
        setTimeout(() => {
          digitEl.style.setProperty('--n', val);
        }, i * 80);
      });
      odoObserver.unobserve(el);
    });
  }, { threshold: 0.4 });
  odometers.forEach(el => odoObserver.observe(el));

  /* ---------- 3. Scroll-progress text reveal (About heading) ---------- */
  const progressTracks = document.querySelectorAll('[data-progress-track]');
  function updateTextReveal() {
    progressTracks.forEach(track => {
      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.9;
      const end = vh * 0.35;
      let progress = (start - rect.top) / (start - end);
      progress = Math.max(0, Math.min(1, progress));
      const mask = track.querySelector('.reveal-mask');
      if (mask) mask.style.width = (progress * 100) + '%';
    });
  }

  /* ---------- 4. CTA rotating image cluster (scroll-progress rotation) ---------- */
  const ctaRotor = document.getElementById('ctaRotor');
  const rotorItems = ctaRotor ? Array.from(ctaRotor.querySelectorAll('.cta-rotor-item')) : [];
  function updateRotor() {
    if (!ctaRotor || !rotorItems.length) return;
    const rect = ctaRotor.getBoundingClientRect();
    const vh = window.innerHeight;
    const start = vh;
    const end = vh * 0.4;
    let progress = (start - rect.top) / (start - end);
    progress = Math.max(0, Math.min(1, progress));
    const eased = 1 - Math.pow(1 - progress, 3);
    rotorItems.forEach((item, i) => {
      const mid = (rotorItems.length - 1) / 2;
      const fanAngle = (i - mid) * 9;
      const startAngle = fanAngle + (i % 2 === 0 ? 14 : -14);
      const angle = startAngle * (1 - eased);
      const lift = (1 - eased) * 24;
      item.style.transform = `rotate(${angle}deg) translateY(${lift}px)`;
    });
  }

  /* ---------- 4b. Scroll-driven image reveal ----------
     Every content photo (hero, about, about-me, certifications) is a
     stacked pair: a muted base image and a true-color overlay clipped to
     0% height. As the image scrolls through the viewport, the clip edge
     advances purely based on scroll position (scrubbed, not one-shot). */
  const revealImgs = document.querySelectorAll('.reveal-img');
  function updateImageReveals() {
    const vh = window.innerHeight;
    revealImgs.forEach(wrap => {
      const overlay = wrap.querySelector('.reveal-img-overlay');
      if (!overlay) return;
      const rect = wrap.getBoundingClientRect();
      const start = vh * 0.95;
      const end = vh * 0.35;
      let progress = (start - rect.top) / (start - end);
      progress = Math.max(0, Math.min(1, progress));
      overlay.style.clipPath = `inset(0 0 ${(1 - progress) * 100}% 0)`;
    });
  }

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateTextReveal();
        updateRotor();
        updateImageReveals();
        toggleBackToTop();
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  updateTextReveal();
  updateRotor();
  updateImageReveals();

  /* ---------- 5. Services hover-expand (mobile tap fallback) ---------- */
  document.querySelectorAll('.service-row').forEach(row => {
    row.addEventListener('click', () => {
      if (window.matchMedia('(hover: none)').matches) {
        row.classList.toggle('force-open');
        const detail = row.querySelector('.service-detail');
        if (detail) {
          detail.style.gridTemplateRows = row.classList.contains('force-open') ? '1fr' : '0fr';
          detail.style.opacity = row.classList.contains('force-open') ? '1' : '0';
        }
      }
    });
  });

  /* ---------- 6. FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-q');
    btn.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(open => open.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ---------- 7. About Me video: autoplay on scroll into view + click to open modal ---------- */
  const aboutMeVideo = document.getElementById('aboutMeVideo');
  const aboutMeVideoWrap = document.getElementById('aboutMeVideoWrap');
  if (aboutMeVideo && aboutMeVideoWrap) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) aboutMeVideo.play().catch(() => {});
        else aboutMeVideo.pause();
      });
    }, { threshold: 0.4 });
    videoObserver.observe(aboutMeVideoWrap);

    const videoModal = document.getElementById('videoModal');
    const videoModalVideo = document.getElementById('videoModalVideo');
    const videoModalClose = document.getElementById('videoModalClose');
    const videoModalBackdrop = document.getElementById('videoModalBackdrop');
    function openVideoModal() {
      aboutMeVideo.pause();
      videoModal.classList.add('open');
      document.body.style.overflow = 'hidden';
      videoModalVideo.currentTime = aboutMeVideo.currentTime;
      videoModalVideo.play().catch(() => {});
    }
    function closeVideoModal() {
      videoModal.classList.remove('open');
      document.body.style.overflow = '';
      videoModalVideo.pause();
    }
    aboutMeVideoWrap.addEventListener('click', openVideoModal);
    videoModalClose.addEventListener('click', closeVideoModal);
    videoModalBackdrop.addEventListener('click', closeVideoModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeVideoModal(); });
  }

  /* ---------- 8. Certifications: click a card to open a larger preview ---------- */
  const certModal = document.getElementById('certModal');
  const certModalImg = document.getElementById('certModalImg');
  const certModalClose = document.getElementById('certModalClose');
  const certModalBackdrop = document.getElementById('certModalBackdrop');

  function openCertModal(src, name) {
    if (!certModal || !certModalImg) return;
    certModalImg.src = src;
    certModalImg.alt = name || '';
    certModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCertModal() {
    if (!certModal) return;
    certModal.classList.remove('open');
    document.body.style.overflow = '';
  }
  document.querySelectorAll('.cert-card').forEach(card => {
    card.addEventListener('click', () => {
      openCertModal(card.dataset.certImg, card.dataset.certName);
    });
  });
  if (certModalClose) certModalClose.addEventListener('click', closeCertModal);
  if (certModalBackdrop) certModalBackdrop.addEventListener('click', closeCertModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCertModal();
  });

  /* ---------- 9. Back to top ---------- */
  const backToTop = document.getElementById('backToTop');
  function toggleBackToTop() {
    if (!backToTop) return;
    if (window.scrollY > window.innerHeight * 0.6) backToTop.classList.add('show');
    else backToTop.classList.remove('show');
  }
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  toggleBackToTop();
});
