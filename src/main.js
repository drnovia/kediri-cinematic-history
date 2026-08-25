import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import './style.css';
import { appState } from './core/state.js';
import { translations } from './data/i18n.js';
import { audioManager } from './core/audio.js';
import { showToast } from './core/utils.js';

import { initMapExplorer } from './components/map-explorer.js';
import { initArtifactVault } from './components/artifact-vault.js';
import { initAksaraTool } from './components/aksara-tool.js';
import { initQuizModule } from './components/quiz-module.js';
import { initBridgeInspector } from './components/bridge-inspector.js';
import { initLayersInspector } from './components/layers-inspector.js';

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(pointer: coarse)').matches;
const navMarkers = [...document.querySelectorAll('.chapter-marker')];
const chapters = [...document.querySelectorAll('.chapter')];
const sourceDialog = document.querySelector('.source-dialog');
const sourceCopy = document.querySelector('#source-dialog-copy');
const sourceLinks = document.querySelector('#source-dialog-links');
const shortcutsDialog = document.querySelector('#shortcuts-dialog');

const sourceData = {
  heritage: {
    copy: 'Setono Gedong dibaca di sini sebagai lapisan warisan, bukan sebagai cerita penggantian satu kebudayaan oleh kebudayaan lain. Balai Pelestarian Kebudayaan (BPK) Wilayah XI dan Pemkot Kediri menjaga integritas temuan arkeologis era Panjalu yang berdampingan dengan makam wali Islam Syaikh Wasil.',
    links: [
      ['Mengenal Cerita Panji - Ditjen Kebudayaan Kemdikbud', 'https://kebudayaan.kemdikbud.go.id/ditwdb/mengenal-cerita-panji/'],
      ['Sejarah Singkat & Cagar Budaya - Pemerintah Kota Kediri', 'https://www.kedirikota.go.id/page/kota-kediri']
    ]
  },
  bridge: {
    copy: 'Brug Over den Brantas te Kediri adalah jembatan konstruksi besi tempa (groove-iron truss) yang dibuka untuk umum pada 18 Maret 1869 karya insinyur Paul Pierre Roux. Situs ini memakai formulasi sejarah terverifikasi yang menautkan arsip resmi Pemkot Kediri dan Bank Indonesia.',
    links: [
      ['Jembatan Lama Berulang Tahun ke-151 - Pemerintah Kota Kediri', 'https://www.kedirikota.go.id/p/dalamberita/5136/jembatan-lama-kediri-berulang-tahun-ke-151-jadi-jembatan-besi-tertua-di-dunia'],
      ['Seri Buku Sejarah & Heritage - Bank Indonesia', 'https://www.bi.go.id/id/bi-institute/publikasi/Documents/Buku_Seri_Sejarah_Heritage_KPw_BI_Kediri.pdf']
    ]
  },
  modern: {
    copy: 'Bab modern menyatukan babak industrialisasi perkebunan tebu (PG Pesantren Baru), rokok kretek, hingga gerbang udara internasional Bandara Dhoho. Kediri dibaca sebagai kota jasa, perniagaan, dan konektivitas yang terus mengalir bersama Brantas.',
    links: [
      ['Sejarah Kecamatan Kota - Pemerintah Kota Kediri', 'https://www.kec-kota.kedirikota.go.id/profil/sejarah'],
      ['Bandara Internasional Dhoho Kediri - PT Surya Dhoho Investama', 'https://www.kedirikota.go.id/']
    ]
  }
};

/* LENIS SMOOTH SCROLLING */
function setupLenis() {
  if (reducedMotion) return null;
  const lenis = new Lenis({ duration: 1.15, smoothWheel: true, syncTouch: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

const lenis = setupLenis();

function smoothTo(target) {
  const element = document.querySelector(target);
  if (!element) return;
  if (lenis) lenis.scrollTo(element, { offset: -30 });
  else element.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
}

/* NAVIGATION LINKS */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = link.getAttribute('href');
    if (!target || target === '#') return;
    const element = document.querySelector(target);
    if (!element) return;
    event.preventDefault();
    audioManager.playUiClick();
    if (target.startsWith('#chapter-')) setActiveChapter(target.slice(1));
    smoothTo(target);
    document.querySelector('.mobile-menu')?.classList.remove('is-open');
    document.querySelector('.menu-button')?.setAttribute('aria-expanded', 'false');
  });
});

function setActiveChapter(id) {
  navMarkers.forEach((marker) => marker.classList.toggle('is-active', marker.dataset.chapter === id));
}

