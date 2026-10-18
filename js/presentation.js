/**
 * AESV-ASM-ML Presentation Engine
 * University of Science and Technology — Faculty of Computers
 * Cybersecurity Department — Graduation Project (1) — 2026
 * Pure Vanilla JavaScript — No external libraries
 */

'use strict';

/* ═══════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════ */
const state = {
  currentSlide: 1,
  totalSlides: 22,
  overviewOpen: false,
  notesOpen: false,
  lightboxOpen: false,
  fullscreen: false,
  isAnimating: false,
  controlPanelOpen: false,
  timerSeconds: 20 * 60,
  timerInterval: null,
};

/* ═══════════════════════════════════════════════
   DOM REFERENCES (resolved after DOMContentLoaded)
   ═══════════════════════════════════════════════ */
let slides, progressBar, slideCounter, overviewPanel, notesPanel,
    lightbox, lightboxImg, lightboxCaption, overviewGrid,
    navDots, controlPanel, btnPrev, btnNext, btnOverview, btnFullscreen,
    btnNotes, btnControls;

const playbackSettings = {
  transition: 'cascade',
  focus: 'halo',
  speed: 'normal',
  ambientMotion: true,
  ambientSpeed: 'normal',
};

/* ═══════════════════════════════════════════════
   SLIDE DATA (for overview panel)
   ═══════════════════════════════════════════════ */
const slideData = [
  { num: 1,  ar: 'الصفحة الرئيسية',                 en: 'Title' },
  { num: 2,  ar: 'مقدمة',                             en: 'Introduction' },
  { num: 3,  ar: 'المشكلة البحثية',                  en: 'Research Problem' },
  { num: 4,  ar: 'أهمية المشروع',                    en: 'Project Significance' },
  { num: 5,  ar: 'أهداف المشروع',                    en: 'Project Objectives' },
  { num: 6,  ar: 'نطاق المشروع',                     en: 'Project Scope' },
  { num: 7,  ar: 'الدراسات السابقة',                 en: 'Related Studies' },
  { num: 8,  ar: 'الحل المقترح',                     en: 'Proposed Solution' },
  { num: 9,  ar: 'المنهجية',                         en: 'Methodology' },
  { num: 10, ar: 'البيانات ومنهجية ML',              en: 'Dataset & ML' },
  { num: 11, ar: 'معمارية النظام الشاملة',           en: 'System Architecture' },
  { num: 12, ar: 'اكتشاف الأصول وإدارة سطح الهجوم', en: 'Asset Discovery & ASM' },
  { num: 13, ar: 'الكشف عن الثغرات والتحقق الأمني', en: 'Vulnerability Detection' },
  { num: 14, ar: 'معالجة البيانات والتحليل والأولوية', en: 'Data Processing & Risk' },
  { num: 15, ar: 'الأدوات والتقنيات',                en: 'Tools & Technologies' },
  { num: 16, ar: 'دراسة الجدوى',                     en: 'Feasibility Study' },
  { num: 17, ar: 'تحليل النظام وتصميمه',             en: 'System Analysis & Design' },
  { num: 18, ar: 'النموذج الأولي والتقدم الحالي',    en: 'Prototype & Progress' },
  { num: 19, ar: 'التجارب ونتائج الاختبار',          en: 'Model Experiments' },
  { num: 20, ar: 'التحديات والأعمال المتبقية',       en: 'Challenges & Remaining' },
  { num: 21, ar: 'الخطة الزمنية للمشروع',            en: 'Project Timeline' },
  { num: 22, ar: 'الخلاصة والخطوات القادمة',         en: 'Conclusion & Next Steps' },
];

