// Interactive Aksara Jawa & Serat Jangka Jayabaya Component
import { prophecies } from '../data/prophecies.js';
import { appState } from '../core/state.js';
import { translations } from '../data/i18n.js';
import { transliterateToJawa, copyToClipboard } from '../core/utils.js';
import { audioManager } from '../core/audio.js';

export function initAksaraTool() {
  const container = document.querySelector('#aksara-tool-root');
  if (!container) return;

  renderAksaraUI(container);
  bindAksaraEvents(container);

  appState.subscribe('lang', () => {
    updateAksaraLanguage(container);
  });
}

function renderAksaraUI(container) {
  const lang = appState.get('lang');
  const t = translations[lang].aksaraSection;

  container.innerHTML = `
    <div class="aksara-section-card">
      <div class="aksara-header-row">
        <div>
          <p class="eyebrow">${t.eyebrow}</p>
          <h2 class="aksara-main-title">${t.title}</h2>
          <p class="aksara-subtitle">${t.subtitle}</p>
        </div>
      </div>

      <div class="aksara-interactive-grid">
        <!-- Live Transliteration Tool -->
        <div class="aksara-converter-box visual-frame">
          <div class="converter-header">
            <span class="converter-tag">GENERATOR AKSARA JAWA</span>
            <span class="converter-tip">Ketik kata Latin di bawah:</span>
          </div>
          <div class="aksara-input-wrap">
            <label for="aksara-latin-input" class="sr-only">${t.inputLabel}</label>
            <input 
              type="text" 
              id="aksara-latin-input" 
              class="aksara-text-input" 
              value="Panjalu Jayati" 
              placeholder="Contoh: Daha, Kediri, Airlangga, Jayabaya..." 
              autocomplete="off"
            />
          </div>
          <div class="aksara-output-stage">
            <div class="aksara-jawa-display" id="aksara-output-glyph">ꦥꦚ꧀ꦗꦭꦸ ꦗꦪꦠꦶ</div>
            <div class="aksara-actions-row">
              <button type="button" class="btn-copy-aksara" id="btn-copy-aksara">
                <span>Salin Aksara (Unicode)</span>
              </button>
              <div class="aksara-quick-presets">
                <button type="button" class="preset-pill" data-text="Panjalu Jayati">Panjalu Jayati</button>
                <button type="button" class="preset-pill" data-text="Dahanapura">Dahanapura</button>
                <button type="button" class="preset-pill" data-text="Sri Jayabaya">Sri Jayabaya</button>
                <button type="button" class="preset-pill" data-text="Kali Brantas">Kali Brantas</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Serat Jangka Jayabaya Prophecy Viewer -->
        <div class="jayabaya-prophecy-box visual-frame">
          <div class="prophecy-header">
            <span class="prophecy-tag">SERAT JANGKA JAYABAYA</span>
            <span class="prophecy-counter">8 BAIT FILOSOFI</span>
          </div>

          <div class="prophecy-selector-tabs" role="tablist">
            ${prophecies.map((p, idx) => `
              <button class="prophecy-tab-btn ${idx === 0 ? 'is-active' : ''}" data-idx="${idx}" role="tab" aria-selected="${idx === 0}">
                ${idx + 1}
              </button>
            `).join('')}
          </div>

          <div class="prophecy-display-area" id="prophecy-display-area">
            ${renderProphecyCard(prophecies[0], lang)}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderProphecyCard(p, lang) {
  const title = lang === 'id' ? p.titleId : p.titleEn;
  const trans = lang === 'id' ? p.transId : p.transEn;
  const context = lang === 'id' ? p.contextId : p.contextEn;

  return `
    <div class="prophecy-card-content">
      <h3 class="prophecy-card-title">${title}</h3>
      <div class="prophecy-jawa-text">${p.jawa}</div>
      <blockquote class="prophecy-quote">"${p.quoteJawa}"</blockquote>
      <div class="prophecy-translation">
        <strong>Makna / Terjemahan:</strong>
        <p>${trans}</p>
      </div>
      <div class="prophecy-context-note">
        <strong>Relevansi Sejarah:</strong>
        <p>${context}</p>
      </div>
    </div>
  `;
}

function bindAksaraEvents(container) {
  const input = container.querySelector('#aksara-latin-input');
  const output = container.querySelector('#aksara-output-glyph');
  const copyBtn = container.querySelector('#btn-copy-aksara');
  const presetBtns = container.querySelectorAll('.preset-pill');
  const tabBtns = container.querySelectorAll('.prophecy-tab-btn');
  const displayArea = container.querySelector('#prophecy-display-area');

  if (input && output) {
    input.addEventListener('input', () => {
      const val = input.value;
      const glyph = transliterateToJawa(val);
      output.textContent = glyph || '...';
    });
  }

  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      audioManager.playUiClick();
      const txt = btn.dataset.text;
      if (input && output) {
        input.value = txt;
        output.textContent = transliterateToJawa(txt);
      }
    });
  });

  if (copyBtn && output) {
    copyBtn.addEventListener('click', () => {
      audioManager.playUiClick();
      const txt = output.textContent;
      copyToClipboard(txt, `Aksara "${txt}" berhasil disalin!`);
    });
  }

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      audioManager.playUiClick();
      tabBtns.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      const idx = parseInt(btn.dataset.idx, 10);
      const lang = appState.get('lang');
      displayArea.innerHTML = renderProphecyCard(prophecies[idx], lang);
    });
  });
}

function updateAksaraLanguage(container) {
  renderAksaraUI(container);
  bindAksaraEvents(container);
}
