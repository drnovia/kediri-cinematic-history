// Digital Archive & Artifact Vault Component
import { artifacts } from '../data/artifacts.js';
import { appState } from '../core/state.js';
import { translations } from '../data/i18n.js';
import { audioManager } from '../core/audio.js';

export function initArtifactVault() {
  const container = document.querySelector('#archive-vault-root');
  if (!container) return;

  renderVaultUI(container);
  bindVaultEvents(container);

  appState.subscribe('lang', () => {
    updateVaultLanguage(container);
  });
}

function renderVaultUI(container) {
  const lang = appState.get('lang');
  const t = translations[lang].archiveSection;

  container.innerHTML = `
    <div class="archive-vault-section">
      <div class="archive-header-row">
        <div>
          <p class="eyebrow archive-eyebrow">${t.eyebrow}</p>
          <h2 class="archive-title">${t.title}</h2>
          <p class="archive-subtitle">${t.subtitle}</p>
        </div>
        <div class="archive-filter-pills" role="tablist" aria-label="Filter Kategori Koleksi Arsip">
          <button class="archive-filter-btn is-active" data-cat="all" role="tab" aria-selected="true">${t.filterAll}</button>
          <button class="archive-filter-btn" data-cat="prasasti" role="tab" aria-selected="false">${t.filterPrasasti}</button>
          <button class="archive-filter-btn" data-cat="manuscript" role="tab" aria-selected="false">${t.filterManuscript}</button>
          <button class="archive-filter-btn" data-cat="colonial" role="tab" aria-selected="false">${t.filterColonial}</button>
        </div>
      </div>

      <div class="archive-grid">
        ${artifacts.map((art) => {
          const desc = lang === 'id' ? art.descId : art.descEn;
          const tagLabel = art.category === 'prasasti' ? 'PRASASTI & ARKEOLOGI' : art.category === 'manuscript' ? 'NASKAH KUNO' : 'DOKUMEN KOLONIAL';

          return `
            <article class="archive-item-card" data-id="${art.id}" data-category="${art.category}">
              <div class="archive-visual-preview">
                <div class="archive-svg-icon">
                  ${getArtifactSvg(art.svgType)}
                </div>
                <span class="archive-category-badge">${tagLabel}</span>
                <span class="archive-year-badge">${art.year}</span>
              </div>
              <div class="archive-item-body">
                <h3 class="archive-item-title">${art.title}</h3>
                <p class="archive-item-desc">${desc}</p>
                <div class="archive-item-meta">
                  <span><strong>${t.material}:</strong> ${art.material}</span>
                  <span><strong>${t.location}:</strong> ${art.location}</span>
                </div>
                <button type="button" class="btn-inspect-artifact" data-id="${art.id}">
                  <span>${t.inspectAction} ↗</span>
                </button>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Artifact Deep Zoom & Inspection Modal -->
    <dialog class="artifact-inspect-dialog" id="artifact-inspect-dialog" aria-labelledby="artifact-modal-title">
      <div class="artifact-modal-inner">
        <button class="modal-close-btn" type="button" aria-label="Tutup dialog arsip">✕</button>
        <div class="artifact-modal-layout" id="artifact-modal-content">
          <!-- Injected dynamically on click -->
        </div>
      </div>
    </dialog>
  `;
}

function getArtifactSvg(type) {
  switch (type) {
    case 'stele':
      return `
        <svg viewBox="0 0 120 160" class="art-svg-art" fill="none" stroke="currentColor">
          <path d="M20 140 H100 V40 Q60 10 20 40 Z" stroke-width="2" fill="rgba(197, 160, 89, 0.08)" />
          <line x1="30" y1="50" x2="90" y2="50" stroke-width="1.5" stroke-dasharray="3 3"/>
          <line x1="30" y1="65" x2="90" y2="65" stroke-width="1.5" stroke-dasharray="3 3"/>
          <line x1="30" y1="80" x2="90" y2="80" stroke-width="1.5" stroke-dasharray="3 3"/>
          <line x1="30" y1="95" x2="90" y2="95" stroke-width="1.5" stroke-dasharray="3 3"/>
          <line x1="30" y1="110" x2="90" y2="110" stroke-width="1.5" stroke-dasharray="3 3"/>
          <circle cx="60" cy="32" r="10" stroke-width="1.5" />
        </svg>
      `;
    case 'vessel':
      return `
        <svg viewBox="0 0 120 160" class="art-svg-art" fill="none" stroke="currentColor">
          <path d="M50 20 H70 V40 L85 60 V120 H35 V60 L50 40 Z" stroke-width="2" fill="rgba(0, 255, 204, 0.08)" />
          <ellipse cx="60" cy="130" rx="35" ry="12" stroke-width="2" />
          <path d="M85 80 Q110 90 95 110" stroke-width="2" />
        </svg>
      `;
    case 'scroll':
      return `
        <svg viewBox="0 0 140 120" class="art-svg-art" fill="none" stroke="currentColor">
          <rect x="15" y="30" width="110" height="60" rx="4" stroke-width="2" fill="rgba(197, 160, 89, 0.1)" />
          <line x1="25" y1="45" x2="115" y2="45" stroke-width="1.5" stroke-dasharray="2 4"/>
          <line x1="25" y1="60" x2="115" y2="60" stroke-width="1.5" stroke-dasharray="2 4"/>
          <line x1="25" y1="75" x2="115" y2="75" stroke-width="1.5" stroke-dasharray="2 4"/>
          <circle cx="10" cy="60" r="8" stroke-width="2" />
          <circle cx="130" cy="60" r="8" stroke-width="2" />
        </svg>
      `;
    case 'blueprint':
      return `
        <svg viewBox="0 0 150 120" class="art-svg-art" fill="none" stroke="currentColor">
          <rect x="10" y="15" width="130" height="90" stroke-width="1.5" stroke-dasharray="4 2" fill="rgba(0, 80, 160, 0.2)" />
          <path d="M20 70 H130" stroke-width="2"/>
          <path d="M30 70 Q75 35 120 70" stroke-width="2"/>
          <line x1="50" y1="50" x2="50" y2="70" stroke-width="1.5"/>
          <line x1="75" y1="42" x2="75" y2="70" stroke-width="1.5"/>
          <line x1="100" y1="50" x2="100" y2="70" stroke-width="1.5"/>
        </svg>
      `;
    default:
      return `
        <svg viewBox="0 0 120 140" class="art-svg-art" fill="none" stroke="currentColor">
          <rect x="25" y="20" width="70" height="100" rx="3" stroke-width="2" fill="rgba(245, 242, 234, 0.05)" />
          <line x1="38" y1="40" x2="82" y2="40" stroke-width="1.5"/>
          <line x1="38" y1="55" x2="82" y2="55" stroke-width="1.5"/>
          <line x1="38" y1="70" x2="82" y2="70" stroke-width="1.5"/>
          <line x1="38" y1="85" x2="82" y2="85" stroke-width="1.5"/>
        </svg>
      `;
  }
}

function bindVaultEvents(container) {
  const filterBtns = container.querySelectorAll('.archive-filter-btn');
  const cards = container.querySelectorAll('.archive-item-card');
  const modal = container.querySelector('#artifact-inspect-dialog');
  const modalContent = container.querySelector('#artifact-modal-content');
  const closeBtn = container.querySelector('.modal-close-btn');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      audioManager.playUiClick();
      filterBtns.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      const cat = btn.dataset.cat;
      cards.forEach((card) => {
        const match = cat === 'all' || card.dataset.category === cat;
        card.style.display = match ? 'flex' : 'none';
      });
    });
  });

  container.querySelectorAll('.btn-inspect-artifact').forEach((btn) => {
    btn.addEventListener('click', () => {
      audioManager.playUiClick();
      const id = btn.dataset.id;
      const art = artifacts.find(a => a.id === id);
      if (!art) return;

      const lang = appState.get('lang');
      const desc = lang === 'id' ? art.descId : art.descEn;

      modalContent.innerHTML = `
        <div class="artifact-modal-graphic">
          <div class="modal-svg-large">
            ${getArtifactSvg(art.svgType)}
          </div>
          <span class="modal-tag-badge">${art.category.toUpperCase()} / ${art.year}</span>
        </div>
        <div class="artifact-modal-text">
          <span class="eyebrow modal-eyebrow">ARSIP HISTORIS DIGITAL</span>
          <h2 id="artifact-modal-title">${art.title}</h2>
          <p class="modal-body-desc">${desc}</p>
          <div class="modal-meta-box">
            <div class="meta-row"><strong>MATERIAL:</strong> <span>${art.material}</span></div>
            <div class="meta-row"><strong>PERIODE:</strong> <span>${art.year}</span></div>
            <div class="meta-row"><strong>LOKASI PENYIMPANAN:</strong> <span>${art.location}</span></div>
            <div class="meta-row"><strong>SIGNIFIKANSI SEJARAH:</strong> <span>${art.significance}</span></div>
          </div>
        </div>
      `;

      modal.showModal();
    });
  });

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.close());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.close();
    });
  }
}

function updateVaultLanguage(container) {
  renderVaultUI(container);
  bindVaultEvents(container);
}