/* ═══════════════════════════════════════════════
   INITIALIZATION
   ═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  resolveDOM();
  state.totalSlides = slides.length;
  prepareCardInteractions();
  const params = new URLSearchParams(location.search);
  const requestedSlide = parseInt(params.get('slide'), 10);
  state.currentSlide = Number.isInteger(requestedSlide) &&
    requestedSlide >= 1 && requestedSlide <= state.totalSlides ? requestedSlide : 1;
  loadPlaybackSettings();
  buildOverviewGrid();
  buildNavigationDots();
  applySlide(state.currentSlide, null);
  updateUI();
  bindKeyboard();
  bindNavButtons();
  bindLightbox();
  bindFullscreenEvents();
  bindExperimentCards();
  bindPlaybackControls();
  updateTimerDisplay();
});

function resolveDOM() {
  slides        = Array.from(document.querySelectorAll('.slide'));
  progressBar   = document.getElementById('progress-bar');
  slideCounter  = document.getElementById('slide-counter');
  overviewPanel = document.getElementById('overview-panel');
  notesPanel    = document.getElementById('notes-panel');
  lightbox      = document.getElementById('lightbox');
  lightboxImg   = document.getElementById('lightbox-img');
  lightboxCaption = document.getElementById('lightbox-caption');
  overviewGrid  = document.getElementById('overview-grid');
  navDots       = document.getElementById('nav-dots');
  controlPanel  = document.getElementById('control-panel');
  btnPrev       = document.getElementById('btn-prev');
  btnNext       = document.getElementById('btn-next');
  btnOverview   = document.getElementById('btn-overview');
  btnFullscreen = document.getElementById('btn-fullscreen');
  btnNotes      = document.getElementById('btn-notes');
  btnControls   = document.getElementById('btn-controls');
}

function prepareCardInteractions() {
  const cardSelector = [
    '.card', '.obj-card', '.stat-box', '.problem-node', '.problem-impact', '.general-obj-box',
    '.study-card', '.method-phase', '.tool-card', '.diagram-thumb', '.progress-item',
    '.scenario-card', '.feasibility-card', '.challenge-card', '.formula-box',
    '.next-step-card', '.scope-item', '.out-of-scope-item', '.pathway-card', '.pathway-step',
    '.nvd-source-card', '.flow-step', '.ml-scene-step', '.experiment-card',
    '.solution-target', '.solution-node', '.solution-processing', '.solution-route', '.solution-output',
    '.prototype-stat', '.prototype-milestone', '.prototype-next-step',
  ].join(',');

  slides.forEach((slide) => {
    slide.querySelectorAll(`.slide-content ${cardSelector}`).forEach((card) => {
      card.classList.add('presentation-card');
      if (card.matches('button, [role="button"], a, .diagram-thumb')) {
        card.classList.add('presentation-card-interactive');
      }
    });
  });
}

/* ═══════════════════════════════════════════════
   SLIDE NAVIGATION
   ═══════════════════════════════════════════════ */
function goToSlide(n) {
  if (n < 1 || n > state.totalSlides) return;
  if (n === state.currentSlide) return;
  if (state.isAnimating) return;

  const prev = state.currentSlide;
  const direction = n > prev ? 'forward' : 'back';
  document.querySelectorAll('.focus-pinned').forEach(card => card.classList.remove('focus-pinned'));
  state.currentSlide = n;
  applySlide(n, prev, direction);
  updateUI();

  // Update URL without reload
  try {
    history.replaceState(null, '', `?slide=${n}`);
  } catch (e) { /* ignore */ }
}

function applySlide(n, prevN, direction) {
  state.isAnimating = true;

  slides.forEach((s, idx) => {
    const sNum = idx + 1;
    if (sNum === n) {
      // Make active
      s.classList.remove('exit-left', 'exit-right');
      s.style.transform = direction === 'back' ? 'translateX(-40px)' : 'translateX(40px)';
      s.style.opacity = '0';
      s.classList.add('active');
      // Force reflow
      void s.offsetWidth;
      s.style.transform = '';
      s.style.opacity = '';
    } else if (sNum === prevN) {
      // Exit current
      s.classList.remove('active');
      s.classList.remove('exit-left', 'exit-right');
      s.classList.add(direction === 'back' ? 'exit-right' : 'exit-left');
      setTimeout(() => {
        s.classList.remove('exit-left', 'exit-right');
      }, 500);
    } else {
      s.classList.remove('active', 'exit-left', 'exit-right');
    }
  });

  // Update notes
  updateNotes(n);

  const transitionDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 0
    : ({ slow: 650, normal: 480, fast: 320 }[playbackSettings.speed] || 480);
  setTimeout(() => {
    state.isAnimating = false;
  }, transitionDuration + 50);
}

function nextSlide() { goToSlide(state.currentSlide + 1); }
function prevSlide() { goToSlide(state.currentSlide - 1); }

/* ═══════════════════════════════════════════════
   UI UPDATES
   ═══════════════════════════════════════════════ */