const chapterObserver = new IntersectionObserver((entries) => {
  const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))[0];
  if (visible) setActiveChapter(visible.target.id);
}, { rootMargin: '-46% 0px -46% 0px', threshold: 0 });
chapters.forEach((chapter) => chapterObserver.observe(chapter));

/* HERO & LOADING INTRO ANIMATION */
function initIntro() {
  const screen = document.querySelector('.loading-screen');
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to('.loading-line span', { scaleX: 1, duration: reducedMotion ? 0.1 : 0.8 })
    .to(screen, { autoAlpha: 0, duration: reducedMotion ? 0.1 : 0.7, pointerEvents: 'none' })
    .from('.hero-eyebrow', { y: 20, autoAlpha: 0, duration: 0.5 }, '-=.2')
    .from('.hero h1 span', { yPercent: 100, autoAlpha: 0, duration: 0.9 }, '-=.3')
    .from('.hero h1 em', { yPercent: 100, autoAlpha: 0, stagger: 0.08, duration: 0.8 }, '-=.55')
    .from('.hero-footer, .hero-year, .hero-side-note', { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.6 }, '-=.45');

  if (!reducedMotion) {
    gsap.to('.hero-river-glow', { y: 35, x: 25, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.orbit-one', { rotation: 360, duration: 48, repeat: -1, ease: 'none' });
    gsap.to('.orbit-two', { rotation: -360, duration: 72, repeat: -1, ease: 'none' });
  }
}

/* RIVER FLOW PROGRESS TRACK */
function initRiverProgress() {
  const progress = document.querySelector('.river-progress');
  const mobileProgress = document.querySelector('.mobile-progress span');
  if (!progress) return;
  const length = progress.getTotalLength();
  gsap.set(progress, { strokeDasharray: length, strokeDashoffset: length });
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      gsap.set(progress, { strokeDashoffset: length * (1 - self.progress) });
      if (mobileProgress) mobileProgress.style.transform = `scaleX(${self.progress})`;
    }
  });
}

