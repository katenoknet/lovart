/* =====================================================
   LOVART INTIMATES — script.js
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Header shadow on scroll ── */
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });


  /* ── Mobile menu ── */
  const burgerBtn  = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  burgerBtn.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    burgerBtn.classList.toggle('active', open);
    burgerBtn.setAttribute('aria-expanded', String(open));
    mobileMenu.setAttribute('aria-hidden', String(!open));
  });

  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      burgerBtn.classList.remove('active');
      burgerBtn.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });


  /* ── Scroll-reveal (Apple-стиль) ────────────────────
     Все элементы с классом .reveal-up плавно появляются
     при попадании в область видимости.
     ─────────────────────────────────────────────────── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));


  /* ── КАРУСЕЛЬ ───────────────────────────────────────── */
  const viewport  = document.getElementById('carouselViewport');
  const track     = document.getElementById('carouselTrack');
  const prevBtn   = document.getElementById('carouselPrev');
  const nextBtn   = document.getElementById('carouselNext');
  const dotsWrap  = document.getElementById('carouselDots');

  if (!viewport || !track) return;

  const cards = Array.from(track.querySelectorAll('.carousel-card'));
  const GAP   = 16;

  let currentIndex = 0;
  let isDragging   = false;
  let startX       = 0;
  let dragDelta    = 0;
  let baseOffset   = 0;

  function getVisible() {
    const vw = window.innerWidth;
    if (vw <= 600) return 1;
    if (vw <= 900) return 2;
    return 3;
  }

  function stepPx() {
    return cards[0].getBoundingClientRect().width + GAP;
  }

  function maxIndex() {
    return Math.max(0, cards.length - getVisible());
  }

  function updateCardWidths() {
    const visible   = getVisible();
    const cardWidth = (viewport.offsetWidth - GAP * (visible - 1)) / visible;
    cards.forEach(c => { c.style.flex = `0 0 ${cardWidth}px`; });
  }

  function goTo(idx, animate = true) {
    currentIndex = Math.max(0, Math.min(idx, maxIndex()));
    baseOffset   = -(currentIndex * stepPx());
    track.style.transition = animate ? 'transform 0.5s cubic-bezier(0.16,1,0.3,1)' : 'none';
    track.style.transform  = `translateX(${baseOffset}px)`;
    updateDots();
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    const count = maxIndex() + 1;
    for (let i = 0; i < count; i++) {
      const btn = document.createElement('button');
      btn.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      btn.setAttribute('aria-label', `Фото ${i + 1}`);
      btn.setAttribute('role', 'tab');
      btn.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(btn);
    }
  }

  function updateDots() {
    dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) =>
      d.classList.toggle('active', i === currentIndex)
    );
  }

  prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

  /* Drag / swipe */
  function getX(e) { return e.touches ? e.touches[0].clientX : e.clientX; }

  function onDragStart(e) {
    if (e.button !== undefined && e.button !== 0) return;
    isDragging = true;
    startX     = getX(e);
    dragDelta  = 0;
    track.style.transition = 'none';
    viewport.classList.add('grabbing');
  }
  function onDragMove(e) {
    if (!isDragging) return;
    dragDelta = getX(e) - startX;
    track.style.transform = `translateX(${baseOffset + dragDelta}px)`;
  }
  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    viewport.classList.remove('grabbing');
    if      (dragDelta < -60) goTo(currentIndex + 1);
    else if (dragDelta >  60) goTo(currentIndex - 1);
    else                      goTo(currentIndex);
  }

  viewport.addEventListener('mousedown', onDragStart);
  window.addEventListener('mousemove',   onDragMove);
  window.addEventListener('mouseup',     onDragEnd);
  viewport.addEventListener('touchstart', onDragStart, { passive: true });
  window.addEventListener('touchmove',   onDragMove,   { passive: true });
  window.addEventListener('touchend',    onDragEnd);
  track.addEventListener('dragstart', e => e.preventDefault());

  /* Resize */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateCardWidths();
      buildDots();
      goTo(Math.min(currentIndex, maxIndex()), false);
    }, 200);
  });

  updateCardWidths();
  buildDots();
  goTo(0, false);


  /* ── Cookie banner ─────────────────────────────────
     Показываем через 1.5с, если пользователь ещё не принял.
     Выбор сохраняется в localStorage и не показывается повторно.
     ─────────────────────────────────────────────────── */
  const cookieBanner  = document.getElementById('cookieBanner');
  const cookieAccept  = document.getElementById('cookieAccept');

  if (cookieBanner && !localStorage.getItem('lovart_cookies_ok')) {
    setTimeout(() => cookieBanner.classList.add('visible'), 1500);

    cookieAccept.addEventListener('click', () => {
      cookieBanner.classList.remove('visible');
      localStorage.setItem('lovart_cookies_ok', '1');
    });
  }


  /* ── Плавный скролл по якорям ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

});