function updateUI() {
  const n = state.currentSlide;
  const total = state.totalSlides;

  // Progress bar
  const pct = ((n - 1) / (total - 1)) * 100;
  progressBar.style.width = pct + '%';

  // Counter
  const cur = String(n).padStart(2, '0');
  const tot = String(total).padStart(2, '0');
  slideCounter.innerHTML = `<span class="current">${cur}</span> / ${tot}`;

  // Nav buttons
  btnPrev.disabled = n <= 1;
  btnNext.disabled = n >= total;

  // Overview active
  document.querySelectorAll('.overview-thumb').forEach(th => {
    th.classList.toggle('active', parseInt(th.dataset.slide) === n);
  });
  document.querySelectorAll('.nav-dot').forEach((dot, index) => {
    const active = index + 1 === n;
    dot.classList.toggle('active', active);
    dot.setAttribute('aria-current', active ? 'step' : 'false');
    if (active) {
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      dot.scrollIntoView({ block: 'nearest', inline: 'center', behavior });
    }
  });
}

function updateNotes(n) {
  const slide = document.querySelector(`.slide[data-slide="${n}"]`);
  const notesEl = document.getElementById('notes-content');
  if (!notesEl) return;

  if (slide) {
    const notes = slide.dataset.notes || '';
    notesEl.innerHTML = notes;
  }
}

/* ═══════════════════════════════════════════════
   OVERVIEW PANEL
   ═══════════════════════════════════════════════ */
function buildOverviewGrid() {
  if (!overviewGrid) return;
  overviewGrid.innerHTML = '';
  slideData.forEach(sd => {
    const thumb = document.createElement('div');
    thumb.className = 'overview-thumb';
    thumb.dataset.slide = sd.num;
    thumb.innerHTML = `
      <div class="overview-num">${String(sd.num).padStart(2, '0')}</div>
      <div class="overview-label">${sd.ar}</div>
      <div class="text-xs text-muted" style="font-family:var(--font-latin);direction:ltr;text-align:center;margin-top:3px;">${sd.en}</div>
    `;
    thumb.addEventListener('click', () => {
      goToSlide(sd.num);
      toggleOverview(false);
    });
    overviewGrid.appendChild(thumb);
  });
}

function toggleOverview(force) {
  state.overviewOpen = (force !== undefined) ? force : !state.overviewOpen;
  overviewPanel.classList.toggle('open', state.overviewOpen);
  if (state.overviewOpen) updateUI();
}

/* ═══════════════════════════════════════════════
   SPEAKER NOTES
   ═══════════════════════════════════════════════ */
function toggleNotes(force) {
  state.notesOpen = (force !== undefined) ? force : !state.notesOpen;
  notesPanel.classList.toggle('open', state.notesOpen);
}

function buildNavigationDots() {
  if (!navDots) return;
  navDots.replaceChildren();
  slideData.forEach((sd) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'nav-dot';
    dot.title = `${String(sd.num).padStart(2, '0')} — ${sd.ar} / ${sd.en}`;
    dot.setAttribute('aria-label', `انتقل إلى الشريحة ${sd.num}: ${sd.ar}`);
    dot.addEventListener('click', () => goToSlide(sd.num));
    navDots.appendChild(dot);
  });
}

function readSetting(key, fallback) {
  try {
    const value = localStorage.getItem(`aesv-presentation-${key}`);
    return value === null ? fallback : value;
  } catch (error) {
    console.warn(`Could not read presentation setting "${key}".`, error);
    return fallback;
  }
}

function saveSetting(key, value) {
  try {
    localStorage.setItem(`aesv-presentation-${key}`, String(value));
  } catch (error) {
    console.warn(`Could not save presentation setting "${key}".`, error);
  }
}