/* SCROLL REVEAL MOTION */
function initRevealMotion() {
  document.querySelectorAll('.reveal-up').forEach((element) => {
    gsap.fromTo(element, { y: reducedMotion ? 0 : 48, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: reducedMotion ? 0.1 : 0.9, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 84%', once: true } });
  });
  document.querySelectorAll('.reveal-scale').forEach((element) => {
    gsap.fromTo(element, { scale: reducedMotion ? 1 : 0.94, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: reducedMotion ? 0.1 : 1.2, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 80%', once: true } });
  });
}

/* CHAPTER 01 MAP ANIMATION */
function initOriginMotion() {
  const map = document.querySelector('.origin-map');
  const pulse = document.querySelector('.map-pulse');
  if (!reducedMotion && map) {
    gsap.to('.map-river', { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', scrollTrigger: { trigger: map, start: 'top 70%', end: 'bottom 50%', scrub: 1 } });
    gsap.fromTo('.kendi', { scale: 0, transformOrigin: 'center' }, { scale: 1, duration: 1, ease: 'back.out(1.6)', scrollTrigger: { trigger: map, start: 'top 56%', once: true } });
    gsap.to(pulse, { scale: 1.5, opacity: 0, duration: 1.8, repeat: -1, ease: 'sine.out', scrollTrigger: { trigger: map, start: 'top 65%', toggleActions: 'play pause resume pause' } });
  }
}

/* CHAPTER 02 HORIZONTAL SCROLL */
function initHorizontalChapter() {
  const stage = document.querySelector('.horizontal-stage');
  const track = document.querySelector('.horizontal-track');
  if (!stage || !track) return;
  if (isTouch && window.innerWidth < 720) {
    stage.classList.add('is-mobile-stack');
    return;
  }
  const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth);
  gsap.to(track, {
    x: () => -getDistance(),
    ease: 'none',
    scrollTrigger: {
      trigger: stage,
      start: 'top top',
      pin: true,
      scrub: reducedMotion ? false : 1,
      invalidateOnRefresh: true,
      end: () => `+=${getDistance() + window.innerHeight * 0.55}`
    }
  });
}

/* CHAPTER 03 BATTLE EFFECT */
function initBattleMotion() {
  const section = document.querySelector('.chapter-three');
  if (!section) return;
  if (!reducedMotion) {
    gsap.fromTo('.battle-cloud', { xPercent: -30, opacity: 0.2 }, { xPercent: 30, opacity: 0.8, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1 } });
    gsap.fromTo('.figure-silhouette', { y: 50, opacity: 0, skewX: 8 }, { y: 0, opacity: 1, skewX: 0, duration: 1.1, scrollTrigger: { trigger: section, start: 'top 58%', once: true } });
    gsap.fromTo(section, { '--battle-wash': 0 }, { '--battle-wash': 1, scrollTrigger: { trigger: section, start: 'top 48%', end: 'center center', scrub: 1 } });
  }
}

/* CHAPTER 04 LAYERS EFFECT */
function initLayersMotion() {
  const cards = gsap.utils.toArray('.layer-card');
  cards.forEach((card, index) => {
    gsap.fromTo(card, { y: reducedMotion ? 0 : 80 + index * 20, rotate: reducedMotion ? 0 : (index - 1) * 2, autoAlpha: 0 }, { y: 0, rotate: 0, autoAlpha: 1, duration: reducedMotion ? 0.1 : 0.9, delay: reducedMotion ? 0 : index * 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.layers-stack', start: 'top 72%', once: true } });
  });
}

/* SVG STROKE DRAW HELPERS */
function drawSvgGroup(selector, trigger) {
  const paths = document.querySelectorAll(selector);
  paths.forEach((path) => {
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    if (reducedMotion) gsap.set(path, { strokeDashoffset: 0 });
    else gsap.to(path, { strokeDashoffset: 0, duration: 1.4, stagger: 0.04, ease: 'power2.inOut', scrollTrigger: { trigger, start: 'top 72%', once: true } });
  });
}

function initBridgeMotion() {
  drawSvgGroup('.bridge-structure path, .bridge-dimensions path, .bridge-water path', '.chapter-five');
  if (!reducedMotion) {
    gsap.fromTo('.bridge-heading', { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, scrollTrigger: { trigger: '.chapter-five', start: 'top 62%', once: true } });
    gsap.fromTo('.blueprint-label', { autoAlpha: 0 }, { autoAlpha: 1, delay: 1, duration: 0.6, scrollTrigger: { trigger: '.bridge-blueprint', start: 'top 65%', once: true } });
  }
}

function initChurchMotion() {
  drawSvgGroup('.church-lines path, .church-brick path', '.chapter-six');
  if (!reducedMotion) gsap.to('.ash-wipe', { yPercent: -100, ease: 'none', scrollTrigger: { trigger: '.chapter-six', start: 'top 80%', end: 'center 36%', scrub: 1 } });
}

function initIndustryMotion() {
  if (!reducedMotion) {
    gsap.to('.gear-large', { rotation: 360, duration: 18, repeat: -1, ease: 'none' });
    gsap.to('.gear-small', { rotation: -360, duration: 11, repeat: -1, ease: 'none' });
    gsap.fromTo('.factory-line span', { scaleY: 0 }, { scaleY: 1, transformOrigin: 'bottom', stagger: 0.08, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.industry-scene', start: 'top 70%', once: true } });
    gsap.fromTo('.industry-stat', { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, scrollTrigger: { trigger: '.industry-scene', start: 'top 55%', once: true } });
  }
}

function initEpilogueMotion() {
  if (reducedMotion) return;
  const turbulence = document.querySelector('#ripple-filter feTurbulence');
  if (turbulence) gsap.to(turbulence, { attr: { baseFrequency: '0.02 0.11' }, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.fromTo('.epilogue-content', { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, scrollTrigger: { trigger: '.epilogue', start: 'top 65%', once: true } });
}

/* MOBILE MENU */
function initMenu() {
  const button = document.querySelector('.menu-button');
  const menu = document.querySelector('.mobile-menu');
  if (!button || !menu) return;
  button.addEventListener('click', () => {
    audioManager.playUiClick();
    const open = menu.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
  });
}

/* SOURCE NOTES MODAL */
function initSourceDialog() {
  document.querySelectorAll('.source-trigger').forEach((button) => {
    button.addEventListener('click', () => {
      audioManager.playUiClick();
      const data = sourceData[button.dataset.source];
      if (!data) return;
      sourceCopy.textContent = data.copy;
      sourceLinks.innerHTML = data.links.map(([title, url]) => `<a href="${url}" target="_blank" rel="noreferrer">${title}<span>↗</span></a>`).join('');
      sourceDialog.showModal();
    });
  });
  document.querySelector('.dialog-close')?.addEventListener('click', () => sourceDialog.close());
  sourceDialog?.addEventListener('click', (event) => { if (event.target === sourceDialog) sourceDialog.close(); });
}

/* KEYBOARD SHORTCUTS & HELP */
function initKeyboardShortcuts() {
  const helpBtn = document.querySelector('#btn-help-shortcuts');
  const footerHelpBtn = document.querySelector('#btn-footer-shortcuts');
  const closeBtn = shortcutsDialog?.querySelector('.dialog-close');

  const openShortcuts = () => {
    audioManager.playUiClick();
    shortcutsDialog?.showModal();
  };

  helpBtn?.addEventListener('click', openShortcuts);
  footerHelpBtn?.addEventListener('click', openShortcuts);
  closeBtn?.addEventListener('click', () => shortcutsDialog?.close());
  shortcutsDialog?.addEventListener('click', (e) => { if (e.target === shortcutsDialog) shortcutsDialog.close(); });

  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === 'm' || e.key === 'M') {
      audioManager.toggle();
      showToast(audioManager.isPlaying ? '🔊 Suara Ambien Aktif' : '🔇 Suara Dimatikan');
    } else if (e.key === 'l' || e.key === 'L') {
      toggleLanguage();
    } else if (e.key === 'p' || e.key === 'P') {
      smoothTo('#section-heritage-map');
    } else if (e.key === 'a' || e.key === 'A') {
      smoothTo('#section-archive-vault');
    } else if (e.key === 'q' || e.key === 'Q') {
      smoothTo('#section-curator-quiz');
    } else if (e.key === '?') {
      openShortcuts();
    } else if (e.key === 'Escape') {
      sourceDialog?.close();
      shortcutsDialog?.close();
      document.querySelector('#artifact-inspect-dialog')?.close();
    }
  });
}

/* AUDIO TOGGLE BUTTON */
function initAudioControls() {
  const btn = document.querySelector('.audio-toggle-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    audioManager.toggle();
    showToast(audioManager.isPlaying ? '🔊 Suara Ambien Diaktifkan' : '🔇 Suara Dimatikan');
  });
}

/* BILINGUAL SWITCHER (ID / EN) */
function initLanguageSwitcher() {
  const switchBtn = document.querySelector('#lang-switch-btn');
  if (!switchBtn) return;
  switchBtn.addEventListener('click', () => {
    audioManager.playUiClick();
    toggleLanguage();
  });
}

function toggleLanguage() {
  const currentLang = appState.get('lang');
  const nextLang = currentLang === 'id' ? 'en' : 'id';
  appState.set('lang', nextLang);

  // Update language switcher pill
  const codes = document.querySelectorAll('.lang-code');
  codes.forEach((c) => {
    c.classList.toggle('is-active', c.textContent.trim().toLowerCase() === nextLang);
  });

  // Apply DOM text updates
  const t = translations[nextLang];
  document.title = t.meta.title;

  const updateText = (id, text) => {
    const el = document.querySelector(id);
    if (el) el.innerHTML = text;
  };

  updateText('#brand-sub', t.nav.brandSub);
  updateText('#hero-eyebrow', t.hero.eyebrow);
  updateText('#hero-title-main', t.hero.titleMain);
  updateText('#hero-title-sub1', t.hero.titleSub1);
  updateText('#hero-title-sub2', t.hero.titleSub2);
  updateText('#hero-title-sub3', t.hero.titleSub3);
  updateText('#hero-lead', t.hero.lead);
  updateText('#hero-scroll-enter', t.hero.scrollEnter);
  updateText('#hero-year-label', t.hero.firstTrace);

  updateText('#intro-eyebrow', t.intro.eyebrow);
  updateText('#intro-heading', t.intro.heading);
  updateText('#intro-body', t.intro.body);
  updateText('#intro-stat1-label', t.intro.stat1Label);
  updateText('#intro-stat2-label', t.intro.stat2Label);
  updateText('#intro-stat3-label', t.intro.stat3Label);

  showToast(nextLang === 'id' ? 'Bahasa: Bahasa Indonesia' : 'Language: English');
}

/* INITIALIZATION */
function init() {
  initIntro();
  initRiverProgress();
  initRevealMotion();
  initOriginMotion();
  initHorizontalChapter();
  initBattleMotion();
  initLayersMotion();
  initBridgeMotion();
  initChurchMotion();
  initIndustryMotion();
  initEpilogueMotion();
  initMenu();
  initSourceDialog();
  initAudioControls();
  initLanguageSwitcher();
  initKeyboardShortcuts();

  // Initialize Modular Components
  initMapExplorer();
  initArtifactVault();
  initAksaraTool();
  initQuizModule();
  initBridgeInspector();
  initLayersInspector();

  window.addEventListener('load', () => ScrollTrigger.refresh());
}

init();
