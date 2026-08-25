// Interactive Kediri Heritage Map Explorer Component
import { landmarks } from '../data/landmarks.js';
import { appState } from '../core/state.js';
import { translations } from '../data/i18n.js';
import { copyToClipboard, showToast } from '../core/utils.js';
import { audioManager } from '../core/audio.js';

export function initMapExplorer() {
  const container = document.querySelector('#map-explorer-root');
  if (!container) return;

  renderMapUI(container);
  bindMapEvents(container);

  appState.subscribe('lang', () => {
    updateMapLanguage(container);
  });
}

function renderMapUI(container) {
  const lang = appState.get('lang');
  const t = translations[lang].mapSection;

  container.innerHTML = `
    <div class="map-explorer-card">
      <div class="map-header-row">
        <div>
          <p class="eyebrow map-eyebrow">${t.eyebrow}</p>
          <h2 class="map-title">${t.title}</h2>
          <p class="map-subtitle">${t.subtitle}</p>
        </div>
        <div class="map-filter-pills" role="tablist" aria-label="Filter Era Cagar Budaya">
          <button class="map-filter-btn is-active" data-era="all" role="tab" aria-selected="true">${t.filterAll}</button>
          <button class="map-filter-btn" data-era="ancient" role="tab" aria-selected="false">${t.filterAncient}</button>
          <button class="map-filter-btn" data-era="colonial" role="tab" aria-selected="false">${t.filterColonial}</button>
          <button class="map-filter-btn" data-era="modern" role="tab" aria-selected="false">${t.filterModern}</button>
        </div>
      </div>

      <div class="map-stage-layout">
        <!-- Interactive Procedural SVG Map -->
        <div class="map-canvas-frame visual-frame">
          <div class="map-radar-overlay"></div>
          <svg class="kediri-svg-map" viewBox="0 0 800 600" role="img" aria-label="Peta Geografis Cagar Budaya Kediri">
            <defs>
              <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#00ffcc" stop-opacity="0.3" />
                <stop offset="50%" stop-color="#00ffcc" stop-opacity="0.9" />
                <stop offset="100%" stop-color="#00ffcc" stop-opacity="0.4" />
              </linearGradient>
              <filter id="glowPin" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <!-- Kediri Boundary Polygon Outline (Stylized) -->
            <path class="map-boundary-poly" d="M120 180 L280 80 L520 70 L720 190 L750 380 L620 540 L380 560 L180 510 L90 350 Z" />
            
            <!-- Mountain Contours (Klotok / Wilis on West, Kelud on South-East) -->
            <path class="map-mountain wilis" d="M110 320 Q60 260 140 220 T210 270" />
            <text x="130" y="250" class="map-geo-label">GN. KLOTOK / WILIS</text>
            <path class="map-mountain kelud" d="M680 440 Q740 370 650 330 T590 400" />
            <text x="630" y="380" class="map-geo-label">GN. KELUD</text>

            <!-- Brantas River Master Flow Arc -->
            <path class="map-main-river" d="M660 550 C580 480 480 420 400 360 S370 230 430 140 S390 60 380 20" />
            <text x="440" y="270" class="map-river-text">KALI BRANTAS</text>

            <!-- Grid Radar Lines -->
            <circle cx="400" cy="300" r="120" class="map-radar-circle" />
            <circle cx="400" cy="300" r="220" class="map-radar-circle" />
            <line x1="400" y1="40" x2="400" y2="560" class="map-grid-axis" />
            <line x1="80" y1="300" x2="720" y2="300" class="map-grid-axis" />

            <!-- Interactive Landmark Pins -->
            <g class="map-pins-group">
              ${landmarks.map((site, index) => {
                // Map Lat/Lng to SVG X/Y
                // Lat: -7.70 to -7.84, Lng: 111.96 to 112.22
                const nx = (site.lng - 111.95) / (112.24 - 111.95);
                const ny = (site.lat - (-7.68)) / ((-7.86) - (-7.68));
                const x = 120 + nx * 560;
                const y = 80 + ny * 440;

                const color = site.era === 'ancient' ? 'var(--gold)' : site.era === 'colonial' ? 'var(--cyan)' : '#e066ff';

                return `
                  <g class="map-pin-item" data-id="${site.id}" data-era="${site.era}" transform="translate(${x}, ${y})" tabindex="0" role="button" aria-label="${site.name}">
                    <circle class="pin-pulse" r="14" stroke="${color}" />
                    <circle class="pin-center" r="5.5" fill="${color}" filter="url(#glowPin)" />
                    <text class="pin-label" x="9" y="4">${site.name}</text>
                  </g>
                `;
              }).join('')}
            </g>
          </svg>
          <div class="map-status-bar">
            <span>KEDIRI REGENCY & CITY ARCHAEOLOGICAL GRID</span>
            <span class="map-active-count">12 LOKASI TERCATAT</span>
          </div>
        </div>

        <!-- Landmark List & Detail Drawer -->
        <div class="map-sidebar">
          <div class="map-cards-scroll">
            ${landmarks.map((site) => {
              const eraBadge = site.era === 'ancient' ? 'ERA KLASIK' : site.era === 'colonial' ? 'ERA KOLONIAL' : 'ERA MODERN';
              const eraColor = site.era === 'ancient' ? 'badge-gold' : site.era === 'colonial' ? 'badge-cyan' : 'badge-purple';
              const desc = lang === 'id' ? site.descId : site.descEn;

              return `
                <article class="landmark-card" data-id="${site.id}" data-era="${site.era}">
                  <div class="landmark-card-top">
                    <span class="landmark-badge ${eraColor}">${eraBadge}</span>
                    <span class="landmark-period">${site.period}</span>
                  </div>
                  <h3 class="landmark-name">${site.name}</h3>
                  <p class="landmark-desc">${desc}</p>
                  <div class="landmark-tags">
                    ${site.highlights.map(h => `<span class="landmark-tag-item"># ${h}</span>`).join('')}
                  </div>
                  <div class="landmark-footer-actions">
                    <button type="button" class="btn-copy-coords" data-coords="${site.coords}">
                      <span>📍 ${site.coords}</span>
                    </button>
                    <button type="button" class="btn-focus-site" data-id="${site.id}">
                      <span>FOKUS PETA →</span>
                    </button>
                  </div>
                </article>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function bindMapEvents(container) {
  // Filter tabs
  const filterBtns = container.querySelectorAll('.map-filter-btn');
  const pinItems = container.querySelectorAll('.map-pin-item');
  const cards = container.querySelectorAll('.landmark-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      audioManager.playUiClick();
      filterBtns.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      const era = btn.dataset.era;
      appState.set('filterMapEra', era);

      pinItems.forEach((pin) => {
        const match = era === 'all' || pin.dataset.era === era;
        pin.style.display = match ? 'block' : 'none';
      });

      let matchCount = 0;
      cards.forEach((card) => {
        const match = era === 'all' || card.dataset.era === era;
        card.style.display = match ? 'grid' : 'none';
        if (match) matchCount++;
      });

      const countEl = container.querySelector('.map-active-count');
      if (countEl) {
        countEl.textContent = `${matchCount} LOKASI DITAMPILKAN`;
      }
    });
  });

  // Pin click & Card click synchronization
  pinItems.forEach((pin) => {
    pin.addEventListener('click', () => {
      audioManager.playUiClick();
      const id = pin.dataset.id;
      highlightSite(container, id);
    });
  });

  cards.forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-copy-coords')) return;
      const id = card.dataset.id;
      highlightSite(container, id);
    });
  });

  // GPS Coordinates copy
  container.querySelectorAll('.btn-copy-coords').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      audioManager.playUiClick();
      const coords = btn.dataset.coords;
      copyToClipboard(coords, `Koordinat ${coords} berhasil disalin!`);
    });
  });

  container.querySelectorAll('.btn-focus-site').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      audioManager.playUiClick();
      const id = btn.dataset.id;
      highlightSite(container, id);
    });
  });
}

function highlightSite(container, siteId) {
  const pin = container.querySelector(`.map-pin-item[data-id="${siteId}"]`);
  const card = container.querySelector(`.landmark-card[data-id="${siteId}"]`);

  container.querySelectorAll('.map-pin-item').forEach(p => p.classList.remove('is-selected'));
  container.querySelectorAll('.landmark-card').forEach(c => c.classList.remove('is-selected'));

  if (pin) {
    pin.classList.add('is-selected');
  }
  if (card) {
    card.classList.add('is-selected');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function updateMapLanguage(container) {
  renderMapUI(container);
  bindMapEvents(container);
}