function loadPlaybackSettings() {
  const transitionOptions = ['cascade', '3d', 'zoom', 'fade', 'slide-up', 'flip-x', 'swirl', 'focus'];
  const focusOptions = ['halo', 'lift', 'border', 'spotlight', 'off'];
  const speedOptions = ['slow', 'normal', 'fast'];
  const ambientSpeedOptions = ['slow', 'normal', 'fast'];
  const storedTransition = readSetting('transition', playbackSettings.transition);
  const storedFocus = readSetting('focus', playbackSettings.focus);
  const storedSpeed = readSetting('speed', playbackSettings.speed);
  const storedAmbient = readSetting('ambient-motion', String(playbackSettings.ambientMotion));
  const storedAmbientSpeed = readSetting('ambient-speed', playbackSettings.ambientSpeed);

  playbackSettings.transition = transitionOptions.includes(storedTransition) ? storedTransition : 'cascade';
  playbackSettings.focus = focusOptions.includes(storedFocus) ? storedFocus : 'halo';
  playbackSettings.speed = speedOptions.includes(storedSpeed) ? storedSpeed : 'normal';
  playbackSettings.ambientMotion = storedAmbient === 'true';
  playbackSettings.ambientSpeed = ambientSpeedOptions.includes(storedAmbientSpeed) ? storedAmbientSpeed : 'normal';

  document.getElementById('transition-style').value = playbackSettings.transition;
  document.getElementById('focus-style').value = playbackSettings.focus;
  document.getElementById('transition-speed').value = playbackSettings.speed;
  document.getElementById('ambient-motion').checked = playbackSettings.ambientMotion;
  document.getElementById('ambient-speed').value = playbackSettings.ambientSpeed;
  applyTransitionStyle(playbackSettings.transition);
  applyFocusStyle(playbackSettings.focus);
  applyTransitionSpeed(playbackSettings.speed);
  document.body.classList.toggle('ambient-motion-off', !playbackSettings.ambientMotion);
  applyAmbientSpeed(playbackSettings.ambientSpeed);
}

function applyTransitionStyle(style) {
  document.querySelectorAll('#presentation').forEach((presentation) => {
    presentation.classList.remove(...['cascade', '3d', 'zoom', 'fade', 'slide-up', 'flip-x', 'swirl', 'focus']
      .map(name => `transition-${name}`));
    presentation.classList.add(`transition-${style}`);
  });
}

function applyFocusStyle(style) {
  document.body.classList.remove('focus-halo', 'focus-lift', 'focus-border', 'focus-spotlight');
  document.querySelectorAll('.focus-pinned').forEach(card => card.classList.remove('focus-pinned'));
  if (style !== 'off') document.body.classList.add(`focus-${style}`);
}

function applyTransitionSpeed(speed) {
  const durations = { slow: '650ms', normal: '480ms', fast: '320ms' };
  document.documentElement.style.setProperty('--transition-slide-duration', durations[speed]);
}

function applyAmbientSpeed(speed) {
  const durations = { slow: '48s', normal: '28s', fast: '16s' };
  document.documentElement.style.setProperty('--ambient-motion-duration', durations[speed]);
}

function toggleControlPanel(force) {
  state.controlPanelOpen = force !== undefined ? force : !state.controlPanelOpen;
  controlPanel.classList.toggle('open', state.controlPanelOpen);
  controlPanel.setAttribute('aria-hidden', String(!state.controlPanelOpen));
  btnControls.setAttribute('aria-expanded', String(state.controlPanelOpen));
}

function bindPlaybackControls() {
  document.getElementById('transition-style').addEventListener('change', (event) => {
    playbackSettings.transition = event.target.value;
    applyTransitionStyle(playbackSettings.transition);
    saveSetting('transition', playbackSettings.transition);
  });
  document.getElementById('focus-style').addEventListener('change', (event) => {
    playbackSettings.focus = event.target.value;
    applyFocusStyle(playbackSettings.focus);
    saveSetting('focus', playbackSettings.focus);
  });
  document.getElementById('transition-speed').addEventListener('change', (event) => {
    playbackSettings.speed = event.target.value;
    applyTransitionSpeed(playbackSettings.speed);
    saveSetting('speed', playbackSettings.speed);
  });
  document.getElementById('ambient-motion').addEventListener('change', (event) => {
    playbackSettings.ambientMotion = event.target.checked;
    document.body.classList.toggle('ambient-motion-off', !playbackSettings.ambientMotion);
    saveSetting('ambient-motion', playbackSettings.ambientMotion);
  });
  document.getElementById('ambient-speed').addEventListener('change', (event) => {
    playbackSettings.ambientSpeed = event.target.value;
    applyAmbientSpeed(playbackSettings.ambientSpeed);
    saveSetting('ambient-speed', playbackSettings.ambientSpeed);
  });
  document.getElementById('control-panel-close').addEventListener('click', () => toggleControlPanel(false));
  document.getElementById('timer-start').addEventListener('click', startTimer);
  document.getElementById('timer-pause').addEventListener('click', pauseTimer);
  document.getElementById('timer-reset').addEventListener('click', resetTimer);

  document.addEventListener('click', (event) => {
    if (state.controlPanelOpen && !controlPanel.contains(event.target) && !btnControls.contains(event.target)) {
      toggleControlPanel(false);
    }

    if (playbackSettings.focus === 'off' ||
        !event.target.closest('.slide.active .slide-content') ||
        event.target.closest('a, button, input, select, textarea')) return;
    const card = event.target.closest('.slide.active .presentation-card');
    const alreadyPinned = card?.classList.contains('focus-pinned') || false;
    document.querySelectorAll('.focus-pinned').forEach(item => item.classList.remove('focus-pinned'));
    if (card && !alreadyPinned) card.classList.add('focus-pinned');
  });
}

function updateTimerDisplay() {
  const minutes = String(Math.floor(state.timerSeconds / 60)).padStart(2, '0');
  const seconds = String(state.timerSeconds % 60).padStart(2, '0');
  document.getElementById('timer-display').textContent = `${minutes}:${seconds}`;
}

function startTimer() {
  if (state.timerInterval !== null || state.timerSeconds <= 0) return;
  document.getElementById('timer-start').disabled = true;
  document.getElementById('timer-pause').disabled = false;
  state.timerInterval = window.setInterval(() => {
    state.timerSeconds = Math.max(0, state.timerSeconds - 1);
    updateTimerDisplay();
    if (state.timerSeconds === 0) pauseTimer();
  }, 1000);
}

function pauseTimer() {
  if (state.timerInterval !== null) {
    window.clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
  document.getElementById('timer-start').disabled = state.timerSeconds <= 0;
  document.getElementById('timer-pause').disabled = true;
}

function resetTimer() {
  pauseTimer();
  state.timerSeconds = 20 * 60;
  updateTimerDisplay();
  document.getElementById('timer-start').disabled = false;
}

/* ═══════════════════════════════════════════════
   LIGHTBOX
   ═══════════════════════════════════════════════ */
function openLightbox(src, caption) {
  lightboxImg.src = src;
  lightboxCaption.textContent = caption || '';
  lightbox.classList.add('open');
  state.lightboxOpen = true;
  lightbox.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  state.lightboxOpen = false;
  lightboxImg.src = '';
}

function bindLightbox() {
  const closeBtn = document.getElementById('lightbox-close');
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Diagram thumbnails
  document.querySelectorAll('.diagram-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const src     = thumb.dataset.src;
      const caption = thumb.dataset.caption;
      openLightbox(src, caption);
    });
  });
}

/* ═══════════════════════════════════════════════
   FULLSCREEN
   ═══════════════════════════════════════════════ */
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

function bindFullscreenEvents() {
  document.addEventListener('fullscreenchange', () => {
    state.fullscreen = !!document.fullscreenElement;
    if (btnFullscreen) {
      btnFullscreen.title = state.fullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)';
      btnFullscreen.innerHTML = state.fullscreen ? svgExitFullscreen() : svgFullscreen();
    }
  });
}

/* ═══════════════════════════════════════════════
   KEYBOARD
   ═══════════════════════════════════════════════ */
function bindKeyboard() {
  document.addEventListener('keydown', (e) => {
    if ((e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') &&
        e.key !== 'Escape') return;

    if (state.lightboxOpen) {
      if (e.key === 'Escape') closeLightbox();
      return;
    }

    if (state.overviewOpen) {
      if (e.key === 'Escape' || e.key === 'o' || e.key === 'O') toggleOverview(false);
      return;
    }

    if (state.controlPanelOpen && e.key === 'Escape') {
      toggleControlPanel(false);
      return;
    }

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        prevSlide();
        break;
      case ' ':
        e.preventDefault();
        nextSlide();
        break;
      case 'f':
      case 'F':
      case 'F11':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'o':
      case 'O':
        e.preventDefault();
        toggleOverview();
        break;
      case 'n':
      case 'N':
        e.preventDefault();
        toggleNotes();
        break;
      case 't':
      case 'T':
        e.preventDefault();
        toggleControlPanel();
        break;
      case 'Escape':
        if (state.notesOpen) toggleNotes(false);
        if (state.fullscreen) document.exitFullscreen().catch(() => {});
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(1);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(state.totalSlides);
        break;
    }
  });
}

/* ═══════════════════════════════════════════════
   NAV BUTTONS
   ═══════════════════════════════════════════════ */
function bindNavButtons() {
  if (btnPrev)      btnPrev.addEventListener('click', prevSlide);
  if (btnNext)      btnNext.addEventListener('click', nextSlide);
  if (btnOverview)  btnOverview.addEventListener('click', () => toggleOverview());
  if (btnFullscreen) btnFullscreen.addEventListener('click', toggleFullscreen);
  if (btnNotes)     btnNotes.addEventListener('click', () => toggleNotes());
  if (btnControls)  btnControls.addEventListener('click', () => toggleControlPanel());

  const overviewClose = document.getElementById('overview-close');
  if (overviewClose) overviewClose.addEventListener('click', () => toggleOverview(false));
}

function bindExperimentCards() {
  const cards = Array.from(document.querySelectorAll('.experiment-card'));
  const title = document.getElementById('experiment-detail-title');
  const copy = document.getElementById('experiment-detail-copy');
  const validation = document.querySelector('.validation-score');
  if (!cards.length || !title || !copy || !validation) return;

  const details = {
    A: {
      title: 'Experiment A · CVSS Baseline',
      copy: 'مرجع لإعادة إنتاج فئات مشتقة من خصائص CVSS؛ لا يُعتمد نموذجاً تشغيلياً ولا تقيس نتيجته تعميم الميزات النصية.',
      hasValidation: false,
    },
    B: {
      title: 'Experiment B · Text + CWE',
      copy: `ميزات وصف الثغرة بعد TF-IDF مع معلومات CWE. Macro-F1 على مجموعة الاختبار: \u20660.6368\u2069.`,
      hasValidation: false,
    },
    C: {
      title: 'Experiment C · Text + CWE + Vendor/Product',
      copy: 'أضيفت ميزات المورّد والمنتج إلى التجربة B. حققت أعلى Macro-F1 تحقق بين B وC في التقسيم العشوائي؛ وهي نتيجة بحثية لا تثبت الجاهزية التشغيلية.',
      hasValidation: true,
    },
  };

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const detail = details[card.dataset.experiment];
      if (!detail) return;
      cards.forEach(item => {
        const selected = item === card;
        item.classList.toggle('experiment-selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      title.textContent = detail.title;
      copy.textContent = detail.copy;
      validation.hidden = !detail.hasValidation;
    });
  });
}

/* ═══════════════════════════════════════════════
   SVG ICON HELPERS
   ═══════════════════════════════════════════════ */
function svgFullscreen() {
  return `<svg viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`;
}

function svgExitFullscreen() {
  return `<svg viewBox="0 0 24 24"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>`;
}

/* ═══════════════════════════════════════════════
   TOUCH / SWIPE SUPPORT
   ═══════════════════════════════════════════════ */
(function bindSwipe() {
  let startX = 0;
  let startY = 0;

  document.addEventListener('touchstart', (e) => {
    if (e.target.closest('#nav-bar, #control-panel, #overview-panel, #lightbox, .slide-content')) return;
    startX = e.changedTouches[0].screenX;
    startY = e.changedTouches[0].screenY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (e.target.closest('#nav-bar, #control-panel, #overview-panel, #lightbox, .slide-content')) return;
    const dx = e.changedTouches[0].screenX - startX;
    const dy = e.changedTouches[0].screenY - startY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
      if (dx < 0) nextSlide();
      else prevSlide();
    }
  }, { passive: true });
})();

/* ═══════════════════════════════════════════════
   WHEEL NAVIGATION (debounced)
   ═══════════════════════════════════════════════ */
(function bindWheel() {
  let lastWheel = 0;
  document.addEventListener('wheel', (e) => {
    const now = Date.now();
    if (now - lastWheel < 600) return;
    if (state.overviewOpen || state.lightboxOpen || state.controlPanelOpen) return;
    if (e.target.closest('#nav-bar, #notes-panel')) return;

    const content = e.target.closest('.slide-content');
    if (content) {
      const canScrollDown = content.scrollTop + content.clientHeight < content.scrollHeight - 2;
      const canScrollUp = content.scrollTop > 2;
      if ((e.deltaY > 30 && canScrollDown) || (e.deltaY < -30 && canScrollUp)) return;
    }

    if (e.deltaY > 30) {
      lastWheel = now;
      nextSlide();
    } else if (e.deltaY < -30) {
      lastWheel = now;
      prevSlide();
    }
  }, { passive: true });
})();
